import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { words } from '@/db/schema/words';
import { and, eq, lt, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import ReviewComponent from './ReviewComponent';

export default async function ReviewPage() {
  // 第一步：验证用户登录
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // 第二步：定义"今天结束时间"（今天23:59:59）
  const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;

  // 第三步：查询当前用户的待复习单词
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
    })
    .from(userProgress)
    .innerJoin(words, eq(userProgress.word_id, words.id))
    .where(
      and(
        eq(userProgress.user_id, userId),
        lt(userProgress.next_review, todayEnd),
        eq(userProgress.mastered, false)
      )
    );

  // 第四步：传递数据给客户端组件
  return <ReviewComponent reviews={reviews} userId={userId} />;
}

