'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutButton } from './checkout-button';

interface UpgradePageClientProps {
    plan: {
        plan: string;
        interval: 'month' | 'year' | null;
    };
    status?: string;
}

export function UpgradePageClient({ plan, status }: UpgradePageClientProps) {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [refreshCount, setRefreshCount] = useState(0);
    const router = useRouter();

    // 当支付成功时，自动轮询刷新页面获取最新订阅状态
    useEffect(() => {
        // plan.plan is now used instead of plan
        if (status === 'success' && plan.plan === 'free' && refreshCount < 10) {
            const timer = setTimeout(() => {
                setRefreshCount(prev => prev + 1);
                router.refresh(); // 使用 Next.js router.refresh() 重新获取服务端数据
            }, 3000); // 每3秒刷新一次

            return () => clearTimeout(timer);
        }
    }, [status, plan.plan, refreshCount, router]);

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
        <div className="min-h-screen bg-parchment py-16 md:py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 header-serif">
                        Institutional Licensing
                    </h1>
                    <p className="text-xl text-muted mb-10 font-medium">
                        Advance your linguistic proficiency with professional-grade synthesis modules.
                    </p>

                    {/* Billing Period Toggle */}
                    <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-8 py-2.5 rounded font-bold transition-all text-xs uppercase tracking-widest ${billingPeriod === 'monthly'
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-8 py-2.5 rounded font-bold transition-all relative text-xs uppercase tracking-widest ${billingPeriod === 'yearly'
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Yearly
                            <span className="absolute -top-2 -right-4 bg-accent text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                                -17%
                            </span>
                        </button>
                    </div>
                </div>

                {status === 'success' && (
                    <div className="mb-12 bg-white border border-emerald-500 p-6 rounded relative text-center max-w-2xl mx-auto shadow-sm">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-lg font-bold text-slate-900 header-serif uppercase tracking-widest">Transaction Verified</strong>
                        </div>
                        <p className="text-muted text-sm font-medium">
                            {plan.plan === 'free'
                                ? `System synchronizing credentials... (Pulse ${refreshCount}/10)`
                                : 'Authorization protocols updated successfully.'
                            }
                        </p>
                    </div>
                )}

                {status === 'cancel' && (
                    <div className="mb-12 bg-white border border-slate-200 p-6 rounded relative text-center max-w-2xl mx-auto shadow-sm">
                        <strong className="block text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Process Aborted</strong>
                        <p className="text-muted text-sm font-medium">Session terminated without signature exchange.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Free Plan */}
                    <div className="paper-card p-10 border-slate-200 flex flex-col relative overflow-hidden">
                        <div className="mb-10">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tier 01</h3>
                            <h3 className="text-2xl font-bold text-slate-900 header-serif">Standard Research</h3>
                            <div className="mt-8 mb-4">
                                <span className="text-5xl font-bold text-slate-900 header-serif">$0</span>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-3">Freemium</span>
                            </div>
                            <p className="text-muted text-sm font-medium">Elementary access for academic evaluation.</p>
                        </div>
                        <ul className="space-y-5 text-slate-600 mb-10 flex-grow">
                            <li className="flex items-start gap-3 text-sm font-medium">
                                <svg className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                1 Standard curriculum module
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium">
                                <svg className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                AI-powered synthesis review
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium">
                                <svg className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                3 Trial custom syntheses
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium opacity-40">
                                <svg className="w-5 h-5 text-slate-200 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Offline access protocols
                            </li>
                        </ul>
                        <button className="w-full py-4 bg-slate-50 text-slate-300 font-bold rounded border border-slate-100 text-xs uppercase tracking-widest grayscale cursor-not-allowed" disabled>
                            Active Status
                        </button>
                    </div>

                    {/* Pro Plan - BEST VALUE */}
                    <div className="paper-card p-10 border-emerald-500 ring-1 ring-emerald-500 flex flex-col relative overflow-hidden transform lg:scale-105 z-10 bg-white">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-bl shadow-sm">
                            Advised Selection
                        </div>
                        <div className="mb-10">
                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Tier 02</h3>
                            <h3 className="text-2xl font-bold text-slate-900 header-serif">Individual Professional</h3>
                            <div className="mt-8 mb-4">
                                <span className="text-5xl font-bold text-slate-900 header-serif">${currentPrices.pro}</span>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-3">per {billingPeriod === 'monthly' ? 'cycle' : 'annum'}</span>
                            </div>
                            {billingPeriod === 'yearly' && (
                                <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2">Effective: ${Math.round(currentPrices.pro / 12)}/Mo</p>
                            )}
                            <p className="text-muted text-sm font-medium">For practitioners requiring authoritative fluency.</p>
                        </div>
                        <ul className="space-y-5 text-slate-600 mb-10 flex-grow">
                            {[
                                '10 Institutional modules',
                                'Unlimited Synthesis throughput',
                                'Unlimited Voice calibration',
                                'Full Technical lexicon access',
                                'Priority editorial support',
                                'Advanced performance metrics'
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {(plan.plan === 'pro' && (plan.interval === (billingPeriod === 'monthly' ? 'month' : 'year') || (!plan.interval && billingPeriod === 'monthly'))) ? (
                            <div className="flex flex-col gap-3">
                                <button className="w-full py-4 bg-slate-50 text-slate-300 font-bold rounded border border-slate-100 text-xs uppercase tracking-widest grayscale cursor-not-allowed" disabled>
                                    Subscribed
                                </button>
                            </div>
                        ) : (
                            <CheckoutButton planType="pro" billingPeriod={billingPeriod} />
                        )}
                    </div>

                    {/* Max Plan - PREMIUM */}
                    <div className="paper-card p-10 border-slate-800 flex flex-col relative overflow-hidden bg-slate-900 text-white shadow-xl lg:scale-105 z-10">
                        <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-bl shadow-sm">
                            Elite Access
                        </div>
                        <div className="mb-10">
                            <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Tier 03</h3>
                            <h3 className="text-2xl font-bold text-white header-serif">Institutional Master</h3>
                            <div className="mt-8 mb-4">
                                <span className="text-5xl font-bold text-white header-serif">${currentPrices.max}</span>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-3">per {billingPeriod === 'monthly' ? 'cycle' : 'annum'}</span>
                            </div>
                            {billingPeriod === 'yearly' && (
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Effective: ${Math.round(currentPrices.max / 12)}/Mo</p>
                            )}
                            <p className="text-slate-300 text-sm font-medium">Elite-level mastery for corporate leadership.</p>
                        </div>
                        <ul className="space-y-5 text-slate-300 mb-10 flex-grow">
                            {[
                                'Unlimited Curriculum library',
                                'Custom domain synthesis',
                                'Enterprise-grade analytics',
                                'Personalized career paths',
                                'Dedicated success liaison',
                                'Early protocol access'
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                                    <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {plan.plan === 'max' && plan.interval === (billingPeriod === 'monthly' ? 'month' : 'year') ? (
                            <div className="flex flex-col gap-3">
                                <button className="w-full py-4 bg-white/5 text-white/20 font-bold rounded border border-white/10 text-xs uppercase tracking-widest grayscale cursor-not-allowed" disabled>
                                    Authorized
                                </button>
                            </div>
                        ) : (
                            <CheckoutButton planType="max" billingPeriod={billingPeriod} />
                        )}
                    </div>
                </div>

                <div className="mt-24 paper-card p-12 border-slate-100 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-10 header-serif uppercase tracking-widest opacity-80 border-b border-slate-50 pb-6">
                        Operational Inquiries
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        <div>
                            <p className="font-bold text-slate-900 header-serif mb-3">Subscription Revocation</p>
                            <p className="text-muted text-sm font-medium leading-relaxed">Authorization can be terminated at any point via the institutional dashboard with immediate effect.</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 header-serif mb-3">Material Analysis Scope</p>
                            <p className="text-muted text-sm font-medium leading-relaxed">Our AI synthesis engine supports all standard business documentation including legal contracts and technical specifications.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
