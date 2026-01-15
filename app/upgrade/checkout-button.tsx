'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
    planType: 'pro' | 'max';
    billingPeriod: 'monthly' | 'yearly';
}

export function CheckoutButton({ planType, billingPeriod }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout/creem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ planType, billingPeriod })
            });

            const data = await response.json();

            if (response.ok && data.checkoutUrl) {
                // Redirect to Creem
                window.location.href = data.checkoutUrl;
            } else {
                const errorMsg = data.error || 'Failed to start checkout. Please try again later.';
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An unexpected error occurred. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                'Upgrade Now →'
            )}
        </button>
    );
}
