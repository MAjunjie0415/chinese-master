'use client';

import Link from 'next/link';

export default function CreateCourseCard() {
    return (
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 transform hover:scale-[1.02] transition-all duration-300">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                            Create Your Course
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                NEW
                            </span>
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Learn from your own materials
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-emerald-900 text-sm">
                    <p className="mb-3 font-medium text-emerald-800">Fast-track your learning with:</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-white px-2 py-1 rounded-md border border-emerald-100 text-emerald-700 font-medium">Emails</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-emerald-100 text-emerald-700 font-medium">Documents</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-emerald-100 text-emerald-700 font-medium">Contracts</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href="/create-course"
                    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-center transition-all shadow-md hover:shadow-emerald-200"
                >
                    Create Course →
                </Link>
            </div>
        </div>
    );
}
