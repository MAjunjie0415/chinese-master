'use client';

import { useState, useEffect } from 'react';
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

interface PictureMatchClientProps {
  courseSlug: string;
  courseTitle: string;
  words: Word[];
  userId: string;
}

export default function PictureMatchClient({
  courseSlug,
  courseTitle,
  words,
  userId,
}: PictureMatchClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [startTime] = useState(() => Date.now());
  const [totalTime, setTotalTime] = useState(0);
  // 跟踪每个单词的答题结果（用于创建复习记录）
  const [wordResults, setWordResults] = useState<Array<{ wordId: number; isCorrect: boolean }>>([]);

  const currentWord = words[currentIndex];

  // 生成选项（1个正确答案 + 3个干扰项）
  const generateOptions = (correctWord: Word, allWords: Word[]) => {
    const options = [correctWord.english];
    const otherWords = allWords.filter((w) => w.id !== correctWord.id);

    // 随机选择3个干扰项
    while (options.length < 4 && otherWords.length >= 3) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      const wrongAnswer = otherWords[randomIndex].english;

      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }

      otherWords.splice(randomIndex, 1);
    }

    // 打乱顺序
    return options.sort(() => Math.random() - 0.5);
  };

  const [options, setOptions] = useState<string[]>([]);

  // 初始化选项和播放发音
  useEffect(() => {
    if (currentWord) {
      setOptions(generateOptions(currentWord, words));
      setSelectedAnswer(null);
      setIsCorrect(null);

      // 自动播放发音
      playPinyinPronunciation(currentWord.chinese);
    }
  }, [currentIndex, currentWord, words]);

  // 手动播放发音
  const handlePlaySound = () => {
    if (currentWord) {
      playPinyinPronunciation(currentWord.chinese);
    }
  };

  // 处理答案选择
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // 已经选择过了

    setSelectedAnswer(answer);
    const correct = answer === currentWord.english;
    setIsCorrect(correct);

    // 记录答题结果
    setWordResults([...wordResults, { wordId: currentWord.id, isCorrect: correct }]);

    if (correct) {
      setScore(score + 1);
    } else {
      setWrongWords([...wrongWords, currentWord]);
    }

    // 1秒后自动下一题
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 练习完成，跳转结果页
        finishPractice();
      }
    }, 1500);
  };

  // 完成练习
  const finishPractice = async () => {
    const currentTime = Date.now();
    const duration = Math.floor((currentTime - startTime) / 1000);

    try {
      // 1. 保存练习记录
      const response = await fetch('/api/practice/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug,
          mode: 'picture-match',
          correctCount: score,
          totalCount: words.length,
          duration,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save practice record');
      }

      // 2. 创建复习记录（为每个单词创建 user_progress）
      await createReviewRecords(wordResults);
    } catch (error) {
      console.error('Error saving practice record:', error);
    }

    // 跳转结果页（通过URL传递数据）
    const params = new URLSearchParams({
      mode: 'picture-match',
      correct: score.toString(),
      total: words.length.toString(),
      duration: duration.toString(),
    });

    router.push(`/courses/${courseSlug}/practice/result?${params.toString()}`);
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-parchment">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="mb-10 paper-card p-10 border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4 header-serif">
              Visual Synthesis Module
            </h1>
            <div className="bg-primary/5 text-primary px-3 py-1 rounded font-bold text-xs tracking-widest">
              <PracticeTimer isActive={true} onTimeUpdate={setTotalTime} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Visual Progress</span>
              <span>{currentIndex + 1} / {words.length}</span>
            </div>
            <PracticeProgress
              current={currentIndex + 1}
              total={words.length}
            />
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="paper-card p-12 mb-10 min-h-[450px] flex flex-col items-center justify-center border-slate-200">
          {/* 图片区域 */}
          <div className="mb-12 w-full text-center">
            <div className="relative w-48 h-48 mx-auto bg-primary/5 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10">
              <div className="text-center">
                <div className="text-7xl font-bold text-slate-900 mb-4 header-serif">
                  {currentWord.chinese}
                </div>
                <div className="text-xl text-slate-400 font-bold uppercase tracking-[0.2em]">
                  {currentWord.pinyin}
                </div>
              </div>
            </div>

            {/* 播放发音按钮 */}
            <div className="text-center mt-8">
              <button
                onClick={handlePlaySound}
                className="inline-flex items-center gap-3 px-8 py-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg font-bold transition-all text-xs uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0m-7.072 0l-1.414 1.414M12 8v8" />
                </svg>
                Acoustic Anchor
              </button>
            </div>
          </div>

          {/* 问题 */}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 text-center px-4">
            Associate Semantic Identifier
          </h3>

          {/* 选项 */}
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentWord.english;

              let buttonClass = 'w-full p-6 text-left rounded-xl border-2 font-bold text-lg transition-all shadow-sm flex items-center justify-between ';

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
                  <span>{option}</span>
                  {isSelected && (
                    isCorrect ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    )
                  )}
                </button>
              );
            })}
          </div>

          {/* 即时反馈 */}
          {selectedAnswer && (
            <div className={`mt-8 p-6 rounded-xl border ${isCorrect ? 'bg-accent/5 border-accent/10' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-center font-bold mb-0 flex items-center justify-center gap-2 ${isCorrect ? 'text-accent' : 'text-red-700'}`}>
                {isCorrect ? (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Association Verified</>
                ) : (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Semantic Mismatch</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-10">
          Acoustic Reference and Semantic Association Loop
        </div>
      </div>
    </div>
  );
}

