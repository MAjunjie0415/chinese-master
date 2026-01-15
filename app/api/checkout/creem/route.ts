import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/creem';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get planType and billingPeriod from request body
        const body = await request.json();
        const planType = body.planType || 'pro'; // Default to 'pro'
        const billingPeriod = body.billingPeriod || 'monthly'; // Default to 'monthly'

        // Select the appropriate product ID based on plan type and billing period
        let productId: string | undefined;

        if (planType === 'pro') {
            productId = billingPeriod === 'yearly'
                ? process.env.NEXT_PUBLIC_CREEM_PRO_YEARLY_PRODUCT_ID
                : process.env.NEXT_PUBLIC_CREEM_PRO_MONTHLY_PRODUCT_ID;
        } else if (planType === 'max') {
            productId = billingPeriod === 'yearly'
                ? process.env.NEXT_PUBLIC_CREEM_MAX_YEARLY_PRODUCT_ID
                : process.env.NEXT_PUBLIC_CREEM_MAX_MONTHLY_PRODUCT_ID;
        }

        if (!productId) {
            console.error(`Creem product ID for ${planType} ${billingPeriod} plan is missing`);
            return NextResponse.json({ error: 'Product ID not configured' }, { status: 500 });
        }

        // Map UI plan names to DB plan names
        const dbPlan = planType === 'max' ? 'enterprise' : 'pro';

        const checkoutUrl = await createCheckoutSession(session.user.id, productId, {
            plan: dbPlan
        });

        return NextResponse.json({ checkoutUrl });

    } catch (error) {
        const err = error as Error;
        console.error('Checkout error:', err.message);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
