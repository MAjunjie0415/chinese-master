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
            <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
                <div className="paper-card p-12 border-slate-200 text-center max-w-md bg-white">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 header-serif">Authorization Required</h2>
                    <p className="text-muted mb-8 font-medium">Please authenticate to access institutional licensing options.</p>
                    <Link
                        href="/login?redirect=/upgrade"
                        className="inline-block bg-primary text-white px-10 py-4 rounded font-bold hover:bg-slate-800 transition-all text-xs uppercase tracking-widest shadow-sm active:scale-95"
                    >
                        Authorize Session
                    </Link>
                </div>
            </div>
        );
    }

    const plan = await getUserPlan(session.user.id);

    return <UpgradePageClient plan={plan} status={status} />;
}
