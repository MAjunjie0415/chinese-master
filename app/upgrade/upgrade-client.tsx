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
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Upgrade Your Learning Experience</h1>
                    <p className="text-xl text-gray-600 mb-8">Get unlimited access to AI-powered business Chinese learning</p>

                    {/* Billing Period Toggle */}
                    <div className="inline-flex items-center gap-4 bg-white p-2 rounded-full shadow-md border border-gray-200">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-full font-semibold transition-all ${billingPeriod === 'monthly'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2 rounded-full font-semibold transition-all relative ${billingPeriod === 'yearly'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Yearly
                            <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </div>

                {status === 'success' && (
                    <div className="mb-12 bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl relative text-center max-w-4xl mx-auto">
                        <strong className="font-bold">Payment successful!</strong>
                        <span className="block sm:inline">We're processing the confirmation, your plan will be updated shortly.</span>
                    </div>
                )}

                {status === 'cancel' && (
                    <div className="mb-12 bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded-xl relative text-center max-w-4xl mx-auto">
                        <strong className="font-bold">Payment canceled.</strong>
                        <span className="block sm:inline">Feel free to contact us if you have any questions.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Standard</h3>
                            <div className="mt-4">
                                <span className="text-5xl font-extrabold text-gray-900">$0</span>
                                <span className="text-gray-500 text-lg ml-2">/forever</span>
                            </div>
                            <p className="text-gray-600 mt-3">Perfect for getting started with business Chinese</p>
                        </div>
                        <ul className="space-y-4 text-gray-700 mb-8 flex-grow">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                1 standard course
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                AI-powered word review (SRS)
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                3 trial custom course analyses
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                10 AI pronunciations per day
                            </li>
                        </ul>
                        <button className="w-full py-4 bg-gray-100 text-gray-800 font-bold rounded-xl border-2 border-gray-300 text-lg" disabled>
                            Start Free
                        </button>
                    </div>

                    {/* Pro Plan - BEST VALUE */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-3xl shadow-2xl border-2 border-emerald-400 relative flex flex-col transform lg:scale-105">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                            Best Value
                        </div>
                        {plan === 'pro' && (
                            <div className="absolute inset-0 bg-emerald-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                                <div className="bg-white px-8 py-3 rounded-full font-bold text-emerald-900 shadow-xl text-lg">
                                    ✓ Current Plan
                                </div>
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-3xl font-bold text-white mb-3">Pro</h3>
                            <div className="flex items-baseline gap-2 text-white">
                                <span className="text-6xl font-extrabold">${currentPrices.pro}</span>
                                <span className="text-emerald-100 text-xl">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                            </div>
                            {billingPeriod === 'yearly' && (
                                <p className="text-emerald-200 text-sm mt-2">Equivalent to ${Math.round(currentPrices.pro / 12)}/month</p>
                            )}
                            <p className="text-emerald-50 mt-3 text-base">For professionals who need real results, fast</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow text-white">
                            {[
                                '10 standard courses',
                                'Unlimited AI text analysis',
                                'Unlimited AI pronunciations',
                                'Full scenario-based library',
                                'Personalized learning reports',
                                'Priority support'
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-base">
                                    <svg className="w-6 h-6 text-emerald-200 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {plan === 'pro' ? (
                            <button className="w-full py-4 bg-emerald-800 text-white font-bold rounded-xl cursor-not-allowed opacity-80 text-lg" disabled>
                                Subscribed
                            </button>
                        ) : (
                            <button className="w-full py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-lg">
                                Subscribe Now
                            </button>
                        )}
                    </div>

                    {/* Max Plan - PREMIUM */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border-2 border-purple-500 relative flex flex-col">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                            Premium
                        </div>
                        {plan === 'max' && (
                            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                                <div className="bg-white px-8 py-3 rounded-full font-bold text-slate-900 shadow-xl text-lg">
                                    ✓ Current Plan
                                </div>
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-3xl font-bold text-white mb-3">Max</h3>
                            <div className="flex items-baseline gap-2 text-white">
                                <span className="text-6xl font-extrabold">${currentPrices.max}</span>
                                <span className="text-purple-200 text-xl">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                            </div>
                            {billingPeriod === 'yearly' && (
                                <p className="text-purple-200 text-sm mt-2">Equivalent to ${Math.round(currentPrices.max / 12)}/month</p>
                            )}
                            <p className="text-slate-300 mt-3 text-base">For professionals seeking the ultimate learning experience</p>
                        </div>
                        <p className="text-purple-300 text-sm font-semibold mb-4 uppercase tracking-wide">Everything in Pro, plus:</p>
                        <ul className="space-y-4 mb-8 flex-grow text-white">
                            {[
                                'Unlimited standard courses',
                                'Custom business scenarios',
                                'Advanced analytics dashboard',
                                'Personalized learning paths',
                                'Dedicated success manager',
                                'Priority feature requests'
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-base">
                                    <svg className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {plan === 'max' ? (
                            <button className="w-full py-4 bg-slate-700 text-white font-bold rounded-xl cursor-not-allowed opacity-80 text-lg" disabled>
                                Subscribed
                            </button>
                        ) : (
                            <button className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg">
                                Subscribe Now
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-20 bg-white p-10 rounded-3xl border border-gray-100 shadow-lg text-center max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                    <div className="text-left space-y-6 mt-8">
                        <div>
                            <p className="font-bold text-gray-800 text-lg">Can I cancel anytime?</p>
                            <p className="text-gray-600 mt-2">Yes, you can cancel your subscription anytime from your profile page.</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-lg">What documents can I analyze?</p>
                            <p className="text-gray-600 mt-2">You can paste any Chinese text (emails, contracts, chat logs). Pro users have no limits on character count or frequency.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
