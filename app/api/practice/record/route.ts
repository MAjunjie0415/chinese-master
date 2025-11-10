import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { courses, userCourses, practiceRecords } from '@/db/schema/courses';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // 验证用户登录
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取请求数据
    const body = await request.json();
    const { courseSlug, mode, correctCount, totalCount, duration } = body;

    // 验证必填字段
    if (!courseSlug || !mode || correctCount === undefined || totalCount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 查询课程ID
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseSlug))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 计算正确率
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    // 保存练习记录
    const [record] = await db
      .insert(practiceRecords)
      .values({
        user_id: userId,
        course_id: course.id,
        mode,
        correctCount: correctCount,
        totalCount: totalCount,
        accuracy,
        duration: duration || null,
      })
      .returning();

    // 更新用户课程进度（简化版：每次练习进度+5，最多100）
    const [enrollment] = await db
      .select()
      .from(userCourses)
      .where(
        and(
          eq(userCourses.user_id, userId),
          eq(userCourses.course_id, course.id)
        )
      )
      .limit(1);

    if (enrollment) {
      const newProgress = Math.min(enrollment.progress + 5, 100);
      const isCompleted = newProgress >= 100;

      await db
        .update(userCourses)
        .set({
          progress: newProgress,
          lastLearnedAt: new Date(),
          isCompleted: isCompleted,
        })
        .where(eq(userCourses.id, enrollment.id));
    }

    return NextResponse.json({
      success: true,
      record,
      message: 'Practice record saved successfully',
    });
  } catch (error) {
    console.error('Error saving practice record:', error);
    return NextResponse.json(
      { error: 'Failed to save practice record' },
      { status: 500 }
    );
  }
}

