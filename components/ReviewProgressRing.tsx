'use client';

interface ReviewProgressRingProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export default function ReviewProgressRing({
  current,
  total,
  size = 120,
  strokeWidth = 8,
}: ReviewProgressRingProps) {
  const percentage = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-green-500 transition-all duration-500 ease-out"
        />
      </svg>
      {/* 中心文字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900">
          {current}/{total}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
}

