'use client';

interface UserInfoCardProps {
  email: string;
  createdAt: string;
}

export default function UserInfoCard({ email, createdAt }: UserInfoCardProps) {
  // 生成用户头像（使用邮箱首字母）
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  // 计算加入天数
  const getDaysSince = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceJoined = getDaysSince(createdAt);

  return (
    <div className="paper-card p-6 mb-8 border-slate-200">
      <div className="flex items-center gap-4">
        {/* 用户头像 */}
        <div className="w-16 h-16 md:w-20 md:h-20 bg-primary border border-primary/20 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105">
          <span className="text-white text-2xl md:text-3xl font-bold">
            {getInitials(email)}
          </span>
        </div>

        {/* 用户信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 truncate header-serif">
              {email.split('@')[0]}
            </h2>
            <span className="px-2 py-0.5 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-colors hover:bg-primary/10">
              Institutional Member
            </span>
          </div>

          <p className="text-sm md:text-base text-muted truncate mb-3 font-medium">
            {email}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Tenure: {formatDate(createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{daysSinceJoined} Cycle {daysSinceJoined === 1 ? 'Day' : 'Days'}</span>
            </div>
          </div>
        </div>

        {/* 设置图标 */}
        <button
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all active:scale-95"
          title="Account Management"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* 移动端设置按钮 */}
      <button
        className="md:hidden w-full mt-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 border border-slate-100 rounded-lg transition-all active:scale-[0.98]"
        title="Settings"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Account Management
      </button>
    </div>
  );
}

