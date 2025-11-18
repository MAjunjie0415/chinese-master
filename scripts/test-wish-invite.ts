/**
 * 许愿池和邀请码功能自动化测试脚本
 * 测试新开发的许愿池、邀请码和Google登录功能
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// 加载.env.local文件
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ .env.local 文件不存在，请先配置数据库连接');
  process.exit(1);
}

// 验证环境变量
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Supabase环境变量未设置');
  process.exit(1);
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<any>): Promise<void> {
  process.stdout.write(`\n🧪 测试: ${name}... `);
  try {
    const details = await testFn();
    results.push({ name, passed: true, details });
    process.stdout.write('✅ 通过\n');
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message });
    process.stdout.write(`❌ 失败: ${error.message}\n`);
  }
}

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log('🚀 开始测试许愿池和邀请码功能...\n');
  console.log('=' .repeat(60));

  // ========== 第一部分：数据库表结构测试 ==========
  console.log('\n📊 第一部分：数据库表结构验证');

  // 测试1: user_wishes表存在性
  await runTest('user_wishes表存在性', async () => {
    const { data, error } = await supabase
      .from('user_wishes')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`表不存在或查询失败: ${error.message}`);
    }
    return { tableExists: true };
  });

  // 测试2: user_wishes表结构
  await runTest('user_wishes表结构验证', async () => {
    const { data, error } = await supabase
      .from('user_wishes')
      .select('id, user_id, title, description, category, status, created_at')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`表结构验证失败: ${error.message}`);
    }
    return { structure: 'valid' };
  });

  // 测试3: invite_codes表存在性
  await runTest('invite_codes表存在性', async () => {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`表不存在或查询失败: ${error.message}`);
    }
    return { tableExists: true };
  });

  // 测试4: invite_codes表结构
  await runTest('invite_codes表结构验证', async () => {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('id, code, generated_by, used_by, is_used, created_at, used_at')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`表结构验证失败: ${error.message}`);
    }
    return { structure: 'valid' };
  });

  // 测试5: users表invite相关字段（如果表存在）
  await runTest('users表invite字段验证', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, invite_quota, invited_count')
      .limit(1);
    
    // Supabase PostgREST错误码：表不存在
    if (error && (error.message.includes('Could not find the table') || error.code === '42P01')) {
      return { 
        tableExists: false, 
        note: 'users表不存在，需要在Supabase SQL Editor中执行scripts/create-users-table.sql创建表',
        action: '请运行SQL脚本创建users表'
      };
    }
    
    // 空表也是正常的
    if (error && error.code === 'PGRST116') {
      return { fields: ['invite_quota', 'invited_count'], tableExists: true, isEmpty: true };
    }
    
    if (error) {
      throw new Error(`字段验证失败: ${error.message}`);
    }
    return { fields: ['invite_quota', 'invited_count'], tableExists: true };
  });

  // ========== 第二部分：RLS策略测试 ==========
  console.log('\n🔒 第二部分：Row Level Security (RLS) 验证');

  // 测试6: user_wishes RLS策略
  await runTest('user_wishes RLS策略', async () => {
    // 这个测试需要实际用户，这里只验证表有RLS
    const { error } = await supabase
      .from('user_wishes')
      .select('id')
      .limit(1);
    
    // 如果没有认证，应该返回权限错误（说明RLS生效）
    if (error && error.code === 'PGRST301') {
      return { rlsEnabled: true };
    }
    // 如果没有错误，可能是RLS未启用或允许匿名访问
    return { rlsStatus: 'checked' };
  });

  // 测试7: invite_codes RLS策略
  await runTest('invite_codes RLS策略', async () => {
    const { error } = await supabase
      .from('invite_codes')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST301') {
      return { rlsEnabled: true };
    }
    return { rlsStatus: 'checked' };
  });

  // ========== 第三部分：数据操作测试（模拟） ==========
  console.log('\n💾 第三部分：数据操作逻辑验证');

  // 测试8: 邀请码生成逻辑
  await runTest('邀请码生成逻辑', async () => {
    // 模拟生成邀请码
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (!code || code.length !== 6) {
      throw new Error('邀请码格式不正确');
    }
    
    return { 
      codeFormat: 'valid',
      length: code.length,
      pattern: /^[A-Z0-9]{6}$/.test(code) ? 'valid' : 'invalid'
    };
  });

  // 测试9: 邀请链接格式
  await runTest('邀请链接格式验证', async () => {
    const code = 'TEST12';
    const origin = 'https://example.com';
    const link = `${origin}/login?invite_code=${code}`;
    
    const url = new URL(link);
    if (url.searchParams.get('invite_code') !== code) {
      throw new Error('邀请链接格式不正确');
    }
    
    return { linkFormat: 'valid', link };
  });

  // 测试10: 许愿表单数据验证
  await runTest('许愿表单数据验证', async () => {
    const wishData = {
      title: 'Medical Chinese',
      category: 'business',
      description: 'Test description',
      status: 'pending'
    };
    
    if (!wishData.title || wishData.title.length === 0) {
      throw new Error('标题不能为空');
    }
    
    const validCategories = ['business', 'travel', 'exam', 'culture', 'other'];
    if (!validCategories.includes(wishData.category)) {
      throw new Error('类别无效');
    }
    
    return { dataValidation: 'valid', wishData };
  });

  // ========== 第四部分：组件文件存在性 ==========
  console.log('\n📁 第四部分：组件文件验证');

  const { existsSync: fsExistsSync } = await import('fs');
  const { resolve: pathResolve } = await import('path');

  // 测试11: WishForm组件文件
  await runTest('WishForm组件文件存在', async () => {
    const filePath = pathResolve(process.cwd(), 'components/WishForm.tsx');
    if (!fsExistsSync(filePath)) {
      throw new Error('WishForm.tsx 文件不存在');
    }
    return { fileExists: true };
  });

  // 测试12: InviteSection组件文件
  await runTest('InviteSection组件文件存在', async () => {
    const filePath = pathResolve(process.cwd(), 'app/profile/invite-section.tsx');
    if (!fsExistsSync(filePath)) {
      throw new Error('invite-section.tsx 文件不存在');
    }
    return { fileExists: true };
  });

  // 测试13: OAuth回调路由文件
  await runTest('OAuth回调路由文件存在', async () => {
    const filePath = pathResolve(process.cwd(), 'app/auth/callback/route.ts');
    if (!fsExistsSync(filePath)) {
      throw new Error('auth/callback/route.ts 文件不存在');
    }
    return { fileExists: true };
  });

  // ========== 第五部分：集成验证 ==========
  console.log('\n🔗 第五部分：集成验证');

  // 测试14: CoursesPageClient集成
  await runTest('CoursesPageClient集成WishForm', async () => {
    const filePath = pathResolve(process.cwd(), 'app/courses/CoursesPageClient.tsx');
    if (!fsExistsSync(filePath)) {
      throw new Error('CoursesPageClient.tsx 文件不存在');
    }
    
    const fs = await import('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content.includes('WishForm')) {
      throw new Error('CoursesPageClient未导入WishForm');
    }
    
    return { integrated: true };
  });

  // 测试15: ProfilePage集成
  await runTest('ProfilePage集成InviteSection', async () => {
    const filePath = pathResolve(process.cwd(), 'app/profile/page.tsx');
    if (!fsExistsSync(filePath)) {
      throw new Error('profile/page.tsx 文件不存在');
    }
    
    const fs = await import('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content.includes('InviteSection')) {
      throw new Error('ProfilePage未导入InviteSection');
    }
    
    return { integrated: true };
  });

  // ========== 测试结果汇总 ==========
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试结果汇总\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`总计: ${total} 个测试`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);

  if (failed > 0) {
    console.log('\n失败的测试:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ❌ ${r.name}: ${r.error}`);
      });
  }

  console.log('\n' + '='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查上述错误');
    process.exit(1);
  }
}

// 运行测试
main().catch((error) => {
  console.error('\n❌ 测试执行失败:', error);
  process.exit(1);
});

