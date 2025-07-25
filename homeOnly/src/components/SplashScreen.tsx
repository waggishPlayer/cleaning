import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  const slideInKeyframes = `@keyframes logoSlideIn {
  0% { transform: translateX(-120vw); }
  100% { transform: translateX(0); }
}`;

  useEffect(() => {
    // Inject slide-in keyframes
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = slideInKeyframes;
    document.head.appendChild(styleSheet);

    // Wait 2s, then fade for 1s
    const fadeTimer = setTimeout(() => {
      setFadeToBlack(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
      }, 1000); // fade duration
    }, 2000); // still duration
    return () => {
      clearTimeout(fadeTimer);
      document.head.removeChild(styleSheet);
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500"
      style={{ backgroundColor: '#00ddff' }}
    >
      <img
        src="/Caarvo no back.png"
        alt="Caarvo Logo"
        className="w-2/3 max-w-md"
        style={{ objectFit: 'contain', animation: 'logoSlideIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
      />
      {/* Black overlay for fade out */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${fadeToBlack ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: '#000', transition: 'opacity 1s', opacity: fadeToBlack ? 1 : 0 }}
      />
    </div>
  );
};

export default SplashScreen; 