import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, motion as motionDiv } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-azure" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    title: 'Fast Booking',
    desc: 'Book your service in seconds.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-azure" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ),
    title: 'Trusted Service',
    desc: 'Thousands of happy customers.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-azure" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg>
    ),
    title: 'Affordable',
    desc: "Premium car cleaning at a price you'll love."
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      {/* Foreground Content */}
      <div className="min-h-screen flex flex-col bg-black text-[color:#00ddff] relative" style={{ zIndex: 1 }}>
        {/* Lime strip at the top */}
        <div className="w-full h-2 bg-[color:#00ddff] fixed top-0 left-0 z-40"></div>
        {showContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center relative w-full max-w-sm">
              <button className="absolute top-2 right-2 text-black text-2xl font-bold" onClick={() => setShowContact(false)}>&times;</button>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black">Contact Us</h2>
              <p className="text-base sm:text-lg text-black mb-2">Phone: <a href="tel:9753644482" className="text-black font-bold">9753644482</a></p>
              <p className="text-base sm:text-lg text-black">Email: <a href="mailto:hello@caarvo.com" className="text-black font-bold">hello@caarvo.com</a></p>
            </div>
          </div>
        )}

        {/* Section 1: Hero Section */}
        <section className="min-h-screen flex flex-col md:flex-row items-end justify-start text-left py-8 sm:py-16 px-4 sm:px-8 relative">
          {/* BMW background image - only for hero section */}
          <img
            src="/bmw image 2.png"
            alt="BMW Background"
            className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none sm:opacity-100 opacity-50 blur-sm sm:blur-none"
            style={{ minHeight: '100vh' }}
            draggable="false"
          />
          {/* Dark overlay for readability - only for hero section */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-black/50 sm:bg-black/30" />
          
          {/* Floating Navbar - only visible in hero section */}
          <nav className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 z-50">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/') }>
              {/* Logo removed as requested */}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="bg-[color:#00ddff] text-black font-bold px-3 sm:px-6 py-2 rounded-xl hover:bg-azure hover:text-black transition text-sm sm:text-base" onClick={() => navigate('/login')}>Sign In</button>
              <button onClick={() => setShowContact(true)} className="bg-black/50 backdrop-blur-sm text-[color:#00ddff] font-bold px-3 sm:px-6 py-2 rounded-xl border-2 border-[color:#00ddff] hover:bg-[color:#00ddff] hover:text-black transition text-sm sm:text-base">Contact Us</button>
            </div>
          </nav>
          <div className="flex-1 flex flex-col items-start justify-end relative z-10 bg-black/10 sm:bg-transparent rounded-2xl p-4 sm:p-0 backdrop-blur-sm sm:backdrop-blur-none max-w-4xl mb-16 sm:mb-24 ml-4 sm:ml-8">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4"
            >
                              <img
                  src="/Caarvo no back 2.png"
                  alt="Caarvo Logo"
                  className="h-[40px] sm:h-[56px] w-auto"
                  style={{
                    filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))',
                    maxHeight: '40px',
                    maxWidth: '100%'
                  }}
                />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-lg sm:text-xl md:text-2xl mb-4 max-w-2xl text-[color:#00ddff] drop-shadow-lg"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)'
              }}
            >
              Car care, delivered at your doorstep.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-base sm:text-lg mb-6 sm:mb-8 max-w-xl text-white font-semibold drop-shadow-lg"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)'
              }}
            >
              Get your car cleaned in as little as one hour—Caarvo brings speed and convenience to your doorstep!
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.07, backgroundColor: '#00ddff', color: '#545454' }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-[color:#00ddff] text-black font-bold px-6 sm:px-10 py-3 sm:py-4 rounded-xl text-lg sm:text-xl hover:bg-customgrey hover:text-black transition"
              onClick={() => navigate('/register')}
            >
              Book Now
            </motion.button>
          </div>
        </section>

        {/* Section 2: 5 Steps of Deep Cleaning */}
        <section className="min-h-screen flex flex-col justify-center bg-black border-4 border-gray-700 py-8 sm:py-16 px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="w-full max-w-6xl mx-auto"
          >
              {/* 5 Steps of Deep Cleaning Section with Lottie animation (static, classic layout) */}
              <div className="w-full">
                {/* Main Heading */}
                <div className="text-center mb-12 lg:mb-16">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[color:#00ddff] mb-4">
                    5 Steps of Deep Cleaning
                  </h3>
                  <p className="text-xl sm:text-2xl md:text-3xl text-white font-semibold">
                    Your Vehicle, Like New Again!
                  </p>
                </div>
                
                {/* Steps List - Single column landscape layout */}
                <div className="flex flex-col gap-8 lg:gap-12">
                  {[
                    { name: 'Pre-Wash Rinse', img: '/pictures/Pre-Wash Rinse.jpg' },
                    { name: 'Foam Soak', img: '/pictures/Foam Soak.webp' },
                    { name: 'Detail Scrubbing', img: '/pictures/Detail Scrubbing.jpg' },
                    { name: 'Interior Vacuum', img: '/pictures/Interior Vacuum & Wipe.jpg' },
                    { name: 'Shine & Finish', img: '/pictures/Shine & Finish.webp' },
                  ].map((step, idx) => (
                    <motion.div
                      key={step.name}
                      className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-12"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, delay: idx * 0.15 }}
                    >
                      {/* Step Number and Heading */}
                      <div className="flex flex-col items-center lg:items-start gap-4 w-full lg:w-auto lg:min-w-[280px] mb-2 lg:mb-0">
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                          <div className="w-12 h-12 bg-[color:#00ddff] rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg flex-shrink-0">
                            {idx + 1}
                          </div>
                          <h4 className="text-xl lg:text-2xl font-bold text-white border-b-2 border-[color:#00ddff] pb-2 text-center lg:text-left">
                            {step.name}
                          </h4>
                        </div>
                      </div>
                      
                      {/* Image Card */}
                      <div className="w-full lg:flex-1">
                        <div 
                          className="relative rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl mx-auto"
                          style={{ height: '250px', minHeight: '250px' }}
                        >
                          <img src={step.img} alt={step.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Section 3: How It Works + Features */}
          <section className="min-h-screen flex flex-col justify-center bg-black py-8 sm:py-16 px-4 sm:px-8">
            <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center">
              <div className="w-full flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-8 text-[color:#00ddff] border-b-4 border-customgrey pb-2 inline-block">How It Works</h2>
                <div className="flex flex-col md:flex-row gap-8 justify-center mb-12">
                  {/* 4 Steps */}
                  {[
                    {
                      title: 'Book Online',
                      desc: 'Choose your service and schedule a time that works for you.',
                      icon: '1',
                    },
                    {
                      title: 'We Arrive',
                      desc: 'Our professionals come to your location and get to work.',
                      icon: '2',
                    },
                    {
                      title: 'Deep Clean',
                      desc: 'We perform a thorough cleaning using top products and techniques.',
                      icon: '3',
                    },
                    {
                      title: 'Enjoy',
                      desc: 'Relax while we make your car shine—fast and hassle-free!',
                      icon: '4',
                    },
                  ].map((step, idx) => (
                    <div
                      key={step.title}
                      className="flex flex-col items-center bg-gradient-to-br from-lime-400/20 via-black to-lime-900/30 border-2 border-lime shadow-2xl rounded-2xl p-8 transition-transform duration-300 hover:scale-105 hover:border-lime-300 hover:shadow-lime-400/40 max-w-xs w-full"
                      style={{ boxShadow: '0 8px 32px 0 rgba(192,255,114,0.18)', borderRadius: '1.5rem' }}
                    >
                      <div className="w-16 h-16 bg-[color:#00ddff] rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">{step.icon}</span>
                      </div>
                      <h4 className="text-xl font-bold text-[color:#00ddff] mb-2 text-center">{step.title}</h4>
                      <p className="text-customgrey text-center">{step.desc}</p>
                    </div>
                  ))}
                </div>
                {/* 3 Feature Cards */}
                <div className="flex flex-col md:flex-row gap-8 justify-center w-full">
                  {[
                    {
                      title: 'Fast Booking',
                      desc: 'Book your car cleaning in seconds with our streamlined process.',
                      icon: (
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[color:#00ddff] mb-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ),
                    },
                    {
                      title: 'Trusted Service',
                      desc: 'Our team is vetted, trained, and trusted by hundreds of happy customers.',
                      icon: (
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[color:#00ddff] mb-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      ),
                    },
                    {
                      title: 'Affordable',
                      desc: 'Premium car care at prices that won’t break the bank.',
                      icon: (
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[color:#00ddff] mb-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8" /></svg>
                      ),
                    },
                  ].map((feature, idx) => (
                    <div
                      key={feature.title}
                      className="bg-black border-2 border-customgrey rounded-2xl p-8 flex flex-col items-center w-full md:w-72 shadow-lg text-center"
                    >
                      <div className="mb-4 flex justify-center w-full">{feature.icon}</div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[color:#00ddff] border-b-4 border-customgrey pb-2 inline-block w-full text-center">{feature.title}</h3>
                      <p className="text-base sm:text-lg text-customgrey w-full text-center">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full bg-black py-8 px-6 sm:px-8 border-t border-gray-800 mt-0">
            <div className="w-full">
              {/* Top Row - Logo and Book Now */}
              <div className="flex justify-between items-center mb-6">
                {/* Logo - Top Left */}
                <div className="flex items-center">
                  <img
                    src="/Caarvo no back 2.png"
                    alt="Caarvo Logo"
                    className="h-[28px] sm:h-[56px] w-auto"
                    style={{
                      filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))',
                      maxHeight: '28px',
                      maxWidth: '100%'
                    }}
                  />
                </div>
                {/* Book Now - Top Right */}
                <button
                  className="bg-[color:#00ddff] text-black font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-base sm:text-lg hover:bg-customgrey hover:text-black transition whitespace-nowrap"
                  onClick={() => navigate('/register')}
                >
                  Book Now
                </button>
              </div>

              {/* Contact Info with Icons - Between Logo and Copyright */}
              <div className="flex justify-center items-center gap-6 mb-6">
                <a href="mailto:hellocaarvo@gmail.com" className="text-[color:#00ddff] hover:text-white transition-colors">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
                <a href="tel:+919203240991" className="text-[color:#00ddff] hover:text-white transition-colors">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/caarvoindore?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-[color:#00ddff] hover:text-white transition-colors">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>

              {/* Policy Links - Between Book Now and Credits */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button 
                  onClick={() => navigate('/privacy-policy')}
                  className="bg-gray-800 text-[color:#00ddff] font-semibold px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 hover:border-[color:#00ddff] transition duration-300"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => navigate('/terms-and-conditions')}
                  className="bg-gray-800 text-[color:#00ddff] font-semibold px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 hover:border-[color:#00ddff] transition duration-300"
                >
                  Terms & Conditions
                </button>
                <button 
                  onClick={() => navigate('/refund-policy')}
                  className="bg-gray-800 text-[color:#00ddff] font-semibold px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 hover:border-[color:#00ddff] transition duration-300"
                >
                  Refund Policy
                </button>
              </div>

              {/* Bottom Row - Copyright & Credits */}
              <div className="flex flex-col sm:flex-row justify-between items-center text-customgrey text-xs">
                <div>2025 Caarvo. All rights reserved.</div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-0">
                  <span>Managed and developed by Ali Asghar Badshah</span>
                  <span className="hidden sm:inline">|</span>
                  <span>Designed by Sandesh Agarwal</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </>
    );
  };

  export default LandingPage; 