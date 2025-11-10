import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL;

console.log('\n🔍 Validating DATABASE_URL format...\n');

if (!dbUrl) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

// 解析连接字符串格式
const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
const match = dbUrl.match(urlPattern);

if (!match) {
  console.error('❌ DATABASE_URL format is incorrect!');
  console.error('\n期望格式: postgresql://user:password@host:port/database');
  console.error('\n当前值 (前50字符):', dbUrl.substring(0, 50) + '...');
  console.error('\n💡 请从 Supabase Dashboard → Project Settings → Database → Connection String → URI 复制最新连接字符串');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

console.log('✅ DATABASE_URL format is valid!\n');
console.log('📋 Connection details:');
console.log('   User:', user);
console.log('   Password:', password ? '***' + password.slice(-4) : 'not set');
console.log('   Host:', host);
console.log('   Port:', port);
console.log('   Database:', database);

// 检查是否是 Supabase 格式
if (host.includes('.supabase.co')) {
  console.log('\n✅ This looks like a Supabase connection string');
} else {
  console.log('\n⚠️  Warning: This does not look like a Supabase connection string');
  console.log('   Expected host to contain ".supabase.co"');
}

// 检查密码是否是占位符
if (password === 'YOUR-PASSWORD' || password.includes('[')) {
  console.error('\n❌ ERROR: Password appears to be a placeholder!');
  console.error('   请从 Supabase Dashboard 复制包含真实密码的连接字符串');
  process.exit(1);
}

console.log('\n✅ DATABASE_URL looks good!');
console.log('\n💡 如果连接仍然失败，请确认：');
console.log('   1. Supabase 项目状态为 Active（你已经确认过了 ✅）');
console.log('   2. 密码在 Supabase Dashboard 中是正确的');
console.log('   3. 如果密码最近更改过，请更新 .env.local 中的连接字符串');

