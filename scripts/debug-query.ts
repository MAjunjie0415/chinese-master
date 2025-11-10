import { config } from 'dotenv';
import { resolve } from 'path';

// 先加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

// 导入
import { db } from '../lib/drizzle';
import { courses } from '../db/schema/courses';
import { eq, sql } from 'drizzle-orm';

async function debugQuery() {
  try {
    console.log('🔍 开始诊断查询问题...\n');

    // 1. 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    const testResult = await db.execute(sql`SELECT NOW() as now`);
    console.log('✅ 连接成功！服务器时间:', testResult.rows[0]);

    // 2. 检查表是否存在
    console.log('\n2️⃣ 检查 courses 表...');
    const tableCheck = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position
    `);
    console.log('📋 表字段:');
    tableCheck.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    // 3. 检查所有课程的 slug
    console.log('\n3️⃣ 检查所有课程的 slug...');
    const allSlugs = await db.execute(sql`
      SELECT id, title, slug 
      FROM courses 
      ORDER BY id
    `);
    console.log(`找到 ${allSlugs.rows.length} 个课程:`);
    allSlugs.rows.forEach((row: any) => {
      console.log(`   - ID ${row.id}: "${row.title}" → slug: "${row.slug}"`);
    });

    // 4. 测试目标查询
    console.log('\n4️⃣ 测试目标查询...');
    const targetSlug = 'business-negotiation-essentials';
    
    // 使用原生SQL查询
    const rawQuery = await db.execute(sql`
      SELECT * FROM courses WHERE slug = ${targetSlug} LIMIT 1
    `);
    
    if (rawQuery.rows.length > 0) {
      console.log('✅ 使用原生SQL找到课程:');
      console.log(rawQuery.rows[0]);
    } else {
      console.log(`⚠️  未找到 slug 为 "${targetSlug}" 的课程`);
      console.log('💡 可能的原因：');
      console.log('   - slug 不匹配（检查大小写、连字符）');
      console.log('   - 数据尚未插入');
    }

    // 5. 测试 Drizzle 查询
    console.log('\n5️⃣ 测试 Drizzle ORM 查询...');
    try {
      const drizzleResult = await db
        .select({
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
        })
        .from(courses)
        .where(eq(courses.slug, targetSlug))
        .limit(1);
      
      if (drizzleResult.length > 0) {
        console.log('✅ Drizzle 查询成功:');
        console.log(drizzleResult[0]);
      } else {
        console.log('⚠️  Drizzle 查询返回空结果');
      }
    } catch (drizzleError: any) {
      console.error('❌ Drizzle 查询失败:');
      console.error('   错误:', drizzleError.message);
      console.error('   代码:', drizzleError.code);
      if (drizzleError.cause) {
        console.error('   原因:', drizzleError.cause);
      }
    }

  } catch (error: any) {
    console.error('\n❌ 诊断过程中出错:');
    console.error('错误:', error.message);
    console.error('代码:', error.code);
    if (error.cause) {
      console.error('原因:', error.cause);
    }
    console.error('\n完整错误:');
    console.error(error);
    process.exit(1);
  }

  console.log('\n✅ 诊断完成');
  process.exit(0);
}

debugQuery();

