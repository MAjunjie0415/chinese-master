import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/creem';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('creem-signature');
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

        console.error('[Creem Webhook] Received request');

        // Verify signature
        if (signature && webhookSecret) {
            const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValid) {
                console.error('[Creem Webhook] Invalid signature - rejecting');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
            console.error('[Creem Webhook] Signature verified successfully');
        } else if (process.env.NODE_ENV === 'production') {
            console.error('[Creem Webhook] Missing signature or secret in production');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        } else {
            console.error('[Creem Webhook] Skipping signature verification (dev mode)');
        }

        const event = JSON.parse(payload);
        const eventType = event.eventType || event.type;
        console.error('[Creem Webhook] Event type:', eventType);

        // Debug: Log full event structure
        console.error('[Creem Webhook] Full event:', JSON.stringify(event, null, 2));

        // Try multiple paths where Creem might put metadata (based on official docs)
        // Official structure: event.object.metadata
        const userId =
            event.object?.metadata?.user_id ||
            event.object?.metadata?.userId ||
            event.object?.subscription?.metadata?.user_id ||
            event.object?.subscription?.metadata?.userId ||
            event.metadata?.user_id ||
            event.metadata?.userId ||
            event.data?.metadata?.user_id ||
            event.data?.object?.metadata?.user_id;

        console.error('[Creem Webhook] Extracted userId:', userId);

        if (!userId) {
            console.error('[Creem Webhook] No user_id found in any metadata path');
            console.error('[Creem Webhook] Available object keys:', Object.keys(event.object || {}));
            if (event.object?.metadata) {
                console.error('[Creem Webhook] object.metadata:', JSON.stringify(event.object.metadata));
            }
            if (event.object?.subscription?.metadata) {
                console.error('[Creem Webhook] object.subscription.metadata:', JSON.stringify(event.object.subscription.metadata));
            }
            return NextResponse.json({ success: true, message: 'Event ignored: No user_id found' });
        }

        // Determine base information from event
        const productId = event.object?.product?.id || event.object?.order?.product;
        const customerEmail = event.object?.customer?.email || event.object?.order?.customer_email;
        const billingPeriod = event.object?.product?.billing_period || event.object?.order?.billing_period;

        // Map Creem billing_period (e.g. 'every-month', 'every-year') to our schema
        let planInterval: 'month' | 'year' | null = null;
        if (billingPeriod) {
            if (billingPeriod.includes('month')) planInterval = 'month';
            else if (billingPeriod.includes('year')) planInterval = 'year';
        }

        // Determine plan type based on metadata or product ID
        const metadataPlan =
            event.object?.metadata?.plan ||
            event.object?.subscription?.metadata?.plan;

        let detectedPlan: 'pro' | 'enterprise' = 'pro';

        if (metadataPlan === 'enterprise' || metadataPlan === 'max') {
            detectedPlan = 'enterprise';
        } else if (productId) {
            // Fallback: Check specific product IDs for Max plan
            const maxProductIds = [
                'prod_1cShfumszn00Q0W3a8aVVD', // Max Monthly
                'prod_6HjFCEsaVeoQzy7iKa7RDy'  // Max Yearly
            ];
            if (maxProductIds.includes(productId)) {
                detectedPlan = 'enterprise';
            }
        }

        console.error('[Creem Webhook] Product ID:', productId);
        console.error('[Creem Webhook] Metadata Plan:', metadataPlan);
        console.error('[Creem Webhook] Detected Plan:', detectedPlan);
        console.error('[Creem Webhook] Customer Email:', customerEmail);
        console.error('[Creem Webhook] Billing Period:', billingPeriod, '->', planInterval);

        switch (eventType) {
            case 'checkout.completed':
            case 'subscription.paid':
            case 'subscription.active':
                // Update user plan
                const result = await db
                    .insert(users)
                    .values({
                        id: userId,
                        email: customerEmail || 'unknown@example.com',
                        plan: detectedPlan,
                        planInterval: planInterval,
                        isPro: true,
                    })
                    .onConflictDoUpdate({
                        target: [users.id],
                        set: {
                            plan: detectedPlan,
                            planInterval: planInterval,
                            isPro: true,
                            updatedAt: new Date()
                        },
                    })
                    .returning({ id: users.id, plan: users.plan, planInterval: users.planInterval });

                console.error(`[Creem Webhook] Synced user ${userId} to ${detectedPlan} (${planInterval}) via ${eventType}`, result);
                break;

            case 'subscription.canceled':
            case 'subscription.expired':
                // Revert user to free plan
                await db
                    .update(users)
                    .set({ plan: 'free' })
                    .where(eq(users.id, userId));
                console.error(`[Creem Webhook] Reverted user ${userId} to Free via ${eventType}`);
                break;

            default:
                console.error('[Creem Webhook] Unhandled event type:', eventType);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        const err = error as Error;
        console.error('[Creem Webhook] Error:', err.message, err.stack);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

