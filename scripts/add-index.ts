import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(databaseUrl, { max: 1 });
  
  try {
    console.log('🔄 添加索引 course_words_word_id_idx...');
    await sql`CREATE INDEX IF NOT EXISTS course_words_word_id_idx ON course_words (word_id)`;
    console.log('✅ 索引创建成功！');
  } catch (error) {
    console.error('❌ 索引创建失败:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main()
  .then(() => {
    console.log('\n✨ 操作完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('错误:', error);
    process.exit(1);
  });

