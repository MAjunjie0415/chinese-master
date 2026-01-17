import { Suspense } from 'react';
import LoginForm from './LoginForm';

// 加载中的骨架屏
function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <div className="w-full max-w-md">
        <div className="paper-card p-10 border-slate-200 animate-pulse bg-white">
          <div className="h-8 bg-slate-100 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto mb-10"></div>
          <div className="space-y-6">
            <div className="h-12 bg-slate-50 rounded"></div>
            <div className="h-12 bg-slate-50 rounded"></div>
            <div className="h-14 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
