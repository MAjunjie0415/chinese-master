import { config } from 'dotenv';
import { resolve } from 'path';

// 先加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

// 导入
import { db } from '../lib/drizzle';
import { courses } from '../db/schema/courses';
import { eq } from 'drizzle-orm';

async function testQuery() {
  try {
    console.log('🧪 Testing simple query...\n');

    // 测试查询（只选择几个基本字段）
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
      })
      .from(courses)
      .where(eq(courses.slug, 'business-negotiation-essentials'))
      .limit(1);

    if (result.length > 0) {
      console.log('✅ Query successful!');
      console.log('Course found:', result[0]);
    } else {
      console.log('⚠️  No course found with that slug');
    }

    // 测试查询所有字段
    console.log('\n🧪 Testing full query...');
    const fullResult = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        category: courses.category,
        description: courses.description,
        totalWords: courses.totalWords,
        difficulty: courses.difficulty,
        coverImage: courses.coverImage,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      })
      .from(courses)
      .where(eq(courses.slug, 'business-negotiation-essentials'))
      .limit(1);

    if (fullResult.length > 0) {
      console.log('✅ Full query successful!');
      console.log('Course:', fullResult[0]);
    } else {
      console.log('⚠️  No course found');
    }

  } catch (error: any) {
    console.error('\n❌ Query failed!');
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    if (error.code) {
      console.error('Code:', error.code);
    }
    process.exit(1);
  }

  process.exit(0);
}

testQuery();

