/**
 * 测试数据库连接脚本
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL 未设置');
  process.exit(1);
}

// 检测连接类型
const isPooler = connectionString.includes('pooler.supabase.com');
const isDirect = connectionString.includes('db.') && connectionString.includes('.supabase.co');

console.log('🔍 测试数据库连接...\n');
console.log('连接类型:', isPooler ? 'Pooler' : isDirect ? 'Direct' : '未知');
console.log('连接字符串（前80字符）:', connectionString.substring(0, 80) + '...\n');

async function testConnection() {
  const client = postgres(connectionString, {
    prepare: false,
    ssl: isPooler || isDirect ? {
      rejectUnauthorized: false,
    } : false,
    max: 1,
    connect_timeout: 10,
  });

  try {
    console.log('📡 尝试连接...');
    const result = await client`SELECT NOW() as now, version() as version`;
    
    if (result && result.length > 0) {
      console.log('✅ 连接成功！');
      console.log('   服务器时间:', result[0].now);
      console.log('   PostgreSQL版本:', result[0].version.split(',')[0]);
      
      // 测试查询courses表
      console.log('\n📋 测试查询courses表...');
      const courses = await client`
        SELECT id, title, slug 
        FROM courses 
        WHERE slug = 'business-negotiation-essentials'
        LIMIT 1
      `;
      
      if (courses && courses.length > 0) {
        console.log('✅ 查询成功！找到课程:');
        console.log('   ID:', courses[0].id);
        console.log('   标题:', courses[0].title);
        console.log('   Slug:', courses[0].slug);
      } else {
        console.log('⚠️  查询返回空结果');
      }
      
    } else {
      console.error('❌ 连接成功但查询返回空结果');
    }
    
    await client.end();
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ 连接失败！');
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);
    if (error.cause) {
      console.error('原因:', error.cause);
    }
    console.error('\n完整错误:');
    console.error(error);
    
    await client.end();
    process.exit(1);
  }
}

testConnection();

