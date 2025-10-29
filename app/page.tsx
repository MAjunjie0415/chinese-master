import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { eq, and, lt, sql, count } from 'drizzle-orm';

export default async function Home() {
  // 尝试获取用户信息（如果未登录则为null）
  let reviewCount = 0;
  let isLoggedIn = false;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      isLoggedIn = true;
      const userId = session.user.id;

      // 查询今日待复习单词数
      const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;
      const result = await db
        .select({ count: count() })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.user_id, userId),
            lt(userProgress.next_review, todayEnd),
            eq(userProgress.mastered, false)
          )
        );

      reviewCount = result[0]?.count || 0;
    }
  } catch (error) {
    // 如果查询失败，继续渲染页面但不显示复习提醒
    console.error('Error fetching review count:', error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <div className="flex flex-col items-center text-center max-w-2xl">
        {/* 产品Logo */}
        <h1 className="text-4xl font-bold text-[#165DFF]">ChineseMaster</h1>

        {/* 产品简介 */}
        <p className="mt-4 text-lg text-gray-600">
          Learn Mandarin for Business & HSK Exams
        </p>

        {/* 复习提醒卡片（仅登录用户显示） */}
        {isLoggedIn && (
          <div className="mt-8 w-full max-w-md">
            {reviewCount > 0 ? (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg animate-pulse">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl">🔥</span>
                </div>
                <h2 className="text-2xl font-bold text-orange-600 mb-2">
                  {reviewCount} {reviewCount === 1 ? 'word' : 'words'} to review today!
                </h2>
                <p className="text-gray-600 mb-4">
                  Keep your learning momentum going!
                </p>
                <Link
                  href="/review"
                  className="block w-full px-6 py-4 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 active:scale-95 transition-all shadow-md"
                >
                  Start Review Now →
                </Link>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  All caught up!
                </h2>
                <p className="text-gray-600">
                  No reviews today. Great job! 🎉
                </p>
              </div>
            )}
          </div>
        )}

        {/* 学习按钮组 */}
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            {isLoggedIn ? 'Continue Learning' : 'Start Learning'}
          </h3>
          <div className="flex flex-col gap-4">
            {/* 按钮1: 商务汉语 */}
            <Link
              href="/wordbanks/business"
              className="px-8 py-3 bg-[#165DFF] text-white rounded-lg font-medium transition-colors hover:bg-[#0E42D2] active:scale-95"
            >
              📚 Business Chinese
            </Link>

            {/* 按钮2: HSK等级 */}
            <Link
              href="/wordbanks/hsk1"
              className="px-8 py-3 bg-[#36D399] text-white rounded-lg font-medium transition-colors hover:bg-[#2BB673] active:scale-95"
            >
              🎓 HSK Levels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
