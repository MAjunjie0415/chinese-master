'use client';

import { useState } from 'react';

interface UpgradePageClientProps {
    plan: string | null;
    status?: string;
}

export function UpgradePageClient({ plan, status }: UpgradePageClientProps) {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    // Monthly prices
    const prices = {
        monthly: {
            pro: 29,
            max: 79
        },
        yearly: {
            pro: 290,  // 10个月的价格，相当于年付打8.3折
            max: 790   // 10个月的价格，相当于年付打8.3折
        }
    };

    const currentPrices = prices[billingPeriod];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">升级您的学习体验</h1>
                    <p className="text-xl text-gray-600 mb-8">获取AI驱动的商务汉语学习无限访问权限</p>

                    {/* Billing Period Toggle */}
                    <div className="inline-flex items-center gap-4 bg-white p-2 rounded-full shadow-md border border-gray-200">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-full font-semibold transition-all ${billingPeriod === 'monthly'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            按月付费
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2 rounded-full font-semibold transition-all relative ${billingPeriod === 'yearly'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            按年付费
                            <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                                省17%
                            </span>
                        </button>
                    </div>
                </div>

                {status === 'success' && (
                    <div className="mb-12 bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl relative text-center max-w-4xl mx-auto">
                        <strong className="font-bold">支付成功！</strong>
                        <span className="block sm:inline">我们正在处理确认，您的计划将很快更新。</span>
                    </div>
                )}

                {status === 'cancel' && (
                    <div className="mb-12 bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded-xl relative text-center max-w-4xl mx-auto">
                        <strong className="font-bold">支付已取消。</strong>
                        <span className="block sm:inline">如有任何问题，请随时联系我们。</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">标准版</h3>
                            <div className="mt-4">
                                <span className="text-5xl font-extrabold text-gray-900">¥0</span>
                                <span className="text-gray-500 text-lg ml-2">/永久</span>
                            </div>
                            <p className="text-gray-600 mt-3">适合开始学习商务汉语的您</p>
                        </div>
                        <ul className="space-y-4 text-gray-700 mb-8 flex-grow">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                访问所有标准课程
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                AI智能单词复习(SRS)
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                3次试用课程分析
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                每天10次AI发音
                            </li>
                        </ul>
                        <button className="w-full py-4 bg-gray-100 text-gray-800 font-bold rounded-xl border-2 border-gray-300 text-lg" disabled>
                            免费开始
                        </button>
                    </div>

                    {/* Pro Plan - BEST VALUE */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-3xl shadow-2xl border-2 border-emerald-400 relative flex flex-col transform lg:scale-105">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                            最超值
                        </div>
                        {plan === 'pro' && (
                            <div className="absolute inset-0 bg-emerald-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                                <div className="bg-white px-8 py-3 rounded-full font-bold text-emerald-900 shadow-xl text-lg">
                                    ✓ 当前计划
                                </div>
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-3xl font-bold text-white mb-3">Pro 专业版</h3>
                            <div className="flex items-baseline gap-2 text-white">
                                <span className="text-6xl font-extrabold">¥{currentPrices.pro}</span>
                                <span className="text-emerald-100 text-xl">/{billingPeriod === 'monthly' ? '月' : '年'}</span>
                            </div>
                            {billingPeriod === 'yearly' && (
                                <p className="text-emerald-200 text-sm mt-2">相当于 ¥{Math.round(currentPrices.pro / 12)}/月</p>
                            )}
                            <p className="text-emerald-50 mt-3 text-base">适合需要快速取得实际成果的专业人士</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow text-white">
                            {[
                                '无限AI文本分析',
                                '无限AI发音指导',
                                '完整场景化课程库',
                                '个性化学习报告',
                                '优先客户支持'
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-base">
                                    <svg className="w-6 h-6 text-emerald-200 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {plan === 'pro' ? (
                            <button className="w-full py-4 bg-emerald-800 text-white font-bold rounded-xl cursor-not-allowed opacity-80 text-lg" disabled>
                                已订阅
                            </button>
                        ) : (
                            <button className="w-full py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-lg">
                                立即订阅
                            </button>
                        )}
                    </div>

                    {/* Max Plan - PREMIUM */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border-2 border-purple-500 relative flex flex-col">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                            顶配版
                        </div>
                        {plan === 'max' && (
                            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                                <div className="bg-white px-8 py-3 rounded-full font-bold text-slate-900 shadow-xl text-lg">
                                    ✓ 当前计划
                                </div>
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-3xl font-bold text-white mb-3">Max 极致版</h3>
                            <div className="flex items-baseline gap-2 text-white">
                                <span className="text-6xl font-extrabold">¥{currentPrices.max}</span>
                                <span className="text-purple-200 text-xl">/{billingPeriod === 'monthly' ? '月' : '年'}</span>
                            </div>
                            {billingPeriod === 'yearly' && (
                                <p className="text-purple-200 text-sm mt-2">相当于 ¥{Math.round(currentPrices.max / 12)}/月</p>
                            )}
                            <p className="text-slate-300 mt-3 text-base">适合追求极致学习体验的专业人士</p>
                        </div>
                        <p className="text-purple-300 text-sm font-semibold mb-4 uppercase tracking-wide">包含Pro所有功能，另加：</p>
                        <ul className="space-y-4 mb-8 flex-grow text-white">
                            {[
                                '1对1辅导课程(每月2次)',
                                '定制商务场景',
                                '高级分析仪表板',
                                '个性化学习路径',
                                '专属成功经理',
                                '优先功能请求'
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-base">
                                    <svg className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {plan === 'max' ? (
                            <button className="w-full py-4 bg-slate-700 text-white font-bold rounded-xl cursor-not-allowed opacity-80 text-lg" disabled>
                                已订阅
                            </button>
                        ) : (
                            <button className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg">
                                立即订阅
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-20 bg-white p-10 rounded-3xl border border-gray-100 shadow-lg text-center max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h3>
                    <div className="text-left space-y-6 mt-8">
                        <div>
                            <p className="font-bold text-gray-800 text-lg">我可以随时取消吗？</p>
                            <p className="text-gray-600 mt-2">是的，您可以随时从个人资料页面取消订阅。</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-lg">我可以分析哪些文档？</p>
                            <p className="text-gray-600 mt-2">您可以粘贴任何中文文本（电子邮件、合同、聊天记录）。Pro用户对字符数和频率没有限制。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
