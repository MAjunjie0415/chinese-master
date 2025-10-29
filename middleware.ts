import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 创建响应对象
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 创建Supabase服务端客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 获取当前用户会话
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // 定义保护的路由（需要登录才能访问）
  const protectedRoutes = ['/wordbanks', '/review', '/profile'];

  // 定义公开路由（无需登录）
  const publicRoutes = ['/', '/login'];

  // 检查当前路径是否为保护路由
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 检查当前路径是否为登录页
  const isLoginPage = pathname === '/login';

  // 未登录用户访问保护路由 → 重定向到登录页
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    // 保存原始URL，登录后可以跳转回来
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 已登录用户访问登录页 → 重定向到首页
  if (isLoginPage && session) {
    // 检查是否有重定向参数
    const redirect = request.nextUrl.searchParams.get('redirect');
    if (redirect && redirect !== '/login') {
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 其他情况：放行
  return response;
}

// 配置中间件匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - _next/static (静态文件)
     * - _next/image (图像优化文件)
     * - favicon.ico (网站图标)
     * - public文件夹下的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

