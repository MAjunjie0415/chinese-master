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
      {/* Hero Section - Clean & Friendly */}
      <section id="hero" className="min-h-screen flex items-center px-4 py-20 md:py-24 bg-gradient-to-br from-white via-emerald-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI-Powered Business Chinese
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Master Business Chinese
              <br />
              <span className="text-emerald-600">That Actually Works</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Upload your work materials — AI creates personalized courses from your emails, contracts, and meeting notes. Learn Chinese that matters for your career.
            </p>

            {/* Logged in users: show cards */}
            {isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
                <Suspense fallback={null}>
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex-1">
                    <ReviewCard />
                  </div>
                </Suspense>
                <Suspense fallback={null}>
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex-1">
                    <CreateCourseCard />
                  </div>
                </Suspense>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href={isLoggedIn ? "/courses" : "/login"}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg shadow-lg shadow-emerald-200 transition-all hover:scale-105"
              >
                {isLoggedIn ? "Continue Learning →" : "Start Free →"}
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-gray-500 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free forever
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                8,000+ words
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-powered
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Light Theme */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-medium text-sm tracking-widest uppercase mb-4">
              Why Choose Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Built for <span className="text-emerald-600">Professionals</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Three powerful features designed for busy professionals who need real results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Real Workplace Vocabulary */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Real Workplace Vocabulary</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn words from actual emails, contracts, and meeting notes — not textbook Chinese that nobody uses.
              </p>
            </div>

            {/* Feature 2: AI-Powered Personalization */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">AI-Powered Personalization</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your work documents — our AI extracts vocabulary and creates personalized courses instantly.
              </p>
            </div>

            {/* Feature 3: Track Your Progress */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Track Your Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Smart spaced repetition ensures you never forget. See your improvement with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section - Light Theme */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-medium text-sm tracking-widest uppercase mb-4">
              Start Learning
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Choose Your <span className="text-emerald-600">Path</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Learn Chinese for the real workplace — courses designed for professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Courses */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Ready-Made Courses</h3>
              <p className="text-lg text-gray-600 mb-6">Expert-curated vocabulary for common business scenarios</p>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Meetings</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Email</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Negotiation</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Daily Office</span>
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
              >
                Browse Courses →
              </Link>
            </div>

            {/* Create Your Course */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Create Your Own Course</h3>
              <p className="text-lg text-gray-600 mb-6">Upload your work documents — AI generates personalized courses</p>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Emails</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Contracts</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Reports</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">Chats</span>
              </div>
              <Link
                href="/create-course"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                Create Course →
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-12 text-sm flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            All courses designed by Chinese language experts
          </p>
        </div>
      </section>

      {/* How It Works Section - Light Theme */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-medium text-sm tracking-widest uppercase mb-4">
              Getting Started
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              3 Steps to <span className="text-emerald-600">Success</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Simple process, powerful results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account with email — takes only 30 seconds, no credit card required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Choose or Create</h3>
              <p className="text-gray-600">
                Pick a ready-made business course or upload your own documents to create a custom course.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Learn & Review</h3>
              <p className="text-gray-600">
                Study new words daily and review with AI-powered spaced repetition system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Light Theme */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-medium text-sm tracking-widest uppercase mb-4">
              Success Stories
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What <span className="text-emerald-600">Users</span> Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Real feedback from learners around the world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-lg mr-4 flex-shrink-0">
                  JM
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John Miller</p>
                  <p className="text-sm text-gray-500">CEO, Tech Startup</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                &ldquo;As a foreign trader, the negotiation vocabulary helped me close 2 deals in 1 month! The scenario-based approach is brilliant.&rdquo;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold text-lg mr-4 flex-shrink-0">
                  SK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Kim</p>
                  <p className="text-sm text-gray-500">Marketing Director</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                &ldquo;I uploaded a Chinese contract and within minutes had a custom course! Now I can understand what I&apos;m signing.&rdquo;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-lg mr-4 flex-shrink-0">
                  DC
                </div>
                <div>
                  <p className="font-semibold text-gray-900">David Chen</p>
                  <p className="text-sm text-gray-500">Business Manager</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                &ldquo;Finally, a tool that understands business context! The examples are practical and relevant to my daily work.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section - SEO & Authority Building */}
      <section id="methodology" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
              The Science Behind Learning
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Traditional Flashcards Fail
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our approach combines cognitive science (Spaced Repetition) with business context to ensure long-term retention.
            </p>
          </div>

          <div className="space-y-12">
            {/* Concept 1 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Contextual Encoding</h3>
                <p className="text-gray-600 leading-relaxed">
                  Words memorized in isolation are forgotten quickly. BizChinese embeds every business term into
                  <strong className="text-gray-900"> real-world sentences</strong>. When you learn the word "negotiation" (谈判),
                  you don't just see the definition; you see it used in a contract dispute scenario. This "contextual hook" doubles
                  memory retention rates compared to rote memorization.
                </p>
              </div>
            </div>

            {/* Concept 2 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Forgetting Curve</h3>
                <p className="text-gray-600 leading-relaxed">
                  According to Ebbinghaus's Forgetting Curve, you forget 70% of new information within 24 hours.
                  Our <strong>AI Algorithm</strong> tracks exactly when you are about to forget a word and schedules a review
                  at that precise moment. This efficiency means you spend less time reviewing easy words and more time
                  mastering difficult ones (like those tricky Chengyu idioms).
                </p>
              </div>
            </div>

            {/* Concept 3 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Active Recall for Business</h3>
                <p className="text-gray-600 leading-relaxed">
                  Passive reading isn't enough. Our system forces <strong className="text-gray-900">Active Recall</strong> —
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

      {/* CTA Section - Clean & Friendly */}
      <section id="cta" className="relative py-20 overflow-hidden bg-gray-50 border-y border-gray-100">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {isLoggedIn ? (
            <>
              <p className="text-emerald-600 font-medium text-sm tracking-widest uppercase mb-4">
                Welcome back
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
                Continue Your Learning Journey
              </h2>
              <p className="text-xl mb-10 text-gray-600 max-w-2xl mx-auto">
                Keep building your vocabulary and master Chinese step by step.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Suspense fallback={
                  <div className="inline-block bg-white animate-pulse text-gray-400 font-bold px-10 py-4 rounded-xl border border-gray-100">
                    Loading...
                  </div>
                }>
                  <ReviewCount />
                </Suspense>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center px-10 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-white transition-all shadow-sm"
                >
                  View Profile
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 mt-10 text-gray-500 text-sm">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Track progress
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Review anytime
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Learn at your pace
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-emerald-600 font-medium text-sm tracking-widest uppercase mb-4">
                Get Started
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 text-center">
                Start Learning Today — Free Forever
              </h2>
              <p className="text-xl mb-10 text-gray-600 max-w-2xl mx-auto">
                No credit card required. 8,000+ words waiting for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all hover:scale-105"
                >
                  Sign Up Free →
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-10 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-white transition-all shadow-sm"
                >
                  Learn More
                </a>
              </div>

              <div className="flex items-center justify-center gap-8 mt-10 text-gray-500 text-sm">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No commitment
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cancel anytime
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Full access
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer - Clean & Light */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-emerald-600 mb-6">BizChinese</h3>
              <p className="text-gray-600 leading-relaxed">
                The smartest way for professionals to master Business Chinese. Built for results.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
              <nav className="space-y-3">
                <a href="#hero" className="block text-gray-600 hover:text-emerald-600 transition-colors">Home</a>
                <a href="#features" className="block text-gray-600 hover:text-emerald-600 transition-colors">Features</a>
                <a href="#courses" className="block text-gray-600 hover:text-emerald-600 transition-colors">Courses</a>
                <a href="#how-it-works" className="block text-gray-600 hover:text-emerald-600 transition-colors">How It Works</a>
                <a href="#faq" className="block text-gray-600 hover:text-emerald-600 transition-colors">FAQ</a>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-6 uppercase tracking-wider text-sm">Legal & Info</h4>
              <nav className="space-y-3">
                <Link href="/privacy-policy" className="block text-gray-600 hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </Link>
                <a href="/sitemap.xml" className="block text-gray-600 hover:text-emerald-600 transition-colors">
                  Sitemap
                </a>
                {isLoggedIn ? (
                  <Link href="/profile" className="block text-gray-600 hover:text-emerald-600 transition-colors">
                    My Profile
                  </Link>
                ) : (
                  <Link href="/login" className="block text-gray-600 hover:text-emerald-600 transition-colors">
                    Login / Sign Up
                  </Link>
                )}
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>© 2026 BizChinese. All rights reserved.</p>
            <p>Master Business Chinese for your career success.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
