
import * as dotenv from 'dotenv';
import { eq, count } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

// Removed static imports for db, courses, userCourses, userProgress

async function main() {
    console.log('🔍 Starting Production Debug...');

    // Dynamic imports to ensure env vars are loaded
    const { db } = await import('@/lib/drizzle');
    const { courses, userCourses } = await import('@/db/schema/courses');
    const { userProgress } = await import('@/db/schema/progress');
    const { sql } = await import('drizzle-orm');

    try {
        // 1. Check Courses Count
        const coursesCount = await db.select({ count: count() }).from(courses);
        console.log(`\n📊 Total Courses in DB: ${coursesCount[0].count}`);

        // 2. Fetch All Courses (Simulate app/courses/page.tsx)
        console.log('\n🔄 Simulating fetchAllCourses...');
        const allCourses = await db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                category: courses.category,
                description: courses.description,
                totalWords: courses.totalWords,
                difficulty: courses.difficulty,
                coverImage: courses.coverImage,
            })
            .from(courses)
            .orderBy(courses.createdAt);

        console.log(`✅ Fetched ${allCourses.length} courses successfully.`);
        if (allCourses.length > 0) {
            console.log('Sample Course:', JSON.stringify(allCourses[0], null, 2));
        }

        // 3. Inspect user_courses Table
        console.log('\n🔍 Inspecting user_courses table...');

        // Check Columns
        const columns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'user_courses';
    `);

        if (columns.length === 0) {
            console.error('❌ Table "user_courses" DOES NOT EXIST in production!');
        } else {
            console.log('✅ Table "user_courses" exists. Columns:', JSON.stringify(columns, null, 2));
        }

        // Check FKs on user_courses
        const constraints = await db.execute(sql`
      SELECT
        tc.constraint_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='user_courses';
    `);

        console.log('Foreign Keys:', JSON.stringify(constraints, null, 2));

    } catch (error) {
        console.error('❌ Error during debug:', error);
    }

    process.exit(0);
}

main();
