'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Review Page Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-6">😓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong!
                </h2>
                <p className="text-gray-600 mb-8">
                    We couldn't load your review session. This might be due to a temporary connection issue.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="w-full bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
