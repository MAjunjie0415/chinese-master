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
      name: 'Visual Synthesis',
      description: 'Acquire lexicon through high-fidelity visual association.',
      difficulty: 'Elementary',
      difficultyLevel: 1,
      iconType: 'image' as const,
      color: 'bg-primary/5',
      borderColor: 'border-primary/10',
      textColor: 'text-primary',
      href: `/courses/${slug}/practice/picture-match`,
      features: [
        'Visual cognitive mapping',
        'Iconographic recognition',
        'Direct semantic linking',
      ],
    },
    {
      id: 'tone-practice',
      name: 'Phonetic Calibration',
      description: 'Master tonal frequencies through precise acoustic analysis.',
      difficulty: 'Fundamental',
      difficultyLevel: 2,
      iconType: 'speaker' as const,
      color: 'bg-accent/5',
      borderColor: 'border-accent/10',
      textColor: 'text-accent',
      href: `/courses/${slug}/practice/tone-practice`,
      features: [
        'Frequency discrimination',
        'Prosodic curve analysis',
        'Acoustic comparison',
      ],
    },
    {
      id: 'translation',
      name: 'Bidirectional Translation',
      description: 'Synthesize meaning between complex linguistic structures.',
      difficulty: 'Professional',
      difficultyLevel: 3,
      iconType: 'translate' as const,
      color: 'bg-primary/5',
      borderColor: 'border-primary/10',
      textColor: 'text-primary',
      href: `/courses/${slug}/practice/translation`,
      features: [
        'Dynamic semantic exchange',
        'Applied Pinyin mapping',
        'Contextual logic flow',
      ],
    },
    {
      id: 'dictation',
      name: 'Lexical Transcription',
      description: 'Convert auditory input into precise character representation.',
      difficulty: 'Executive',
      difficultyLevel: 4,
      iconType: 'pencil' as const,
      color: 'bg-accent/5',
      borderColor: 'border-accent/10',
      textColor: 'text-accent',
      href: `/courses/${slug}/practice/dictation`,
      features: [
        'Auditory-to-Graph mapping',
        'Structural recall protocol',
        'High-stakes dictation',
      ],
    },
  ];

  // Icon component for practice modes
  const PracticeModeIcon = ({ type }: { type: 'image' | 'speaker' | 'translate' | 'pencil' }) => {
    const iconClass = "w-12 h-12";
    switch (type) {
      case 'image':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'speaker':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        );
      case 'translate':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'pencil':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
    }
  };

  // Difficulty badge component
  const DifficultyBadge = ({ level, label, textColor }: { level: number; label: string; textColor: string }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white ${textColor} flex items-center gap-1 border border-primary/5`}>
      {Array.from({ length: level }).map((_, i) => (
        <svg key={i} className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.827c.197-.544.96-.544 1.157 0l.33 1.01a1 1 0 00.95.69h1.062c.571 0 .808.73.346 1.066l-.86.623a1 1 0 00-.363 1.118l.33 1.01c.197.544-.42 1.025-.882.69l-.86-.623a1 1 0 00-1.176 0l-.86.623c-.462.335-1.079-.146-.882-.69l.33-1.01a1 1 0 00-.363-1.118l-.86-.623c-.462-.336-.225-1.066.346-1.066h1.062a1 1 0 00.95-.69l.33-1.01z" />
        </svg>
      ))}
      <span className="ml-0.5">{label}</span>
    </span>
  );

  return (
    <div className="min-h-screen py-8 px-4 bg-parchment">
      <div className="max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors text-sm font-medium"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Back to Curriculum
        </Link>

        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 header-serif leading-tight">
            Advanced Training Modules
          </h1>
          <p className="text-xl text-muted font-medium">
            Select an institutional mode for <span className="text-slate-900 underline decoration-accent/20 underline-offset-4">{course.title}</span>
          </p>
        </div>

        {/* 练习模式卡片 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {practiceModes.map((mode) => (
            <Link
              key={mode.id}
              href={mode.href}
              className="block bg-white rounded-xl border border-slate-200 hover:border-primary shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col"
            >
              <div className={`p-8 flex-grow ${mode.color}`}>
                {/* 图标和难度 */}
                <div className="flex items-center justify-between mb-4">
                  <div className={mode.textColor}>
                    <PracticeModeIcon type={mode.iconType} />
                  </div>
                  <DifficultyBadge level={mode.difficultyLevel} label={mode.difficulty} textColor={mode.textColor} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 header-serif group-hover:text-primary transition-colors">
                  {mode.name}
                </h3>
                <p className="text-sm text-muted mb-6 leading-relaxed font-medium">
                  {mode.description}
                </p>

                <ul className="space-y-3">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      <svg className="w-3.5 h-3.5 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">~5 MIN CYCLE</span>
                  <span className="inline-flex items-center text-primary font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Commence →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 提示信息 */}
        <div className="mt-12 paper-card p-10 border-slate-100 max-w-4xl">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Methodological Guidance
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                <strong>Foundational Lexicon?</strong> Initiate with <strong>Visual Synthesis</strong> to establish primary semantic mappings.
                <br />
                <br />
                <strong>Phonetic Mastery?</strong> <strong>Phonetic Calibration</strong> and <strong>Lexical Transcription</strong> provide high-fidelity acoustic feedback for precise prosodic control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

