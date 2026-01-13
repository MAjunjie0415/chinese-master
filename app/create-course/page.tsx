export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import CreateCourseClient from './CreateCourseClient';

// Loading skeleton
function AnalyzingSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4">
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🎯 Create Your Course
                    </h1>
                    <p className="text-gray-600">
                        Paste any Chinese text and we&apos;ll generate a personalized course just for you
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {!session ? (
                        // Not logged in
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">Please log in to create custom courses</p>
                            <a
                                href="/login?redirect=/create-course"
                                className="inline-block bg-teal-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-all"
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
                <div className="mt-6 bg-white bg-opacity-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">💡 Tips</h3>
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

