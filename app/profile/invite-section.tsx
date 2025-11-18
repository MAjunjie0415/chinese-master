'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export function InviteSection() {
  const supabase = createBrowserSupabaseClient();
  const [invitedCount, setInvitedCount] = useState(0);
  const [inviteLink, setInviteLink] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // 加载已邀请人数
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 只统计已使用的邀请码数量
        const { data } = await supabase
          .from('invite_codes')
          .select('id')
          .eq('generated_by', user.id)
          .eq('is_used', true);

        setInvitedCount(data?.length || 0);
      } catch (error) {
        console.error('加载邀请数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 生成邀请链接
  const handleGenerateLink = async () => {
    setGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录');
        return;
      }

      // 生成邀请码（简单随机字符串）
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const link = `${window.location.origin}/login?invite_code=${code}`;

      // 乐观更新：立即显示链接
      setInviteLink(link);
      setShowLink(true);

      // 后台保存到数据库（不阻塞UI）
      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          generated_by: user.id,
          is_used: false,
        });

      if (error) {
        console.error('保存邀请码失败:', error);
        // 即使保存失败，也保留链接显示（用户仍可使用）
      }
    } catch (error) {
      console.error('生成邀请链接失败:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制链接');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 shadow-md mt-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🎁 邀请好友</h3>
        <p className="text-gray-600 text-sm mb-4">
          邀请朋友注册，你们都能获得3次复习额度
        </p>
      </div>

      {/* 已邀请人数 - 大数字显示 */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-purple-600 mb-2">
          {invitedCount}
        </div>
        <div className="text-sm text-gray-600">已邀请人数</div>
      </div>

      {/* 邀请按钮 */}
      {!showLink ? (
        <button
          onClick={handleGenerateLink}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md"
        >
          {generating ? '生成中...' : '邀请朋友'}
        </button>
      ) : (
        <div className="space-y-3">
          {/* 邀请链接显示 */}
          <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
            <div className="text-xs text-gray-500 mb-2">分享链接：</div>
            <div className="font-mono text-sm text-gray-900 break-all mb-3">
              {inviteLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all active:scale-95"
            >
              {copied ? '✅ 已复制！' : '📋 复制链接'}
            </button>
          </div>

          {/* 重新生成按钮 */}
          <button
            onClick={() => {
              setShowLink(false);
              setInviteLink('');
            }}
            className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            生成新链接
          </button>
        </div>
      )}

      {/* 说明文字 */}
      <div className="mt-4 text-center text-xs text-gray-500">
        邀请成功，双方各得3次复习额度
      </div>
    </div>
  );
}

