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
        title: 'Perfect Score! 🏆',
        message: 'Outstanding! You got every question right! You\'re a natural at this!',
        emoji: '🎉',
        color: 'from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-400',
      };
    } else if (accuracy >= 80) {
      return {
        title: 'Excellent Work! ⭐',
        message: 'Great job! You\'re making fantastic progress. Keep it up!',
        emoji: '🌟',
        color: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-400',
      };
    } else if (accuracy >= 60) {
      return {
        title: 'Good Effort! 💪',
        message: 'You\'re on the right track! Practice makes perfect. Try again to improve!',
        emoji: '👍',
        color: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-400',
      };
    } else {
      return {
        title: 'Keep Going! 🌱',
        message: 'Don\'t give up! Every practice session makes you stronger. You can do this!',
        emoji: '💚',
        color: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-400',
      };
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
          <div className="text-8xl mb-4">{encouragement.emoji}</div>
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📚</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Words Added to Review Plan
              </h4>
              <p className="text-sm text-gray-700">
                Great! {totalCount} word{totalCount !== 1 ? 's' : ''} from this practice session {totalCount !== 1 ? 'have' : 'has'} been added to your review plan. 
                Review them regularly to master these words!
              </p>
            </div>
          </div>
        </div>

        {/* 额外提示 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🎯</div>
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

