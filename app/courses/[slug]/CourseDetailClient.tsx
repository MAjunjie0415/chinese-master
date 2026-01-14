'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Word {
  wordId: number;
  order: number;
  chinese: string | null;
  pinyin: string | null;
  english: string | null;
  scene: string | null;
  example: string | null;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  totalWords: number;
  difficulty: string | null;
  coverImage: string | null;
}

interface CourseDetailClientProps {
  course: Course;
  courseWords: Word[];
  isLoggedIn: boolean;
  isEnrolled: boolean;
  userProgress: number;
  isCompleted: boolean;
}

export default function CourseDetailClient({
  course,
  courseWords,
  isLoggedIn,
  isEnrolled,
  userProgress,
  isCompleted,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 添加课程到"我的课程"
  const handleAddCourse = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add course');
      }

      // 刷新页面以更新状态
      router.refresh();
    } catch (err) {
      console.error('Error adding course:', err);
      setError(err instanceof Error ? err.message : 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  // 开始学习（跳转到练习模式选择页面）
  const handleStartLearning = () => {
    router.push(`/courses/${course.slug}/practice`);
  };

  // 根据分类显示不同的颜色和标签
  const getCategoryDisplay = (cat: string) => {
    if (cat === 'business') {
      return { icon: 'briefcase', label: 'Business', color: 'bg-blue-100 text-blue-700' };
    }
    if (cat.startsWith('hsk')) {
      const level = cat.replace('hsk', '');
      return { icon: 'book', label: `HSK ${level}`, color: 'bg-emerald-100 text-emerald-700' };
    }
    return { icon: 'book', label: cat, color: 'bg-gray-100 text-gray-700' };
  };

  const categoryInfo = getCategoryDisplay(course.category);

  // 难度显示 - 使用SVG星星
  const getDifficultyDisplay = (diff: string | null) => {
    if (!diff) return null;
    const levels: { [key: string]: { level: number; label: string } } = {
      beginner: { level: 1, label: 'Beginner' },
      intermediate: { level: 2, label: 'Intermediate' },
      advanced: { level: 3, label: 'Advanced' },
    };
    return levels[diff] || levels.beginner;
  };

  const difficultyInfo = getDifficultyDisplay(course.difficulty);

  // Star icon component
  const StarIcon = ({ filled = true }: { filled?: boolean }) => (
    <svg className={`w-4 h-4 ${filled ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  // Category icon component
  const CategoryIcon = ({ type }: { type: string }) => {
    if (type === 'briefcase') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  };

  // 计算已学单词数
  const learnedWords = Math.round((userProgress / 100) * course.totalWords);

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Link
          href="/courses"
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
          Back to Courses
        </Link>

        {/* 课程头部信息 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* 标签 */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}
            >
              <CategoryIcon type={categoryInfo.icon} /> {categoryInfo.label}
            </span>
            {difficultyInfo && (
              <span className="inline-flex items-center gap-0.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {Array.from({ length: difficultyInfo.level }).map((_, i) => (
                  <StarIcon key={i} filled={true} />
                ))}
                <span className="ml-1">{difficultyInfo.label}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {course.totalWords} words
            </span>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {course.title}
          </h1>

          {/* 描述 */}
          {course.description && (
            <p className="text-lg text-gray-600 mb-6">{course.description}</p>
          )}

          {/* 进度条（仅已添加课程显示） */}
          {isEnrolled && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                <span className="text-sm font-semibold text-blue-600">
                  {learnedWords}/{course.totalWords} words ({userProgress}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${userProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isLoggedIn ? (
              <Link
                href={`/login?redirect=/courses/${course.slug}`}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors"
              >
                Login to Start →
              </Link>
            ) : isCompleted ? (
              <>
                <div className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 px-8 py-4 rounded-lg font-semibold">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Course Completed!
                </div>
                <button
                  onClick={handleStartLearning}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold transition-colors"
                >
                  Review Again
                </button>
              </>
            ) : isEnrolled ? (
              <button
                onClick={handleStartLearning}
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : userProgress === 0 ? 'Begin Learning →' : 'Continue Learning →'}
              </button>
            ) : (
              <button
                onClick={handleAddCourse}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Start Course →'}
              </button>
            )}
          </div>
        </div>

        {/* 单词列表 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Words in this course ({courseWords.length})
          </h2>

          {courseWords.length > 0 ? (
            <div className="space-y-4">
              {courseWords.map((word, index) => (
                <div
                  key={word.wordId}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* 序号 */}
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {index + 1}
                    </span>

                    {/* 单词信息（复用v1.0样式） */}
                    <div className="flex-1">
                      {/* 汉字 - 大字体 */}
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {word.chinese}
                      </div>

                      {/* 拼音 - 蓝色 */}
                      <div className="text-lg text-blue-600 mb-2">
                        {word.pinyin}
                      </div>

                      {/* 英文释义 - 灰色 */}
                      <div className="text-base text-gray-700 mb-2">
                        {word.english}
                      </div>

                      {/* 例句（如果有） */}
                      {word.example && (
                        <div className="text-sm text-gray-600 italic">
                          {word.example}
                        </div>
                      )}

                      {/* 场景标签（如果有） */}
                      {word.scene && (
                        <div className="mt-2">
                          <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                            {word.scene}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No words in this course yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

