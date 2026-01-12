'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SearchResult {
    chinese: string;
    pinyin: string;
    english: string;
    example_sentence: string | null;
    example_pinyin: string | null;
    example_english: string | null;
    similarity: number;
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        try {
            const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            setResults(data.results || []);
        } catch (err: any) {
            console.error('Search failed:', err);
            setError(err.message || 'Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                        Research 2.0 Beta
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        AI Smart Search
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Don't just translate. Find the <span className="text-blue-600 font-semibold">exact business term</span> for your context.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Describe what you need..."
                            className="w-full px-6 py-5 pl-14 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none shadow-sm group-hover:shadow-md"
                            disabled={loading}
                        />
                        <span className="absolute left-5 top-5 text-gray-400 text-xl">🔍</span>
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg hover:shadow-blue-200"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Searching...
                                </div>
                            ) : (
                                'Search'
                            )}
                        </button>
                    </div>
                </form>

                {/* Suggestion Chips */}
                {!results.length && !loading && (
                    <div className="mb-12 flex flex-wrap justify-center gap-3">
                        <span className="text-gray-400 text-sm font-medium py-2">Try searching:</span>
                        {['Negotiation Phrases', 'HSK 4 Idioms', 'Office Equipment', 'Email Salutations', 'Marketing Terms'].map((chip) => (
                            <button
                                key={chip}
                                onClick={() => { setQuery(chip); }}
                                className="bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-4 py-2 rounded-full text-sm font-medium text-gray-600 transition-all hover:shadow-sm"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {results.length > 0 ? (
                        results.map((res, i) => (
                            <div
                                key={i}
                                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Chinese & Pinyin */}
                                    <div className="md:w-1/3">
                                        <div className="flex items-baseline gap-3 mb-1">
                                            <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight">{res.chinese}</h3>
                                            {/* Level Badge (Mockup based on random logic for demo, ideally comes from DB) */}
                                            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                Vocab
                                            </span>
                                        </div>
                                        <p className="text-blue-600 font-serif text-xl italic mb-2">{res.pinyin}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                {Math.round(res.similarity * 100)}% Relevancy
                                            </span>
                                        </div>
                                    </div>

                                    {/* Definitions & Examples */}
                                    <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="mb-4">
                                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Definition</h4>
                                            <p className="text-gray-800 font-medium text-lg leading-relaxed">{res.english}</p>
                                        </div>

                                        {res.example_sentence && (
                                            <div className="bg-blue-50 rounded-lg p-4 group-hover:bg-blue-100/50 transition-colors">
                                                <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Example Scenario</h4>
                                                <p className="text-gray-900 font-medium mb-1">{res.example_sentence}</p>
                                                <p className="text-gray-500 text-sm mb-1">{res.example_pinyin}</p>
                                                <p className="text-blue-800/80 text-sm">{res.example_english}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : !loading && query && (
                        <div className="text-center py-16">
                            <div className="inline-block bg-gray-100 rounded-full p-6 mb-4">
                                <span className="text-4xl">🤔</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-500">We couldn't find matches for "{query}". <br />Try a broader term or different keywords.</p>
                        </div>
                    )}
                </div>

                {/* Home Link */}
                <div className="mt-12 text-center">
                    <Link href="/" className="text-blue-600 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
