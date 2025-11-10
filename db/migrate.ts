/**
 * 数据库迁移脚本
 * 用于应用新的数据库schema到Supabase
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🔄 开始数据库迁移...');

  // 创建迁移连接（max: 1 用于迁移）
  const migrationClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    // 执行迁移
    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('✅ 数据库迁移成功！');
    console.log('\n新增表:');
    console.log('  - courses (课程主表)');
    console.log('  - user_courses (用户课程关联表)');
    console.log('  - course_words (课程单词关联表)');
    console.log('  - practice_records (练习记录表)');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  } finally {
    // 关闭连接
    await migrationClient.end();
  }
}

main()
  .then(() => {
    console.log('\n✨ 所有操作完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('错误:', error);
    process.exit(1);
  });


