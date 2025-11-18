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

  // 切换Tab时更新URL
  const handleTabChange = (tab: 'explore' | 'my') => {
    setActiveTab(tab);
    router.push(`/courses?tab=${tab}`, { scroll: false });
  };

  // 筛选课程
  const getFilteredCourses = () => {
    let filtered = allCourses;

    // 按分类筛选
    if (selectedCategory === 'business') {
      filtered = coursesByCategory.business;
    } else if (selectedCategory === 'hsk') {
      filtered = coursesByCategory.hsk;
    }

    // 按搜索关键词筛选
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
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Courses
          </h1>
          <p className="text-gray-600">
            Master Chinese through structured courses tailored for business and HSK exams
          </p>
        </div>

        {/* 许愿池横幅 */}
        <WishForm variant="banner" />

        {/* Tab切换 */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => handleTabChange('explore')}
              className={`px-4 py-3 font-semibold transition-colors relative ${
                activeTab === 'explore'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Explore
              {activeTab === 'explore' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => handleTabChange('my')}
              className={`px-4 py-3 font-semibold transition-colors relative ${
                activeTab === 'my'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Courses
              {myCourses.inProgress.length + myCourses.completed.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {myCourses.inProgress.length + myCourses.completed.length}
                </span>
              )}
              {activeTab === 'my' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          {/* 搜索框（仅Explore Tab显示） */}
          {activeTab === 'explore' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Tab内容 */}
        {activeTab === 'explore' ? (
          <>
            {/* 筛选器 */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setSelectedCategory('business')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'business'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                💼 Business ({coursesByCategory.business.length})
              </button>
              <button
                onClick={() => setSelectedCategory('hsk')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'hsk'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📚 HSK ({coursesByCategory.hsk.length})
              </button>
            </div>

            {/* 课程网格 */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
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
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-600 mb-6">
                  Please login to view your courses
                </p>
                <Link
                  href="/login?redirect=/courses?tab=my"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Login →
                </Link>
              </div>
            ) : myCourses.inProgress.length === 0 && myCourses.completed.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  You haven&apos;t started any courses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Explore our library to begin your Chinese learning journey!
                </p>
                <button
                  onClick={() => handleTabChange('explore')}
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
                      📚 In Progress
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
                      ✓ Completed
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

        {/* 许愿池底部按钮 */}
        <WishForm variant="button" />
      </div>
    </div>
  );
}

