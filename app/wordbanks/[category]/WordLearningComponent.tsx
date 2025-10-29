'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playPinyinPronunciation } from '@/lib/pronunciation';

interface Word {
  id: number;
  chinese: string;
  pinyin: string;
  english: string;
  scene: string | null;
  example: string | null;
  category: string;
  frequency: number;
}

interface WordLearningComponentProps {
  words: Word[];
  userId: string;
}

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

export default function WordLearningComponent({
  words,
  userId,
}: WordLearningComponentProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showUndo, setShowUndo] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'know' | 'forgot', index: number } | null>(null);

  // 模拟初始加载
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // 显示答案
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // 发音处理函数
  const handlePronunciation = async () => {
    setError(null);
    const errorMessage = await playPinyinPronunciation(currentWord.chinese);
    if (errorMessage) {
      // 用户友好的错误提示
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

  // 记录学习进度（认识/不认识）
  const handleKnowWord = async (known: boolean) => {
    setLoading(true);
    setError(null);

    try {
      // 保存上次操作记录（用于撤销）
      setLastAction({ type: known ? 'know' : 'forgot', index: currentIndex });

      // 调用API记录到user_progress表
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId: currentWord.id,
          known: known,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record progress');
      }

      // 显示撤销按钮2秒
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 3000);

      // 移动到下一个单词
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // 完成所有单词
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error recording progress:', error);
      // 用户友好的错误提示
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setError('Network issue: Please check your internet and try again.');
        } else if (error.message.includes('Unauthorized')) {
          setError('Session expired. Please log in again.');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(`Failed to save progress: ${error.message}`);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始加载骨架屏
  if (isInitialLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <WordSkeleton />
      </div>
    );
  }

  // 空数据处理
  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No words in this category yet
          </h2>
          <p className="text-gray-600 mb-8">
            This word bank is being updated. Try exploring other categories!
          </p>
          <button
            onClick={() => router.push('/wordbanks')}
            className="w-full md:w-auto bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 active:scale-95 transition-all"
          >
            Browse Other Word Banks
          </button>
        </div>
      </div>
    );
  }

  // 完成页面
  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Great Job!
          </h1>
          <p className="text-gray-600 mb-6">
            You've completed {words.length} words. Keep up the good work!
          </p>

          {/* 复习提醒卡片 */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              💡 <strong>Don't forget to review!</strong>
            </p>
            <p className="text-xs text-gray-600">
              Check your review page to strengthen your memory
            </p>
          </div>

          <div className="space-y-3">
            {/* 优先按钮：去复习 */}
            <button
              onClick={() => router.push('/review')}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-md"
            >
              📝 Check My Reviews
            </button>

            <button
              onClick={() => router.push('/wordbanks')}
              className="w-full bg-[#165DFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all"
            >
              📚 Back to Word Banks
            </button>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setShowAnswer(false);
                setCompleted(false);
              }}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all"
            >
              🔄 Learn These Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 学习页面
  return (
    <div className="min-h-screen py-8 px-4">
      {/* 进度条 */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {words.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#165DFF] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 单词卡片 */}
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
          <div className="text-center mb-8">
            <p className="text-2xl md:text-3xl font-semibold text-gray-900">
              {currentWord.pinyin}
            </p>
          </div>

          {/* 英文释义 */}
          <div className="text-center mb-8">
            <p className="text-xl md:text-2xl text-gray-600">
              {currentWord.english}
            </p>
          </div>

          {/* 答案区域（初始隐藏）- 添加淡入动画 */}
          <div 
            className={`mt-8 pt-8 border-t border-gray-200 transition-all duration-500 ${
              showAnswer ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'
            }`}
          >
            {showAnswer && (
              <>
                {/* 汉字 */}
                <div className="text-center mb-6 animate-fadeIn">
                  <p className="text-5xl md:text-6xl font-bold text-gray-900">
                    {currentWord.chinese}
                  </p>
                </div>

                {/* 例句（如果有） */}
                {currentWord.example && (
                  <div className="text-center mb-6 animate-fadeIn">
                    <p className="text-lg text-gray-600">{currentWord.example}</p>
                  </div>
                )}

                {/* 场景标签（如果有） */}
                {currentWord.scene && (
                  <div className="text-center mb-6 animate-fadeIn">
                    <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm">
                      {currentWord.scene}
                    </span>
                  </div>
                )}

                {/* 发音按钮 */}
                <div className="text-center mb-6 animate-fadeIn">
                  <button
                    onClick={handlePronunciation}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium active:scale-95 transition-all"
                  >
                    <span>🔊</span>
                    <span>Pronounce</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 操作按钮 - 移动端优化 + 加载状态 + 触摸反馈 */}
          <div className="mt-8">
            {!showAnswer ? (
              // 显示答案按钮
              <button
                onClick={handleShowAnswer}
                disabled={loading}
                className="w-full bg-[#165DFF] text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Show Answer'}
              </button>
            ) : (
              // 认识/不认识按钮
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleKnowWord(false)}
                  disabled={loading}
                  className="w-full bg-red-500 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-red-600 active:scale-95 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Saving...' : "❌ Don't Know"}
                </button>
                <button
                  onClick={() => handleKnowWord(true)}
                  disabled={loading}
                  className="w-full bg-green-500 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 active:scale-95 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Saving...' : '✅ Know'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Review the pinyin and meaning, then show the answer to see the
            Chinese character.
          </p>
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
      `}</style>
    </div>
  );
}

