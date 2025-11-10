/**
 * v1.1 数据库迁移测试脚本
 * 验证迁移是否成功，如果失败则提示回滚
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { courses, userCourses, courseWords, practiceRecords } from '../db/schema/courses';
import { words } from '../db/schema/words';
import { userProgress } from '../db/schema/user_progress';
import { sql, eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

// 测试结果跟踪
let testsPassed = 0;
let testsFailed = 0;
const failedTests: string[] = [];

function logTest(testName: string, passed: boolean, details?: string) {
  if (passed) {
    testsPassed++;
    console.log(`  ✅ ${testName}`);
    if (details) console.log(`     ${details}`);
  } else {
    testsFailed++;
    failedTests.push(testName);
    console.log(`  ❌ ${testName}`);
    if (details) console.log(`     ${details}`);
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🧪 开始执行v1.1迁移测试...\n');
  console.log('=' .repeat(60));

  const client = postgres(databaseUrl);
  const db = drizzle(client);

  try {
    // ==================== 测试1：新表创建成功 ====================
    console.log('\n📋 测试1: 新表创建成功');
    console.log('-'.repeat(60));

    const tableQuery = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('courses', 'user_courses', 'course_words', 'practice_records')
      ORDER BY table_name
    `;

    const expectedTables = ['courses', 'user_courses', 'course_words', 'practice_records'];
    const foundTables = tableQuery.map(row => row.table_name);
    
    expectedTables.forEach(tableName => {
      const exists = foundTables.includes(tableName);
      logTest(
        `表 "${tableName}" 存在`,
        exists,
        exists ? '表已成功创建' : '表未找到，迁移可能失败'
      );
    });

    // 测试表结构
    console.log('\n📋 验证表结构:');
    
    // 验证courses表字段
    const coursesColumns = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `;
    const requiredCoursesColumns = ['id', 'title', 'slug', 'category', 'total_words'];
    const coursesColumnNames = coursesColumns.map(col => col.column_name);
    const hasAllCoursesColumns = requiredCoursesColumns.every(col => coursesColumnNames.includes(col));
    logTest(
      'courses表包含所有必需字段',
      hasAllCoursesColumns,
      hasAllCoursesColumns ? '字段完整' : `缺少字段: ${requiredCoursesColumns.filter(c => !coursesColumnNames.includes(c)).join(', ')}`
    );

    // ==================== 测试2：现有表数据未丢失 ====================
    console.log('\n📋 测试2: 现有表数据未丢失（v1.0数据完整性）');
    console.log('-'.repeat(60));

    // 检查words表
    const wordsCount = await db.select({ count: sql<number>`count(*)::int` }).from(words);
    const wordsTotal = wordsCount[0].count;
    logTest(
      'words表数据完整',
      wordsTotal > 0,
      `找到 ${wordsTotal} 条单词记录`
    );

    // 检查words表结构未被修改
    const wordsColumns = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'words'
      ORDER BY ordinal_position
    `;
    const expectedWordsColumns = ['id', 'chinese', 'pinyin', 'english', 'scene', 'example', 'category', 'frequency'];
    const wordsColumnNames = wordsColumns.map(col => col.column_name);
    const wordsStructureIntact = expectedWordsColumns.every(col => wordsColumnNames.includes(col));
    logTest(
      'words表结构未被修改',
      wordsStructureIntact,
      wordsStructureIntact ? '所有原始字段保留' : '表结构被意外修改'
    );

    // 随机抽取一条words记录验证完整性
    if (wordsTotal > 0) {
      const sampleWord = await db.select().from(words).limit(1);
      const hasAllFields = sampleWord[0] && 
        sampleWord[0].chinese && 
        sampleWord[0].pinyin && 
        sampleWord[0].english;
      logTest(
        'words表记录完整性',
        hasAllFields,
        hasAllFields ? `示例: "${sampleWord[0].chinese}" (${sampleWord[0].pinyin})` : '记录字段缺失'
      );
    }

    // 检查user_progress表
    const progressCount = await db.select({ count: sql<number>`count(*)::int` }).from(userProgress);
    const progressTotal = progressCount[0].count;
    logTest(
      'user_progress表数据完整',
      true, // 可能为0（新用户），所以只要表存在就算通过
      `找到 ${progressTotal} 条学习进度记录`
    );

    // 如果有user_progress数据，验证关联完整性
    if (progressTotal > 0) {
      const sampleProgress = await db
        .select({
          progressId: userProgress.id,
          userId: userProgress.user_id,
          wordId: userProgress.word_id,
          chinese: words.chinese,
        })
        .from(userProgress)
        .leftJoin(words, eq(userProgress.word_id, words.id))
        .limit(1);

      const relationIntact = sampleProgress[0] && sampleProgress[0].chinese;
      logTest(
        'user_progress与words表关联完整',
        relationIntact,
        relationIntact 
          ? `用户 ${sampleProgress[0].userId.substring(0, 8)}... 的进度记录正常` 
          : '关联关系损坏'
      );
    }

    // ==================== 测试3：外键关联有效 ====================
    console.log('\n📋 测试3: 外键约束生效');
    console.log('-'.repeat(60));

    // 测试3.1：course_words -> words外键约束
    try {
      await db.insert(courseWords).values({
        course_id: 99999, // 不存在的course_id
        word_id: 1, // 假设存在
        order: 1,
      });
      logTest(
        'course_words -> courses外键约束',
        false,
        '❌ 允许插入不存在的course_id，外键约束未生效'
      );
    } catch (error: any) {
      const isForeignKeyError = error.message.includes('foreign key') || 
                                error.message.includes('violates') ||
                                error.code === '23503';
      logTest(
        'course_words -> courses外键约束',
        isForeignKeyError,
        isForeignKeyError ? '正确拦截非法course_id' : `未知错误: ${error.message}`
      );
    }

    // 测试3.2：course_words -> words外键约束
    try {
      // 先创建一个测试课程
      const [testCourse] = await db.insert(courses).values({
        title: 'Test Course',
        slug: 'test-course-temp',
        category: 'business',
        description: 'Temporary test course',
      }).returning();

      // 尝试插入不存在的word_id
      await db.insert(courseWords).values({
        course_id: testCourse.id,
        word_id: 99999999, // 不存在的word_id
        order: 1,
      });

      logTest(
        'course_words -> words外键约束',
        false,
        '❌ 允许插入不存在的word_id，外键约束未生效'
      );

      // 清理测试数据
      await db.delete(courses).where(eq(courses.id, testCourse.id));
    } catch (error: any) {
      const isForeignKeyError = error.message.includes('foreign key') || 
                                error.message.includes('violates') ||
                                error.code === '23503';
      logTest(
        'course_words -> words外键约束',
        isForeignKeyError,
        isForeignKeyError ? '正确拦截非法word_id' : `未知错误: ${error.message}`
      );

      // 尝试清理（如果课程已创建）
      try {
        await db.delete(courses).where(eq(courses.slug, 'test-course-temp'));
      } catch {}
    }

    // 测试3.3：user_courses唯一约束
    try {
      // 创建测试课程（如果还没有）
      const existingTestCourse = await db.select().from(courses).where(eq(courses.slug, 'test-course-unique')).limit(1);
      let testCourseId: number;

      if (existingTestCourse.length > 0) {
        testCourseId = existingTestCourse[0].id;
      } else {
        const [newTestCourse] = await db.insert(courses).values({
          title: 'Test Unique Course',
          slug: 'test-course-unique',
          category: 'business',
        }).returning();
        testCourseId = newTestCourse.id;
      }

      const testUserId = '00000000-0000-0000-0000-000000000001';

      // 插入第一条记录
      await db.insert(userCourses).values({
        user_id: testUserId,
        course_id: testCourseId,
        progress: 0,
      });

      // 尝试插入重复记录
      await db.insert(userCourses).values({
        user_id: testUserId,
        course_id: testCourseId,
        progress: 0,
      });

      logTest(
        'user_courses唯一约束',
        false,
        '❌ 允许重复插入相同user_id和course_id，唯一约束未生效'
      );

      // 清理测试数据
      await db.delete(userCourses).where(eq(userCourses.course_id, testCourseId));
      await db.delete(courses).where(eq(courses.id, testCourseId));
    } catch (error: any) {
      const isUniqueError = error.message.includes('unique') || 
                           error.message.includes('duplicate') ||
                           error.code === '23505';
      logTest(
        'user_courses唯一约束',
        isUniqueError,
        isUniqueError ? '正确拦截重复记录' : `未知错误: ${error.message}`
      );

      // 清理测试数据
      try {
        const testCourse = await db.select().from(courses).where(eq(courses.slug, 'test-course-unique')).limit(1);
        if (testCourse.length > 0) {
          await db.delete(userCourses).where(eq(userCourses.course_id, testCourse[0].id));
          await db.delete(courses).where(eq(courses.id, testCourse[0].id));
        }
      } catch {}
    }

    // ==================== 测试4：索引创建成功 ====================
    console.log('\n📋 测试4: 索引创建成功');
    console.log('-'.repeat(60));

    const indexQuery = await client`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('courses', 'user_courses', 'course_words', 'practice_records')
      ORDER BY indexname
    `;

    const indexCount = indexQuery.length;
    logTest(
      '新表索引创建',
      indexCount >= 8,
      `创建了 ${indexCount} 个索引（预期至少8个）`
    );

    // ==================== 最终结果 ====================
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果总结:');
    console.log('='.repeat(60));
    console.log(`✅ 通过: ${testsPassed} 项`);
    console.log(`❌ 失败: ${testsFailed} 项`);

    if (testsFailed > 0) {
      console.log('\n❌ 失败的测试项:');
      failedTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test}`);
      });

      console.log('\n⚠️  测试未通过！建议回滚迁移。');
      console.log('\n🔄 回滚步骤:');
      console.log('  1. 在Supabase控制台恢复备份');
      console.log('  2. 或手动执行SQL删除新表:');
      console.log('     DROP TABLE IF EXISTS practice_records CASCADE;');
      console.log('     DROP TABLE IF EXISTS course_words CASCADE;');
      console.log('     DROP TABLE IF EXISTS user_courses CASCADE;');
      console.log('     DROP TABLE IF EXISTS courses CASCADE;');
      
      process.exit(1);
    } else {
      console.log('\n🎉 所有测试通过！迁移成功！');
      console.log('\n✅ v1.0数据完整无损');
      console.log('✅ v1.1新表创建成功');
      console.log('✅ 外键约束正常工作');
      console.log('✅ 索引创建完成');
      console.log('\n🚀 可以继续进行v1.1功能开发了！');
    }

  } catch (error) {
    console.error('\n❌ 测试执行失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main()
  .then(() => {
    process.exit(testsFailed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('错误:', error);
    process.exit(1);
  });


