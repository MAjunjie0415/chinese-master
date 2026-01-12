import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { userCourses, courses } from '@/db/schema/courses';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/courses/enroll
 * 添加课程到用户的"我的课程"
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态 - 使用集中的工具函数
    const supabase = await createServerSupabaseClient();

    // 使用 getUser() 代替 getSession()，更安全且能验证会话有效性
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Enrollment Auth Error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 解析请求体
    const body = await request.json();
    const { courseId } = body;

    if (!courseId || typeof courseId !== 'number') {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // 验证课程是否存在
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // 检查用户是否已添加该课程
    const [existingEnrollment] = await db
      .select()
      .from(userCourses)
      .where(
        and(
          eq(userCourses.user_id, userId),
          eq(userCourses.course_id, courseId)
        )
      )
      .limit(1);

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: true,
          message: 'Course already added',
          isAlreadyEnrolled: true
        },
        { status: 200 }
      );
    }

    // 添加课程
    try {
      await db.insert(userCourses).values({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        isCompleted: false,
      });

      return NextResponse.json({
        success: true,
        message: 'Course added successfully',
      });
    } catch (dbError) {
      const error = dbError as Error & { detail?: string; code?: string };
      console.error('Database Error during enrollment:', {
        message: error.message,
        detail: error.detail,
        code: error.code,
        userId,
        courseId
      });
      return NextResponse.json(
        { error: 'Failed to save enrollment to database' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Unexpected Error enrolling in course:', {
      message: err.message,
      stack: err.stack
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

