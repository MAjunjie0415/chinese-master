'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/courses';
  const inviteCode = searchParams.get('invite_code');

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Email login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        throw loginError;
      }

      if (data.session) {
        // Login successful, redirect to target page
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Email signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/courses`,
        },
      });

      if (signupError) {
        // Check if email already exists
        if (signupError.message.includes('already registered') ||
          signupError.message.includes('already exists') ||
          signupError.message.includes('User already registered')) {
          setError('This email is already registered. Please log in or use a different email.');
        } else {
          throw signupError;
        }
        return;
      }

      if (data.user) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setMode('login');
        // Clear form
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Build callback URL, preserving invite_code and redirect params
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (inviteCode) {
        callbackUrl.searchParams.set('invite_code', inviteCode);
      }
      if (redirectTo) {
        callbackUrl.searchParams.set('redirect', redirectTo);
      }

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (signInError) {
        throw signInError;
      }
      // OAuth will redirect, no need to set loading to false manually here
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  // Check if session exists (already logged in)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Already logged in, redirect directly
        router.push(redirectTo);
        router.refresh();
      }
    };

    checkSession();
  }, [redirectTo, router, supabase]);

  const handleSubmit = mode === 'login' ? handleLogin : handleSignup;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <div className="w-full max-w-md">
        {/* Form Container */}
        <div className="paper-card p-10 border-slate-200 shadow-sm relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12" />

          {/* Title */}
          <div className="relative z-10 text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 header-serif">
              {mode === 'login' ? 'Institutional Login' : 'Credential Issuance'}
            </h1>
            <p className="text-muted text-sm font-medium">
              {mode === 'login'
                ? 'Resume your linguistic curriculum'
                : 'Initialize your professional profile'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Identifier (Email)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                placeholder="you@institution.com"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Access Token (Password)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                placeholder="••••••••"
                disabled={loading}
              />
              {mode === 'signup' && (
                <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Entropy requirement: 6+ characters
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded text-[11px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded text-[11px] font-bold uppercase tracking-wider">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest shadow-sm active:scale-[0.98]"
            >
              {loading
                ? (mode === 'login' ? 'Synchronizing...' : 'Generating...')
                : (mode === 'login' ? 'Authorize Session' : 'Create Credentials')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center relative z-10">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Protocol Sync</span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-3.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6 text-xs uppercase tracking-widest active:scale-[0.98] relative z-10"
          >
            {loading ? (
              <span>Synchronizing...</span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>OAuth Integration</span>
              </>
            )}
          </button>

          {/* Invite Code Feedback */}
          {inviteCode && (
            <div className="bg-slate-50 border border-slate-100 text-primary p-4 rounded text-[10px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 relative z-10 leading-relaxed italic">
              Affiliate token detected: Mutual synthesis credits pending issuance.
            </div>
          )}

          {/* Mode Switch */}
          <div className="mt-8 text-center relative z-10 border-t border-slate-50 pt-6">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccess('');
              }}
              className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
              disabled={loading}
            >
              {mode === 'login'
                ? "Establish NEW Credential Profile"
                : 'Account identified? Authorize existing'}
            </button>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-10 text-center">
          <a
            href="/"
            className="text-[10px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors"
          >
            ← System Exit (Home)
          </a>
        </div>
      </div>
    </div>
  );
}

