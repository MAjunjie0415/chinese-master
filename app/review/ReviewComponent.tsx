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
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-6 animate-pulse"></div>
    <div className="paper-card p-8 md:p-12">
      <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
      <div className="h-6 bg-slate-200 rounded w-full mb-6 animate-pulse"></div>
      <div className="h-10 bg-slate-200 rounded w-2/3 mx-auto mb-4 animate-pulse"></div>
      <div className="h-6 bg-slate-200 rounded w-full mb-6 animate-pulse"></div>
      <div className="h-12 bg-slate-200 rounded w-full animate-pulse"></div>
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
      <div className="min-h-screen py-8 px-4 bg-parchment">
        <WordSkeleton />
      </div>
    );
  }

  // 空数据处理 - Premium版
  if (reviews.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-parchment">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-accent mb-2 header-serif">Great job!</h2>
          <p className="text-xl text-slate-900 mb-4 font-bold">No reviews today!</p>
          <p className="text-slate-600 mb-8 font-medium">
            You&apos;ve completed all your reviews. Come back tomorrow for more!
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded font-bold hover:bg-slate-800 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-sm"
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-parchment">
        {/* 庆祝动画 */}
        {showCelebration && (
          <ReviewCelebration
            reviewCount={reviews.length}
            onAnimationComplete={() => setShowCelebration(false)}
          />
        )}

        <div className="text-center max-w-2xl w-full">
          {/* 完成图标 */}
          <div className="w-24 h-24 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-14 h-14 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-4xl font-bold mb-4 text-slate-900 header-serif">Review Complete!</h2>
          <p className="text-xl text-slate-600 mb-8 font-medium">
            Great job! You&apos;ve reviewed <strong className="text-accent">{reviews.length}</strong> words today.
          </p>

          {/* 复习统计卡片 */}
          <div className="paper-card p-8 mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 header-serif">Your Review Stats</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* 正确率 */}
              <div className="bg-accent/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-accent mb-1">
                  {accuracy}%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</div>
              </div>

              {/* 正确数 */}
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {reviewStats.correct}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Still Know</div>
              </div>

              {/* 错误数 */}
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {reviewStats.incorrect}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forgot</div>
              </div>
            </div>

            {/* 鼓励语 */}
            {accuracy >= 80 && (
              <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mb-4">
                <p className="text-accent font-bold flex items-center gap-2 justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Excellent! You remembered most of the words!
                </p>
              </div>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-4">
                <p className="text-primary font-bold flex items-center gap-2 justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  Good job! Keep reviewing to strengthen your memory!
                </p>
              </div>
            )}
            {accuracy < 60 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                <p className="text-red-600 font-bold flex items-center gap-2 justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Don&apos;t worry! Review these words again soon to improve.
                </p>
              </div>
            )}
          </div>

          {/* 成就展示 */}
          <div className="mb-6">
            <AchievementDisplay compact={true} />
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {/* 优先按钮：继续学习 */}
            <button
              onClick={() => router.push('/courses')}
              className="w-full bg-primary text-white px-8 py-4 rounded font-bold text-xs uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Learn More Words
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-slate-100 text-slate-700 px-8 py-4 rounded font-bold text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const remainingCount = reviews.length - currentIndex - 1;

  return (
    <div className="min-h-screen py-8 px-4 bg-parchment">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-900 header-serif">Today&apos;s Reviews</h1>

        {/* 进度可视化 */}
        <div className="paper-card p-6 mb-6">
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
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${showFeedback.type === 'correct' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {showFeedback.type === 'correct' ? (
                  <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* 单词卡片 - 优化版 */}
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 transition-all duration-300">
            {/* 课程来源标签 */}
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {currentWord.courseTitle}
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
                    className="w-full md:flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Saving...</>
                    ) : (
                      <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Forgot</>
                    )}
                  </button>
                  <button
                    onClick={handleStillKnow}
                    disabled={loading}
                    className="w-full md:flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Saving...</>
                    ) : (
                      <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Still Know</>
                    )}
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
