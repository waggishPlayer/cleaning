import React, { useState, useRef } from 'react';

const CAR_SVG_PATH = '/car.svg';
const DIRT_OVERLAY_URL = 'https://www.pngall.com/wp-content/uploads/5/Grunge-PNG-Image.png'; // transparent dirt overlay

const HeroSection: React.FC<{ small?: boolean; hideSlider?: boolean; initialSlider?: number }> = ({ small, hideSlider = false, initialSlider = 50 }) => {
  const [slider, setSlider] = useState(initialSlider); // percent clean
  const containerRef = useRef<HTMLDivElement>(null);

  // Dirty filter: sepia + brightness + contrast
  const dirtyFilter = 'sepia(0.7) brightness(0.8) contrast(1.1)';

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
      {/* Dirt overlay (left) */}
      <img
        src={DIRT_OVERLAY_URL}
        alt="Dirt Overlay"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          opacity: 0.7,
          mixBlendMode: 'multiply',
          clipPath: `inset(0 ${100 - slider}% 0 0)`,
          transition: 'clip-path 0.2s',
          zIndex: 2,
        }}
        draggable={false}
      />
      {/* Clean side (right) */}
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