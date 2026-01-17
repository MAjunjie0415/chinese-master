'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PracticeTimer from '@/components/PracticeTimer';
import PracticeProgress from '@/components/PracticeProgress';
import { playPinyinPronunciation } from '@/lib/pronunciation';
import { createReviewRecords } from '@/lib/practice-utils';

interface Word {
    id: number;
    chinese: string;
    pinyin: string;
    english: string;
}

interface DictationClientProps {
    courseSlug: string;
    courseTitle: string;
    words: Word[];
    userId: string;
}

export default function DictationClient({
    courseSlug,
    courseTitle,
    words,
    userId,
}: DictationClientProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [wrongWords, setWrongWords] = useState<Word[]>([]);
    const [startTime] = useState(() => Date.now());
    const [totalTime, setTotalTime] = useState(0);
    const [wordResults, setWordResults] = useState<Array<{ wordId: number; isCorrect: boolean }>>([]);
    const [showHint, setShowHint] = useState(false);

    const currentWord = words[currentIndex];

    // 生成选项（正确汉字 + 3个干扰汉字）
    const generateOptions = useCallback((correctWord: Word, allWords: Word[]) => {
        const options = [correctWord.chinese];
        const otherWords = allWords.filter((w) => w.id !== correctWord.id);

        while (options.length < 4 && otherWords.length >= 3) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const wrongAnswer = otherWords[randomIndex].chinese;

            if (!options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }

            otherWords.splice(randomIndex, 1);
        }

        return options.sort(() => Math.random() - 0.5);
    }, []);

    const [options, setOptions] = useState<string[]>([]);

    // 初始化每道题
    useEffect(() => {
        if (currentWord) {
            setOptions(generateOptions(currentWord, words));
            setSelectedAnswer(null);
            setIsCorrect(null);
            setShowHint(false);

            // 自动播放发音
            playPinyinPronunciation(currentWord.chinese);
        }
    }, [currentIndex, currentWord, words, generateOptions]);

    // 手动播放发音
    const handlePlaySound = () => {
        if (currentWord) {
            playPinyinPronunciation(currentWord.chinese);
        }
    };

    // 完成练习
    const finishPractice = async (finalScore: number, finalWordResults: Array<{ wordId: number; isCorrect: boolean }>) => {
        const currentTime = Date.now();
        const duration = Math.floor((currentTime - startTime) / 1000);

        try {
            await fetch('/api/practice/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseSlug,
                    mode: 'dictation',
                    correctCount: finalScore,
                    totalCount: words.length,
                    duration,
                }),
            });

            await createReviewRecords(finalWordResults);
        } catch (error) {
            console.error('Error saving practice record:', error);
        }

        const params = new URLSearchParams({
            mode: 'dictation',
            correct: finalScore.toString(),
            total: words.length.toString(),
            duration: duration.toString(),
        });

        router.push(`/courses/${courseSlug}/practice/result?${params.toString()}`);
    };

    // 处理答案选择
    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answer);
        const correct = answer === currentWord.chinese;
        setIsCorrect(correct);

        const newResults = [...wordResults, { wordId: currentWord.id, isCorrect: correct }];
        setWordResults(newResults);

        let newScore = score;
        if (correct) {
            newScore = score + 1;
            setScore(newScore);
        } else {
            setWrongWords([...wrongWords, currentWord]);
        }

        setTimeout(() => {
            if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                finishPractice(newScore, newResults);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen py-6 px-4 bg-parchment">
            <div className="max-w-2xl mx-auto">
                {/* 头部 */}
                <div className="mb-4 paper-card p-6 border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-slate-900 border-l-4 border-accent pl-4 header-serif">
                            Transcription Module
                        </h1>
                        <div className="bg-accent/5 text-accent px-3 py-1 rounded font-bold text-xs tracking-widest">
                            <PracticeTimer isActive={true} onTimeUpdate={setTotalTime} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Transcription Progress</span>
                            <span>{currentIndex + 1} / {words.length}</span>
                        </div>
                        <PracticeProgress
                            current={currentIndex + 1}
                            total={words.length}
                        />
                    </div>
                </div>

                {/* 题目卡片 */}
                <div className="paper-card p-6 md:p-8 mb-4 flex flex-col items-center justify-center border-slate-200">
                    {/* 听力区域 */}
                    <div className="mb-6 text-center w-full">
                        <div className="mb-4">
                            <button
                                onClick={handlePlaySound}
                                className="w-24 h-24 bg-accent hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 group active:scale-95 mx-auto"
                            >
                                <svg className="w-12 h-12 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zm-2.122 2.122a1 1 0 011.414 0 5 5 0 010 7.071 1 1 0 11-1.414-1.414 3 3 0 000-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <p className="mt-2 text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Acoustic Reference</p>
                        </div>

                        {/* Hint Area */}
                        <div className="h-10 flex items-center justify-center">
                            {showHint ? (
                                <div className="text-center animate-fade-in bg-slate-50 px-6 py-2 rounded-lg border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-3">Semantic:</span>
                                    <span className="text-lg font-bold text-slate-700 header-serif">{currentWord.english}</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowHint(true)}
                                    className="text-accent/60 hover:text-accent text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 decoration-accent/20"
                                >
                                    Access Semantic Hint
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 题目 */}
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center px-4">
                        Identify Correlative Characters
                    </h3>

                    {/* 选项 */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {options.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer = option === currentWord.chinese;

                            let buttonClass = 'p-6 text-3xl font-bold rounded-xl border-2 transition-all shadow-sm flex items-center justify-center ';

                            if (isSelected) {
                                if (isCorrect) {
                                    buttonClass += 'border-accent bg-accent/5 text-accent';
                                } else {
                                    buttonClass += 'border-red-500 bg-red-50 text-red-700';
                                }
                            } else if (selectedAnswer && isCorrectAnswer) {
                                buttonClass += 'border-accent/30 bg-accent/5 text-accent';
                            } else {
                                buttonClass += 'border-slate-100 bg-slate-50 text-slate-800 hover:border-primary hover:bg-white';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={selectedAnswer !== null}
                                    className={buttonClass}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {/* 反馈信息 */}
                    {selectedAnswer && (
                        <div className={`mt-4 p-4 rounded-xl border w-full max-w-md ${isCorrect ? 'bg-accent/5 border-accent/10' : 'bg-red-50 border-red-100'}`}>
                            <p className={`text-center font-bold mb-0 flex items-center justify-center gap-2 ${isCorrect ? 'text-accent' : 'text-red-700'}`}>
                                {isCorrect ? (
                                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Transcription Verified</>
                                ) : (
                                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Phonetic Mismatch: {currentWord.pinyin}</>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* 底部提示 */}
                <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                    Auditory-to-Graph Calibration Loop
                </div>
            </div>
        </div>
    );
}
