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

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* User Info Card */}
        <UserInfoCard
          email={session.user.email || 'user@example.com'}
          createdAt={session.user.created_at}
        />

        {/* Page Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
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
            <p className="text-sm text-blue-500 mt-2">👉 Explore courses</p>
          </Link>

          {/* Card 2: Mastered Words */}
          <div className="bg-[#ECFDF5] rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg text-gray-600 mb-4">Mastered Words</h2>
            <p className="text-5xl font-bold text-green-600 my-4">
              {stats.mastered}
            </p>
            <p className="text-sm text-green-500 mt-2">✅ Keep it up!</p>
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
            <p className="text-sm text-purple-500 mt-2">📚 Continue learning</p>
          </Link>

          {/* Card 5: Completed Courses */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg text-gray-600 mb-4">Completed Courses</h2>
            <p className="text-5xl font-bold text-orange-600 my-4">
              {stats.completedCourses}
            </p>
            <p className="text-sm text-orange-500 mt-2">🏆 Great achievement!</p>
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
              className="inline-block bg-[#165DFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0E42D2] active:scale-95 transition-all shadow-md"
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

