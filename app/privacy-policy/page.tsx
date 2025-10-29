import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | ChineseMaster',
  description: 'Privacy policy for ChineseMaster - How we protect your data and respect your privacy.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600">
            Last updated: <strong>October 29, 2025</strong>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              At ChineseMaster, we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our Chinese learning platform.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-blue-500 pb-2">
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>We collect the following types of information:</p>
              
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Information:</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Email address (required for account creation and login)</li>
                  <li>Password (encrypted and never stored in plain text)</li>
                </ul>
              </div>

              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 mb-2">Learning Data:</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Words you've learned and reviewed</li>
                  <li>Learning progress and statistics</li>
                  <li>Review schedules and mastery status</li>
                  <li>Study session timestamps</li>
                </ul>
              </div>

              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 mb-2">Technical Information:</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Browser type and version</li>
                  <li>Device information (mobile, tablet, or desktop)</li>
                  <li>IP address (for security purposes)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-emerald-500 pb-2">
              2. How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use your information to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Provide personalized learning:</strong> Track your progress and customize your review schedule based on your learning patterns</li>
                <li><strong>Sync across devices:</strong> Ensure your data is accessible on all your devices</li>
                <li><strong>Improve our service:</strong> Analyze usage patterns to enhance features and user experience</li>
                <li><strong>Send important updates:</strong> Notify you about account activity, new features, or service changes (you can opt out anytime)</li>
                <li><strong>Maintain security:</strong> Detect and prevent fraudulent activities or unauthorized access</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-purple-500 pb-2">
              3. Data Protection & Security
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS</li>
                <li><strong>Secure storage:</strong> Your data is stored in secure, encrypted databases provided by Supabase</li>
                <li><strong>Password protection:</strong> Passwords are hashed and salted, never stored in plain text</li>
                <li><strong>Access controls:</strong> Strict internal access policies to protect your data from unauthorized access</li>
              </ul>
              <p className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <strong>Note:</strong> While we use best practices to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2">
              4. Third-Party Services
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use the following trusted third-party services:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Supabase:</strong> Database hosting and authentication services. 
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    View their privacy policy →
                  </a>
                </li>
                <li><strong>Vercel:</strong> Hosting and content delivery (if applicable)</li>
              </ul>
              <p className="mt-4">
                <strong>We do NOT:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Sell your personal information to third parties</li>
                <li>Share your learning data with advertisers</li>
                <li>Use your data for purposes other than providing our service</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-red-500 pb-2">
              5. Your Rights & Choices
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>You have the following rights regarding your data:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct your account information at any time</li>
                <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
                <li><strong>Data portability:</strong> Export your learning data in a standard format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from promotional emails (account-related emails may still be sent)</li>
              </ul>
              <p className="mt-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
                To exercise any of these rights, please contact us through your account settings or email us directly.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-gray-500 pb-2">
              6. Data Retention
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We retain your data as follows:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Active accounts:</strong> Data is retained as long as your account is active</li>
                <li><strong>Deleted accounts:</strong> Data is permanently deleted within 30 days of account deletion request</li>
                <li><strong>Backup data:</strong> May remain in backup systems for up to 90 days</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-blue-500 pb-2">
              7. Cookies & Tracking
            </h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use essential cookies to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Keep you logged in during your session</li>
                <li>Remember your preferences</li>
                <li>Ensure site functionality and security</li>
              </ul>
              <p className="mt-3">
                We do NOT use third-party advertising cookies or tracking pixels.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-purple-500 pb-2">
              8. Children's Privacy
            </h2>
            <div className="text-gray-700 leading-relaxed">
              <p>
                Our service is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-orange-500 pb-2">
              9. Changes to This Policy
            </h2>
            <div className="text-gray-700 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by:
              </p>
              <ul className="list-disc ml-6 mt-3 space-y-1">
                <li>Posting the new policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending an email notification (for major changes)</li>
              </ul>
              <p className="mt-3">
                Your continued use of our service after changes indicates your acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-emerald-500 pb-2">
              10. Contact Us
            </h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <p><strong>Email:</strong> privacy@chinesemaster.com</p>
                <p><strong>Response time:</strong> We aim to respond within 48 hours</p>
              </div>
            </div>
          </section>

          {/* Closing */}
          <section className="pt-6 border-t border-gray-200">
            <p className="text-gray-600 italic">
              By using ChineseMaster, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

