import Link from 'next/link';
import { Suspense } from 'react';

// 复习卡片骨架屏
function ReviewCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl p-6 shadow-xl animate-pulse">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-white bg-opacity-30 rounded w-32 mb-2"></div>
            <div className="h-4 bg-white bg-opacity-30 rounded w-24"></div>
          </div>
        </div>
        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="h-4 bg-white bg-opacity-30 rounded w-40 mb-2"></div>
          <div className="h-4 bg-white bg-opacity-30 rounded w-32"></div>
        </div>
        <div className="h-12 bg-white bg-opacity-30 rounded-xl"></div>
      </div>
    </div>
  );
}

// 复习数据获取组件
async function ReviewData() {
  const { createServerSupabaseClient } = await import('@/lib/supabase');
  const { db } = await import('@/lib/drizzle');
  const { userProgress } = await import('@/db/schema/progress');
  const { courses, courseWords } = await import('@/db/schema/courses');
  const { eq, and, lt, sql, count } = await import('drizzle-orm');

  let reviewCount = 0;
  let reviewSources: Array<{ courseTitle: string; count: number }> = [];
  let estimatedMinutes = 0;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const userId = session.user.id;
      const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

      // 先快速查询待复习单词总数
      const countResult = await db
        .select({ count: count() })
        .from(userProgress)
        .innerJoin(courseWords, eq(userProgress.wordId, courseWords.word_id))
        .innerJoin(courses, eq(courseWords.course_id, courses.id))
        .where(
          and(
            eq(userProgress.userId, userId),
            lt(userProgress.nextReviewAt, todayEnd),
            lt(userProgress.masteryScore, 100)
          )
        );

      reviewCount = countResult[0]?.count || 0;

      // 只有在有单词时才查询来源分布
      if (reviewCount > 0) {
        const sourceResult = await db
          .select({
            courseTitle: courses.title,
            count: count(),
          })
          .from(userProgress)
          .innerJoin(courseWords, eq(userProgress.wordId, courseWords.word_id))
          .innerJoin(courses, eq(courseWords.course_id, courses.id))
          .where(
            and(
              eq(userProgress.userId, userId),
              lt(userProgress.nextReviewAt, todayEnd),
              lt(userProgress.masteryScore, 100)
            )
          )
          .groupBy(courses.title)
          .limit(3);

        reviewSources = sourceResult.map((r) => ({
          courseTitle: r.courseTitle,
          count: r.count,
        }));

        estimatedMinutes = Math.max(1, Math.ceil(reviewCount * 0.2));
      }
    }
  } catch (error) {
    console.error('Error fetching review count:', error);
  }

  if (reviewCount === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl p-6 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

      <div className="relative z-10">
        {/* 头部：图标和标题 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">
              Time to Review!
            </h3>
            <p className="text-white text-sm opacity-90">
              {reviewCount} {reviewCount === 1 ? 'word' : 'words'} waiting
            </p>
          </div>
        </div>

        {/* 信息卡片 */}
        <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-4 mb-4 space-y-2">
          {/* 预计时间 */}
          <div className="flex items-center gap-2 text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-800">
              Estimated: ~{estimatedMinutes} {estimatedMinutes === 1 ? 'minute' : 'minutes'}
            </span>
          </div>

          {/* 单词来源 */}
          {reviewSources.length > 0 && (
            <div className="flex items-start gap-2 text-gray-800">
              <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-800 block mb-1">From courses:</span>
                <div className="flex flex-wrap gap-2">
                  {reviewSources.map((source, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white bg-opacity-20 text-gray-800 px-2 py-1 rounded-full backdrop-blur-sm font-medium"
                    >
                      {source.courseTitle} ({source.count})
                    </span>
                  ))}
                  {reviewCount > reviewSources.reduce((sum, s) => sum + s.count, 0) && (
                    <span className="text-xs bg-white bg-opacity-20 text-gray-800 px-2 py-1 rounded-full backdrop-blur-sm font-medium">
                      +{reviewCount - reviewSources.reduce((sum, s) => sum + s.count, 0)} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA按钮 */}
        <Link
          href="/review/start?from=home"
          className="block w-full bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl text-center transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Start Review →
        </Link>
      </div>
    </div>
  );
}

// 导出的复习卡片组件（带 Suspense）
export default function ReviewCard() {
  return (
    <Suspense fallback={<ReviewCardSkeleton />}>
      <ReviewData />
    </Suspense>
  );
}

