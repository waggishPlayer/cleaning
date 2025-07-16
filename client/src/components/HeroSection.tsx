import React, { useState, useRef } from 'react';

const CAR_SVG_PATH = '/car.svg';
const DIRT_OVERLAY_URL = 'https://www.pngall.com/wp-content/uploads/5/Grunge-PNG-Image.png'; // transparent dirt overlay

const HeroSection: React.FC<{ small?: boolean; hideSlider?: boolean; initialSlider?: number }> = ({ small, hideSlider = false, initialSlider = 50 }) => {
  const [slider, setSlider] = useState(initialSlider); // percent clean
  const containerRef = useRef<HTMLDivElement>(null);

  // Dirty filter: sepia + brightness + contrast
  const dirtyFilter = 'sepia(0.7) brightness(0.8) contrast(1.1)';

  // Dirt patch configs
  const mudColor = '#2d1c0b';
  // Use 3 visible, natural splats in the bottom half
  const dirtSpots = [
    { left: 25, top: 65, width: 13, height: 12, key: 1, path: 'M20,80 Q30,60 50,80 Q70,100 80,80 Q90,60 70,70 Q50,60 30,70 Q10,80 20,80 Z' },
    { left: 55, top: 75, width: 12, height: 10, key: 2, path: 'M40,90 Q50,70 60,90 Q80,100 90,90 Q100,80 80,85 Q60,80 50,85 Q30,90 40,90 Z' },
    { left: 70, top: 60, width: 10, height: 9, key: 3, path: 'M60,80 Q65,70 75,80 Q85,90 90,80 Q95,70 85,75 Q75,70 65,75 Q55,80 60,80 Z' },
  ];

  // Handle slider drag
  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlider(Number(e.target.value));
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: small ? 'min(60vw, 400px)' : 'min(90vw, 600px)',
        height: small ? 'min(28vw, 180px)' : 'min(40vw, 260px)',
        margin: small ? '0 0 0 auto' : '0 auto',
        userSelect: 'none',
        background: 'transparent',
      }}
    >
      {/* Dirty side (left) */}
      {slider > 0 && (
        <img
          src={CAR_SVG_PATH}
          alt="Dirty Car"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: dirtyFilter,
            clipPath: `inset(0 ${100 - slider}% 0 0)`,
            transition: 'clip-path 0.2s',
            zIndex: 1,
          }}
          draggable={false}
        />
      )}
      {/* Dirt patches temporarily removed for debugging question mark icon */}
      {/* Dirt overlay temporarily removed for debugging question mark icon */}
      {/* Clean side (right) */}
      {slider < 100 && (
        <img
          src={CAR_SVG_PATH}
          alt="Clean Car"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            clipPath: `inset(0 0 0 ${slider}%)`,
            transition: 'clip-path 0.2s',
            zIndex: 3,
          }}
          draggable={false}
        />
      )}
      {/* Slider handle and indicator, only if not hidden */}
      {!hideSlider && (
        <>
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={handleSlider}
            style={{
              position: 'absolute',
              left: 0,
              bottom: '-2.5rem',
              width: '100%',
              zIndex: 4,
              accentColor: '#c1ff72',
              height: '2rem',
            }}
          />
          {/* Slider indicator line */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${slider}% - 2px)`,
              top: 0,
              width: '4px',
              height: '100%',
              background: 'linear-gradient(to bottom, #c1ff72, #00ddff)',
              borderRadius: '2px',
              zIndex: 5,
              pointerEvents: 'none',
              transition: 'left 0.2s',
            }}
          />
        </>
      )}
    </div>
  );
};

export default HeroSection; 