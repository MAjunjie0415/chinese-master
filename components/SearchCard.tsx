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
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 rounded-2xl p-6 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl">🔍</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            Research 2.0
                            <span className="bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                NEW
                            </span>
                        </h3>
                        <p className="text-white text-sm opacity-90">
                            AI Smart Search
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-4 mb-4 text-white text-sm">
                    <p className="mb-2">Search by:</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg">Meaning</span>
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg">Context</span>
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg">Scenario</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href="/search"
                    className="block w-full bg-white text-blue-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl text-center transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    Try Search →
                </Link>
            </div>
        </div>
    );
}
