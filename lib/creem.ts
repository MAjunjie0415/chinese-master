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

    if (!productId) {
        console.error('Debug (Error): Product ID is missing/undefined passed to createCheckoutSession');
        throw new Error('Product ID is required');
    }

    // Ensure we have a valid app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chinese-master-ebon.vercel.app';

    const payload = {
        product_id: productId,
        success_url: `${appUrl}/upgrade?status=success`,
        // Note: cancel_url is not supported by Creem API
        metadata: {
            user_id: userId,
        },
    };

    // Determine endpoint based on API Key prefix
    const isTestMode = apiKey.startsWith('creem_test_');
    const baseUrl = isTestMode ? 'https://test-api.creem.io' : 'https://api.creem.io';
    const endpoint = `${baseUrl}/v1/checkouts`;

    // FORCE VISIBILITY: Using console.error to bypass log filtering
    console.error('Debug Payload:', {
        api_key_prefix: apiKey.substring(0, 5) + '...',
        product_id: productId,
        url: endpoint,
        is_test_mode: isTestMode
    });

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
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

    // Debug logging
    console.error('Webhook signature debug:', {
        received_signature: signature.substring(0, 10) + '...',
        computed_digest: digest.substring(0, 10) + '...',
        secret_prefix: secret.substring(0, 5) + '...',
        payload_length: payload.length
    });

    // Use timing-safe comparison
    try {
        return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch (e) {
        // If lengths don't match, timingSafeEqual throws
        console.error('Signature length mismatch:', { digest_len: digest.length, sig_len: signature.length });
        return false;
    }
}
