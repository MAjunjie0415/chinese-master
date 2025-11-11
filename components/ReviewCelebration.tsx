'use client';

import { useEffect, useState } from 'react';

interface ReviewCelebrationProps {
  reviewCount: number;
  onAnimationComplete?: () => void;
}

export default function ReviewCelebration({
  reviewCount,
  onAnimationComplete,
}: ReviewCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // 延迟显示消息，让彩带动画先播放
    const timer1 = setTimeout(() => {
      setShowMessage(true);
    }, 500);

    // 动画完成后回调
    const timer2 = setTimeout(() => {
      setShowConfetti(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onAnimationComplete]);

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* 彩带动画 */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = 2 + Math.random() * 2;
          const color = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][
            Math.floor(Math.random() * 6)
          ];

          return (
            <div
              key={i}
              className="absolute w-2 h-12 rounded-full"
              style={{
                left: `${left}%`,
                top: '-10%',
                backgroundColor: color,
                animation: `fall ${duration}s ease-in ${delay}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* 庆祝消息 */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Review Complete!
              </h2>
              <p className="text-lg text-gray-600">
                You&apos;ve reviewed <strong className="text-orange-600">{reviewCount}</strong>{' '}
                {reviewCount === 1 ? 'word' : 'words'} today!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

