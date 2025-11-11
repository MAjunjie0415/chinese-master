import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { words } from '@/db/schema/words';
import { courses, courseWords } from '@/db/schema/courses';
import { and, eq, lt, sql, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ReviewStartCard from '@/components/ReviewStartCard';

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function ReviewStartPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const fromHome = params.from === 'home';
  // 验证用户登录
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/review/start');
  }

  const userId = session.user.id;

  // 定义"今天结束时间"
  const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

  // 并行查询：同时获取复习数量、来源分布和掌握单词数（大幅提升性能）
  const [countResult, sourceResult, masteredResult] = await Promise.all([
    // 查询待复习单词总数
    db
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
      ),
    
    // 查询单词来源分布（先查询，如果有单词再使用）
    db
      .select({
        courseTitle: courses.title,
        courseSlug: courses.slug,
        count: count(),
      })
      .from(userProgress)
      .innerJoin(courseWords, eq(userProgress.word_id, courseWords.word_id))
      .innerJoin(courses, eq(courseWords.course_id, courses.id))
      .where(
        and(
          eq(userProgress.user_id, userId),
          lt(userProgress.next_review, todayEnd),
          eq(userProgress.mastered, false)
        )
      )
      .groupBy(courses.title, courses.slug)
      .orderBy(sql`count(*) DESC`),
    
    // 查询用户总掌握单词数（用于鼓励语）
    db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.user_id, userId),
          eq(userProgress.mastered, true)
        )
      ),
  ]);

  const reviewCount = countResult[0]?.count || 0;

  // 如果没有待复习单词，重定向到复习页面（会显示空状态）
  if (reviewCount === 0) {
    redirect('/review');
  }

  // 计算预计时间（每个单词约12秒，即0.2分钟）
  const estimatedMinutes = Math.max(1, Math.ceil(reviewCount * 0.2));

  const masteredCount = masteredResult[0]?.count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 返回按钮 - 只有从 home 跳转时才显示 */}
        {fromHome && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        )}

        {/* 复习开始卡片 */}
        <ReviewStartCard
          reviewCount={reviewCount}
          estimatedMinutes={estimatedMinutes}
          reviewSources={sourceResult}
          masteredCount={masteredCount}
        />
      </div>
    </div>
  );
}

