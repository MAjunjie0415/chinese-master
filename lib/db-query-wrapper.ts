/**
 * 数据库查询包装器
 * 提供重试机制和更好的错误处理
 */

import { db } from './drizzle';
import { checkDatabaseConnection } from './drizzle';

interface QueryOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * 执行数据库查询，带重试机制
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 在重试前检查连接
      if (attempt > 0) {
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }

      // 执行查询（带超时）
      const result = await Promise.race([
        queryFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        ),
      ]);

      return result;
    } catch (error: any) {
      lastError = error;

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === retries) {
        break;
      }

      // 判断是否需要重试
      const shouldRetry = 
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'ENOTFOUND' ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('connection') ||
        error?.message?.includes('Failed query');

      if (shouldRetry) {
        console.warn(`⚠️ Query failed (attempt ${attempt + 1}/${retries + 1}), retrying...`, error?.message);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      } else {
        // 不需要重试的错误（如SQL语法错误），直接抛出
        throw error;
      }
    }
  }

  // 所有重试都失败
  throw new Error(
    `Query failed after ${retries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

