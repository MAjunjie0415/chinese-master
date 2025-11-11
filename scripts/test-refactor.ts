/**
 * 重构后功能测试脚本
 * 测试移除Word Banks后的核心功能
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// 加载.env.local文件
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ .env.local 文件不存在，请先配置数据库连接');
  process.exit(1);
}

// 验证DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 环境变量未设置');
  process.exit(1);
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<any>): Promise<void> {
  try {
    console.log(`\n🧪 测试: ${name}`);
    const result = await testFn();
    results.push({ name, passed: true, details: result });
    console.log(`✅ 通过: ${name}`);
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message });
    console.error(`❌ 失败: ${name}`);
    console.error(`   错误: ${error.message}`);
  }
}

async function main() {
  // 动态导入（在环境变量加载后）
  const { db } = await import('../lib/drizzle');
  const { userProgress } = await import('../db/schema/user_progress');
  const { courses, courseWords, userCourses, practiceRecords } = await import('../db/schema/courses');
  const { words } = await import('../db/schema/words');
  const drizzleOrm = await import('drizzle-orm');
  const { eq, and, sql, count, lt } = drizzleOrm;

  console.log('🚀 开始自动化测试...\n');

  // 测试1: 数据库连接
  await runTest('数据库连接', async () => {
    const result = await db.execute(sql`SELECT 1 as test`);
    if (!result || result.length === 0) {
      throw new Error('数据库连接失败');
    }
    return { connected: true };
  });

  // 测试2: 检查courses表是否存在
  await runTest('Courses表存在性检查', async () => {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
      ) as exists
    `);
    const exists = result[0]?.exists;
    if (!exists) {
      throw new Error('courses表不存在');
    }
    return { exists: true };
  });

  // 测试3: 检查course_words表是否存在
  await runTest('Course_words表存在性检查', async () => {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_words'
      ) as exists
    `);
    const exists = result[0]?.exists;
    if (!exists) {
      throw new Error('course_words表不存在');
    }
    return { exists: true };
  });

  // 测试4: 检查是否有课程数据
  await runTest('课程数据检查', async () => {
    const courseList = await db.select().from(courses).limit(5);
    if (courseList.length === 0) {
      throw new Error('没有课程数据，请运行 npm run seed:courses');
    }
    return { count: courseList.length, courses: courseList.map(c => ({ id: c.id, title: c.title })) };
  });

  // 测试5: 检查课程-单词关联
  await runTest('课程-单词关联检查', async () => {
    const [course] = await db.select().from(courses).limit(1);
    if (!course) {
      throw new Error('没有课程数据');
    }
    
    const courseWordsList = await db
      .select({
        wordId: courseWords.word_id,
        order: courseWords.order,
      })
      .from(courseWords)
      .where(eq(courseWords.course_id, course.id))
      .limit(5);
    
    if (courseWordsList.length === 0) {
      throw new Error(`课程 ${course.title} 没有关联单词`);
    }
    
    return { 
      courseId: course.id, 
      courseTitle: course.title,
      wordCount: courseWordsList.length 
    };
  });

  // 测试6: 测试Review查询逻辑（JOIN course_words）
  await runTest('Review查询逻辑测试', async () => {
    // 创建一个测试查询，模拟Review页面的查询
    const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;
    
    // 这个查询应该能正常执行，即使没有数据
    const reviews = await db
      .select({
        wordId: words.id,
        courseId: courses.id,
        courseTitle: courses.title,
      })
      .from(userProgress)
      .innerJoin(words, eq(userProgress.word_id, words.id))
      .innerJoin(courseWords, eq(userProgress.word_id, courseWords.word_id))
      .innerJoin(courses, eq(courseWords.course_id, courses.id))
      .where(
        and(
          lt(userProgress.next_review, todayEnd),
          eq(userProgress.mastered, false)
        )
      )
      .limit(1);
    
    return { 
      queryExecuted: true, 
      resultCount: reviews.length,
      note: '查询逻辑正确，即使没有数据也能正常执行'
    };
  });

  // 测试7: 检查practice_records表
  await runTest('Practice_records表检查', async () => {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'practice_records'
      ) as exists
    `);
    const exists = result[0]?.exists;
    if (!exists) {
      throw new Error('practice_records表不存在');
    }
    return { exists: true };
  });

  // 测试8: 检查user_progress表结构
  await runTest('User_progress表结构检查', async () => {
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_progress'
      ORDER BY ordinal_position
    `);
    
    const columnNames = columns.map((c: any) => c.column_name);
    const requiredColumns = ['id', 'user_id', 'word_id', 'last_reviewed', 'next_review', 'mastered'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`缺少必需字段: ${missingColumns.join(', ')}`);
    }
    
    return { 
      columns: columnNames,
      structure: '正确'
    };
  });

  // 测试9: 检查首页Review查询逻辑
  await runTest('首页Review查询逻辑测试', async () => {
    const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;
    
    // 模拟首页的查询（只统计来自Courses的单词）
    const result = await db
      .select({ count: count() })
      .from(userProgress)
      .innerJoin(courseWords, eq(userProgress.word_id, courseWords.word_id))
      .innerJoin(courses, eq(courseWords.course_id, courses.id))
      .where(
        and(
          lt(userProgress.next_review, todayEnd),
          eq(userProgress.mastered, false)
        )
      );
    
    const reviewCount = result[0]?.count || 0;
    
    return { 
      queryExecuted: true, 
      reviewCount: Number(reviewCount),
      note: '查询逻辑正确'
    };
  });

  // 测试10: 检查Profile页面查询逻辑
  await runTest('Profile页面查询逻辑测试', async () => {
    // 测试各种统计查询是否能正常执行
    const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;
    
    // 总学习单词数
    const totalLearned = await db
      .select({ count: count() })
      .from(userProgress);
    
    // 今日复习数（只统计Courses）
    const todayReviews = await db
      .select({ count: count() })
      .from(userProgress)
      .innerJoin(courseWords, eq(userProgress.word_id, courseWords.word_id))
      .where(
        and(
          lt(userProgress.next_review, todayEnd),
          eq(userProgress.mastered, false)
        )
      );
    
    // 课程统计
    const enrolledCourses = await db
      .select({ count: count() })
      .from(userCourses);
    
    // 练习记录统计
    const practiceStats = await db
      .select({ count: count() })
      .from(practiceRecords);
    
    return {
      totalLearned: Number(totalLearned[0]?.count || 0),
      todayReviews: Number(todayReviews[0]?.count || 0),
      enrolledCourses: Number(enrolledCourses[0]?.count || 0),
      practiceStats: Number(practiceStats[0]?.count || 0),
      note: '所有查询都能正常执行'
    };
  });

  // 输出测试结果
  console.log('\n\n📊 测试结果汇总:');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} [${index + 1}/${results.length}] ${result.name}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    if (result.details && Object.keys(result.details).length > 0) {
      const detailsStr = JSON.stringify(result.details, null, 2).replace(/\n/g, '\n   ');
      console.log(`   详情: ${detailsStr}`);
    }
  });
  
  console.log('='.repeat(60));
  console.log(`\n总计: ${results.length} 个测试`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  有测试失败，请检查并修复问题');
    process.exit(1);
  } else {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
