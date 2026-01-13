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
                        Paste your Chinese text
                    </label>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        minLength={50}
                        maxLength={10000}
                        required
                        placeholder="尊敬的李总，感谢贵公司对本次合作的支持..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none text-gray-900 placeholder-gray-400"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {text.length} / 10,000 characters (min 50)
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || text.length < 50}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-4 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⏳</span> Analyzing...
                        </span>
                    ) : (
                        '✨ Analyze & Extract Words'
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
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-teal-600">{result.extractedCount}</div>
                    <div className="text-xs text-gray-500">Words Extracted</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-600">{result.matchedCount}</div>
                    <div className="text-xs text-gray-500">In Dictionary</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">{result.newWordsCount}</div>
                    <div className="text-xs text-gray-500">New For You</div>
                </div>
            </div>

            {/* Word List */}
            <div>
                <h3 className="font-semibold text-gray-700 mb-3">
                    📚 Select words to include ({selectedWords.size} selected)
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {result.newWords.map((word) => (
                        <label
                            key={word.id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedWords.has(word.id)
                                ? 'bg-teal-50 border-2 border-teal-300'
                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedWords.has(word.id)}
                                onChange={() => toggleWord(word.id)}
                                className="w-5 h-5 text-teal-500 rounded"
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
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                    Create Course ({selectedWords.size} words)
                </button>
            </div>
        </div>
    );
}
