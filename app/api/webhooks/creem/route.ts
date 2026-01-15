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

        // Verify signature
        if (signature && webhookSecret) {
            const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValid) {
                console.error('Invalid Creem webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        } else if (process.env.NODE_ENV === 'production') {
            console.error('Missing Creem signature or secret in production');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const event = JSON.parse(payload);
        console.log('Received Creem event:', event.type);

        // Creem usually puts metadata at the top level or inside the data object
        // Adjusting based on common patterns
        const userId = event.metadata?.user_id || event.data?.metadata?.user_id;

        if (!userId) {
            console.warn('User ID missing in Creem event metadata');
            return NextResponse.json({ success: true, message: 'Event ignored: No user_id' });
        }

        switch (event.type) {
            case 'checkout.completed':
            case 'subscription.paid':
                // Update user plan to pro
                await db
                    .update(users)
                    .set({ plan: 'pro' })
                    .where(eq(users.id, userId));
                console.log(`[Creem Webhook] User ${userId} upgraded to Pro via ${event.type}`);
                break;

            case 'subscription.canceled':
            case 'subscription.expired':
                // Revert user to free plan
                await db
                    .update(users)
                    .set({ plan: 'free' })
                    .where(eq(users.id, userId));
                console.log(`[Creem Webhook] User ${userId} reverted to Free via ${event.type}`);
                break;

            default:
                console.log('[Creem Webhook] Unhandled event type:', event.type);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        const err = error as Error;
        console.error('Creem Webhook error:', err.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
