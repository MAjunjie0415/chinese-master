import Link from 'next/link';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/progress';
import { courses, courseWords } from '@/db/schema/courses';
import { eq, and, lt, sql, count } from 'drizzle-orm';

// 获取复习数量的组件
async function ReviewCountData() {
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
      .innerJoin(courseWords, eq(userProgress.wordId, courseWords.word_id))
      .innerJoin(courses, eq(courseWords.course_id, courses.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          lt(userProgress.nextReviewAt, todayEnd),
          lt(userProgress.masteryScore, 100)
        )
      );

    const reviewCount = Number(result[0]?.count || 0);

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
  } catch (error: any) {
    console.error('Error fetching review count:', error);
    // 记录详细错误信息以便调试
    if (error?.message) {
      console.error('Error message:', error.message);
    }
    if (error?.stack) {
      console.error('Error stack:', error.stack);
    }
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

