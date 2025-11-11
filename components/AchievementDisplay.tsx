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
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Achievements</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-orange-600">{achievements.streakDays}</span>
            <span className="text-sm text-gray-600">days</span>
          </div>
        </div>
        {achievements.nextMilestone && (
          <div className="text-sm text-gray-600">
            Next: {achievements.nextMilestone.description}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Your Achievements</h3>

      {/* 连续学习天数 */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">
              {achievements.streakDays} {achievements.streakDays === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="text-5xl">🔥</div>
        </div>
      </div>

      {/* 总掌握单词数 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Words Mastered</p>
            <p className="text-3xl font-bold text-blue-600">
              {achievements.totalMastered}
            </p>
          </div>
          <div className="text-5xl">📚</div>
        </div>
      </div>

      {/* 已达成里程碑 */}
      {achievements.milestones.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Achieved Milestones</h4>
          <div className="grid grid-cols-4 gap-3">
            {achievements.milestones.slice(0, 8).map((milestone) => (
              <div key={milestone.id} className="text-center">
                <AchievementBadge milestone={milestone} size="md" />
                <p className="text-xs text-gray-600 mt-2">{milestone.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 下一个里程碑 */}
      {achievements.nextMilestone && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <AchievementBadge milestone={achievements.nextMilestone} size="sm" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Next Milestone</p>
              <p className="text-sm text-gray-600">{achievements.nextMilestone.description}</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (achievements.totalMastered / achievements.nextMilestone.target) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

