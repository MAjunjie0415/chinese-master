'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export function InviteSection() {
  const supabase = createBrowserSupabaseClient();
  const [invitedCount, setInvitedCount] = useState(0);
  const [inviteLink, setInviteLink] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Load invited count
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Only count used invite codes
      const { data } = await supabase
        .from('invite_codes')
        .select('id')
        .eq('generated_by', user.id)
        .eq('is_used', true);

      setInvitedCount(data?.length || 0);
    } catch (error) {
      console.error('Failed to load invite data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate invite link
  const handleGenerateLink = async () => {
    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please login first');
        return;
      }

      // Generate invite code (simple random string)
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const link = `${window.location.origin}/login?invite_code=${code}`;

      // Optimistic update: show link immediately
      setInviteLink(link);
      setShowLink(true);

      // Save to database in background (non-blocking)
      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          generated_by: user.id,
          is_used: false,
        });

      if (error) {
        console.error('Failed to save invite code:', error);
        // Even if save fails, keep link visible for current session
      }
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      alert('Failed to generate link, please try again');
    } finally {
      setGenerating(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy link, please copy manually');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow mt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 md:p-6 shadow-md mt-6">
      <div className="text-center mb-4 md:mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">🎁 Invite Friends</h3>
        <p className="text-gray-600 text-xs md:text-sm mb-4">
          Invite friends to register, and you both get 3 review credits
        </p>
      </div>

      {/* Invited count - Large number display */}
      <div className="text-center mb-4 md:mb-6">
        <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
          {invitedCount}
        </div>
        <div className="text-xs md:text-sm text-gray-600">Friends Invited</div>
      </div>

      {/* Invite Button */}
      {!showLink ? (
        <button
          onClick={handleGenerateLink}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md text-sm md:text-base"
        >
          {generating ? 'Generating...' : 'Invite Friend'}
        </button>
      ) : (
        <div className="space-y-3">
          {/* Invite Link Display */}
          <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-purple-300">
            <div className="text-xs text-gray-500 mb-2">Share Link:</div>
            <div className="font-mono text-xs md:text-sm text-gray-900 break-all mb-3">
              {inviteLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all active:scale-95 text-sm md:text-base"
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={() => {
              setShowLink(false);
              setInviteLink('');
            }}
            className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm md:text-base"
          >
            Generate New Link
          </button>
        </div>
      )}

      {/* Description Text */}
      <div className="mt-4 text-center text-xs text-gray-500">
        When your friend registers successfully, you both get 3 review credits
      </div>
    </div>
  );
}
