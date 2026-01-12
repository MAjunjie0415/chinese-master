import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/drizzle';
import { courses, userCourses } from '@/db/schema/courses';
import { eq, and } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PracticeModeSelectionPage({ params }: PageProps) {
  const { slug } = await params;

  // 获取用户登录状态
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?redirect=/courses/${slug}/practice`);
  }

  const userId = session.user.id;

  // 第一步：查询课程信息（必须首先获取，因为后续查询需要 course.id）
  const courseResults = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      category: courses.category,
    })
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!courseResults || courseResults.length === 0) {
    notFound();
  }

  const course = courseResults[0];

  // 第二步：检查用户是否已添加课程（并行查询优化空间有限，但保持代码一致性）
  const enrollmentResults = await db
    .select({
      id: userCourses.id,
      courseId: userCourses.course_id,
    })
    .from(userCourses)
    .where(
      and(
        eq(userCourses.user_id, userId),
        eq(userCourses.course_id, course.id)
      )
    )
    .limit(1);

  if (!enrollmentResults || enrollmentResults.length === 0) {
    redirect(`/courses/${slug}`);
  }

  // 练习模式配置
  const practiceModes = [
    {
      id: 'picture-match',
      name: 'Picture Match',
      description: 'Learn words through images. Perfect for beginners!',
      difficulty: '⭐ Beginner',
      icon: '🖼️',
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700',
      href: `/courses/${slug}/practice/picture-match`,
      features: [
        'Visual learning with images',
        'Multiple choice questions',
        'Instant feedback',
        'Audio pronunciation',
      ],
    },
    {
      id: 'tone-practice',
      name: 'Tone Training',
      description: 'Master Chinese tones through listening. Essential for all levels!',
      difficulty: '⭐⭐ Essential',
      icon: '🔊',
      color: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      textColor: 'text-emerald-700',
      href: `/courses/${slug}/practice/tone-practice`,
      features: [
        'Tone discrimination training',
        'Visual tone curves',
        'Repeated listening',
        'Compare different tones',
      ],
    },
    {
      id: 'translation',
      name: 'Translation',
      description: 'Practice translating between Chinese and English in both directions.',
      difficulty: '⭐⭐⭐ Intermediate',
      icon: '🔀',
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-700',
      href: `/courses/${slug}/practice/translation`,
      features: [
        'Both-way translation',
        'Hanyu/Pinyin recognition',
        'Multiple choice challenges',
        'Instant audio feedback',
      ],
    },
    {
      id: 'dictation',
      name: 'Dictation',
      description: 'Choose the correct characters after listening to the audio.',
      difficulty: '⭐⭐⭐⭐ Advanced',
      icon: '✍️',
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700',
      href: `/courses/${slug}/practice/dictation`,
      features: [
        'Pure listening challenge',
        'Character recognition',
        'Audio-to-Hanzi mapping',
        'Optional hints for meaning',
      ],
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Course
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Practice Mode
          </h1>
          <p className="text-gray-600">
            Select a practice mode for <span className="font-semibold">{course.title}</span>
          </p>
        </div>

        {/* 练习模式卡片 */}
        <div className="grid gap-6 md:grid-cols-2">
          {practiceModes.map((mode) => (
            <Link
              key={mode.id}
              href={mode.href}
              className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-300 group"
            >
              <div className={`p-6 bg-gradient-to-br ${mode.color}`}>
                {/* 图标和难度 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-6xl">{mode.icon}</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white ${mode.textColor}`}>
                    {mode.difficulty}
                  </span>
                </div>

                {/* 标题和描述 */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {mode.name}
                </h3>
                <p className="text-gray-700 mb-4">
                  {mode.description}
                </p>

                {/* 特性列表 */}
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-green-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 开始按钮 */}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    ~5 minutes
                  </span>
                  <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Start Practice
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 提示信息 */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Learning Tip
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong>New to Chinese?</strong> Start with <strong>Picture Match</strong> to build vocabulary through visual learning.
                <br />
                <strong>Struggling with tones?</strong> <strong>Tone Training</strong> will help you distinguish the 4 tones through repeated listening.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

