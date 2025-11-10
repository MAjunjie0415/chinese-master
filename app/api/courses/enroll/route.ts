import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { userCourses, courses } from '@/db/schema/courses';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/courses/enroll
 * 添加课程到用户的"我的课程"
 */
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
        { error: 'Course already added' },
        { status: 400 }
      );
    }

    // 添加课程
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
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

