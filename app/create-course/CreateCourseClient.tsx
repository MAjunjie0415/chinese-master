'use client';

import { useState } from 'react';

interface ExtractedWord {
    id: number;
    chinese: string;
    pinyin: string;
    english: string;
    frequency: number;
}

interface AnalysisResult {
    success: boolean;
    totalWordsInText: number;
    extractedCount: number;
    matchedCount: number;
    newWordsCount: number;
    newWords: ExtractedWord[];
    suggestedCourseTitle: string;
}

export default function CreateCourseClient() {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/analyze-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze text');
            }

            setResult(data);
            // Select all words by default
            setSelectedWords(new Set(data.newWords.map((w: ExtractedWord) => w.id)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleWord = (wordId: number) => {
        const newSelected = new Set(selectedWords);
        if (newSelected.has(wordId)) {
            newSelected.delete(wordId);
        } else {
            newSelected.add(wordId);
        }
        setSelectedWords(newSelected);
    };

    const handleCreateCourse = async () => {
        if (selectedWords.size === 0) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/courses/create-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: result?.suggestedCourseTitle || 'My Custom Course',
                    wordIds: Array.from(selectedWords),
                    sourceText: text,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create course');
            }

            // Redirect to the new course
            window.location.href = `/courses/${data.course.slug}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create course');
            setIsLoading(false);
        }
    };


    // Show form if no result
    if (!result) {
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                        Describe what you want to learn, or paste Chinese text
                    </label>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        minLength={20}
                        maxLength={10000}
                        required
                        placeholder="Examples:&#10;• I want to learn words for business meetings&#10;• Words for negotiating a contract&#10;• 尊敬的李总，感谢贵公司对本次合作的支持..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-slate-50/50 resize-none text-slate-900 placeholder-slate-400 font-medium transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {text.length} / 10,000 characters (min 20) • English description or Chinese text both work!
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || text.length < 20}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Analyzing...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                            </svg>
                            Analyze & Extract Words
                        </span>
                    )}
                </button>
            </form>
        );
    }

    // Show results
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-primary">{result.extractedCount}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Words Found</div>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-accent">{result.matchedCount}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">In Lexicon</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900">{result.newWordsCount}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">New For You</div>
                </div>
            </div>

            {/* Word List */}
            <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 header-serif">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Selection List ({selectedWords.size} selected)
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {result.newWords.map((word) => (
                        <label
                            key={word.id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${selectedWords.has(word.id)
                                ? 'bg-primary/5 border-accent/30'
                                : 'bg-slate-50 border-transparent hover:bg-slate-100/80'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedWords.has(word.id)}
                                onChange={() => toggleWord(word.id)}
                                className="w-5 h-5 text-accent rounded border-slate-300 focus:ring-accent"
                            />
                            <div className="flex-1">
                                <span className="font-semibold text-gray-900">{word.chinese}</span>
                                <span className="text-gray-400 mx-2">·</span>
                                <span className="text-gray-500">{word.pinyin}</span>
                            </div>
                            <span className="text-sm text-gray-600">{word.english}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={() => setResult(null)}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all"
                >
                    ← Back
                </button>
                <button
                    onClick={handleCreateCourse}
                    disabled={selectedWords.size === 0}
                    className="flex-1 bg-accent text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-md shadow-accent/10 disabled:opacity-50 active:scale-[0.98]"
                >
                    Create Course ({selectedWords.size})
                </button>
            </div>
        </div>
    );
}
