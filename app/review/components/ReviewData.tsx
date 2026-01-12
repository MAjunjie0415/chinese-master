import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/progress';
import { words } from '@/db/schema/words';
import { courses, courseWords } from '@/db/schema/courses';
import { and, eq, lt, sql } from 'drizzle-orm';
import ReviewComponent, { type Review } from '../ReviewComponent';

interface ReviewDataProps {
  userId: string;
}

interface ReviewItem {
  id: number;
  chinese: string | null;
  pinyin: string | null;
  english: string | null;
  scene: string | null;
  example: string | null;
  category: string | null;
  frequency: number | null;
  progressId: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
}

// 获取复习数据的组件
export default async function ReviewData({ userId }: ReviewDataProps) {
  // 定义"今天结束时间"（今天23:59:59）
  const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

  let reviewsData: ReviewItem[] = [];
  try {
    // 优化查询 - 先过滤 user_progress，再 JOIN 其他表
    // 这样可以充分利用 nextReviewIdx 索引
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
      .innerJoin(words, eq(userProgress.wordId, words.id))
      // 再 JOIN courseWords（使用 word_id，需要确保有索引）
      .innerJoin(courseWords, eq(userProgress.wordId, courseWords.word_id))
      // 最后 JOIN courses（使用 course_id，有索引）
      .innerJoin(courses, eq(courseWords.course_id, courses.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          lt(userProgress.nextReviewAt, todayEnd),
          lt(userProgress.masteryScore, 100) // masteryScore < 100 means not fully mastered
        )
      )
      // 添加排序，确保结果一致性（可选，但有助于缓存）
      .orderBy(userProgress.nextReviewAt);

    reviewsData = reviews as ReviewItem[];
  } catch (error) {
    const err = error as Error;
    console.error('CRITICAL: Error fetching review data:', {
      message: err.message,
      stack: err.stack,
      userId
    });
    // Fallback to empty reviews
    reviewsData = [];
  }

  return <ReviewComponent reviews={reviewsData as unknown as Review[]} userId={userId} />;
}

