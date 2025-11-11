import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { courses, userCourses, courseWords } from '@/db/schema/courses';
import { words } from '@/db/schema/words';
import { eq, and, sql } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import TonePracticeClient from './TonePracticeClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TonePracticePage({ params }: PageProps) {
  const { slug } = await params;

  // 获取用户登录状态
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?redirect=/courses/${slug}/practice/tone-practice`);
  }

  const userId = session.user.id;

  // 第一步：查询课程信息（必须首先获取，因为后续查询需要 course.id）
  const courseResults = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
    })
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!courseResults || courseResults.length === 0) {
    notFound();
  }

  const course = courseResults[0];

  // 第二步：并行查询用户注册检查和课程单词（大幅提升性能）
  const [enrollmentResults, courseWordsData] = await Promise.all([
    // 检查用户是否已添加课程
    db
      .select({
        id: userCourses.id,
        courseId: userCourses.course_id,
      })
      .from(userCourses)
      .where(
        and(
          eq(userCourses.user_id, userId),
          eq(userCourses.course_id, course.id)
        )
      )
      .limit(1),
    
    // 查询课程的单词（随机15个）
    db
      .select({
        id: words.id,
        chinese: words.chinese,
        pinyin: words.pinyin,
        english: words.english,
      })
      .from(courseWords)
      .leftJoin(words, eq(courseWords.word_id, words.id))
      .where(eq(courseWords.course_id, course.id))
      .orderBy(sql`RANDOM()`)
      .limit(15),
  ]);

  if (!enrollmentResults || enrollmentResults.length === 0) {
    redirect(`/courses/${slug}`);
  }

  // 过滤掉null值
  const validWords = courseWordsData.filter(
    (w) => w.chinese && w.pinyin && w.english
  ) as Array<{
    id: number;
    chinese: string;
    pinyin: string;
    english: string;
  }>;

  if (validWords.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Not Enough Words
          </h2>
          <p className="text-gray-600 mb-6">
            This course needs at least 4 words to practice.
          </p>
          <a
            href={`/courses/${slug}`}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Back to Course
          </a>
        </div>
      </div>
    );
  }

  return (
    <TonePracticeClient
      courseSlug={slug}
      courseTitle={course.title}
      words={validWords}
      userId={userId}
    />
  );
}

