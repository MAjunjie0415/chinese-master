/**
 * 成就系统工具函数
 * 基于现有数据计算用户的成就和里程碑
 */

import { db } from '@/lib/drizzle';
import { userProgress } from '@/db/schema/progress';
import { practiceRecords } from '@/db/schema/courses';
import { eq, and, sql, count } from 'drizzle-orm';

export interface UserAchievements {
  streakDays: number; // 连续学习天数
  totalMastered: number; // 总掌握单词数
  milestones: AchievementMilestone[]; // 已达成里程碑
  nextMilestone: AchievementMilestone | null; // 下一个里程碑
}

export interface AchievementMilestone {
  id: string;
  name: string;
  description: string;
  target: number; // 目标数量
  achieved: boolean; // 是否已达成
  icon: string; // 图标
}

// 里程碑定义
const MILESTONES: AchievementMilestone[] = [
  { id: 'first-10', name: 'First Steps', description: 'Master 10 words', target: 10, achieved: false, icon: '🌱' },
  { id: 'first-25', name: 'Getting Started', description: 'Master 25 words', target: 25, achieved: false, icon: '📚' },
  { id: 'first-50', name: 'Building Foundation', description: 'Master 50 words', target: 50, achieved: false, icon: '🏗️' },
  { id: 'first-100', name: 'Century Club', description: 'Master 100 words', target: 100, achieved: false, icon: '💯' },
  { id: 'first-250', name: 'Vocabulary Builder', description: 'Master 250 words', target: 250, achieved: false, icon: '📖' },
  { id: 'first-500', name: 'Word Master', description: 'Master 500 words', target: 500, achieved: false, icon: '👑' },
  { id: 'first-1000', name: 'Language Expert', description: 'Master 1000 words', target: 1000, achieved: false, icon: '🌟' },
];

// 连续学习天数里程碑
const STREAK_MILESTONES: AchievementMilestone[] = [
  { id: 'streak-3', name: '3-Day Streak', description: 'Study for 3 days in a row', target: 3, achieved: false, icon: '🔥' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Study for 7 days in a row', target: 7, achieved: false, icon: '💪' },
  { id: 'streak-14', name: 'Two Weeks Strong', description: 'Study for 14 days in a row', target: 14, achieved: false, icon: '⚡' },
  { id: 'streak-30', name: 'Monthly Champion', description: 'Study for 30 days in a row', target: 30, achieved: false, icon: '🏆' },
  { id: 'streak-100', name: 'Century Streak', description: 'Study for 100 days in a row', target: 100, achieved: false, icon: '🎯' },
];

/**
 * 计算连续学习天数
 * 基于user_progress的last_reviewed和practice_records的created_at
 */
export async function calculateStreakDays(userId: string): Promise<number> {
  try {
    // 并行获取所有学习活动日期（复习和练习）
    const [reviewDates, practiceDates] = await Promise.all([
      db
        .select({
          date: sql<string>`DATE(${userProgress.last_reviewed})`.as('date'),
        })
        .from(userProgress)
        .where(eq(userProgress.user_id, userId))
        .groupBy(sql`DATE(${userProgress.last_reviewed})`),

      db
        .select({
          date: sql<string>`DATE(${practiceRecords.createdAt})`.as('date'),
        })
        .from(practiceRecords)
        .where(eq(practiceRecords.user_id, userId))
        .groupBy(sql`DATE(${practiceRecords.createdAt})`),
    ]);

    // 合并并去重日期
    const allDates = new Set<string>();
    reviewDates.forEach(r => allDates.add(r.date));
    practiceDates.forEach(p => allDates.add(p.date));

    // 转换为日期对象并排序
    const sortedDates = Array.from(allDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime()); // 降序

    if (sortedDates.length === 0) return 0;

    // 计算连续天数
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今天是否有活动
    const todayStr = today.toISOString().split('T')[0];
    const hasToday = sortedDates.some(d => d.toISOString().split('T')[0] === todayStr);

    // 如果今天没有活动，检查昨天
    let checkDate = hasToday ? today : new Date(today.getTime() - 24 * 60 * 60 * 1000);
    checkDate.setHours(0, 0, 0, 0);

    for (const date of sortedDates) {
      const dateStr = date.toISOString().split('T')[0];
      const checkStr = checkDate.toISOString().split('T')[0];

      if (dateStr === checkStr) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (dateStr < checkStr) {
        // 日期不连续，中断
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak days:', error);
    return 0;
  }
}

/**
 * 获取用户成就
 */
export async function getUserAchievements(userId: string): Promise<UserAchievements> {
  // 并行查询：总掌握单词数和连续学习天数
  const [masteredResult, streakDays] = await Promise.all([
    // 计算总掌握单词数
    db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.user_id, userId), eq(userProgress.mastered, true))),

    // 计算连续学习天数
    calculateStreakDays(userId),
  ]);

  const totalMastered = masteredResult[0]?.count || 0;

  // 检查单词里程碑
  const milestones = MILESTONES.map(m => ({
    ...m,
    achieved: totalMastered >= m.target,
  }));

  // 检查连续学习里程碑
  const streakMilestones = STREAK_MILESTONES.map(m => ({
    ...m,
    achieved: streakDays >= m.target,
  }));

  // 合并所有里程碑
  const allMilestones = [...milestones, ...streakMilestones];

  // 找出已达成和未达成的里程碑
  const achievedMilestones = allMilestones.filter(m => m.achieved);
  const nextMilestone = allMilestones.find(m => !m.achieved) || null;

  return {
    streakDays,
    totalMastered,
    milestones: achievedMilestones,
    nextMilestone,
  };
}

/**
 * 获取鼓励语（基于成就）
 */
export function getEncouragementMessage(achievements: UserAchievements): string {
  if (achievements.streakDays >= 30) {
    return `🎉 Amazing! You've maintained a ${achievements.streakDays}-day streak!`;
  } else if (achievements.streakDays >= 7) {
    return `🔥 Great! You're on a ${achievements.streakDays}-day streak!`;
  } else if (achievements.totalMastered >= 100) {
    return `🌟 Excellent! You've mastered ${achievements.totalMastered} words!`;
  } else if (achievements.totalMastered >= 50) {
    return `💪 Keep going! You've mastered ${achievements.totalMastered} words!`;
  } else {
    return `🚀 You're building a solid foundation!`;
  }
}

