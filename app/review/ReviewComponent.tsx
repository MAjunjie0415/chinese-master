'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playPinyinPronunciation } from '@/lib/pronunciation';
import ReviewProgressRing from '@/components/ReviewProgressRing';
import ReviewCelebration from '@/components/ReviewCelebration';
import AchievementDisplay from '@/components/AchievementDisplay';

export type Review = {
  id: number;
  chinese: string;
  pinyin: string;
  english: string;
  scene: string | null;
  example: string | null;
  category: string;
  frequency: number;
  progressId: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
};

type ReviewComponentProps = {
  reviews: Review[];
  userId: string;
};

// 骨架屏组件
const WordSkeleton = () => (
  <div className="max-w-2xl mx-auto">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-full mb-6 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto mb-4 animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-full mb-6 animate-pulse"></div>
      <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
    </div>
  </div>
);

export default function ReviewComponent({ reviews, userId }: ReviewComponentProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showUndo, setShowUndo] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'know' | 'forgot', index: number } | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: 'correct' | 'incorrect' } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, incorrect: 0 });

  // 模拟初始加载
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // 初始加载骨架屏
  if (isInitialLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <WordSkeleton />
      </div>
    );
  }

  // 空数据处理 - 优化版
  if (reviews.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Great job!</h2>
          <p className="text-xl text-gray-900 mb-4">No reviews today!</p>
          <p className="text-gray-600 mb-8">
            You&apos;ve completed all your reviews. Come back tomorrow for more!
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full md:w-auto bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 active:scale-95 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentWord = reviews[currentIndex];
  const progress = ((currentIndex + 1) / reviews.length) * 100;
  const completed = currentIndex >= reviews.length;

  // 发音处理函数 - 优化错误提示
  const handlePronunciation = async () => {
    setError(null);
    const errorMessage = await playPinyinPronunciation(currentWord.chinese);
    if (errorMessage) {
      if (errorMessage.includes('not supported')) {
        setError("Your browser doesn't support pronunciation. Try Chrome, Edge, or Firefox for better support.");
      } else {
        setError(errorMessage);
      }
    }
  };

  // 撤销功能
  const handleUndo = () => {
    if (lastAction) {
      setCurrentIndex(lastAction.index);
      setShowAnswer(false);
      setShowUndo(false);
      setLastAction(null);
    }
  };

  // 处理"仍掌握" - 使用乐观更新
  const handleStillKnow = async () => {
    setError(null);
    setLastAction({ type: 'know', index: currentIndex });

    // 更新统计
    setReviewStats(prev => ({ ...prev, correct: prev.correct + 1 }));

    // 显示即时反馈
    setShowFeedback({ type: 'correct' });
    setTimeout(() => setShowFeedback(null), 1000);

    // 【乐观更新】立即切换到下一个单词
    const previousIndex = currentIndex;
    const wasShowingAnswer = showAnswer;

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setShowAnswer(false);
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 3000);

      // 如果完成，显示庆祝动画
      if (nextIndex >= reviews.length) {
        setShowCelebration(true);
      }
    }, 800); // 延迟切换，让用户看到反馈

    // 【后台异步保存】
    try {
      setLoading(true);

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          known: true,
          isReview: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update progress');
      }
    } catch (err) {
      // 【错误回滚】
      setCurrentIndex(previousIndex);
      setShowAnswer(wasShowingAnswer);

      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          setError('⚠️ Network issue - progress not saved. Please check your connection and try again.');
        } else if (err.message.includes('Unauthorized')) {
          setError('⚠️ Session expired. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(`⚠️ Failed to save: ${err.message}. Please try again.`);
        }
      } else {
        setError('⚠️ Something went wrong. Progress not saved. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理"已遗忘" - 使用乐观更新
  const handleForgot = async () => {
    setError(null);
    setLastAction({ type: 'forgot', index: currentIndex });

    // 更新统计
    setReviewStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));

    // 显示即时反馈
    setShowFeedback({ type: 'incorrect' });
    setTimeout(() => setShowFeedback(null), 1000);

    // 【乐观更新】立即切换到下一个单词
    const previousIndex = currentIndex;
    const wasShowingAnswer = showAnswer;

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setShowAnswer(false);
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 3000);

      // 如果完成，显示庆祝动画
      if (nextIndex >= reviews.length) {
        setShowCelebration(true);
      }
    }, 800); // 延迟切换，让用户看到反馈

    // 【后台异步保存】
    try {
      setLoading(true);

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          known: false,
          isReview: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update progress');
      }
    } catch (err) {
      // 【错误回滚】
      setCurrentIndex(previousIndex);
      setShowAnswer(wasShowingAnswer);

      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          setError('⚠️ Network issue - progress not saved. Please check your connection and try again.');
        } else if (err.message.includes('Unauthorized')) {
          setError('⚠️ Session expired. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(`⚠️ Failed to save: ${err.message}. Please try again.`);
        }
      } else {
        setError('⚠️ Something went wrong. Progress not saved. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 复习完成
  if (completed) {
    const totalReviewed = reviewStats.correct + reviewStats.incorrect;
    const accuracy = totalReviewed > 0 ? Math.round((reviewStats.correct / totalReviewed) * 100) : 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        {/* 庆祝动画 */}
        {showCelebration && (
          <ReviewCelebration
            reviewCount={reviews.length}
            onAnimationComplete={() => setShowCelebration(false)}
          />
        )}

        <div className="text-center max-w-2xl w-full">
          {/* 完成图标 */}
          <div className="text-8xl mb-6 animate-bounce">🎉</div>

          <h2 className="text-4xl font-bold mb-4 text-gray-900">Review Complete!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Great job! You&apos;ve reviewed <strong className="text-orange-600">{reviews.length}</strong> words today.
          </p>

          {/* 复习统计卡片 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Review Stats</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* 正确率 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>

              {/* 正确数 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {reviewStats.correct}
                </div>
                <div className="text-sm text-gray-600">Still Know</div>
              </div>

              {/* 错误数 */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {reviewStats.incorrect}
                </div>
                <div className="text-sm text-gray-600">Forgot</div>
              </div>
            </div>

            {/* 鼓励语 */}
            {accuracy >= 80 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 mb-4">
                <p className="text-green-700 font-semibold">
                  🌟 Excellent! You remembered most of the words!
                </p>
              </div>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
                <p className="text-blue-700 font-semibold">
                  💪 Good job! Keep reviewing to strengthen your memory!
                </p>
              </div>
            )}
            {accuracy < 60 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 mb-4">
                <p className="text-orange-700 font-semibold">
                  📚 Don&apos;t worry! Review these words again soon to improve.
                </p>
              </div>
            )}
          </div>

          {/* 成就展示 */}
          <div className="mb-6">
            <AchievementDisplay compact={true} />
          </div>

          {/* 鼓励继续学习的卡片 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
            <p className="text-gray-700 font-semibold mb-2 text-lg">
              🚀 <strong>Keep the momentum going!</strong>
            </p>
            <p className="text-sm text-gray-600">
              You&apos;ve reviewed {reviews.length} words from your courses. Keep learning to expand your vocabulary!
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {/* 优先按钮：继续学习 */}
            <button
              onClick={() => router.push('/courses')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              📚 Learn More Words
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-300 active:scale-95 transition-all"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const remainingCount = reviews.length - currentIndex - 1;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Today&apos;s Reviews</h1>

        {/* 进度可视化 - 优化版 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* 进度圆环 */}
            <ReviewProgressRing
              current={currentIndex + 1}
              total={reviews.length}
              size={100}
              strokeWidth={8}
            />

            {/* 进度信息 */}
            <div className="flex-1 ml-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  Progress
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(progress)}%
                </span>
              </div>
              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {/* 剩余单词数 */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {remainingCount > 0 ? `${remainingCount} ${remainingCount === 1 ? 'word' : 'words'} remaining` : 'Last word!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 单词内容区 */}
        <div className="relative">
          {/* 错误提示 - 优化版 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <p className="text-red-600 font-medium mb-2">⚠️ {error}</p>
              {error.includes('network') && (
                <p className="text-sm text-red-500">Try refreshing the page or checking your internet.</p>
              )}
              {error.includes('browser') && (
                <p className="text-sm text-red-500">Use Chrome, Edge, or Firefox for better support.</p>
              )}
            </div>
          )}

          {/* 撤销提示 */}
          {showUndo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between animate-pulse">
              <span className="text-blue-600 text-sm">Action recorded!</span>
              <button
                onClick={handleUndo}
                className="text-blue-600 text-sm font-semibold underline hover:text-blue-700"
              >
                Undo?
              </button>
            </div>
          )}

          {/* 即时反馈动画 */}
          {showFeedback && (
            <div className={`fixed inset-0 flex items-center justify-center pointer-events-none z-50 ${showFeedback.type === 'correct' ? 'animate-bounce' : 'animate-pulse'
              }`}>
              <div className={`text-8xl ${showFeedback.type === 'correct' ? 'text-green-500' : 'text-red-500'
                }`}>
                {showFeedback.type === 'correct' ? '✅' : '❌'}
              </div>
            </div>
          )}

          {/* 单词卡片 - 优化版 */}
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 transition-all duration-300">
            {/* 课程来源标签 */}
            <div className="mb-4 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                📚 {currentWord.courseTitle}
              </span>
            </div>

            {/* 问题面 */}
            {!showAnswer && (
              <div className="animate-fadeIn">
                {/* 拼音 */}
                <div className="text-center mb-6">
                  <p className="text-3xl text-blue-600 font-semibold mb-4">{currentWord.pinyin}</p>
                </div>

                {/* 英文释义 */}
                <div className="text-center mb-8">
                  <p className="text-xl text-gray-700 font-medium">{currentWord.english}</p>
                </div>

                {/* 按钮区 */}
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => setShowAnswer(true)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Show Answer'}
                  </button>
                </div>
              </div>
            )}

            {/* 答案面 */}
            {showAnswer && (
              <div className="animate-fadeIn">
                {/* 汉字 */}
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-gray-900 mb-4">{currentWord.chinese}</p>
                  <p className="text-2xl text-blue-600 font-semibold">{currentWord.pinyin}</p>
                </div>

                {/* 英文释义 */}
                <div className="text-center mb-6">
                  <p className="text-xl text-gray-700 font-medium">{currentWord.english}</p>
                </div>

                {/* 例句 */}
                {currentWord.example && (
                  <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 italic">&ldquo;{currentWord.example}&rdquo;</p>
                  </div>
                )}

                {/* 发音按钮 */}
                <div className="text-center mb-6">
                  <button
                    onClick={handlePronunciation}
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-100 active:scale-95 transition-all font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0m-7.072 0l-1.414 1.414M12 8v8" />
                    </svg>
                    Play Pronunciation
                  </button>
                </div>

                {/* 按钮区 */}
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={handleForgot}
                    disabled={loading}
                    className="w-full md:flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Saving...' : '❌ Forgot'}
                  </button>
                  <button
                    onClick={handleStillKnow}
                    disabled={loading}
                    className="w-full md:flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Saving...' : '✅ Still Know'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @media (max-width: 768px) {
          .flex.gap-4 {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
