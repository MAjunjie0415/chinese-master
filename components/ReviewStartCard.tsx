'use client';

import { useRouter } from 'next/navigation';

interface ReviewSource {
  courseTitle: string;
  courseSlug: string;
  count: number;
}

interface ReviewStartCardProps {
  reviewCount: number;
  estimatedMinutes: number;
  reviewSources: ReviewSource[];
  masteredCount: number;
}

export default function ReviewStartCard({
  reviewCount,
  estimatedMinutes,
  reviewSources,
  masteredCount,
}: ReviewStartCardProps) {
  const router = useRouter();

  // 生成鼓励语
  const getEncouragement = () => {
    if (masteredCount >= 100) {
      return "🎉 Amazing! You've mastered over 100 words! Keep up the excellent work!";
    } else if (masteredCount >= 50) {
      return "🌟 Great progress! You've mastered 50+ words. You're doing fantastic!";
    } else if (masteredCount >= 20) {
      return "💪 Keep going! You've mastered 20+ words. Every review makes you stronger!";
    } else {
      return "🚀 You're building a solid foundation! Every word you review brings you closer to fluency!";
    }
  };

  const handleStartReview = () => {
    router.push('/review');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* 头部：渐变背景 */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-8 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <h1 className="text-3xl font-bold mb-2">Ready to Review?</h1>
          <p className="text-lg opacity-90">
            Let&apos;s strengthen your memory!
          </p>
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-8 space-y-6">
        {/* 复习概览 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Review Overview
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* 单词数量 */}
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {reviewCount}
              </div>
              <div className="text-sm text-gray-600">
                {reviewCount === 1 ? 'Word' : 'Words'}
              </div>
            </div>

            {/* 预计时间 */}
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ~{estimatedMinutes}
              </div>
              <div className="text-sm text-gray-600">
                {estimatedMinutes === 1 ? 'Minute' : 'Minutes'}
              </div>
            </div>
          </div>

          {/* 单词来源分布 */}
          {reviewSources.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Words from courses:
              </h3>
              <div className="space-y-2">
                {reviewSources.slice(0, 5).map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      📚 {source.courseTitle}
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      {source.count}
                    </span>
                  </div>
                ))}
                {reviewSources.length > 5 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    +{reviewSources.length - 5} more courses
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 鼓励语 */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💪</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Keep Going!</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {getEncouragement()}
              </p>
              {masteredCount > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  You&apos;ve mastered <strong>{masteredCount}</strong> words so far!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={handleStartReview}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
        >
          Start Review →
        </button>

        {/* 提示 */}
        <p className="text-center text-sm text-gray-500">
          Tip: Review regularly to strengthen your memory! 💡
        </p>
      </div>
    </div>
  );
}

