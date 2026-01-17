'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/CourseCard';
import Link from 'next/link';
import { WishForm } from '@/components/WishForm';

interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  totalWords: number;
  difficulty: string | null;
  coverImage: string | null;
  isEnrolled: boolean;
  progress: number;
  isCompleted: boolean;
}

interface CoursesPageClientProps {
  allCourses: Course[];
  coursesByCategory: {
    business: Course[];
    hsk: Course[];
  };
  myCourses: {
    inProgress: Course[];
    completed: Course[];
  };
  isLoggedIn: boolean;
  initialTab: string;
}

export default function CoursesPageClient({
  allCourses,
  coursesByCategory,
  myCourses,
  isLoggedIn,
  initialTab,
}: CoursesPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'explore' | 'my'>(
    initialTab === 'my' ? 'my' : 'explore'
  );
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'business' | 'hsk'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Update URL when switching tabs
  const handleTabChange = (tab: 'explore' | 'my') => {
    setActiveTab(tab);
    router.push(`/courses?tab=${tab}`, { scroll: false });
  };

  // Filter courses
  const getFilteredCourses = () => {
    let filtered = allCourses;

    // Filter by category
    if (selectedCategory === 'business') {
      filtered = coursesByCategory.business;
    } else if (selectedCategory === 'hsk') {
      filtered = coursesByCategory.hsk;
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="min-h-screen py-8 px-4 bg-parchment">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 header-serif">
            Curriculum Library
          </h1>
          <p className="text-lg text-muted font-medium">
            Systematic pathways for business bilingualism and HSK proficiency.
          </p>
        </div>

        {/* Wish Pool Banner */}
        <WishForm variant="banner" />

        {/* Tab Switching */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-200">
          <div className="flex gap-8">
            <button
              onClick={() => handleTabChange('explore')}
              className={`px-1 py-3 font-bold transition-all relative text-xs uppercase tracking-widest ${activeTab === 'explore'
                ? 'text-primary'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              Explore Catalogue
              {activeTab === 'explore' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
            <button
              onClick={() => handleTabChange('my')}
              className={`px-1 py-3 font-bold transition-all relative text-xs uppercase tracking-widest ${activeTab === 'my'
                ? 'text-primary'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              My Enrollment
              {myCourses.inProgress.length + myCourses.completed.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary rounded-full">
                  {myCourses.inProgress.length + myCourses.completed.length}
                </span>
              )}
              {activeTab === 'my' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          </div>

          {/* Search Box (Only show in Explore Tab) */}
          {activeTab === 'explore' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-300"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'explore' ? (
          <>
            {/* Filters */}
            <div className="mb-8 flex gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedCategory === 'all'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
              >
                All Domains
              </button>
              <button
                onClick={() => setSelectedCategory('business')}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-1.5 ${selectedCategory === 'business'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Business ({coursesByCategory.business.length})
              </button>
              <button
                onClick={() => setSelectedCategory('hsk')}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-1.5 ${selectedCategory === 'hsk'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                HSK Proficiency ({coursesByCategory.hsk.length})
              </button>
            </div>

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* My Courses Tab */}
            {!isLoggedIn ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-600 mb-6">
                  Please login to view your courses
                </p>
                <Link
                  href="/login?redirect=/courses?tab=my"
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Login →
                </Link>
              </div>
            ) : myCourses.inProgress.length === 0 && myCourses.completed.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  You haven&apos;t started any courses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore our library to begin your Chinese learning journey!
                </p>
                <button
                  onClick={() => handleTabChange('explore')}
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Browse Courses →
                </button>
              </div>
            ) : (
              <>
                {/* In Progress */}
                {myCourses.inProgress.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      In Progress
                      <span className="text-sm font-normal text-gray-600">
                        ({myCourses.inProgress.length} {myCourses.inProgress.length === 1 ? 'course' : 'courses'})
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myCourses.inProgress.map((course) => (
                        <CourseCard key={course.id} {...course} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {myCourses.completed.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completed
                      <span className="text-sm font-normal text-gray-600">
                        ({myCourses.completed.length} {myCourses.completed.length === 1 ? 'course' : 'courses'})
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myCourses.completed.map((course) => (
                        <CourseCard key={course.id} {...course} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Wish Pool Bottom Button */}
        <WishForm variant="button" />
      </div>
    </div>
  );
}

