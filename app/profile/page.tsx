import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import UserInfoCard from '@/components/UserInfoCard';
import AchievementDisplay from '@/components/AchievementDisplay';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { userCourses, practiceRecords, courseWords } from '@/db/schema/courses';
import { eq, and, lt, sql, count, avg } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getUserAchievements } from '@/lib/achievements';

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

  // 第二步：并行查询所有统计数据（大幅提升性能）
  // 定义"今天结束时间"（今天23:59:59）
  const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

  // 使用 Promise.all 并行执行所有查询
  const [
    totalLearnedResult,
    masteredResult,
    todayReviewsResult,
    enrolledCoursesResult,
    completedCoursesResult,
    practiceStatsResult,
    achievements,
  ] = await Promise.all([
    // 查询总学习单词数
    db
      .select({ count: count() })
      .from(userProgress)
      .where(eq(userProgress.user_id, userId)),
    
    // 查询已掌握单词数
    db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.user_id, userId), eq(userProgress.mastered, true))),
    
    // 查询今日待复习单词数（只统计来自 Courses 的）
    db
      .select({ count: count() })
      .from(userProgress)
      .innerJoin(courseWords, eq(userProgress.word_id, courseWords.word_id))
      .where(
        and(
          eq(userProgress.user_id, userId),
          lt(userProgress.next_review, todayEnd),
          eq(userProgress.mastered, false)
        )
      ),
    
    // 查询课程统计
    db
      .select({ count: count() })
      .from(userCourses)
      .where(eq(userCourses.user_id, userId)),
    
    // 查询已完成课程
    db
      .select({ count: count() })
      .from(userCourses)
      .where(
        and(
          eq(userCourses.user_id, userId),
          eq(userCourses.isCompleted, true)
        )
      ),
    
    // 查询练习记录统计
    db
      .select({
        totalPractices: count(),
        avgAccuracy: avg(practiceRecords.accuracy),
      })
      .from(practiceRecords)
      .where(eq(practiceRecords.user_id, userId)),
    
    // 获取成就数据
    getUserAchievements(userId),
  ]);

  const stats = {
    totalLearned: totalLearnedResult[0]?.count || 0,
    mastered: masteredResult[0]?.count || 0,
    reviewsToday: todayReviewsResult[0]?.count || 0,
    enrolledCourses: enrolledCoursesResult[0]?.count || 0,
    completedCourses: completedCoursesResult[0]?.count || 0,
    totalPractices: practiceStatsResult[0]?.totalPractices || 0,
    avgAccuracy: practiceStatsResult[0]?.avgAccuracy ? Math.round(Number(practiceStatsResult[0].avgAccuracy)) : 0,
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
          Learning Dashboard
        </h2>

        {/* 统计卡片 - 第一行：单词学习 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 卡片1：总学习单词数 - 可点击跳转到课程 */}
        <Link
          href="/courses"
          className="bg-[#EFF6FF] rounded-xl shadow-sm p-8 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <h2 className="text-lg text-gray-600 mb-4">Total Words Learned</h2>
          <p className="text-5xl font-bold text-blue-600 my-4">
            {stats.totalLearned}
          </p>
          <p className="text-sm text-blue-500 mt-2">👉 Explore courses</p>
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
            href="/review/start"
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

        {/* 统计卡片 - 第二行：课程和练习 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 卡片4：进行中课程 */}
          <Link
            href="/courses?tab=my-courses"
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-8 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            <h2 className="text-lg text-gray-600 mb-4">Enrolled Courses</h2>
            <p className="text-5xl font-bold text-purple-600 my-4">
              {stats.enrolledCourses}
            </p>
            <p className="text-sm text-purple-500 mt-2">📚 Continue learning</p>
          </Link>

          {/* 卡片5：已完成课程 */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg text-gray-600 mb-4">Completed Courses</h2>
            <p className="text-5xl font-bold text-orange-600 my-4">
              {stats.completedCourses}
            </p>
            <p className="text-sm text-orange-500 mt-2">🏆 Great achievement!</p>
          </div>

          {/* 卡片6：练习统计 */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg text-gray-600 mb-4">Practice Sessions</h2>
            <p className="text-5xl font-bold text-indigo-600 my-4">
              {stats.totalPractices}
            </p>
            {stats.avgAccuracy > 0 && (
              <p className="text-sm text-indigo-500 mt-2">
                Avg: {stats.avgAccuracy}% accuracy
              </p>
            )}
            {stats.totalPractices === 0 && (
              <p className="text-sm text-gray-500 mt-2">Start practicing!</p>
            )}
          </div>
        </div>

        {/* 成就展示 */}
        <div className="mt-8 mb-8">
          <AchievementDisplay initialData={achievements} />
        </div>

        {/* 底部：快速操作 */}
        <div className="mt-12">
          <div className="text-center">
            <Link
              href="/courses"
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
              Explore courses above and begin mastering Chinese vocabulary!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

