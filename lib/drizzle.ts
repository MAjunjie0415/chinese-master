import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL!;

// 创建PostgreSQL连接
export const client = postgres(connectionString);

// 创建Drizzle实例
export const db = drizzle(client, { schema });

