import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkAndIncrementPronunciationQuota } from '@/lib/subscription';

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

        const userId = session.user.id;
        const result = await checkAndIncrementPronunciationQuota(userId);

        if (!result.success) {
            return NextResponse.json({
                error: 'Quota exceeded',
                message: result.message,
                requiresUpgrade: true
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            usageCount: result.usageCount,
            limit: result.limit
        });

    } catch (error) {
        console.error('Usage tracking error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
