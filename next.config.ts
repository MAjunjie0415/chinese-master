import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境优化
  reactStrictMode: true, // 启用React严格模式
  
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
    // 图片格式优化
    formats: ['image/webp'],
    // 设备尺寸断点
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // 图片尺寸断点
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 编译优化
  compiler: {
    // 移除console.log (生产环境)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // 保留error和warn
    } : false,
  },

  // 性能优化
  poweredByHeader: false, // 移除X-Powered-By header
  compress: true, // 启用gzip压缩

  // 实验性功能 (可选)
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'], // 优化依赖导入
  },
};

export default nextConfig;
