import { db } from '../lib/drizzle';
import { sql } from 'drizzle-orm';

async function checkTables() {
  try {
    console.log('Checking database tables...\n');

    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('courses', 'user_courses', 'course_words', 'practice_records')
      ORDER BY table_name
    `);

    console.log('✅ Tables found:', result.rows.length);
    result.rows.forEach((row: any) => {
      console.log('  -', row.table_name);
    });

    // 检查 courses 表的列
    console.log('\n📋 Checking courses table columns...');
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `);

    if (columns.rows.length > 0) {
      console.log('Columns in courses table:');
      columns.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ courses table not found or has no columns');
    }

    // 检查是否有数据
    console.log('\n📊 Checking data...');
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM courses`);
    console.log('Courses count:', count.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkTables();

