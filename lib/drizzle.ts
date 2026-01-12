import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// 检测连接类型
const isPooler = connectionString.includes('pooler.supabase.com');
const isDirect = connectionString.includes('db.') && connectionString.includes('.supabase.co');

// 创建PostgreSQL连接 - 使用单例模式确保连接复用
// 根据Supabase官方文档和最佳实践：
// - Session Pooler: 推荐用于服务器端应用，使用 pooler.supabase.com
// - Direct连接: 可能在某些网络环境下DNS解析失败，不推荐用于生产
export const client = postgres(connectionString, {
  // Supabase Pooler 和 Direct 都要求禁用 prepare
  prepare: false,

  // SSL配置：Pooler需要显式SSL配置
  ssl: isPooler || isDirect ? {
    rejectUnauthorized: false, // Supabase 使用自签名证书
  } : false,

  // 连接池配置 - 优化配置 (Serverless环境降低连接数)
  // Vercel serverless functions create new instances frequently.
  // Using a large pool size (e.g. 20) typically exhausts the database connection limit quickly.
  // max: 5 is a balanced choice for serverless + Supabase Transaction/Session pooler.
  // Using 1 was too restrictive when multiple Server Components run parallel queries.
  max: 5,
  idle_timeout: 20,           // 减少空闲超时（秒）
  connect_timeout: 10,        // 减少连接超时（秒）
  max_lifetime: 0,            // 0 表示尽可能复用连接，避免频繁重连（或者设为 60s）
  // 对于 Serverless，通常设为 0 或短时间都行，postgres.js处理较好
  // 保持默认或简单配置即可

  // 错误处理和重试
  onnotice: () => { },         // 忽略通知

  // 数据转换
  transform: {
    undefined: null,           // undefined 转为 null
  },

  // 连接健康检查
  connection: {
    application_name: 'chinese-master',
  },
});

// 创建Drizzle实例，使用schema进行类型推断
export const db = drizzle(client, {
  schema,
  // 确保字段名正确映射（snake_case -> camelCase）
  logger: process.env.NODE_ENV === 'development' ? {
    logQuery: (query, params) => {
      // 只在开发环境记录查询，避免生产环境日志过多
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Query:', query);
        if (params && params.length > 0) {
          console.log('📝 Params:', params);
        }
      }
    },
  } : false,
});

// 导出连接健康检查函数
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database connection check failed:', error);
    return false;
  }
}

// 优雅关闭连接（用于应用关闭时）
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}
