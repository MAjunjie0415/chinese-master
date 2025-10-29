'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playPinyinPronunciation } from '@/lib/pronunciation';

type Review = {
  id: number;
  chinese: string;
  pinyin: string;
  english: string;
  scene: string | null;
  example: string | null;
  category: string;
  frequency: number;
  progressId: number;
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
            You've completed all your reviews. Come back tomorrow for more!
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

  // 处理"仍掌握"
  const handleStillKnow = async () => {
    setLoading(true);
    setError(null);

    try {
      setLastAction({ type: 'know', index: currentIndex });

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

      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 3000);

      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          setError('Network issue: Please check your internet and try again.');
        } else if (err.message.includes('Unauthorized')) {
          setError('Session expired. Please log in again.');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(`Failed to save progress: ${err.message}`);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理"已遗忘"
  const handleForgot = async () => {
    setLoading(true);
    setError(null);

    try {
      setLastAction({ type: 'forgot', index: currentIndex });

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

      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 3000);

      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          setError('Network issue: Please check your internet and try again.');
        } else if (err.message.includes('Unauthorized')) {
          setError('Session expired. Please log in again.');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(`Failed to save progress: ${err.message}`);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 复习完成
  if (completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold mb-4">Review Complete!</h2>
          <p className="text-gray-600 mb-6">
            Great job! You've reviewed {reviews.length} words today.
          </p>

          {/* 鼓励继续学习的卡片 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              🚀 <strong>Keep the momentum going!</strong>
            </p>
            <p className="text-xs text-gray-600">
              Learn more words to expand your vocabulary
            </p>
          </div>

          <div className="space-y-3">
            {/* 优先按钮：继续学习 */}
            <button
              onClick={() => router.push('/wordbanks')}
              className="w-full bg-[#165DFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md"
            >
              📚 Learn More Words
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-center mb-6">Today&apos;s Reviews</h1>

      {/* 进度条 */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Progress: {currentIndex + 1}/{reviews.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 单词内容区 */}
      <div className="max-w-2xl mx-auto px-4">
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

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 transition-all duration-300 transform">
          {/* 拼音 */}
          <div className="text-center mb-6">
            <p className="text-2xl text-blue-600 font-semibold mb-4">{currentWord.pinyin}</p>
          </div>

          {/* 英文释义 */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700">{currentWord.english}</p>
          </div>

          {/* 汉字和例句（仅在showAnswer时显示）- 添加淡入动画 */}
          <div 
            className={`transition-all duration-500 ${
              showAnswer ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'
            }`}
          >
            {showAnswer && (
              <>
                <div className="text-center mb-6 animate-fadeIn">
                  <p className="text-3xl font-bold text-gray-900 mb-4">{currentWord.chinese}</p>
                </div>

                {/* 例句 */}
                {currentWord.example && (
                  <div className="text-center mb-6 animate-fadeIn">
                    <p className="text-gray-600">{currentWord.example}</p>
                  </div>
                )}

                {/* 发音按钮 */}
                <div className="text-center mb-6 animate-fadeIn">
                  <button
                    onClick={handlePronunciation}
                    className="w-full md:w-auto bg-blue-50 text-blue-600 px-4 py-1 rounded-lg hover:bg-blue-100 active:scale-95 transition-all"
                  >
                    🔊 Pronunciation
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 按钮区 - 移动端优化 */}
          <div className="flex justify-center gap-4 mt-8">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Show Answer'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleForgot}
                  disabled={loading}
                  className="w-full md:flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Saving...' : '❌ Forgot'}
                </button>
                <button
                  onClick={handleStillKnow}
                  disabled={loading}
                  className="w-full md:flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 active:scale-95 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Saving...' : '✅ Still Know'}
                </button>
              </>
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
