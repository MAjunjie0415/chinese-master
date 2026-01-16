import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import UserInfoCard from '@/components/UserInfoCard';
import AchievementDisplay from '@/components/AchievementDisplay';
import { InviteSection } from './invite-section';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/progress';
import { userCourses, practiceRecords, courseWords } from '@/db/schema/courses';
import { eq, and, lt, sql, count, avg } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getUserAchievements, type UserAchievements } from '@/lib/achievements';
import { getUserPlan, getCustomCourseUsage } from '@/lib/subscription';

export default async function ProfilePage() {
  // Step 1: Verify user authentication
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Step 2: Query all stats in parallel (performance optimization)
  // Define "end of today" (today 23:59:59)
  const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

  // Use Promise.allSettled to execute all queries in parallel
  // Add error handling to ensure single query failure doesn't affect others
  const results = await Promise.allSettled([
    // Query total learned words count
    db
      .select({ count: count() })
      .from(userProgress)
      .where(eq(userProgress.userId, userId)),

    // Query mastered words count
    db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), sql`${userProgress.masteryScore} >= 100`)),

    // Query words to review today (only from Courses)
    db
      .select({ count: count() })
      .from(userProgress)
      .innerJoin(courseWords, eq(userProgress.wordId, courseWords.word_id))
      .where(
        and(
          eq(userProgress.userId, userId),
          lt(userProgress.nextReviewAt, todayEnd),
          lt(userProgress.masteryScore, 100)
        )
      ),

    // Query course statistics
    db
      .select({ count: count() })
      .from(userCourses)
      .where(eq(userCourses.user_id, userId)),

    // Query completed courses
    db
      .select({ count: count() })
      .from(userCourses)
      .where(
        and(
          eq(userCourses.user_id, userId),
          eq(userCourses.isCompleted, true)
        )
      ),

    // Query practice record statistics
    db
      .select({
        totalPractices: count(),
        avgAccuracy: avg(practiceRecords.accuracy),
      })
      .from(practiceRecords)
      .where(eq(practiceRecords.user_id, userId)),

    // Get achievement data
    getUserAchievements(userId),

    // Get subscription data
    getUserPlan(userId),
    getCustomCourseUsage(userId),
  ]);

  // Safely extract results, handling potential errors
  // Extract values from PromiseSettledResult, using defaults on failure
  // Note: Using extends constraint to avoid JSX parsing issues
  const getValue = <T extends any>(result: PromiseSettledResult<T>, defaultValue: T): T => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error('Query failed:', result.reason);
      return defaultValue;
    }
  };

  const [
    totalLearnedResult,
    masteredResult,
    todayReviewsResult,
    enrolledCoursesResult,
    completedCoursesResult,
    practiceStatsResult,
    achievementsResult,
    planResult,
    usageResult,
  ] = results;

  const stats = {
    totalLearned: getValue(totalLearnedResult, [{ count: 0 }])[0]?.count || 0,
    mastered: getValue(masteredResult, [{ count: 0 }])[0]?.count || 0,
    reviewsToday: getValue(todayReviewsResult, [{ count: 0 }])[0]?.count || 0,
    enrolledCourses: getValue(enrolledCoursesResult, [{ count: 0 }])[0]?.count || 0,
    completedCourses: getValue(completedCoursesResult, [{ count: 0 }])[0]?.count || 0,
    totalPractices: getValue(practiceStatsResult, [{ totalPractices: 0, avgAccuracy: null }])[0]?.totalPractices || 0,
    avgAccuracy: getValue(practiceStatsResult, [{ totalPractices: 0, avgAccuracy: null }])[0]?.avgAccuracy
      ? Math.round(Number(getValue(practiceStatsResult, [{ totalPractices: 0, avgAccuracy: null }])[0]?.avgAccuracy))
      : 0,
  };

  // Provide correct default values (matching UserAchievements interface)
  const defaultAchievements: UserAchievements = {
    streakDays: 0,
    totalMastered: 0,
    milestones: [],
    nextMilestone: null,
  };
  const achievementsData = getValue(achievementsResult, defaultAchievements);

  const userPlanData = getValue(planResult, { plan: 'free' as const, interval: null });
  const plan = userPlanData.plan;
  const planInterval = userPlanData.interval;
  const usage = getValue(usageResult, { count: 0, limit: 3, isOverLimit: false });

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-white via-emerald-50/50 to-cyan-50/50">
      <div className="max-w-5xl mx-auto">
        {/* User Info Card */}
        <UserInfoCard
          email={session.user.email || 'user@example.com'}
          createdAt={session.user.created_at}
        />

        {/* Subscription Plan Section */}
        <div className="mb-12 bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-8 gap-8">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">Subscription Plan</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${plan === 'enterprise'
                  ? 'bg-purple-600 text-white'
                  : plan === 'pro'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {plan === 'enterprise' ? 'Max Premium' : plan === 'pro' ? 'Pro Professional' : 'Standard'}
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                {plan === 'enterprise'
                  ? 'You have unlimited access to all premium scenarios and personalized learning paths.'
                  : plan === 'pro'
                    ? 'You have full access to all AI features and scenario-based courses.'
                    : 'Upgrade to Individual Pro for unlimited AI course generation and pronunciations.'}
              </p>

              {plan === 'free' && (
                <div className="max-w-md">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      AI Analysis Quota
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {usage.count} / {usage.limit} used
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${usage.isOverLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((usage.count / usage.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Reset monthly? No, 3 total trial uses for free plan.
                  </p>
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
              <Link
                href="/upgrade"
                className={`text-center px-8 py-3 rounded-xl font-bold transition-all ${plan !== 'free'
                  ? 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
                  } ${plan === 'enterprise' ? 'border-purple-600 text-purple-600 hover:bg-purple-50' : ''}`}
              >
                {plan !== 'free' ? 'Manage Plan' : 'Upgrade to Pro →'}
              </Link>
              <a
                href="mailto:support@bizchinese.cc"
                className="text-center text-sm text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Need team licensing? Contact us
              </a>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-gray-900">
          Learning Dashboard
        </h2>

        {/* Stats Card - Row 1: Word Learning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Total Learned - Clickable to Courses */}
          <Link
            href="/courses"
            className="bg-[#EFF6FF] rounded-xl shadow-sm p-8 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            <h2 className="text-lg text-gray-600 mb-4">Total Words Learned</h2>
            <p className="text-5xl font-bold text-blue-600 my-4">
              {stats.totalLearned}
            </p>
            <p className="text-sm text-blue-500 mt-2 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Explore courses
            </p>
          </Link>

          {/* Card 2: Mastered Words */}
          <div className="bg-[#ECFDF5] rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg text-gray-600 mb-4">Mastered Words</h2>
            <p className="text-5xl font-bold text-green-600 my-4">
              {stats.mastered}
            </p>
            <p className="text-sm text-green-500 mt-2 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keep it up!
            </p>
          </div>

          {/* Card 3: Today's Reviews - Clickable to Review Page */}
          {stats.reviewsToday > 0 ? (
            <Link
              href="/review/start"
              className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl shadow-md p-8 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer animate-pulse"
            >
              <h2 className="text-lg text-gray-600 mb-4">Reviews Today</h2>
              <p className="text-5xl font-bold text-orange-600 my-4">
                {stats.reviewsToday}
              </p>
              <p className="text-sm text-orange-600 font-semibold mt-2 flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Click to start review!
              </p>
            </Link>
          ) : (
            <div className="bg-[#FFFBEB] rounded-xl shadow-sm p-8 text-center">
              <h2 className="text-lg text-gray-600 mb-4">Reviews Today</h2>
              <p className="text-5xl font-bold text-yellow-600 my-4">
                {stats.reviewsToday}
              </p>
              <p className="text-sm text-green-500 mt-2 flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All done!
              </p>
            </div>
          )}
        </div>

        {/* Stats Card - Row 2: Courses and Practice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 4: In-progress Courses */}
          <Link
            href="/courses?tab=my-courses"
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-8 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            <h2 className="text-lg text-gray-600 mb-4">Enrolled Courses</h2>
            <p className="text-5xl font-bold text-purple-600 my-4">
              {stats.enrolledCourses}
            </p>
            <p className="text-sm text-purple-500 mt-2 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Continue learning
            </p>
          </Link>

          {/* Card 5: Completed Courses */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg text-gray-600 mb-4">Completed Courses</h2>
            <p className="text-5xl font-bold text-orange-600 my-4">
              {stats.completedCourses}
            </p>
            <p className="text-sm text-orange-500 mt-2 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              Great achievement!
            </p>
          </div>

          {/* Card 6: Practice Stats */}
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

        {/* Achievements Display */}
        <div className="mt-8 mb-8">
          <AchievementDisplay initialData={achievementsData} />
        </div>

        {/* Invitation Section */}
        <InviteSection />

        {/* Bottom: Quick Actions */}
        <div className="mt-12">
          <div className="text-center">
            <Link
              href="/courses"
              className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
            >
              Continue Learning
            </Link>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-gray-200"></div>

          {/* Sign Out Button */}
          <div className="flex justify-center">
            <SignOutButton />
          </div>
        </div>

        {/* Tips */}
        {stats.totalLearned === 0 && (
          <div className="mt-12 text-center bg-blue-50 rounded-xl p-6">
            <p className="text-gray-600 mb-2 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              <strong>Ready to start your learning journey?</strong>
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

