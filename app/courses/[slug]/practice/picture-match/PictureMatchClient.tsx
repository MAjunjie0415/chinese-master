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
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto">
        {/* 头部：标题、计时器、进度 */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Picture Match
            </h1>
            <PracticeTimer isActive={true} onTimeUpdate={setTotalTime} />
          </div>
          <PracticeProgress
            current={currentIndex + 1}
            total={words.length}
            showPercentage
          />
        </div>

        {/* 题目卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* 图片区域（用emoji + 汉字表示） */}
          <div className="mb-8">
            <div className="relative w-48 h-48 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
              <div className="text-center">
                <div className="text-7xl font-bold text-gray-900 mb-2">
                  {currentWord.chinese}
                </div>
                <div className="text-xl text-blue-600 font-medium">
                  {currentWord.pinyin}
                </div>
              </div>
            </div>

            {/* 播放发音按钮 */}
            <div className="text-center mt-4">
              <button
                onClick={handlePlaySound}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0m-7.072 0l-1.414 1.414M12 8v8" />
                </svg>
                Play Sound
              </button>
            </div>
          </div>

          {/* 问题 */}
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            What does this word mean?
          </h3>

          {/* 选项 */}
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentWord.english;

              let buttonClass = 'w-full p-4 text-left rounded-lg border-2 font-medium transition-all ';

              if (isSelected) {
                if (isCorrect) {
                  buttonClass += 'bg-green-50 border-green-500 text-green-700';
                } else {
                  buttonClass += 'bg-red-50 border-red-500 text-red-700';
                }
              } else if (selectedAnswer && isCorrectAnswer) {
                // 显示正确答案
                buttonClass += 'bg-green-50 border-green-500 text-green-700';
              } else {
                buttonClass += 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{String.fromCharCode(65 + index)}. {option}</span>
                    {isSelected && isCorrect && (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isSelected && !isCorrect && (
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 即时反馈 */}
          {selectedAnswer && (
            <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-center font-semibold flex items-center justify-center gap-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Perfect! Correct answer!</>
                ) : (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Not quite. The correct answer is highlighted.</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="text-center text-sm text-gray-500">
          <p>Listen to the pronunciation and choose the correct English meaning</p>
        </div>
      </div>
    </div>
  );
}

