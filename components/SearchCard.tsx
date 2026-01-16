import Link from 'next/link';
import { Suspense } from 'react';

function SearchCardSkeleton() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 rounded-2xl p-6 shadow-xl animate-pulse">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-5 bg-white bg-opacity-30 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-white bg-opacity-30 rounded w-24"></div>
                    </div>
                </div>
                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-4 mb-4">
                    <div className="h-4 bg-white bg-opacity-30 rounded w-40 mb-2"></div>
                </div>
                <div className="h-12 bg-white bg-opacity-30 rounded-xl"></div>
            </div>
        </div>
    );
}

export default function SearchCard() {
    return (
        <div className="relative overflow-hidden bg-primary rounded-xl p-6 shadow-sm border border-slate-700">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2 header-serif">
                            Lexicon Explorer
                            <span className="bg-amber-500/20 text-amber-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-amber-500/30">
                                ADVANCED
                            </span>
                        </h3>
                        <p className="text-slate-300 text-sm font-medium">
                            Contextual Semantic Search
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 text-slate-300 text-sm">
                    <p className="mb-2 font-bold text-[10px] uppercase tracking-widest text-slate-400">Search Parameters:</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-white/10 px-2 py-1 rounded border border-white/10 text-white font-medium">Industry Context</span>
                        <span className="bg-white/10 px-2 py-1 rounded border border-white/10 text-white font-medium">Nuance</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href="/search"
                    className="block w-full bg-white text-primary hover:bg-slate-100 font-bold px-6 py-3 rounded-lg text-center transition-all shadow-sm active:scale-[0.98]"
                >
                    Launch Explorer →
                </Link>
            </div>
        </div>
    );
}
