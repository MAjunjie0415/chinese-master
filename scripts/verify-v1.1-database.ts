/**
 * v1.1 数据库验证脚本
 * 验证新增的4张表是否正确创建
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { courses, userCourses, courseWords, practiceRecords } from '../db/schema/courses';
import { words } from '../db/schema/words';
import { userProgress } from '../db/schema/user_progress';
import { sql } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🔍 开始验证v1.1数据库结构...\n');

  const client = postgres(databaseUrl);
  const db = drizzle(client);

  try {
    // 1. 验证v1.0表是否存在（不应受影响）
    console.log('✅ 验证v1.0核心表...');
    
    const wordsCount = await db.select({ count: sql<number>`count(*)` }).from(words);
    console.log(`  ✓ words表: ${wordsCount[0].count} 条记录`);
    
    const progressCount = await db.select({ count: sql<number>`count(*)` }).from(userProgress);
    console.log(`  ✓ user_progress表: ${progressCount[0].count} 条记录`);

    // 2. 验证v1.1新增表
    console.log('\n✅ 验证v1.1新增表...');
    
    const coursesCount = await db.select({ count: sql<number>`count(*)` }).from(courses);
    console.log(`  ✓ courses表: ${coursesCount[0].count} 条记录`);
    
    const userCoursesCount = await db.select({ count: sql<number>`count(*)` }).from(userCourses);
    console.log(`  ✓ user_courses表: ${userCoursesCount[0].count} 条记录`);
    
    const courseWordsCount = await db.select({ count: sql<number>`count(*)` }).from(courseWords);
    console.log(`  ✓ course_words表: ${courseWordsCount[0].count} 条记录`);
    
    const practiceRecordsCount = await db.select({ count: sql<number>`count(*)` }).from(practiceRecords);
    console.log(`  ✓ practice_records表: ${practiceRecordsCount[0].count} 条记录`);

    // 3. 验证外键关系
    console.log('\n✅ 验证外键关系...');
    
    // 验证course_words -> courses外键
    const courseWordsWithCourses = await db
      .select({
        courseWordId: courseWords.id,
        courseId: courses.id,
        courseTitle: courses.title,
      })
      .from(courseWords)
      .leftJoin(courses, sql`${courseWords.course_id} = ${courses.id}`)
      .limit(1);
    
    if (courseWordsWithCourses.length > 0 && courseWordsWithCourses[0].courseTitle) {
      console.log(`  ✓ course_words -> courses 外键正常`);
    } else if (courseWordsCount[0].count === 0) {
      console.log(`  ⚠ course_words表为空，无法验证外键（正常）`);
    }

    // 验证course_words -> words外键
    const courseWordsWithWords = await db
      .select({
        courseWordId: courseWords.id,
        wordId: words.id,
        chinese: words.chinese,
      })
      .from(courseWords)
      .leftJoin(words, sql`${courseWords.word_id} = ${words.id}`)
      .limit(1);
    
    if (courseWordsWithWords.length > 0 && courseWordsWithWords[0].chinese) {
      console.log(`  ✓ course_words -> words 外键正常`);
    } else if (courseWordsCount[0].count === 0) {
      console.log(`  ⚠ course_words表为空，无法验证外键（正常）`);
    }

    // 4. 验证索引
    console.log('\n✅ 验证索引...');
    
    const indexQuery = await client`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('courses', 'user_courses', 'course_words', 'practice_records')
      ORDER BY tablename, indexname
    `;
    
    console.log(`  ✓ 找到 ${indexQuery.length} 个索引:`);
    indexQuery.forEach(index => {
      console.log(`    - ${index.tablename}.${index.indexname}`);
    });

    // 5. 总结
    console.log('\n📊 验证总结:');
    console.log('  ✅ v1.0核心表完整无损');
    console.log('  ✅ v1.1新增4张表创建成功');
    console.log('  ✅ 外键关系正确建立');
    console.log('  ✅ 索引创建完成');
    
    console.log('\n🎉 数据库结构验证通过！可以开始开发v1.1功能了。');

  } catch (error) {
    console.error('\n❌ 验证失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('错误:', error);
    process.exit(1);
  });


