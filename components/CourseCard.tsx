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
  // Display different icon and color based on category
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

  const categoryInfo = getCategoryDisplay(category);

  // Difficulty display - returns level number
  const getDifficultyLevel = (diff: string | null): number => {
    if (!diff) return 0;
    const levels: { [key: string]: number } = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };
    return levels[diff] || 1;
  };

  // Small star icon for difficulty
  const StarIcon = () => (
    <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  // Category icon component
  const CategoryPlaceholderIcon = ({ type }: { type: string }) => {
    if (type === 'briefcase') {
      return (
        <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  };

  // Action button rendering
  const renderActionButton = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Completed
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
            <div className="flex items-center justify-center h-full">
              <CategoryPlaceholderIcon type={categoryInfo.icon} />
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
          {difficulty && getDifficultyLevel(difficulty) > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-500">
              {Array.from({ length: getDifficultyLevel(difficulty) }).map((_, i) => (
                <StarIcon key={i} />
              ))}
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

