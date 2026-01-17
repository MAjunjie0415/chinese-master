'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

interface WishFormProps {
  variant?: 'banner' | 'button';
}

export function WishForm({ variant = 'button' }: WishFormProps) {
  const supabase = createBrowserSupabaseClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'business',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a course title');
      return;
    }

    setSubmitting(true);
    setError('');

    // 乐观更新：立即显示成功状态
    setShowSuccess(true);

    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please login first');
      }

      // 后台保存（不阻塞UI）
      const { error: insertError } = await supabase
        .from('user_wishes')
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim() || null,
          status: 'pending',
        });

      if (insertError) {
        throw insertError;
      }

      // 成功：3秒后自动关闭
      setTimeout(() => {
        setIsOpen(false);
        setShowSuccess(false);
        setForm({ title: '', category: 'business', description: '' });
      }, 3000);
    } catch (err: any) {
      // 错误处理：回滚成功状态
      setShowSuccess(false);
      setError(err.message || 'Submission failed, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // Banner样式（顶部横幅）- 移动端适配
  if (variant === 'banner') {
    return (
      <>
        <div className="mb-8 bg-primary rounded-lg shadow-sm p-6 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1 header-serif">Curriculum Requests</h3>
                <p className="text-slate-300 text-sm font-medium">Propose specific domain materials for AI synthesis.</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="w-full md:w-auto bg-white text-primary px-6 py-2.5 rounded font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm text-sm uppercase tracking-widest whitespace-nowrap"
            >
              Propose Module
            </button>
          </div>
        </div>

        {/* Modal */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !submitting) {
                setIsOpen(false);
              }
            }}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm fixed inset-0" />
            <div className="paper-card max-w-md w-full p-6 relative z-10 max-h-[90vh] overflow-y-auto border-slate-200">
              {showSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                    <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 header-serif">Proposal Received</h3>
                  <p className="text-muted text-sm font-medium">Your request has been queued for editorial review.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 header-serif">
                      <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Module Proposal
                    </h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-slate-300 hover:text-slate-500 transition-colors text-3xl"
                      disabled={submitting}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Resource Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g., Clinical Terminology for HSK 6"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Categorization
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium appearance-none"
                        disabled={submitting}
                      >
                        <option value="business">Executive Business</option>
                        <option value="travel">Expedient Travel</option>
                        <option value="exam">HSK Academic</option>
                        <option value="culture">Interdisciplinary</option>
                        <option value="other">Specialized Domain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Specification Details
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Define the scope and intended use case..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none text-sm font-medium"
                        disabled={submitting}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={submitting}
                        className="flex-1 px-4 py-3 border border-slate-200 rounded font-bold text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !form.title.trim()}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest shadow-sm"
                      >
                        {submitting ? 'Transmitting...' : 'Submit Proposal'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // Button样式（底部按钮）- 移动端适配
  return (
    <>
      <div className="mt-16 border-t border-slate-100 pt-8">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded font-bold hover:bg-primary transition-all shadow-sm active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Propose New Curriculum
        </button>
      </div>

      {/* Modal - 与banner版本相同 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setIsOpen(false);
            }
          }}
        >
          <div className="bg-black/50 backdrop-blur-sm fixed inset-0" />
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 md:p-6 relative z-10 max-h-[90vh] overflow-y-auto">
            {showSuccess ? (
              <div className="text-center py-6 md:py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-green-600 mb-2">Thank you for your suggestion!</h3>
                <p className="text-gray-600 text-sm md:text-base">We'll consider it carefully</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Make a Wish
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g., Medical Chinese"
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
                      disabled={submitting}
                    >
                      <option value="business">Business Chinese</option>
                      <option value="travel">Travel Chinese</option>
                      <option value="exam">HSK Exam</option>
                      <option value="culture">Culture & Interest</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe what you'd like to learn..."
                      rows={4}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-sm md:text-base"
                      disabled={submitting}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 md:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      disabled={submitting}
                      className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 text-sm md:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !form.title.trim()}
                      className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm md:text-base"
                    >
                      {submitting ? 'Submitting...' : 'Submit Wish'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
