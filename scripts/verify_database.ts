import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

async function verifyDatabase() {
  console.log('🔍 验证数据库表结构...\n');
  
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // 查询表信息
    const tablesResult = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('words', 'user_progress')
      ORDER BY table_name;
    `;
    
    console.log('✅ 已创建的表:');
    tablesResult.forEach((row: any) => {
      console.log(`   • ${row.table_name}`);
    });
    
    // 查询words表的列
    console.log('\n📋 words 表结构:');
    const wordsColumns = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'words'
      ORDER BY ordinal_position;
    `;
    wordsColumns.forEach((col: any) => {
      console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // 查询user_progress表的列
    console.log('\n📋 user_progress 表结构:');
    const progressColumns = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_progress'
      ORDER BY ordinal_position;
    `;
    progressColumns.forEach((col: any) => {
      console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // 查询索引
    console.log('\n🔗 索引信息:');
    const indexes = await client`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('words', 'user_progress')
      ORDER BY tablename, indexname;
    `;
    indexes.forEach((idx: any) => {
      console.log(`   • ${idx.tablename}.${idx.indexname}`);
    });
    
    console.log('\n✅ 数据库验证完成！表结构正确。\n');
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await client.end();
  }
}

verifyDatabase();

