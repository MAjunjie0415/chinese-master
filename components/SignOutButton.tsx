'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/supabase';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (!confirm('Are you sure you want to sign out?')) {
      return;
    }

    setLoading(true);

    try {
      await signOutUser();
      // 退出成功后重定向到首页
      router.push('/');
      router.refresh(); // 刷新页面以清除会话
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-red-600 text-lg font-semibold hover:text-red-700 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
}

