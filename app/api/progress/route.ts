import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 解析请求体
    const body = await request.json();
    const { wordId, known, isReview } = body;

    if (!wordId || typeof known !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 计算下次复习时间
    const now = new Date();
    let nextReview: Date;

    if (isReview) {
      // 复习模式
      if (known) {
        // Still Know：2天后复习
        nextReview = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      } else {
        // Forgot：10分钟后复习
        nextReview = new Date(now.getTime() + 10 * 60 * 1000);
      }
    } else {
      // 学习模式
      if (known) {
        // Know：1天后复习
        nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else {
        // Don't Know：1小时后复习
        nextReview = new Date(now.getTime() + 60 * 60 * 1000);
      }
    }

    // 检查是否已存在记录
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.user_id, userId),
          eq(userProgress.word_id, wordId)
        )
      )
      .limit(1);

    if (existingProgress.length > 0) {
      // 更新已有记录
      await db
        .update(userProgress)
        .set({
          last_reviewed: now,
          next_review: nextReview,
          mastered: known,
        })
        .where(
          and(
            eq(userProgress.user_id, userId),
            eq(userProgress.word_id, wordId)
          )
        );
    } else {
      // 插入新记录
      await db.insert(userProgress).values({
        user_id: userId,
        word_id: wordId,
        last_reviewed: now,
        next_review: nextReview,
        mastered: known,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Progress recorded successfully',
    });
  } catch (error) {
    console.error('Error recording progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

