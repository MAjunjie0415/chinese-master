'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);

  // 导航链接配置
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Review', path: '/review/start' },
    { name: 'Profile', path: '/profile' },
  ];

  // 判断链接是否为当前页面
  const isActive = (path: string) => {
    return pathname === path;
  };

  // 处理导航点击，提供即时反馈
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // 如果已经是当前页面，阻止导航
    if (pathname === path) {
      e.preventDefault();
      return;
    }

    // 设置导航状态，提供即时视觉反馈
    setNavigating(path);
    
    // 使用 router.push 进行导航，提供更好的性能
    e.preventDefault();
    router.push(path);
    
    // 清除导航状态（延迟一点以确保视觉反馈可见）
    setTimeout(() => setNavigating(null), 300);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* 左侧：产品名称 */}
        <Link
          href="/"
          prefetch={true}
          className="text-xl font-bold text-[#165DFF] cursor-pointer hover:opacity-80 transition-opacity"
        >
          ChineseMaster
        </Link>

        {/* 右侧：桌面端导航链接 */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              prefetch={true}
              onClick={(e) => handleNavigation(e, link.path)}
              className={`transition-all cursor-pointer relative ${
                isActive(link.path)
                  ? 'text-[#165DFF] font-semibold'
                  : navigating === link.path
                  ? 'text-[#165DFF] opacity-70'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.name}
              {navigating === link.path && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#165DFF] animate-pulse" />
              )}
            </Link>
          ))}
        </div>

        {/* 右侧：移动端汉堡菜单图标 */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-600 cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              // 关闭图标 (X)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // 汉堡图标 (三条横线)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

        {/* 移动端菜单展开 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  prefetch={true}
                  onClick={(e) => {
                    handleNavigation(e, link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left transition-colors cursor-pointer ${
                    isActive(link.path)
                      ? 'text-[#165DFF] font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
    </nav>
  );
}

