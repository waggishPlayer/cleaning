import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 3000);

    const animationTimer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 800);

    return () => {
      clearTimeout(timer);
      clearInterval(animationTimer);
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
            SparkleWash
          </h1>
          <p className="text-xl text-blue-100">Professional Vehicle Cleaning</p>
        </div>

        {/* Car Animation */}
        <div className="relative w-64 h-32 mx-auto mb-8">
          {/* Car Body */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <svg width="120" height="60" viewBox="0 0 120 60" className="car-body">
              {/* Car body */}
              <rect x="20" y="25" width="80" height="25" rx="5" fill="#374151" />
              {/* Car roof */}
              <rect x="35" y="15" width="50" height="15" rx="3" fill="#374151" />
              {/* Windows */}
              <rect x="37" y="17" width="46" height="11" rx="2" fill="#87CEEB" />
              {/* Wheels */}
              <circle cx="35" cy="50" r="8" fill="#1F2937" />
              <circle cx="85" cy="50" r="8" fill="#1F2937" />
              <circle cx="35" cy="50" r="4" fill="#6B7280" />
              <circle cx="85" cy="50" r="4" fill="#6B7280" />
            </svg>
          </div>

          {/* Bubbles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 bg-blue-200 rounded-full opacity-70 bubble-${i}`}
              style={{
                left: `${20 + i * 10}%`,
                bottom: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animation: `bubbleRise 2s infinite ease-out`
              }}
            />
          ))}

          {/* Water Drops */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`drop-${i}`}
              className={`absolute w-2 h-2 bg-blue-300 rounded-full opacity-80 drop-${i}`}
              style={{
                left: `${30 + i * 12}%`,
                top: `${10 + (i % 2) * 15}%`,
                animationDelay: `${i * 0.3}s`,
                animation: `dropFall 1.5s infinite ease-in`
              }}
            />
          ))}

          {/* Shine Effect */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full opacity-20 shine-effect`}
            style={{
              animation: `shine 2s infinite ease-in-out`
            }}
          />
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>

        {/* Loading Text */}
        <p className="text-blue-100 mt-4 text-lg">
          {animationPhase === 0 && "Initializing..."}
          {animationPhase === 1 && "Loading services..."}
          {animationPhase === 2 && "Preparing dashboard..."}
          {animationPhase === 3 && "Almost ready..."}
        </p>
      </div>

      <style>{`
        @keyframes bubbleRise {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }

        @keyframes dropFall {
          0% {
            transform: translateY(-20px) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(40px) scale(1);
            opacity: 0;
          }
        }

        @keyframes shine {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.2;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.4;
          }
        }

        .car-body {
          animation: carShine 3s infinite ease-in-out;
        }

        @keyframes carShine {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen; 