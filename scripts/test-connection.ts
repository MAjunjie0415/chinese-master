import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '../lib/drizzle';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');

    // 检查环境变量
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL environment variable is not set!');
      console.log('\n💡 Please check your .env.local file.');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL found (first 50 chars):', dbUrl.substring(0, 50) + '...');

    // 尝试执行简单查询
    console.log('\n📡 Attempting to connect...');
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    if (result.rows && result.rows.length > 0) {
      console.log('✅ Connection successful!');
      console.log('⏰ Server time:', result.rows[0]);

      // 检查表是否存在
      console.log('\n📋 Checking tables...');
      const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('courses', 'user_courses', 'course_words', 'practice_records', 'words', 'user_progress')
        ORDER BY table_name
      `);

      console.log(`✅ Found ${tables.rows.length} tables:`);
      tables.rows.forEach((row: any) => {
        console.log(`   - ${row.table_name}`);
      });

    } else {
      console.error('❌ Connection failed: No response from database');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Connection failed!\n');

    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 Error: Connection refused');
      console.error('\n可能的原因：');
      console.error('  1. Supabase 项目已暂停（Paused）');
      console.error('  2. 数据库 URL 错误');
      console.error('  3. 网络连接问题');
      console.error('\n💡 解决方案：');
      console.error('  1. 访问 https://supabase.com/dashboard');
      console.error('  2. 找到你的项目，检查状态是否为 "Paused"');
      console.error('  3. 如果已暂停，点击 "Resume" 恢复项目');
      console.error('  4. 等待 1-2 分钟后重试');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔴 Error: Host not found');
      console.error('可能是数据库 URL 中的主机名错误');
    } else if (error.message?.includes('password')) {
      console.error('🔴 Error: Authentication failed');
      console.error('数据库密码可能不正确');
    } else {
      console.error('🔴 Error details:', error.message || error);
    }

    console.error('\n📖 详细错误信息:');
    console.error(error);

    process.exit(1);
  }

  console.log('\n✅ All checks passed!');
  process.exit(0);
}

testConnection();

