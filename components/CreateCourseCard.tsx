'use client';

import Link from 'next/link';

export default function CreateCourseCard() {
    return (
        <div className="relative overflow-hidden paper-card p-6 border-slate-200">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg flex items-center gap-2 header-serif">
                            Create Curriculum
                            <span className="bg-accent/10 text-accent text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-accent/20">
                                Premium
                            </span>
                        </h3>
                        <p className="text-muted text-sm font-medium">
                            Digitize your own work materials
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 text-slate-700 text-sm border border-slate-100">
                    <p className="mb-3 font-bold text-slate-800 uppercase tracking-widest text-[10px]">Supported Formats:</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 font-medium">Internal Memos</span>
                        <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 font-medium">Bilingual Reports</span>
                        <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 font-medium">Contracts</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href="/create-course"
                    className="block w-full bg-primary hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-lg text-center transition-all shadow-sm active:scale-[0.98]"
                >
                    Initialize Course →
                </Link>
            </div>
        </div>
    );
}
