'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 导航链接配置
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Word Banks', path: '/wordbanks' },
    { name: 'Profile', path: '/profile' },
  ];

  // 判断链接是否为当前页面
  const isActive = (path: string) => {
    return pathname === path;
  };

  // 处理导航跳转
  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false); // 移动端菜单自动收起
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* 左侧：产品名称 */}
        <button
          onClick={() => handleNavigation('/')}
          className="text-xl font-bold text-[#165DFF] cursor-pointer hover:opacity-80 transition-opacity"
        >
          ChineseMaster
        </button>

        {/* 右侧：桌面端导航链接 */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavigation(link.path)}
              className={`transition-colors cursor-pointer ${
                isActive(link.path)
                  ? 'text-[#165DFF] font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.name}
            </button>
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
              <button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className={`text-left transition-colors cursor-pointer ${
                  isActive(link.path)
                    ? 'text-[#165DFF] font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

