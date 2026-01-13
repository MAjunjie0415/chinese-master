'use client';

import Link from 'next/link';

export default function CreateCourseCard() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl p-6 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            Create Your Course
                            <span className="bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                NEW
                            </span>
                        </h3>
                        <p className="text-white text-sm opacity-90">
                            Learn from your own materials
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-4 mb-4 text-white text-sm">
                    <p className="mb-2">Upload any Chinese text:</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg">📧 Emails</span>
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg">📄 Documents</span>
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg">💼 Contracts</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href="/create-course"
                    className="block w-full bg-white text-teal-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl text-center transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    Create Course →
                </Link>
            </div>
        </div>
    );
}
