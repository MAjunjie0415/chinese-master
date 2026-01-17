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
    <div className="min-h-screen py-6 px-4 bg-parchment">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="mb-4 paper-card p-6 border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 border-l-4 border-accent pl-4 header-serif">
              Phonetic Module
            </h1>
            <div className="bg-accent/5 text-accent px-3 py-1 rounded font-bold text-xs tracking-widest">
              <PracticeTimer isActive={true} onTimeUpdate={setTotalTime} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Acoustic Progress</span>
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
          {/* 声音播放区域 */}
          <div className="mb-6 w-full">
            <div className="relative w-32 h-32 mx-auto bg-primary/5 rounded-full flex items-center justify-center shadow-inner border border-primary/10">
              <div className="text-center">
                {hasPlayed ? (
                  <div className="animate-pulse">
                    <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                ) : (
                  <div>
                    <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 播放按钮 */}
            <div className="text-center mt-4">
              <button
                onClick={handlePlaySound}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-slate-800 text-white rounded-lg font-bold transition-all shadow-sm text-xs uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recall
              </button>
            </div>
          </div>

          {/* 问题 */}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center px-4">
            Categorize Intonational Frequency
          </h3>

          {/* 声调选项 - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option.tone.toString();
              const isCorrectAnswer = option.tone === correctTone;

              let buttonClass = 'w-full p-4 text-left rounded-xl border-2 font-bold transition-all shadow-sm ';

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
                  <div className="flex items-center gap-2">
                    <ToneMark tone={option.tone} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {isSelected && isCorrect && (
                    <span className="text-xl ml-auto">✓</span>
                  )}
                  {isSelected && !isCorrect && (
                    <span className="text-xl ml-auto">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 即时反馈 */}
          {selectedAnswer && (
            <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? 'bg-accent/5 border-accent/10' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-center font-bold mb-4 flex items-center justify-center gap-2 ${isCorrect ? 'text-accent' : 'text-red-700'}`}>
                {isCorrect ? (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Precise Calibration</>
                ) : (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Frequency Mismatch</>
                )}
              </p>
              <div className="flex justify-center items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <span className="text-slate-900 border-b border-accent/20 pb-0.5">{currentWord.chinese}</span>
                <span>/</span>
                <span className="text-primary">{currentWord.pinyin}</span>
                <span>/</span>
                <span>{currentWord.english}</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 - Compact */}
        <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
          1st: High flat | 2nd: Rising | 3rd: Dipping | 4th: Falling
        </div>
      </div>
    </div>
  );
}

