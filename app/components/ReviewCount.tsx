import Link from 'next/link';
import { Suspense } from 'react';

// 获取复习数量的组件
async function ReviewCountData() {
  const { createServerSupabaseClient } = await import('@/lib/supabase');
  const { db } = await import('@/lib/drizzle');
  const { userProgress } = await import('@/db/schema/user_progress');
  const { courses, courseWords } = await import('@/db/schema/courses');
  const { eq, and, lt, sql, count } = await import('drizzle-orm');

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const userId = session.user.id;
    const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;
    
    // 快速查询待复习单词总数
    const result = await db
      .select({ count: count() })
      .from(userProgress)
      .innerJoin(courseWords, eq(userProgress.word_id, courseWords.word_id))
      .innerJoin(courses, eq(courseWords.course_id, courses.id))
      .where(
        and(
          eq(userProgress.user_id, userId),
          lt(userProgress.next_review, todayEnd),
          eq(userProgress.mastered, false)
        )
      );

    const reviewCount = result[0]?.count || 0;

    if (reviewCount === 0) {
      return (
        <Link
          href="/courses"
          className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Continue Learning →
        </Link>
      );
    }

    return (
      <Link
        href="/review/start?from=home"
        className="inline-block bg-white text-orange-600 hover:bg-gray-100 font-bold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        Start Review ({reviewCount} words) →
      </Link>
    );
  } catch (error) {
    console.error('Error fetching review count:', error);
    // 出错时显示默认按钮
    return (
      <Link
        href="/courses"
        className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        Continue Learning →
      </Link>
    );
  }
}

// 加载中的占位符
function ReviewCountSkeleton() {
  return (
    <div className="inline-block bg-white bg-opacity-20 animate-pulse text-white font-bold px-10 py-4 rounded-lg">
      Loading...
    </div>
  );
}

// 导出的复习数量组件（带 Suspense）
export default function ReviewCount() {
  return (
    <Suspense fallback={<ReviewCountSkeleton />}>
      <ReviewCountData />
    </Suspense>
  );
}

