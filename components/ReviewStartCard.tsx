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

  // 生成鼓励语 - 不再使用emoji
  const getEncouragement = () => {
    if (masteredCount >= 100) {
      return "Amazing! You've mastered over 100 words! Keep up the excellent work!";
    } else if (masteredCount >= 50) {
      return "Great progress! You've mastered 50+ words. You're doing fantastic!";
    } else if (masteredCount >= 20) {
      return "Keep going! You've mastered 20+ words. Every review makes you stronger!";
    } else {
      return "You're building a solid foundation! Every word you review brings you closer to fluency!";
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
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
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
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {source.courseTitle}
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
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </div>
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
        <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
          Tip: Review regularly to strengthen your memory!
        </p>
      </div>
    </div>
  );
}

