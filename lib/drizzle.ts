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
console.log('🔌 Initializing Postgres client to:', isPooler ? 'Supabase Pooler' : isDirect ? 'Supabase Direct' : 'Unknown');

export const client = postgres(connectionString, {
  // Supabase Pooler 和 Direct 都要求禁用 prepare
  prepare: false,

  // SSL配置：生产环境下始终开启 SSL，并允许自签名证书
  ssl: process.env.NODE_ENV === 'production' || isPooler || isDirect ? {
    rejectUnauthorized: false, // 允许 Supabase 自签名证书
  } : false,

  // 连接池配置 - 优化配置 (服务器端降低连接数防瓶颈)
  // 对于 Supabase 免费版，并行实例多时连接数很容易耗尽
  // max: 2 是最保守、最安全的配置，防止 500 错误
  max: 2,
  idle_timeout: 15,           // 缩短空闲超时
  connect_timeout: 10,        // 连接超时
  max_lifetime: 60 * 30,      // 30分钟后自动回收连接

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
