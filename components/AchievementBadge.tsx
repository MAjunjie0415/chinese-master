'use client';

interface AchievementMilestone {
  id: string;
  name: string;
  description: string;
  target: number;
  achieved: boolean;
  icon: string;
}

interface AchievementBadgeProps {
  milestone: AchievementMilestone;
  size?: 'sm' | 'md' | 'lg';
}

export default function AchievementBadge({
  milestone,
  size = 'md',
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg ${
        milestone.achieved ? 'opacity-100' : 'opacity-50 grayscale'
      } transition-all hover:scale-110`}
      title={milestone.achieved ? milestone.description : `Unlock: ${milestone.description}`}
    >
      <span>{milestone.icon}</span>
    </div>
  );
}

