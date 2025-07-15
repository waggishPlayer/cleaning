import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFadeIn(true); // Start fade-in
    const fadeTimer = setTimeout(() => {
      setZoomed(true); // Start zoom-out
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 400); // Wait for fade out
      }, 800);
    }, 1500);
    return () => clearTimeout(fadeTimer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0`} style={{ background: '#c1ff72' }}>
      <div
        ref={logoRef}
        className={`splash-logo transition-transform duration-700 ease-in-out ${fadeIn ? 'fade-in' : ''} ${zoomed ? 'zoom-out' : ''}`}
        style={{ willChange: 'transform, opacity', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <img src="/logo.png" alt="Caarvo Logo" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
      </div>
      <style>{`
        .splash-logo {
          opacity: 0;
          transform: scale(1);
        }
        .splash-logo.fade-in {
          opacity: 1;
          transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .splash-logo.zoom-out {
          transform: scale(8);
          opacity: 0;
          transition: transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default SplashScreen; 