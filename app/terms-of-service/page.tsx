import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service | BizChinese',
    description: 'Terms of service for BizChinese - Our rules and your rights.',
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>

                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Terms of Service</h1>
                    <p className="text-gray-600">
                        Last updated: <strong>January 16, 2026</strong>
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-emerald-500 pb-2">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            By accessing or using BizChinese, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-cyan-500 pb-2">
                            2. Description of Service
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            BizChinese is an AI-powered platform designed to help professionals learn Business Chinese through personalized courses and spaced repetition.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-purple-500 pb-2">
                            3. User Accounts
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-amber-500 pb-2">
                            4. Subscriptions and Payments
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            We offer free and paid subscription plans. Payments are processed through Creem. Subscriptions may be cancelled at any time through your account settings. No refunds will be provided for partially used subscription periods unless required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-blue-500 pb-2">
                            5. Content and Intellectual Property
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            The content provided by BizChinese, including lesson materials and software, is the property of BizChinese and protected by intellectual property laws. Users may not copy, distribute, or create derivative works without express permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-red-500 pb-2">
                            6. Limitation of Liability
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            BizChinese is provided "as is" without warranty of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-gray-500 pb-2">
                            7. Contact Information
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            If you have any questions about these Terms, please contact us at: <strong>support@bizchinese.cc</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
