'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to the console with its digest
        console.error('🔴 GLOBAL APP ERROR:', error);
        if (error.digest) {
            console.error('Digest:', error.digest);
        }
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-100">
                <div className="text-6xl mb-6">⚙️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
                <p className="text-gray-600 mb-6">
                    The application encountered an unexpected error. This might be due to a database connection issue or a temporary server glitch.
                </p>

                {error.message && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left overflow-auto max-h-40">
                        <p className="text-xs font-mono text-red-600 font-semibold mb-1">Error Message:</p>
                        <p className="text-sm font-mono text-gray-700 break-all">{error.message}</p>
                        {error.digest && (
                            <p className="text-xs font-mono text-gray-400 mt-2">Digest: {error.digest}</p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                    >
                        Try Refreshing
                    </button>
                    <Link
                        href="/"
                        className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                        Go to HomePage
                    </Link>
                </div>

                <p className="mt-8 text-xs text-gray-400">
                    If the problem persists, please contact support with the digest code above.
                </p>
            </div>
        </div>
    );
}
