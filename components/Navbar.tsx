'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);

  // Navigation links configuration
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Search', path: '/search' },
    { name: 'Review', path: '/review/start' },
    { name: 'Profile', path: '/profile' },
  ];

  // Check if link is the current page
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Handle navigation click with instant feedback
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // If already on the page, prevent navigation
    if (pathname === path) {
      e.preventDefault();
      return;
    }

    // Set navigating state for visual feedback
    setNavigating(path);

    // Use router.push for better performance
    e.preventDefault();
    router.push(path);

    // Clear navigating state after a delay
    setTimeout(() => setNavigating(null), 300);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left: Product Name */}
        <Link
          href="/"
          prefetch={true}
          className="text-xl font-bold text-[#165DFF] cursor-pointer hover:opacity-80 transition-opacity"
        >
          ChineseMaster
        </Link>

        {/* Right: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              prefetch={true}
              onClick={(e) => handleNavigation(e, link.path)}
              className={`transition-all cursor-pointer relative ${isActive(link.path)
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

        {/* Right: Mobile Hamburger Menu Icon */}
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

      {/* Mobile Menu Expansion */}
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
                className={`text-left transition-colors cursor-pointer ${isActive(link.path)
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

