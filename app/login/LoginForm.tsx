'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/courses';
  const inviteCode = searchParams.get('invite_code');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 创建Supabase客户端
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Google登录
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // 构建回调URL，保留invite_code和redirect参数
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (inviteCode) {
        callbackUrl.searchParams.set('invite_code', inviteCode);
      }
      if (redirectTo) {
        callbackUrl.searchParams.set('redirect', redirectTo);
      }

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (signInError) {
        throw signInError;
      }
      // OAuth会重定向，不需要设置loading为false
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || '登录失败，请重试');
      setLoading(false);
    }
  };

  // 检查是否已有session（已登录）
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // 已登录，直接跳转（invite_code会在OAuth回调中处理）
        router.push(redirectTo);
        router.refresh();
      }
    };

    checkSession();
  }, [redirectTo, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* 表单容器 */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {/* 标题 */}
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Welcome
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to continue your learning journey
          </p>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Google登录按钮 */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span>登录中...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* 邀请码提示 */}
          {inviteCode && (
            <div className="mt-6 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg text-sm text-center">
              🎁 使用邀请码注册，您将获得3次复习额度
            </div>
          )}
        </div>

        {/* 返回首页链接 */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
