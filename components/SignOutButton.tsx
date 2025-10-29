'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/supabase';
import LogOutModal from './LogOutModal';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmLogOut = async () => {
    setLoading(true);

    try {
      await signOutUser();
      // 退出成功后重定向到首页
      router.push('/');
      router.refresh(); // 刷新页面以清除会话
    } catch (error) {
      console.error('Log out error:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 text-red-600 text-base font-medium hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50 active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log Out
      </button>

      <LogOutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmLogOut}
        loading={loading}
      />
    </>
  );
}

