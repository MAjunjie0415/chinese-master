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
    <div className="min-h-screen py-8 px-4 bg-parchment">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-10 header-serif">
          Learning Dashboard
        </h1>
        {/* User Info Card */}
        <UserInfoCard
          email={session.user.email || 'user@example.com'}
          createdAt={session.user.created_at}
        />

        {/* Subscription Plan Section */}
        <div className="mb-12 paper-card border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />
          <div className="flex flex-col md:flex-row items-center p-8 gap-8 relative z-10">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-900 header-serif uppercase tracking-widest opacity-80">Institutional License</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${plan === 'enterprise'
                  ? 'bg-primary text-white border-primary'
                  : plan === 'pro'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                  {plan === 'enterprise' ? 'Max Premium' : plan === 'pro' ? 'Pro Professional' : 'Standard'}
                </span>
              </div>
              <p className="text-muted mb-6 font-medium">
                {plan === 'enterprise'
                  ? 'You have unlimited access to all premium scenarios and personalized learning paths.'
                  : plan === 'pro'
                    ? 'You have full access to all AI features and scenario-based courses.'
                    : 'Upgrade to Individual Pro for unlimited AI course generation and pronunciations.'}
              </p>

              {plan === 'free' && (
                <div className="max-w-md">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      AI Synthesis Quota
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {usage.count} / {usage.limit} TOTAL
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${usage.isOverLimit ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min((usage.count / usage.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
              <Link
                href="/upgrade"
                className={`text-center px-8 py-3 rounded font-bold transition-all text-xs uppercase tracking-widest whitespace-nowrap active:scale-95 ${plan !== 'free'
                  ? 'border border-primary text-primary hover:bg-slate-50'
                  : 'bg-primary text-white hover:bg-slate-800 shadow-sm'
                  }`}
              >
                {plan !== 'free' ? 'Manage Credentials' : 'Request Upgrade →'}
              </Link>
            </div>
          </div>
        </div>


        {/* Stats Card - Row 1: Word Learning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Total Learned - Clickable to Courses */}
          <Link
            href="/courses"
            className="paper-card p-8 text-center group border-slate-200 hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lexicon Size</h2>
            <p className="text-5xl font-bold text-primary my-4 group-hover:scale-110 transition-transform">
              {stats.totalLearned}
            </p>
            <p className="text-[10px] text-primary mt-2 font-bold uppercase tracking-widest flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100">
              Explore Collection →
            </p>
          </Link>

          {/* Card 2: Mastered Words */}
          <div className="paper-card p-8 text-center border-slate-200 group hover:border-emerald-200 transition-all">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Confirmed Proficiency</h2>
            <p className="text-5xl font-bold text-emerald-700 my-4 group-hover:scale-110 transition-transform">
              {stats.mastered}
            </p>
            <p className="text-[10px] text-emerald-600/60 mt-2 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              Items Verified
            </p>
          </div>

          {/* Card 3: Today's Reviews - Clickable to Review Page */}
          {stats.reviewsToday > 0 ? (
            <Link
              href="/review/start"
              className="paper-card p-8 text-center bg-white border-accent/20 group hover:border-accent transition-all active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-accent animate-pulse" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pending Synthesis</h2>
              <p className="text-5xl font-bold text-accent my-4 group-hover:scale-110 transition-transform">
                {stats.reviewsToday}
              </p>
              <p className="text-[10px] text-accent mt-2 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                Initiate Review →
              </p>
            </Link>
          ) : (
            <div className="paper-card p-8 text-center border-slate-100 opacity-60">
              <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Pending Synthesis</h2>
              <p className="text-5xl font-bold text-slate-200 my-4">
                {stats.reviewsToday}
              </p>
              <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                Queue Empty
              </p>
            </div>
          )}
        </div>

        {/* Stats Card - Row 2: Courses and Practice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 4: In-progress Courses */}
          <Link
            href="/courses?tab=my"
            className="paper-card p-8 text-center group border-slate-200 hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active Modules</h2>
            <p className="text-5xl font-bold text-primary my-4 group-hover:scale-110 transition-transform">
              {stats.enrolledCourses}
            </p>
            <p className="text-[10px] text-primary/60 mt-2 font-bold uppercase tracking-widest">
              Resume Training
            </p>
          </Link>

          {/* Card 5: Completed Courses */}
          <div className="paper-card p-8 text-center border-slate-200">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Completed Modules</h2>
            <p className="text-5xl font-bold text-slate-800 my-4 leading-none">
              {stats.completedCourses}
            </p>
            <p className="text-[10px] text-slate-400 mt-5 font-bold uppercase tracking-widest">
              Course Archives
            </p>
          </div>

          {/* Card 6: Practice Stats */}
          <div className="paper-card p-8 text-center border-slate-200">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Session Statistics</h2>
            <p className="text-5xl font-bold text-primary my-4 leading-none">
              {stats.totalPractices}
            </p>
            {stats.avgAccuracy > 0 ? (
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-5">
                {stats.avgAccuracy}% Precision
              </p>
            ) : (
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-5">
                Historical Mean
              </p>
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
        <div className="mt-16 border-t border-slate-100 pt-12">
          <div className="text-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-10 py-4 bg-primary hover:bg-slate-800 text-white text-sm font-bold uppercase tracking-widest rounded transition-all shadow-sm active:scale-95"
            >
              Resume Curriculum →
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
          <div className="mt-16 text-center paper-card bg-slate-50 p-8 border-slate-100 group">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 header-serif">Academic Onboarding</h3>
            <p className="text-muted text-sm font-medium">
              Initialize your learning journey by exploring our institutional curriculum library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

