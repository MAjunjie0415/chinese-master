export interface CheckoutSessionResponse {
    id: string;
    checkout_url: string;
}

/**
 * Create a Creem checkout session
 * @param userId - The ID of the user subscribing
 * @param productId - The ID of the Creem product (Individual Pro)
 */
export async function createCheckoutSession(userId: string, productId: string): Promise<string> {
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
        console.error('Debug: CREEM_API_KEY is missing in environment variables');
        throw new Error('CREEM_API_KEY is not configured');
    }

    const payload = {
        product_id: productId,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?status=cancel`,
        metadata: {
            user_id: userId,
        },
    };

    console.log('Debug: Creating Creem session', {
        api_key_prefix: apiKey.substring(0, 5) + '...',
        product_id: productId,
        success_url: payload.success_url,
        cancel_url: payload.cancel_url
    });

    const response = await fetch('https://api.creem.io/v1/checkout/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Creem API error response (text):', errorText);

        try {
            const errorJson = JSON.parse(errorText);
            console.error('Creem API error response (json):', errorJson);
            throw new Error(errorJson.message || 'Failed to create checkout session');
        } catch (e) {
            throw new Error(`Creem API failed: ${response.status} ${response.statusText}. details: ${errorText}`);
        }
    }

    const data: CheckoutSessionResponse = await response.json();
    return data.checkout_url;
}

/**
 * Verify Creem webhook signature
 * (Placeholder for verification logic using crypto)
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return digest === signature;
}
