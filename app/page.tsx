export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase';
import ReviewCard from './components/ReviewCard';
import CreateCourseCard from '@/components/CreateCourseCard';
import ReviewCount from './components/ReviewCount';

// Get login status (lightweight, returns fast)
async function getLoginStatus() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
}

export default async function Home() {
  // Get login status only, don't block page rendering
  const isLoggedIn = await getLoginStatus();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center px-4 py-16 md:py-24 bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Learn Business Chinese{' '}
              <span className="text-teal-500">That Actually Works</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Master Chinese for meetings, emails, and negotiations. Upload your work materials — AI creates personalized courses just for you.
            </p>

            {/* Logged in users: show review reminder and create course card */}
            {isLoggedIn && (
              <div className="flex flex-col gap-6">
                <Suspense fallback={null}>
                  <ReviewCard />
                </Suspense>
                <Suspense fallback={null}>
                  <CreateCourseCard />
                </Suspense>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href={isLoggedIn ? "/courses" : "/login"}
                className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
              >
                {isLoggedIn ? "Continue Learning" : "Start Free →"}
              </Link>
              <a
                href="#features"
                className="inline-block bg-white border-2 border-gray-300 hover:border-teal-500 text-gray-700 font-semibold px-8 py-4 rounded-lg transition-all hover:scale-105 text-center"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl transform rotate-3 opacity-20"></div>
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop"
                alt="Business professional learning Chinese for work meetings"
                width={800}
                height={600}
                className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Professionals Choose BizChinese
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Three powerful features designed for busy professionals who need results
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Real Workplace Vocabulary */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Real Workplace Vocabulary</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn words from actual emails, contracts, and meeting notes — not textbook Chinese that nobody uses.
              </p>
            </div>

            {/* Feature 2: AI-Powered Personalization */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Personalization</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your work documents — our AI extracts vocabulary and creates personalized courses instantly.
              </p>
            </div>

            {/* Feature 3: Track Your Progress */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Track Your Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Smart spaced repetition ensures you never forget. See your improvement with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Business Chinese Courses
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Learn Chinese for the real workplace — courses designed for professionals
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Courses */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Ready-Made Courses</h3>
              <p className="text-lg text-gray-600 mb-4">Expert-curated vocabulary for common business scenarios</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Meetings</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Email</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Negotiation</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">Daily Office</span>
              </div>
              <Link
                href="/courses"
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Browse Courses →
              </Link>
            </div>

            {/* Create Your Course */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Create Your Own Course</h3>
              <p className="text-lg text-gray-600 mb-4">Upload your work documents — AI generates personalized courses</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">📧 Emails</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">📄 Contracts</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">📊 Reports</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">💬 Chats</span>
              </div>
              <Link
                href="/create-course"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Create Course →
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            ✓ All courses designed by Chinese language experts
          </p>
        </div>
      </section>

      {/* How It Works Section */}
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
              <div className="w-20 h-20 bg-teal-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Choose or Create</h3>
              <p className="text-gray-600">
                Pick a ready-made business course or upload your own documents to create a custom course.
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

      {/* Testimonials Section */}
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
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg mr-4 flex-shrink-0">
                  JM
                </div>
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
            <div className="bg-teal-50 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-lg mr-4 flex-shrink-0">
                  SK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Kim</p>
                  <p className="text-sm text-gray-600">Marketing Director</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                &ldquo;I uploaded a Chinese contract and within minutes had a custom course! Now I can understand what I&apos;m signing.&rdquo;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-purple-50 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-lg mr-4 flex-shrink-0">
                  DC
                </div>
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

      {/* Methodology Section - SEO & Authority Building */}
      <section id="methodology" className="py-20 bg-emerald-900 text-emerald-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-300 font-semibold tracking-wider uppercase text-sm mb-2 block">
              The Science Behind Learning
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Traditional Flashcards Fail
            </h2>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Our approach combines cognitive science (Spaced Repetition) with business context to ensure long-term retention.
            </p>
          </div>

          <div className="space-y-12">
            {/* Concept 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-emerald-800 p-4 rounded-xl flex-shrink-0">
                <span className="text-3xl">🧠</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Contextual Encoding</h3>
                <p className="text-emerald-200 leading-relaxed">
                  Words memorized in isolation are forgotten quickly. BizChinese embeds every business term into
                  <strong className="text-white"> real-world sentences</strong>. When you learn the word "negotiation" (谈判),
                  you don't just see the definition; you see it used in a contract dispute scenario. This "contextual hook" doubles
                  memory retention rates compared to rote memorization.
                </p>
              </div>
            </div>

            {/* Concept 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-emerald-800 p-4 rounded-xl flex-shrink-0">
                <span className="text-3xl">📉</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">The Forgetting Curve</h3>
                <p className="text-emerald-200 leading-relaxed">
                  According to Ebbinghaus's Forgetting Curve, you forget 70% of new information within 24 hours.
                  Our <strong>AI Algorithm</strong> tracks exactly when you are about to forget a word and schedules a review
                  at that precise moment. This efficiency means you spend less time reviewing easy words and more time
                  mastering difficult ones (like those tricky Chengyu idioms).
                </p>
              </div>
            </div>

            {/* Concept 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-emerald-800 p-4 rounded-xl flex-shrink-0">
                <span className="text-3xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Active Recall for Business</h3>
                <p className="text-emerald-200 leading-relaxed">
                  Passive reading isn't enough. Our system forces <strong className="text-white">Active Recall</strong> —
                  you must produce the answer before seeing it. Combined with real workplace vocabulary from emails,
                  contracts, and meetings, this creates the robust neural pathways needed for
                  handling high-stakes business situations in China.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Common Questions
          </h2>
          <p className="text-center text-gray-600 mb-16">
            About Business Chinese & Our Platform
          </p>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                How is this different from Duolingo or Anki?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Unlike general apps (Duolingo), BizChinese is built <strong>specifically for professionals</strong>.
                We focus on high-value business vocabulary for real workplace scenarios, not "the apple is red".
                Unlike Anki, you don't need to build decks — our AI curators have already selected the 8,000 most important words
                and example sentences for you.
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Can I create courses from my own documents?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes! Our <strong>Create Your Course</strong> feature lets you upload any Chinese text —
                emails, contracts, meeting notes, or chat logs. Our AI extracts vocabulary, matches it with our dictionary,
                and generates a personalized course just for you.
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Can I start if I am a complete beginner?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Absolutely. We recommend starting with the <strong>Office Daily</strong> or <strong>Business Socializing</strong> courses.
                They introduce essential workplace phrases with pinyin and audio. The interface builds confidence before moving into complex scenarios like negotiations.
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                Is it free to use forever?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes! The core learning features — accessing standard courses and using the Spaced Repetition review system —
                are <strong>free forever</strong>. We believe access to language education should be open.
                In the future, we may introduce premium features for advanced analytics or 1-on-1 tutoring,
                but your daily study routine will always be free.
              </p>
            </details>

            {/* FAQ Item 5 */}
            <details className="bg-white p-6 rounded-xl shadow-md group">
              <summary className="font-semibold text-lg cursor-pointer text-gray-900 flex justify-between items-center">
                How does "Create Your Course" work?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Paste any Chinese text (email, contract, meeting notes) and our AI analyzes it.
                We extract unique vocabulary, match it with our dictionary for pinyin and translations,
                filter out words you've already mastered, and create a <strong>custom course</strong>
                with just the new words you need to learn.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {isLoggedIn ? (
            <>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Continue Your Learning Journey
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Keep building your vocabulary and master Chinese step by step.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Suspense fallback={
                  <div className="inline-block bg-white bg-opacity-20 animate-pulse text-white font-bold px-10 py-4 rounded-lg">
                    Loading...
                  </div>
                }>
                  <ReviewCount />
                </Suspense>
                <Link
                  href="/profile"
                  className="inline-block bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 font-bold px-10 py-4 rounded-lg transition-all hover:scale-105"
                >
                  View Profile
                </Link>
              </div>

              <p className="mt-6 text-sm opacity-75">
                ✓ Track your progress  ✓ Review anytime  ✓ Learn at your pace
              </p>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">BizChinese</h3>
              <p className="text-gray-400 leading-relaxed">
                The smartest way for professionals to master Business Chinese.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <nav className="space-y-2">
                <a href="#hero" className="block hover:text-white transition-colors">Home</a>
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#courses" className="block hover:text-white transition-colors">Courses</a>
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
                {isLoggedIn ? (
                  <Link href="/profile" className="block hover:text-white transition-colors">
                    My Profile
                  </Link>
                ) : (
                  <Link href="/login" className="block hover:text-white transition-colors">
                    Login / Sign Up
                  </Link>
                )}
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
