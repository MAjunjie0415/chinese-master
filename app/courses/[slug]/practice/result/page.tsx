import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { courses } from '@/db/schema/courses';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    mode?: string;
    correct?: string;
    total?: string;
    duration?: string;
  }>;
}

export default async function PracticeResultPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { mode, correct, total, duration } = await searchParams;

  // 获取用户登录状态
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?redirect=/courses/${slug}`);
  }

  // 查询课程信息
  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
    })
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!course) {
    notFound();
  }

  // 解析参数
  const correctCount = parseInt(correct || '0', 10);
  const totalCount = parseInt(total || '1', 10);
  const durationSeconds = parseInt(duration || '0', 10);
  const accuracy = Math.round((correctCount / totalCount) * 100);

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 根据成绩生成鼓励语
  const getEncouragementMessage = (accuracy: number) => {
    if (accuracy === 100) {
      return {
        title: 'Perfect Score!',
        message: 'Outstanding! You got every question right! You\'re a natural at this!',
        iconType: 'trophy' as const,
        color: 'from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-400',
        iconColor: 'text-yellow-500',
      };
    } else if (accuracy >= 80) {
      return {
        title: 'Excellent Work!',
        message: 'Great job! You\'re making fantastic progress. Keep it up!',
        iconType: 'star' as const,
        color: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-400',
        iconColor: 'text-green-500',
      };
    } else if (accuracy >= 60) {
      return {
        title: 'Good Effort!',
        message: 'You\'re on the right track! Practice makes perfect. Try again to improve!',
        iconType: 'thumbsup' as const,
        color: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-400',
        iconColor: 'text-blue-500',
      };
    } else {
      return {
        title: 'Keep Going!',
        message: 'Don\'t give up! Every practice session makes you stronger. You can do this!',
        iconType: 'heart' as const,
        color: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-400',
        iconColor: 'text-purple-500',
      };
    }
  };

  // Icon component for encouragement
  const EncouragementIcon = ({ type, className }: { type: 'trophy' | 'star' | 'thumbsup' | 'heart'; className?: string }) => {
    const iconClass = className || 'w-20 h-20';
    switch (type) {
      case 'trophy':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a4 4 0 01-7.66 0H6a2 2 0 110-4h1.17c.123-.39.315-.749.564-1.061A3 3 0 015 5zm4.5 2a.5.5 0 00-1 0v1.5H7a.5.5 0 000 1h1.5V11a.5.5 0 001 0V9.5H11a.5.5 0 000-1H9.5V7z" clipRule="evenodd" />
          </svg>
        );
      case 'star':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'thumbsup':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        );
      case 'heart':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const encouragement = getEncouragementMessage(accuracy);

  // 模式名称映射
  const modeNames: { [key: string]: string } = {
    'picture-match': 'Picture Match',
    'tone-practice': 'Tone Training',
  };

  const modeName = modeNames[mode || ''] || 'Practice';

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* 鼓励语卡片 */}
        <div className={`bg-gradient-to-br ${encouragement.color} border-4 ${encouragement.borderColor} rounded-2xl p-8 mb-6 text-center shadow-xl`}>
          <div className={`flex justify-center mb-4 ${encouragement.iconColor}`}>
            <EncouragementIcon type={encouragement.iconType} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {encouragement.title}
          </h1>
          <p className="text-lg text-gray-700">
            {encouragement.message}
          </p>
        </div>

        {/* 成绩卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Your Results
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 正确率 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {accuracy}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>

            {/* 答对题数 */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {correctCount}/{totalCount}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>

            {/* 用时 */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {formatDuration(durationSeconds)}
              </div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {correctCount} / {totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>

          {/* 模式信息 */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Mode: <span className="font-semibold text-gray-700">{modeName}</span></p>
            <p>Course: <span className="font-semibold text-gray-700">{course.title}</span></p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href={`/courses/${slug}/practice/${mode}`}
            className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-md"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Practice Again
            </div>
          </Link>

          <Link
            href={`/courses/${slug}`}
            className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors shadow-md"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Course
            </div>
          </Link>
        </div>

        {/* 复习计划提示 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Review Plan Created!
              </h4>
              <p className="text-sm text-gray-700">
                <strong>{totalCount} words</strong> from this practice have been added to your review plan.
                Review them regularly to strengthen your memory!
              </p>
              <Link
                href="/review"
                className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Go to Review →
              </Link>
            </div>
          </div>
        </div>

        {/* 额外提示 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Study Tips
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Daily practice:</strong> 10-15 minutes every day is better than cramming</li>
                <li>• <strong>Review mistakes:</strong> Focus on words you got wrong</li>
                <li>• <strong>Mix it up:</strong> Try different practice modes for better retention</li>
                <li>• <strong>Stay consistent:</strong> Regular practice builds muscle memory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

