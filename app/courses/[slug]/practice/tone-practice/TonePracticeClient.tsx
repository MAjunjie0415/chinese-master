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

interface TonePracticeClientProps {
  courseSlug: string;
  courseTitle: string;
  words: Word[];
  userId: string;
}

// 声调图标组件
function ToneMark({ tone }: { tone: number }) {
  const paths = [
    '', // 0: no tone
    'M10,15 L50,15', // 1st tone: flat high
    'M10,25 L50,10', // 2nd tone: rising
    'M10,15 L30,25 L50,10', // 3rd tone: dipping
    'M10,10 L50,25', // 4th tone: falling
  ];

  const colors = ['#999', '#4CAF50', '#2196F3', '#FF9800', '#F44336'];

  return (
    <svg width="60" height="35" viewBox="0 0 60 35">
      <path
        d={paths[tone]}
        stroke={colors[tone]}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TonePracticeClient({
  courseSlug,
  courseTitle,
  words,
  userId,
}: TonePracticeClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [startTime] = useState(() => Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  // 跟踪每个单词的答题结果（用于创建复习记录）
  const [wordResults, setWordResults] = useState<Array<{ wordId: number; isCorrect: boolean }>>([]);

  const currentWord = words[currentIndex];

  // 提取声调数字（从拼音中）
  const getToneNumber = (pinyin: string): number => {
    // 简化：检测拼音中的声调标记
    if (/[āēīōūǖ]/.test(pinyin)) return 1; // 第1声
    if (/[áéíóúǘ]/.test(pinyin)) return 2; // 第2声
    if (/[ǎěǐǒǔǚ]/.test(pinyin)) return 3; // 第3声
    if (/[àèìòùǜ]/.test(pinyin)) return 4; // 第4声
    return 1; // 默认第1声
  };

  // 生成声调选项（只显示声调编号，不显示拼音）
  const generateToneOptions = (correctPinyin: string) => {
    // 只返回4个声调选项，不暴露任何拼音信息
    return [
      { tone: 1, label: '1st Tone — High flat' },
      { tone: 2, label: '2nd Tone — Rising' },
      { tone: 3, label: '3rd Tone — Dipping' },
      { tone: 4, label: '4th Tone — Falling' },
    ];
  };

  const [options, setOptions] = useState<Array<{ tone: number; label: string }>>([]);;

  // 初始化选项并播放发音
  useEffect(() => {
    if (currentWord) {
      setOptions(generateToneOptions(currentWord.pinyin));
      setSelectedAnswer(null);
      setIsCorrect(null);
      setHasPlayed(false);

      // 自动播放发音
      setTimeout(() => {
        playPinyinPronunciation(currentWord.chinese);
        setHasPlayed(true);
      }, 500);
    }
  }, [currentIndex, currentWord]);

  // 手动重放发音
  const handlePlaySound = () => {
    if (currentWord) {
      playPinyinPronunciation(currentWord.chinese);
    }
  };

  // 处理答案选择
  const handleAnswerSelect = (selectedOption: { tone: number; label: string }) => {
    if (selectedAnswer !== null) return; // 已经选择过了

    setSelectedAnswer(selectedOption.tone.toString());
    const correctTone = getToneNumber(currentWord.pinyin);
    const correct = selectedOption.tone === correctTone;
    setIsCorrect(correct);

    // 记录答题结果
    setWordResults([...wordResults, { wordId: currentWord.id, isCorrect: correct }]);

    if (correct) {
      setScore(score + 1);
    } else {
      setWrongWords([...wrongWords, currentWord]);
    }

    // 2秒后自动下一题
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 练习完成，跳转结果页
        finishPractice();
      }
    }, 2000);
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
          mode: 'tone-practice',
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

    // 跳转结果页
    const params = new URLSearchParams({
      mode: 'tone-practice',
      correct: score.toString(),
      total: words.length.toString(),
      duration: duration.toString(),
    });

    router.push(`/courses/${courseSlug}/practice/result?${params.toString()}`);
  };

  const correctTone = getToneNumber(currentWord.pinyin);

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Tone Training
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
          {/* 声音播放区域 */}
          <div className="mb-8">
            <div className="relative w-48 h-48 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-inner">
              <div className="text-center">
                {hasPlayed ? (
                  <div className="animate-pulse">
                    <svg className="w-24 h-24 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                ) : (
                  <div>
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 播放按钮 */}
            <div className="text-center mt-6">
              <button
                onClick={handlePlaySound}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Play Again
              </button>
            </div>
          </div>

          {/* 问题 */}
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Which tone did you hear?
          </h3>

          {/* 声调选项 */}
          <div className="grid grid-cols-1 gap-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option.tone.toString();
              const isCorrectAnswer = option.tone === correctTone;

              let buttonClass = 'w-full p-5 text-left rounded-xl border-2 font-medium transition-all ';

              if (isSelected) {
                if (isCorrect) {
                  buttonClass += 'bg-green-50 border-green-500';
                } else {
                  buttonClass += 'bg-red-50 border-red-500';
                }
              } else if (selectedAnswer && isCorrectAnswer) {
                buttonClass += 'bg-green-50 border-green-500';
              } else {
                buttonClass += 'bg-white border-gray-300 hover:border-emerald-400 hover:bg-emerald-50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ToneMark tone={option.tone} />
                      <span className="text-lg">{option.label}</span>
                    </div>
                    {isSelected && isCorrect && (
                      <span className="text-3xl">✓</span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="text-3xl">✗</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 即时反馈 */}
          {selectedAnswer && (
            <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-center font-semibold mb-2 flex items-center justify-center gap-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Excellent! Correct tone!</>
                ) : (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Not quite. Listen carefully to the tone.</>
                )}
              </p>
              <p className="text-center text-sm text-gray-600">
                Word: <span className="font-semibold">{currentWord.chinese}</span> ({currentWord.pinyin}) - {currentWord.english}
              </p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="bg-emerald-100 border-2 border-emerald-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Tone Guide</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>1st tone:</strong> High and flat (―)</li>
                <li>• <strong>2nd tone:</strong> Rising (ˊ)</li>
                <li>• <strong>3rd tone:</strong> Dipping (ˇ)</li>
                <li>• <strong>4th tone:</strong> Falling (ˋ)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

