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
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
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

