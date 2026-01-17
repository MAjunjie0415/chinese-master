export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import CreateCourseClient from './CreateCourseClient';

// Loading skeleton
function AnalyzingSkeleton() {
    return (
        <div className="min-h-screen bg-parchment py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
                    <div className="h-64 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}

// Main page component
async function CreateCoursePage() {
    // Check login status
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    return (
        <div className="min-h-screen bg-parchment py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2 header-serif">
                        <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                        </svg>
                        Create Your Course
                    </h1>
                    <p className="text-gray-600">
                        Paste any Chinese text and we&apos;ll generate a personalized course just for you
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    {!session ? (
                        // Not logged in
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">Please log in to create custom courses</p>
                            <a
                                href="/login?redirect=/create-course"
                                className="inline-block bg-primary text-white font-bold px-10 py-3 rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                            >
                                Log In →
                            </a>
                        </div>
                    ) : (
                        // Logged in - show form
                        <CreateCourseClient />
                    )}
                </div>

                {/* Tips */}
                <div className="mt-6 bg-primary/5 rounded-xl border border-primary/10 p-4">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 header-serif uppercase tracking-widest text-xs">
                        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                        Tips
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Works best with business emails, contracts, or meeting notes</li>
                        <li>• Minimum 50 characters, maximum 10,000 characters</li>
                        <li>• We&apos;ll automatically identify new words for you to learn</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<AnalyzingSkeleton />}>
            <CreateCoursePage />
        </Suspense>
    );
}

