import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { words } from '@/db/schema/words';
import { courses, courseWords } from '@/db/schema/courses';
import { and, eq, lt, sql } from 'drizzle-orm';
import ReviewComponent from '../ReviewComponent';

interface ReviewDataProps {
  userId: string;
}

// 获取复习数据的组件
export default async function ReviewData({ userId }: ReviewDataProps) {
  // 定义"今天结束时间"（今天23:59:59）
  const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

  // 优化查询 - 先过滤 user_progress，再 JOIN 其他表
  // 这样可以充分利用 userNextReviewIdx 索引 (user_id, next_review)
  const reviews = await db
    .select({
      // words表字段
      id: words.id,
      chinese: words.chinese,
      pinyin: words.pinyin,
      english: words.english,
      scene: words.scene,
      example: words.example,
      category: words.category,
      frequency: words.frequency,
      // user_progress表字段
      progressId: userProgress.id,
      // courses表字段（课程来源信息）
      courseId: courses.id,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(userProgress)
    // 先 JOIN words（使用 word_id 外键，通常有索引）
    .innerJoin(words, eq(userProgress.word_id, words.id))
    // 再 JOIN courseWords（使用 word_id，需要确保有索引）
    .innerJoin(courseWords, eq(userProgress.word_id, courseWords.word_id))
    // 最后 JOIN courses（使用 course_id，有索引）
    .innerJoin(courses, eq(courseWords.course_id, courses.id))
    .where(
      and(
        eq(userProgress.user_id, userId),
        lt(userProgress.next_review, todayEnd),
        eq(userProgress.mastered, false)
      )
    )
    // 添加排序，确保结果一致性（可选，但有助于缓存）
    .orderBy(userProgress.next_review);

  return <ReviewComponent reviews={reviews} userId={userId} />;
}

