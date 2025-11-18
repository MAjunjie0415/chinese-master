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
      setError('请输入课程标题');
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
        throw new Error('请先登录');
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
      setError(err.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // Banner样式（顶部横幅）
  if (variant === 'banner') {
    return (
      <>
        <div className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌟</span>
              <div>
                <h3 className="text-xl font-bold mb-1">想要什么课程？告诉我们！</h3>
                <p className="text-purple-100 text-sm">您的建议将帮助我们开发更多优质课程</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              许愿新课程
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
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative z-10 max-h-[90vh] overflow-y-auto">
              {showSuccess ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 animate-bounce">✅</div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">感谢您的建议！</h3>
                  <p className="text-gray-600">我们会认真考虑您的建议</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">🌟 许愿新课程</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                      disabled={submitting}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        课程标题 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="例如：Medical Chinese（医疗汉语）"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        类别
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        disabled={submitting}
                      >
                        <option value="business">商务汉语</option>
                        <option value="travel">旅游汉语</option>
                        <option value="exam">考试HSK</option>
                        <option value="culture">文化兴趣</option>
                        <option value="other">其他</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        详细描述（可选）
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="请描述您希望学习的内容..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        disabled={submitting}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={submitting}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !form.title.trim()}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        {submitting ? '提交中...' : '提交愿望'}
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

  // Button样式（底部按钮）
  return (
    <>
      <div className="mt-16 border-t pt-8">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg active:scale-95 font-semibold"
        >
          🌟 许愿新课程
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative z-10 max-h-[90vh] overflow-y-auto">
            {showSuccess ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 animate-bounce">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">感谢您的建议！</h3>
                <p className="text-gray-600">我们会认真考虑您的建议</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">🌟 许愿新课程</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      课程标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="例如：Medical Chinese（医疗汉语）"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      类别
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      disabled={submitting}
                    >
                      <option value="business">商务汉语</option>
                      <option value="travel">旅游汉语</option>
                      <option value="exam">考试HSK</option>
                      <option value="culture">文化兴趣</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      详细描述（可选）
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="请描述您希望学习的内容..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      disabled={submitting}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      disabled={submitting}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !form.title.trim()}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {submitting ? '提交中...' : '提交愿望'}
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

