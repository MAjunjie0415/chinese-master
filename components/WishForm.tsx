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
        <div className="mb-6 md:mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <span className="text-2xl md:text-3xl">🌟</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold mb-1">Want a new course? Tell us!</h3>
                <p className="text-purple-100 text-xs md:text-sm">Your suggestions help us develop better courses</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="w-full md:w-auto bg-white text-purple-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all hover:scale-105 active:scale-95 shadow-md text-sm md:text-base whitespace-nowrap"
            >
              Make a Wish
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
            <div className="bg-black/50 backdrop-blur-sm fixed inset-0" />
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 md:p-6 relative z-10 max-h-[90vh] overflow-y-auto">
              {showSuccess ? (
                <div className="text-center py-6 md:py-8">
                  <div className="text-5xl md:text-6xl mb-4 animate-bounce">✅</div>
                  <h3 className="text-xl md:text-2xl font-bold text-green-600 mb-2">Thank you for your suggestion!</h3>
                  <p className="text-gray-600 text-sm md:text-base">We'll consider it carefully</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">🌟 Make a Wish</h2>
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

  // Button样式（底部按钮）- 移动端适配
  return (
    <>
      <div className="mt-12 md:mt-16 border-t pt-6 md:pt-8">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg active:scale-95 font-semibold text-sm md:text-base"
        >
          🌟 Make a Wish
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
                <div className="text-5xl md:text-6xl mb-4 animate-bounce">✅</div>
                <h3 className="text-xl md:text-2xl font-bold text-green-600 mb-2">Thank you for your suggestion!</h3>
                <p className="text-gray-600 text-sm md:text-base">We'll consider it carefully</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">🌟 Make a Wish</h2>
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
