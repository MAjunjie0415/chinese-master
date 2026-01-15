import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getUserPlan } from '@/lib/subscription';
import { UpgradePageClient } from './upgrade-client';

interface UpgradePageProps {
    searchParams: { status?: string };
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
    const params = await searchParams;
    const status = params.status;
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">请先登录以升级</h1>
                    <Link href="/login?redirect=/upgrade" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold">
                        登录
                    </Link>
                </div>
            </div>
        );
    }

    const plan = await getUserPlan(session.user.id);

    return <UpgradePageClient plan={plan} status={status} />;
}
