import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { courses, userCourses, courseWords } from '@/db/schema/courses';
import { words } from '@/db/schema/words';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const [course] = await db
    .select({
      title: courses.title,
      description: courses.description,
      totalWords: courses.totalWords,
    })
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} - BizChinese`,
    description: course.description || `Learn ${course.totalWords} Chinese words in this course`,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 获取用户登录状态
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;

  // 第一步：查询课程信息（必须首先获取，因为后续查询需要 course.id）
  const courseResults = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      category: courses.category,
      description: courses.description,
      totalWords: courses.totalWords,
      difficulty: courses.difficulty,
      coverImage: courses.coverImage,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    })
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!courseResults || courseResults.length === 0) {
    notFound();
  }

  const course = courseResults[0];

  // 第二步：并行查询课程单词列表和用户进度（大幅提升性能）
  const [courseWordsData, enrollmentResult] = await Promise.all([
    // 查询课程包含的单词
    db
      .select({
        wordId: courseWords.word_id,
        order: courseWords.order,
        chinese: words.chinese,
        pinyin: words.pinyin,
        english: words.english,
        scene: words.scene,
        example: words.example,
      })
      .from(courseWords)
      .leftJoin(words, eq(courseWords.word_id, words.id))
      .where(eq(courseWords.course_id, course.id))
      .orderBy(courseWords.order),

    // 如果用户已登录，检查是否已添加课程（否则返回空数组）
    userId
      ? db
        .select({
          id: userCourses.id,
          userId: userCourses.user_id,
          courseId: userCourses.course_id,
          progress: userCourses.progress,
          lastLearnedAt: userCourses.lastLearnedAt,
          isCompleted: userCourses.isCompleted,
          addedAt: userCourses.addedAt,
        })
        .from(userCourses)
        .where(
          and(
            eq(userCourses.user_id, userId),
            eq(userCourses.course_id, course.id)
          )
        )
        .limit(1)
      : Promise.resolve([]),
  ]);

  // 处理用户注册信息
  let isEnrolled = false;
  let userProgress = 0;
  let isCompleted = false;

  if (enrollmentResult.length > 0) {
    const enrollment = enrollmentResult[0];
    isEnrolled = true;
    userProgress = enrollment.progress;
    isCompleted = enrollment.isCompleted;
  }

  return (
    <CourseDetailClient
      course={course}
      courseWords={courseWordsData}
      isLoggedIn={!!userId}
      isEnrolled={isEnrolled}
      userProgress={userProgress}
      isCompleted={isCompleted}
    />
  );
}

