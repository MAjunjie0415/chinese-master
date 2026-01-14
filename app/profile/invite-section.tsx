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
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
          Invite Friends
        </h3>
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
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all active:scale-95 text-sm md:text-base flex items-center justify-center gap-2"
            >
              {copied ? (
                <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Copied!</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg> Copy Link</>
              )}
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
