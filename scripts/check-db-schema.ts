import { config } from 'dotenv';
import { resolve } from 'path';

// 先加载 .env.local 文件（必须在导入 drizzle 之前）
config({ path: resolve(process.cwd(), '.env.local') });

// 现在才导入 drizzle（此时环境变量已加载）
import { db } from '../lib/drizzle';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // 检查 courses 表是否存在
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
      )
    `);

    if (!tableExists.rows[0]?.exists) {
      console.error('❌ courses 表不存在！');
      console.log('💡 需要运行数据库迁移：npx drizzle-kit push');
      process.exit(1);
    }

    console.log('✅ courses 表存在\n');

    // 获取所有列
    const columns = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'courses'
      ORDER BY ordinal_position
    `);

    console.log('📋 courses 表的列：');
    columns.rows.forEach((col: any) => {
      const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
      const nullable = col.is_nullable === 'YES' ? ' [nullable]' : '';
      console.log(`   - ${col.column_name}: ${col.data_type}${nullable}${defaultVal}`);
    });

    // 检查必需的字段
    const requiredFields = [
      'id', 'title', 'slug', 'category', 'cover_image', 
      'description', 'total_words', 'difficulty', 'created_at', 'updated_at'
    ];

    const actualFields = columns.rows.map((col: any) => col.column_name);
    const missingFields = requiredFields.filter(f => !actualFields.includes(f));

    if (missingFields.length > 0) {
      console.error(`\n❌ 缺少以下字段：${missingFields.join(', ')}`);
      console.log('💡 需要重新运行数据库迁移');
    } else {
      console.log('\n✅ 所有必需的字段都存在');
    }

    // 检查是否有数据
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM courses`);
    console.log(`\n📊 课程数量：${count.rows[0]?.count || 0}`);

  } catch (error: any) {
    console.error('\n❌ 错误:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 数据库连接失败，请检查：');
      console.error('   1. DATABASE_URL 是否正确');
      console.error('   2. Supabase 项目是否激活');
      console.error('   3. 是否使用了 Direct 连接（Session mode）');
    }
    process.exit(1);
  }

  process.exit(0);
}

checkSchema();

