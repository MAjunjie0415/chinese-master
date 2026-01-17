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

interface TranslationClientProps {
    courseSlug: string;
    courseTitle: string;
    words: Word[];
    userId: string;
}

export default function TranslationClient({
    courseSlug,
    courseTitle,
    words,
    userId,
}: TranslationClientProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [wrongWords, setWrongWords] = useState<Word[]>([]);
    const [startTime] = useState(() => Date.now());
    const [totalTime, setTotalTime] = useState(0);
    const [wordResults, setWordResults] = useState<Array<{ wordId: number; isCorrect: boolean }>>([]);

    // 翻译方向：0 = Chinese to English, 1 = English to Chinese
    const [direction, setDirection] = useState<number>(0);

    const currentWord = words[currentIndex];

    // 生成选项
    const generateOptions = useCallback((correctWord: Word, allWords: Word[], dir: number) => {
        const correctValue = dir === 0 ? correctWord.english : correctWord.chinese;
        const options = [correctValue];
        const otherWords = allWords.filter((w) => w.id !== correctWord.id);

        // 随机选择3个干扰项
        while (options.length < 4 && otherWords.length >= 3) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const wrongAnswer = dir === 0 ? otherWords[randomIndex].english : otherWords[randomIndex].chinese;

            if (!options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }

            otherWords.splice(randomIndex, 1);
        }

        // 打乱顺序
        return options.sort(() => Math.random() - 0.5);
    }, []);

    const [options, setOptions] = useState<string[]>([]);

    // 初始化每道题
    useEffect(() => {
        if (currentWord) {
            // 随机决定方向
            const newDir = Math.random() > 0.5 ? 1 : 0;
            setDirection(newDir);
            setOptions(generateOptions(currentWord, words, newDir));
            setSelectedAnswer(null);
            setIsCorrect(null);

            // 如果是中翻英，自动播放发音
            if (newDir === 0) {
                playPinyinPronunciation(currentWord.chinese);
            }
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
            // 1. 保存练习记录
            await fetch('/api/practice/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseSlug,
                    mode: 'translation',
                    correctCount: finalScore,
                    totalCount: words.length,
                    duration,
                }),
            });

            // 2. 创建复习记录
            await createReviewRecords(finalWordResults);
        } catch (error) {
            console.error('Error saving practice record:', error);
        }

        // 跳转结果页
        const params = new URLSearchParams({
            mode: 'translation',
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
        const correctValue = direction === 0 ? currentWord.english : currentWord.chinese;
        const correct = answer === correctValue;
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

        // 给用户一点反馈时间
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
                        <h1 className="text-xl font-bold text-slate-900 border-l-4 border-primary pl-4 header-serif">
                            Synthesis Module
                        </h1>
                        <div className="bg-primary/5 text-primary px-3 py-1 rounded font-bold text-xs tracking-widest">
                            <PracticeTimer isActive={true} onTimeUpdate={setTotalTime} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Analysis Progress</span>
                            <span>{currentIndex + 1} / {words.length}</span>
                        </div>
                        <PracticeProgress
                            current={currentIndex + 1}
                            total={words.length}
                        />
                    </div>
                </div>

                {/* 题目卡片 */}
                <div className="paper-card p-6 md:p-8 mb-4 flex flex-col justify-center border-slate-200">
                    {/* 问题区域 */}
                    <div className="text-center mb-6">
                        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 bg-slate-50 px-4 py-1 rounded-full mb-4 inline-block uppercase tracking-widest">
                            {direction === 0 ? 'Hanzi → English' : 'English → Hanzi'}
                        </span>

                        <div className="py-6">
                            {direction === 0 ? (
                                <>
                                    <div className="text-5xl font-bold text-slate-900 mb-2 header-serif">
                                        {currentWord.chinese}
                                    </div>
                                    <div className="text-lg text-slate-400 font-bold uppercase tracking-[0.2em]">
                                        {currentWord.pinyin}
                                    </div>
                                </>
                            ) : (
                                <div className="text-3xl font-bold text-slate-900 header-serif leading-tight">
                                    {currentWord.english}
                                </div>
                            )}
                        </div>

                        {/* 播放按钮 */}
                        <div className="mt-2">
                            <button
                                onClick={handlePlaySound}
                                className="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-full transition-all active:scale-90"
                                title="Acoustic Reference"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0m-7.072 0l-1.414 1.414M12 8v8" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 选项 */}
                    <div className="grid grid-cols-2 gap-3">
                        {options.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const correctValue = direction === 0 ? currentWord.english : currentWord.chinese;
                            const isCorrectAnswer = option === correctValue;

                            let buttonClass = 'w-full p-4 text-center rounded-xl border-2 font-bold text-base transition-all shadow-sm flex flex-col items-center justify-center gap-1 ';

                            if (isSelected) {
                                if (isCorrect) {
                                    buttonClass += 'bg-accent/5 border-accent text-accent';
                                } else {
                                    buttonClass += 'bg-red-50 border-red-200 text-red-600';
                                }
                            } else if (selectedAnswer && isCorrectAnswer) {
                                buttonClass += 'bg-accent/5 border-accent/30 text-accent';
                            } else {
                                buttonClass += 'bg-slate-50 border-slate-100 text-slate-700 hover:border-primary hover:bg-white';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={selectedAnswer !== null}
                                    className={buttonClass}
                                >
                                    <span className="truncate w-full">{option}</span>
                                    {isSelected && (
                                        isCorrect ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                        )
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 反馈 */}
                    <div className="h-12 mt-4">
                        {selectedAnswer && (
                            <div className={`p-2 rounded-lg text-center font-bold flex items-center justify-center gap-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {isCorrect ? (
                                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Correct!</>
                                ) : (
                                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg> Keep going!</>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 底部提示 */}
                <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                    Both directions are randomized
                </div>
            </div>
        </div>
    );
}
