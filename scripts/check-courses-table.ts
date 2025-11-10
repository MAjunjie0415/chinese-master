import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../lib/drizzle';
import { sql } from 'drizzle-orm';

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') });

async function checkCoursesTable() {
  try {
    console.log('🔍 Checking courses table structure...\n');

    // 检查表的所有列
    const columns = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columns in courses table:');
    const columnsArray = Array.isArray(columns) ? columns : (columns as any).rows || [];
    columnsArray.forEach((col: any) => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '[nullable]' : '[not null]'}`);
    });

    // 检查是否有数据
    console.log('\n📊 Checking courses data...');
    const courses = await db.execute(sql`SELECT * FROM courses LIMIT 5`);
    const coursesArray = Array.isArray(courses) ? courses : (courses as any).rows || [];
    
    if (coursesArray.length > 0) {
      console.log(`✅ Found ${coursesArray.length} course(s):`);
      coursesArray.forEach((course: any, index: number) => {
        console.log(`\n   Course ${index + 1}:`);
        Object.keys(course).forEach(key => {
          console.log(`     ${key}: ${course[key]}`);
        });
      });
    } else {
      console.log('⚠️  No courses found in database');
    }

    // 测试具体的查询（模拟页面查询）
    console.log('\n🧪 Testing query with slug...');
    const testSlug = 'business-negotiation-essentials';
    const testQuery = await db.execute(sql`
      SELECT 
        id, 
        title, 
        slug, 
        category, 
        cover_image, 
        description, 
        total_words, 
        difficulty, 
        created_at, 
        updated_at 
      FROM courses 
      WHERE slug = ${testSlug} 
      LIMIT 1
    `);
    const testQueryArray = Array.isArray(testQuery) ? testQuery : (testQuery as any).rows || [];

    if (testQueryArray.length > 0) {
      console.log('✅ Query successful!');
      console.log('   Found course:', testQueryArray[0]);
    } else {
      console.log(`⚠️  No course found with slug: ${testSlug}`);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    console.error('\n详细错误:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkCoursesTable();

