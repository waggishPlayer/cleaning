import React, { useRef, useState } from 'react';
import HeroSection from './HeroSection';
import { useNavigate } from 'react-router-dom';
// Add Framer Motion for animation
import { motion, AnimatePresence, circInOut } from 'framer-motion';

const howItWorksSteps = [
  {
    title: 'Book Online',
    desc: 'Choose your service and schedule a time that works for you.',
    icon: (
      <svg width="36" height="36" fill="none" stroke="#c1ff72" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    ),
  },
  {
    title: 'We Arrive',
    desc: 'Our professionals come to your location, fully equipped.',
    icon: (
      <svg width="36" height="36" fill="none" stroke="#00ddff" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="3"/><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>
    ),
  },
  {
    title: 'We Clean',
    desc: 'Your vehicle is cleaned with care and eco-friendly products.',
    icon: (
      <svg width="36" height="36" fill="none" stroke="#c1ff72" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 17v-2a4 4 0 014-4h8a4 4 0 014 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
  },
  {
    title: 'Enjoy',
    desc: 'Drive away in a spotless, refreshed vehicle!',
    icon: (
      <svg width="36" height="36" fill="none" stroke="#00ddff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
    ),
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<'hero' | 'howitworks'>('hero');
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [prevSection, setPrevSection] = useState<'hero' | 'howitworks'>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const direction = section === 'howitworks' && prevSection === 'hero' ? 1 : -1;

  // Always show the slider on all devices
  const showSlider = true;

  // Handle wheel for horizontal transition only between hero/howitworks
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) {
        e.preventDefault();
        return;
      }
      if (section === 'hero' && e.deltaY > 0) {
        setIsTransitioning(true);
        setSection('howitworks');
        e.preventDefault();
      } else if (section === 'howitworks' && e.deltaY < 0 && window.scrollY < 10) {
        setIsTransitioning(true);
        setSection('hero');
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [section, isTransitioning]);

  // Remove scrollIntoView logic to allow natural vertical scroll up/down

  // AnimatePresence variants for horizontal slide
  const variants = {
    initial: (direction: number) => ({ x: direction > 0 ? '100vw' : '-100vw', opacity: 1 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.7, ease: circInOut } },
    exit: (direction: number) => ({ x: direction > 0 ? '-100vw' : '100vw', opacity: 1, transition: { duration: 0.7, ease: circInOut } }),
  };
  React.useEffect(() => { setPrevSection(section); }, [section]);

  // Animation complete handler
  const handleAnimationComplete = () => {
    setIsTransitioning(false);
  };

  // Lock scroll only for hero section
  React.useEffect(() => {
    if (section === 'hero') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [section]);

  return (
    <div
      className="min-h-screen flex flex-col bg-black"
      style={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        overflowY: section === 'hero' ? 'hidden' : 'auto',
      }}
    >
      {/* Fixed Logo at the top center */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 30,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.2rem 0 1.2rem 0',
          background: 'transparent',
          pointerEvents: 'none',
        }}
        className="md:pt-14 md:pb-10 pt-6 pb-3"
      >
        <img
          src="/logo.png"
          alt="Caarvo Logo"
          style={{
            height: 'clamp(48px, 12vw, 90px)',
            width: 'clamp(120px, 60vw, 340px)',
            objectFit: 'contain',
            borderRadius: 9999,
            display: 'block',
            background: 'transparent',
            boxShadow: '0 2px 24px 0 rgba(0,0,0,0.08)',
          }}
        />
      </div>
      {/* Section 1 & 2: Snap full screen, horizontal animation */}
      <div style={{ position: 'relative', width: '100%', minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', marginTop: 0, scrollSnapAlign: 'start' }}>
        <AnimatePresence custom={direction} initial={false} mode="sync">
          {section === 'hero' && (
            <motion.div
              key="hero"
              custom={1}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              onAnimationComplete={handleAnimationComplete}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', minHeight: '100vh', height: '100vh', background: 'black', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', scrollSnapAlign: 'start' }}
            >
              {/* Main two-column layout */}
              <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto items-center justify-center flex-1 px-4 md:px-0" style={{ gap: '2rem', marginTop: 0, marginBottom: 0, flexGrow: 1, minHeight: 0, paddingTop: 60 }}>
                {/* Left: Content */}
                <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left mt-[32vh] md:mt-0" style={{ flex: 1, color: '#fff', maxWidth: 520, gap: '2rem' }}>
                  <h1 style={{ color: '#c1ff72', fontSize: '2.1rem', fontWeight: 800, marginBottom: 0, lineHeight: 1.08 }} className="md:text-5xl text-3xl">Get Started with Caarvo</h1>
                  <p style={{ color: '#00ddff', fontSize: '1.1rem', marginBottom: 0, lineHeight: 1.5 }} className="md:text-xl text-base">
                    Professional vehicle cleaning services that come to you. Experience the ultimate in convenience, quality, and eco-friendly care.
                  </p>
                  <div className="flex gap-4 md:gap-6 mt-2">
                    <button className="btn-primary" style={{ minWidth: 120, fontSize: '1rem', padding: '0.8rem 1.5rem' }} onClick={() => navigate('/register')}>Get Started</button>
                  </div>
                </div>
                {/* Right: Car slider (bigger) */}
                <div className="flex flex-col items-center justify-center w-full md:w-auto" style={{ flex: 1, minWidth: 0, maxWidth: 700, marginLeft: 0, marginTop: '1rem', marginBottom: 0 }}>
                  <HeroSection small={false} hideSlider={!showSlider} initialSlider={75} />
                  {showSlider && (
                    <div
                      style={{
                        color: '#c1ff72',
                        marginTop: '2.2rem',
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        fontWeight: 600,
                        letterSpacing: 0.2,
                      }}
                      className="md:mt-8 mt-6"
                    >
                      Slide to clean the car!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {section === 'howitworks' && (
            <motion.div
              key="howitworks"
              ref={howItWorksRef}
              custom={1}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              onAnimationComplete={handleAnimationComplete}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                minHeight: '100vh',
                height: '100vh',
                background: 'black',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 'clamp(120px, 22vw, 180px)', // more gap from logo on mobile
                scrollSnapAlign: 'start',
              }}
            >
              <h2 style={{ color: '#c1ff72', fontSize: '2.5rem', fontWeight: 800, marginBottom: '2.5rem', letterSpacing: 0.5 }}>How It Works</h2>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '2.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 1200 }} className="mt-8 md:mt-0">
                {howItWorksSteps.map((step, idx) => (
                  <div key={idx} style={{ background: '#18181b', borderRadius: '2rem', boxShadow: '0 4px 32px 0 rgba(0,221,255,0.08)', padding: '2.2rem 2rem', minWidth: 220, maxWidth: 270, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: idx % 2 === 0 ? '2px solid #c1ff72' : '2px solid #00ddff' }}>
                    <div style={{ marginBottom: '1.2rem' }}>{step.icon}</div>
                    <h3 style={{ color: idx % 2 === 0 ? '#c1ff72' : '#00ddff', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.7rem', textAlign: 'center' }}>{step.title}</h3>
                    <p style={{ color: '#fff', fontSize: '1.05rem', textAlign: 'center', lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Section 3: About Us + Footer, normal scrollable */}
      <div
        ref={aboutRef}
        style={{
          width: '100%',
          background: 'black',
          minHeight: '100vh',
          paddingTop: 'clamp(100px, 22vw, 160px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="relative"
      >
        {/* On mobile, add extra margin-top to push About Us below logo and ensure full screen */}
        <div className="block md:hidden" style={{ minHeight: 'calc(100vh - 110px)', marginTop: '0' }}></div>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', marginTop: '0' }}>
          <h2 style={{ color: '#c1ff72', fontSize: '2rem', fontWeight: 800, marginBottom: '1.2rem', letterSpacing: 0.5 }} className="md:text-4xl text-2xl">About Us</h2>
          <div style={{ color: '#fff', fontSize: '1.05rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.6, fontWeight: 500 }} className="md:text-lg text-base">
            Caarvo is dedicated to providing premium, eco-friendly vehicle cleaning services at your doorstep. Our mission is to deliver convenience, quality, and care for your car and the environment. With a team of passionate professionals and a commitment to customer satisfaction, we make car care effortless and enjoyable.
          </div>
        </div>
        <footer style={{ minHeight: '25vh', width: '100%', background: '#111', color: '#c1ff72', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', borderTop: '2px solid #222', padding: '1.5rem 0' }} className="md:text-lg text-base">
          &copy; {new Date().getFullYear()} Caarvo. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 