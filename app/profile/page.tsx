import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import UserInfoCard from '@/components/UserInfoCard';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { eq, and, lt, sql, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  // 第一步：验证用户登录
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // 第二步：查询统计数据
  // 定义"今天结束时间"（今天23:59:59）
  const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

  // 查询总学习单词数
  const totalLearnedResult = await db
    .select({ count: count() })
    .from(userProgress)
    .where(eq(userProgress.user_id, userId));

  // 查询已掌握单词数
  const masteredResult = await db
    .select({ count: count() })
    .from(userProgress)
    .where(and(eq(userProgress.user_id, userId), eq(userProgress.mastered, true)));

  // 查询今日待复习单词数
  const todayReviewsResult = await db
    .select({ count: count() })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.user_id, userId),
        lt(userProgress.next_review, todayEnd),
        eq(userProgress.mastered, false)
      )
    );

  const stats = {
    totalLearned: totalLearnedResult[0]?.count || 0,
    mastered: masteredResult[0]?.count || 0,
    reviewsToday: todayReviewsResult[0]?.count || 0,
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* 用户信息卡片 */}
        <UserInfoCard 
          email={session.user.email || 'user@example.com'} 
          createdAt={session.user.created_at}
        />

        {/* 页面标题 */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
          Learning Statistics
        </h2>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 卡片1：总学习单词数 - 可点击跳转到词库 */}
        <Link
          href="/wordbanks"
          className="bg-[#EFF6FF] rounded-xl shadow-sm p-8 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <h2 className="text-lg text-gray-600 mb-4">Total Words Learned</h2>
          <p className="text-5xl font-bold text-blue-600 my-4">
            {stats.totalLearned}
          </p>
          <p className="text-sm text-blue-500 mt-2">👉 Learn more words</p>
        </Link>

        {/* 卡片2：已掌握单词数 */}
        <div className="bg-[#ECFDF5] rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-lg text-gray-600 mb-4">Mastered Words</h2>
          <p className="text-5xl font-bold text-green-600 my-4">
            {stats.mastered}
          </p>
          <p className="text-sm text-green-500 mt-2">✅ Keep it up!</p>
        </div>

        {/* 卡片3：今日待复习 - 可点击跳转到复习页 */}
        {stats.reviewsToday > 0 ? (
          <Link
            href="/review"
            className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl shadow-md p-8 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer animate-pulse"
          >
            <h2 className="text-lg text-gray-600 mb-4">Reviews Today</h2>
            <p className="text-5xl font-bold text-orange-600 my-4">
              {stats.reviewsToday}
            </p>
            <p className="text-sm text-orange-600 font-semibold mt-2">
              🔥 Click to start review!
            </p>
          </Link>
        ) : (
          <div className="bg-[#FFFBEB] rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg text-gray-600 mb-4">Reviews Today</h2>
            <p className="text-5xl font-bold text-yellow-600 my-4">
              {stats.reviewsToday}
            </p>
            <p className="text-sm text-green-500 mt-2">✅ All done!</p>
          </div>
        )}
        </div>

        {/* 底部：快速操作 */}
        <div className="mt-12">
          <div className="text-center">
            <Link
              href="/wordbanks"
              className="inline-block bg-[#165DFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0E42D2] active:scale-95 transition-all shadow-md"
            >
              Continue Learning
            </Link>
          </div>

          {/* 分隔线 */}
          <div className="my-8 border-t border-gray-200"></div>

          {/* 退出登录按钮 */}
          <div className="flex justify-center">
            <SignOutButton />
          </div>
        </div>

        {/* 提示信息 */}
        {stats.totalLearned === 0 && (
          <div className="mt-12 text-center bg-blue-50 rounded-xl p-6">
            <p className="text-gray-600 mb-2">
              🚀 <strong>Ready to start your learning journey?</strong>
            </p>
            <p className="text-gray-500 text-sm">
              Choose a word bank above and begin mastering Chinese vocabulary!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

