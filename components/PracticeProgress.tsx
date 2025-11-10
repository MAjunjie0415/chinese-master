'use client';

interface PracticeProgressProps {
  current: number;
  total: number;
  showPercentage?: boolean;
}

export default function PracticeProgress({
  current,
  total,
  showPercentage = false,
}: PracticeProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress: {current}/{total}
        </span>
        {showPercentage && (
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

