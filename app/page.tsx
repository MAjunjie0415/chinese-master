import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/user_progress';
import { eq, and, lt, sql, count } from 'drizzle-orm';

export default async function Home() {
  // 获取用户登录状态和复习数据
  let reviewCount = 0;
  let isLoggedIn = false;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      isLoggedIn = true;
      const userId = session.user.id;

      const todayEnd = sql`now()::date + interval '1 day' - interval '1 second'`;
      const result = await db
        .select({ count: count() })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.user_id, userId),
            lt(userProgress.next_review, todayEnd),
            eq(userProgress.mastered, false)
          )
        );

      reviewCount = result[0]?.count || 0;
    }
  } catch (error) {
    console.error('Error fetching review count:', error);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 首屏 */}
      <section id="hero" className="min-h-screen flex items-center px-4 py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Business Chinese + HSK{' '}
              <span className="text-emerald-500">Learning Tool</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Master vocabulary, track progress, and review with AI — designed for professionals & exam takers.
            </p>
            
            {/* 已登录用户：显示复习提醒 */}
            {isLoggedIn && reviewCount > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4 animate-pulse">
                <p className="text-orange-700 font-semibold mb-2">
                  🔥 {reviewCount} {reviewCount === 1 ? 'word' : 'words'} waiting for review!
                </p>
                <Link
                  href="/review"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg transition-all"
                >
                  Review Now →
                </Link>
              </div>
            )}

            {/* CTA按钮 */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href={isLoggedIn ? "/wordbanks" : "/login"}
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
              >
                {isLoggedIn ? "Continue Learning" : "Start Learning Free"} →
              </Link>
              <a
                href="#features"
                className="inline-block bg-white border-2 border-gray-300 hover:border-emerald-500 text-gray-700 font-semibold px-8 py-4 rounded-lg transition-all hover:scale-105 text-center"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-2xl transform rotate-3 opacity-20"></div>
        <Image
                src="https://images.unsplash.com/photo-1513001900722-370f803f498d?w=800&h=600&fit=crop"
                alt="Foreign professionals learning Chinese with our tool"
                width={800}
                height={600}
                className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - 核心功能 */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Our Tool Stands Out
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Three powerful features designed specifically for foreign learners
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Business Scenarios */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Business Scenarios</h3>
              <p className="text-gray-600 leading-relaxed">
                Negotiation, meetings, emails — vocabulary sorted by real work scenes to help you communicate confidently.
              </p>
            </div>

            {/* Feature 2: HSK Leveled */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">HSK Leveled Practice</h3>
              <p className="text-gray-600 leading-relaxed">
                From HSK 1 to 6, focus on high-frequency words with exam-oriented examples to pass your test.
              </p>
            </div>

            {/* Feature 3: AI-Powered Review */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Review</h3>
              <p className="text-gray-600 leading-relaxed">
                Spaced repetition based on your memory curve — never forget what you learn, scientifically proven.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Word Banks Section - 词库展示 */}
      <section id="wordbanks" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Trusted Word Banks
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Comprehensive vocabulary verified by Chinese language teachers
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Word Bank */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Business Chinese</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">5,000+ terms</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Negotiation</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Contract</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Presentation</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Email</span>
              </div>
              <Link
                href="/wordbanks/business"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Start Learning →
              </Link>
            </div>

            {/* HSK Word Bank */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">HSK Levels</h3>
              <p className="text-3xl font-bold text-emerald-600 mb-4">3,000+ words</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">HSK 1</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">HSK 2</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">HSK 3</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">HSK 4</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">HSK 5</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">HSK 6</span>
              </div>
              <Link
                href="/wordbanks"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Choose Level →
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            ✓ All words verified by Chinese language teachers
          </p>
        </div>
      </section>

      {/* How It Works Section - 使用流程 */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            3 Steps to Start Learning
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Simple process, powerful results
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account with email — takes only 30 seconds, no credit card required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Choose Word Bank</h3>
              <p className="text-gray-600">
                Select Business Chinese or your HSK level — personalized to your goals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Learn & Review</h3>
              <p className="text-gray-600">
                Study new words daily and review with AI-powered spaced repetition system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - 用户评价 */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            What Users Say
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Real feedback from learners around the world
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-blue-50 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  src="https://i.pravatar.cc/100?img=12"
                  alt="John"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">John Miller</p>
                  <p className="text-sm text-gray-600">CEO, Tech Startup</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                &ldquo;As a foreign trader, the negotiation vocabulary helped me close 2 deals in 1 month! The scenario-based approach is brilliant.&rdquo;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-emerald-50 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  src="https://i.pravatar.cc/100?img=45"
                  alt="Maria"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Maria Rodriguez</p>
                  <p className="text-sm text-gray-600">University Student</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                &ldquo;HSK 4 exam passed! The spaced review made memorizing words so easy. I studied 30 minutes daily for 2 months.&rdquo;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-purple-50 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  src="https://i.pravatar.cc/100?img=33"
                  alt="David"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">David Chen</p>
                  <p className="text-sm text-gray-600">Business Manager</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                &ldquo;Finally, a tool that understands business context! The examples are practical and relevant to my daily work.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Everything you need to know
          </p>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Is it free to use?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes! Basic features are completely free forever, including access to all word banks and spaced repetition. Premium features will be available in the future.
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Which devices are supported?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Works on phones, tablets, and computers. Your progress syncs automatically across all devices.
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Does pinyin include tones?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Absolutely! All pinyin includes accurate tone marks, and we provide AI-generated standard pronunciation for every word.
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Will word banks be updated?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes! We add new business terms monthly and continuously improve HSK vocabulary based on the latest exam requirements.
              </p>
            </details>

            {/* FAQ Item 5 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Is my data secure?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Your privacy is our priority. All data is encrypted and stored securely. Read our{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>{' '}
                for details.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section - 最终行动召唤 */}
      <section id="cta" className="py-20 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Start Learning Today — Free Forever
          </h2>
          <p className="text-xl mb-8 opacity-90">
            No credit card required. 8,000+ words waiting for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Sign Up Free →
            </Link>
            <a
              href="#features"
              className="inline-block bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 font-bold px-10 py-4 rounded-lg transition-all hover:scale-105"
            >
              Learn More
            </a>
          </div>

          <p className="mt-6 text-sm opacity-75">
            ✓ No commitment  ✓ Cancel anytime  ✓ Full access
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">ChineseMaster</h3>
              <p className="text-gray-400 leading-relaxed">
                The smartest way for foreigners to learn Business Chinese and pass HSK exams.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <nav className="space-y-2">
                <a href="#hero" className="block hover:text-white transition-colors">Home</a>
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#wordbanks" className="block hover:text-white transition-colors">Word Banks</a>
                <a href="#how-it-works" className="block hover:text-white transition-colors">How It Works</a>
                <a href="#faq" className="block hover:text-white transition-colors">FAQ</a>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal & Info</h4>
              <nav className="space-y-2">
                <Link href="/privacy-policy" className="block hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <a href="/sitemap.xml" className="block hover:text-white transition-colors">
                  Sitemap
                </a>
                <Link href="/login" className="block hover:text-white transition-colors">
                  Login / Sign Up
                </Link>
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2025 ChineseMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
