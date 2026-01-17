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
      return { icon: 'briefcase', label: 'Business', color: 'bg-primary/5 text-primary border border-primary/10' };
    }
    if (cat.startsWith('hsk')) {
      const level = cat.replace('hsk', '');
      return { icon: 'book', label: `HSK ${level}`, color: 'bg-accent/5 text-accent border border-accent/10' };
    }
    return { icon: 'book', label: cat, color: 'bg-slate-50 text-slate-600 border border-slate-100' };
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

  // Simple bar indicator for difficulty
  const DifficultyDots = ({ level }: { level: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1 w-3 rounded-full ${i <= level ? 'bg-primary' : 'bg-slate-200'}`}
        />
      ))}
    </div>
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-accent/10 text-accent">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
          <Link
            href={`/courses/${slug}`}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold transition-all text-xs uppercase tracking-widest text-center"
          >
            Review
          </Link>
        </div>
      );
    }

    if (isEnrolled) {
      return (
        <div className="space-y-3">
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {progress === 0 ? 'Commence' : `${progress}% Proficiency`}
            </span>
            <Link
              href={`/courses/${slug}`}
              className="inline-block bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold transition-all text-xs uppercase tracking-widest"
            >
              Resume →
            </Link>
          </div>
        </div>
      );
    }

    // Not enrolled state
    return (
      <Link
        href={`/courses/${slug}`}
        className="inline-block bg-primary hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold transition-all w-full text-center text-xs uppercase tracking-widest shadow-sm"
      >
        Enroll in Course →
      </Link>
    );
  };

  return (
    <div className="paper-card overflow-hidden group">
      {/* Cover Image */}
      <Link href={`/courses/${slug}`}>
        <div className="relative h-44 bg-slate-50 border-b border-slate-100 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full opacity-60">
              <CategoryPlaceholderIcon type={categoryInfo.icon} />
            </div>
          )}
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
          {difficulty && (
            <DifficultyDots level={getDifficultyLevel(difficulty)} />
          )}
        </div>

        {/* Title */}
        <Link href={`/courses/${slug}`}>
          <h3 className="text-lg font-bold text-slate-900 mb-2 hover:text-primary transition-colors line-clamp-2 header-serif leading-snug">
            {title}
          </h3>
        </Link>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted mb-4 line-clamp-2 leading-relaxed">
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

