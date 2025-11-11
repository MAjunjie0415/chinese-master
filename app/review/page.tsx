import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ReviewData from './components/ReviewData';

// 骨架屏组件
function ReviewSkeleton() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-6 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

export default async function ReviewPage() {
  // 第一步：验证用户登录
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  // 第二步：使用 Suspense 分离数据获取，让页面先显示骨架屏
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <ReviewData userId={userId} />
    </Suspense>
  );
}

