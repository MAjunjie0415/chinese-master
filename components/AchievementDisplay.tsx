'use client';

import { useEffect, useState } from 'react';
import AchievementBadge from './AchievementBadge';

export interface UserAchievements {
  streakDays: number;
  totalMastered: number;
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    target: number;
    achieved: boolean;
    icon: string;
  }>;
  nextMilestone: {
    id: string;
    name: string;
    description: string;
    target: number;
    achieved: boolean;
    icon: string;
  } | null;
}

interface AchievementDisplayProps {
  compact?: boolean;
  initialData?: UserAchievements | null; // 服务器端传入的初始数据
}

export default function AchievementDisplay({ compact = false, initialData = null }: AchievementDisplayProps) {
  const [achievements, setAchievements] = useState<UserAchievements | null>(initialData);
  const [loading, setLoading] = useState(!initialData); // 如果有初始数据，不需要加载

  useEffect(() => {
    // 如果已经有初始数据，不需要再获取
    if (initialData) {
      return;
    }

    async function fetchAchievements() {
      try {
        const response = await fetch('/api/achievements');
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, [initialData]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!achievements) {
    return null;
  }

  if (compact) {
    return (
      <div className="paper-card p-4 border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest header-serif opacity-80">Achievements</h3>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-accent">{achievements.streakDays}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Days</span>
          </div>
        </div>
        {achievements.nextMilestone && (
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-2 mt-2">
            Target: {achievements.nextMilestone.description}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="paper-card p-6 border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-6 header-serif uppercase tracking-widest opacity-80 border-b border-slate-100 pb-4">
        Academic Milestones
      </h3>

      {/* 连续学习天数 */}
      <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-100 transition-all hover:border-accent/30 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Consistency Streak</p>
            <p className="text-3xl font-bold text-accent">
              {achievements.streakDays} {achievements.streakDays === 1 ? 'Cycle' : 'Cycles'}
            </p>
          </div>
          <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* 总掌握单词数 */}
      <div className="bg-slate-50 rounded-lg p-5 mb-8 border border-slate-100 transition-all hover:border-primary/30 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lexicon Mastery</p>
            <p className="text-3xl font-bold text-primary">
              {achievements.totalMastered}
            </p>
          </div>
          <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      {/* 已达成里程碑 */}
      {achievements.milestones.length > 0 && (
        <div className="mb-8">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Academic Credentials</h4>
          <div className="grid grid-cols-4 gap-4">
            {achievements.milestones.slice(0, 8).map((milestone) => (
              <div key={milestone.id} className="text-center group">
                <div className="inline-block transition-transform group-hover:rotate-12">
                  <AchievementBadge milestone={milestone} size="md" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter truncate">{milestone.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 下一个里程碑 */}
      {achievements.nextMilestone && (
        <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
          <div className="flex items-center gap-4">
            <AchievementBadge milestone={achievements.nextMilestone} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Next Objective</p>
              <p className="text-sm font-bold text-slate-700 truncate mb-3">{achievements.nextMilestone.description}</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, (achievements.totalMastered / achievements.nextMilestone.target) * 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Progress: {Math.round((achievements.totalMastered / achievements.nextMilestone.target) * 100)}%
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-right">
                  {achievements.totalMastered} / {achievements.nextMilestone.target}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

