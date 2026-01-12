import * as dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';

// Manually load .env.local from the project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { userCourses, courses } from '../db/schema/courses';

async function debugEnroll() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    console.log('🔍 Starting debug enrollment...');

    const client = postgres(databaseUrl, { max: 1 });
    const db = drizzle(client);

    try {
        // 1. Try to fetch one course
        const allCourses = await db.select().from(courses).limit(1);
        if (allCourses.length === 0) {
            console.log('❌ No courses found in database.');
            return;
        }
        const course = allCourses[0];
        const courseId = course.id;
        console.log(`✅ Found course: ${course.title} (ID: ${courseId})`);

        // 2. Use a dummy userId
        const userId = '00000000-0000-0000-0000-000000000003';
        console.log(`👤 Using dummy userId: ${userId}`);

        // 3. Check for existing enrollment
        console.log('🔎 Checking for existing enrollment...');
        const existing = await db
            .select()
            .from(userCourses)
            .where(
                and(
                    eq(userCourses.user_id, userId),
                    eq(userCourses.course_id, courseId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            console.log('ℹ️ Enrollment already exists, deleting it for test...');
            await db.delete(userCourses).where(
                and(
                    eq(userCourses.user_id, userId),
                    eq(userCourses.course_id, courseId)
                )
            );
        }

        // 4. Try to insert
        console.log('🚀 Attempting to insert into user_courses...');
        await db.insert(userCourses).values({
            user_id: userId,
            course_id: courseId,
            progress: 0,
            isCompleted: false,
        });
        console.log('✅ INSERT successful!');

        // 5. Cleanup
        await db.delete(userCourses).where(
            and(
                eq(userCourses.user_id, userId),
                eq(userCourses.course_id, courseId)
            )
        );
        console.log('🧹 Cleanup successful!');

    } catch (error: any) {
        console.error('❌ ERROR caught in debug script:');
        console.error('Message:', error.message);
        if (error.code) console.error('Code:', error.code);
        if (error.detail) console.error('Detail:', error.detail);
        if (error.stack) console.error('Stack:', error.stack);
    } finally {
        await client.end();
        process.exit(0);
    }
}

debugEnroll();
