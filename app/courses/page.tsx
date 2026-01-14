import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { courses, userCourses, courseWords } from '@/db/schema/courses';
import { eq, and, sql } from 'drizzle-orm';
import CoursesPageClient from './CoursesPageClient';

export const metadata = {
  title: 'Courses - BizChinese',
  description: 'Explore our library of Chinese courses for business and HSK exam preparation',
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // 获取用户登录状态
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  const params = await searchParams;

  // 并行查询：同时获取所有课程和用户进度（大幅提升性能）
  let allCoursesResult = [];
  let userCoursesResult = [];

  try {
    [allCoursesResult, userCoursesResult] = await Promise.all([
      // 查询所有课程
      db
        .select({
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
          category: courses.category,
          description: courses.description,
          totalWords: courses.totalWords,
          difficulty: courses.difficulty,
          coverImage: courses.coverImage,
        })
        .from(courses)
        .orderBy(courses.createdAt),

      // 如果用户已登录，获取用户的课程进度（否则返回空数组）
      userId
        ? db
          .select({
            courseId: userCourses.course_id,
            progress: userCourses.progress,
            isCompleted: userCourses.isCompleted,
          })
          .from(userCourses)
          .where(eq(userCourses.user_id, userId))
        : Promise.resolve([]),
    ]);
  } catch (err) {
    console.error('Failed to fetch courses data:', err);
    // In production, this might be due to connection limits or timeouts
    // We swallow the error here to allow the page to render with empty state or error boundary to take over if we rethrow
    // Rethrowing to let error.tsx handle it is better for visibility
    throw err;
  }

  const allCourses = allCoursesResult || [];
  const userCoursesData = userCoursesResult || [];

  // 默认tab逻辑：如果用户已登录且有课程，默认显示"My Courses"，否则显示"Explore"
  const defaultTab = userId && userCoursesData.length > 0 ? 'my' : 'explore';
  const currentTab = params.tab || defaultTab;

  // 将用户进度合并到课程数据中
  const coursesWithProgress = allCourses.map((course) => {
    const userCourse = userCoursesData.find((uc) => uc.courseId === course.id);
    return {
      ...course,
      isEnrolled: !!userCourse,
      progress: userCourse?.progress || 0,
      isCompleted: userCourse?.isCompleted || false,
    };
  });

  // 按分类分组课程
  const coursesByCategory = {
    business: coursesWithProgress.filter((c) => c.category === 'business'),
    hsk: coursesWithProgress.filter((c) => c.category.startsWith('hsk')),
  };

  // 我的课程数据
  const myCourses = {
    inProgress: coursesWithProgress.filter((c) => c.isEnrolled && !c.isCompleted),
    completed: coursesWithProgress.filter((c) => c.isCompleted),
  };

  return (
    <CoursesPageClient
      allCourses={coursesWithProgress}
      coursesByCategory={coursesByCategory}
      myCourses={myCourses}
      isLoggedIn={!!userId}
      initialTab={currentTab}
    />
  );
}

