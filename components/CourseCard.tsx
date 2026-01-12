'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CourseCardProps {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  totalWords: number;
  difficulty: string | null;
  coverImage: string | null;
  // User-related state (optional, only shown after login)
  isEnrolled?: boolean;
  progress?: number;
  isCompleted?: boolean;
}

export default function CourseCard({
  title,
  slug,
  category,
  description,
  totalWords,
  difficulty,
  coverImage,
  isEnrolled = false,
  progress = 0,
  isCompleted = false,
}: CourseCardProps) {
  // Display different emoji and color based on category
  const getCategoryDisplay = (cat: string) => {
    if (cat === 'business') {
      return { emoji: '💼', label: 'Business', color: 'bg-blue-100 text-blue-700' };
    }
    if (cat.startsWith('hsk')) {
      const level = cat.replace('hsk', '');
      return { emoji: '📚', label: `HSK ${level}`, color: 'bg-emerald-100 text-emerald-700' };
    }
    return { emoji: '📖', label: cat, color: 'bg-gray-100 text-gray-700' };
  };

  const categoryInfo = getCategoryDisplay(category);

  // Difficulty display
  const getDifficultyDisplay = (diff: string | null) => {
    if (!diff) return null;
    const levels: { [key: string]: string } = {
      beginner: '⭐',
      intermediate: '⭐⭐',
      advanced: '⭐⭐⭐',
    };
    return levels[diff] || '⭐';
  };

  // Action button rendering
  const renderActionButton = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            ✓ Completed
          </span>
          <Link
            href={`/courses/${slug}`}
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Review Again
          </Link>
        </div>
      );
    }

    if (isEnrolled) {
      return (
        <div className="space-y-2">
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {progress === 0 ? 'Just started' : `${progress}% complete`}
            </span>
            <Link
              href={`/courses/${slug}`}
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Continue →
            </Link>
          </div>
        </div>
      );
    }

    // Not enrolled state
    return (
      <Link
        href={`/courses/${slug}`}
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full text-center"
      >
        Start Learning →
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Cover Image */}
      <Link href={`/courses/${slug}`}>
        <div className="relative h-40 bg-gradient-to-br from-blue-100 to-emerald-100 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">
              {categoryInfo.emoji}
            </div>
          )}
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
          {difficulty && (
            <span className="text-xs text-gray-500">
              {getDifficultyDisplay(difficulty)}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/courses/${slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Word Count */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>{totalWords} words</span>
        </div>

        {/* Action Button */}
        {renderActionButton()}
      </div>
    </div>
  );
}

