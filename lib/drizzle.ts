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

// 创建PostgreSQL连接
// 根据Supabase官方文档：
// - Session Pooler: 推荐用于服务器端应用，使用 pooler.supabase.com
// - Direct连接: 可能在某些网络环境下DNS解析失败，不推荐用于生产
export const client = postgres(connectionString, {
  // Supabase Pooler 和 Direct 都要求禁用 prepare
  prepare: false,
  
  // SSL配置：Pooler需要显式SSL配置
  ssl: isPooler || isDirect ? {
    rejectUnauthorized: false, // Supabase 使用自签名证书
  } : false,
  
  // 连接池配置
  max: 10,                    // 最大连接数
  idle_timeout: 20,           // 空闲超时（秒）
  connect_timeout: 30,        // 连接超时（秒）
  
  // 错误处理
  onnotice: () => {},         // 忽略通知
  
  // 数据转换
  transform: {
    undefined: null,           // undefined 转为 null
  },
});

// 创建Drizzle实例，使用schema进行类型推断
export const db = drizzle(client, { 
  schema,
  // 确保字段名正确映射（snake_case -> camelCase）
  logger: process.env.NODE_ENV === 'development',
});

