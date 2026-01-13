import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { courses, courseWords, userCourses } from '@/db/schema/courses';
import { eq } from 'drizzle-orm';

interface CreateCourseRequest {
    title: string;
    wordIds: number[];
    sourceText?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Get user session
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

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Parse request body
        const body: CreateCourseRequest = await request.json();
        const { title, wordIds, sourceText } = body;

        if (!title || !wordIds || wordIds.length === 0) {
            return NextResponse.json(
                { error: 'Title and at least one word are required' },
                { status: 400 }
            );
        }

        if (wordIds.length > 50) {
            return NextResponse.json(
                { error: 'Maximum 50 words per course' },
                { status: 400 }
            );
        }

        // Generate unique slug
        const timestamp = Date.now();
        const slug = `custom-${userId.slice(0, 8)}-${timestamp}`;

        // Create the course
        const [newCourse] = await db
            .insert(courses)
            .values({
                title: title.slice(0, 100),
                slug,
                category: 'custom',
                description: `Custom course with ${wordIds.length} words`,
                totalWords: wordIds.length,
                difficulty: 'intermediate',
                isCustom: true,
                createdBy: userId,
                sourceText: sourceText?.slice(0, 10000),
            })
            .returning({ id: courses.id, slug: courses.slug });

        // Add words to course
        const courseWordValues = wordIds.map((wordId, index) => ({
            course_id: newCourse.id,
            word_id: wordId,
            order: index + 1,
        }));

        await db.insert(courseWords).values(courseWordValues);

        // Auto-enroll user in the course
        await db.insert(userCourses).values({
            user_id: userId,
            course_id: newCourse.id,
            progress: 0,
        });

        return NextResponse.json({
            success: true,
            course: {
                id: newCourse.id,
                slug: newCourse.slug,
                title,
                wordCount: wordIds.length,
            },
        });

    } catch (error) {
        const err = error as Error;
        console.error('Error creating custom course:', err.message, err.stack);
        return NextResponse.json(
            { error: 'Internal server error', details: err.message },
            { status: 500 }
        );
    }
}
