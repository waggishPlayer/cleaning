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
        {/* Full-page BMW background image */}
        <img
          src="/bmw image 2.png"
          alt="BMW Background"
          className="fixed inset-0 w-full h-full object-cover z-0 select-none pointer-events-none max-sm:opacity-60 max-sm:blur-sm"
          style={{ minHeight: '100vh' }}
          draggable="false"
        />
        {/* Optional: dark overlay for readability */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-black/40 sm:bg-black/30" style={{ background: undefined }} />
        {/* Lime strip at the top */}
        <div className="w-full h-2 bg-[color:#00ddff] fixed top-0 left-0 z-40"></div>
      {/* Navbar */}
        <nav className="w-full flex justify-between items-center px-8 py-6 relative z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/') }>
            {/* Logo removed as requested */}
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-[color:#00ddff] text-black font-bold px-6 py-2 rounded-xl hover:bg-azure hover:text-black transition" onClick={() => navigate('/login')}>Sign In</button>
            <button onClick={() => setShowContact(true)} className="bg-black text-[color:#00ddff] font-bold px-6 py-2 rounded-xl border-2 border-[color:#00ddff] hover:bg-[color:#00ddff] hover:text-black transition">Contact Us</button>
        </div>
      </nav>
        {showContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center relative min-w-[320px]">
              <button className="absolute top-2 right-2 text-black text-2xl font-bold" onClick={() => setShowContact(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-4 text-black">Contact Us</h2>
              <p className="text-lg text-black mb-2">Phone: <a href="tel:9753644482" className="text-black font-bold">9753644482</a></p>
              <p className="text-lg text-black">Email: <a href="mailto:hello@caarvo.com" className="text-black font-bold">hello@caarvo.com</a></p>
            </div>
          </div>
        )}

        {/* Hero Section with 3D Car Viewer to the right */}
        <section className="relative flex flex-col md:flex-row items-center justify-between flex-1 text-left py-16 px-2 md:px-8 mt-52 w-full overflow-hidden">
          <div className="flex-1 flex flex-col items-start relative z-10">
            <motion.h1
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="font-poppins text-5xl md:text-7xl font-extrabold mb-4 border-b-4 border-customgrey pb-2 inline-block"
            >
              <span className="relative flex flex-col items-start min-h-[120px]">
                <img src="/Caarvo no back 2.png" alt="Caarvo Logo" className="h-[56px] w-auto mb-2" style={{maxHeight: 56}} />
                <span className="relative z-10 text-white text-2xl md:text-3xl font-extrabold mt-2 ml-2">for that showroom clean look</span>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-xl md:text-2xl mb-4 max-w-2xl text-[color:#00ddff]"
            >
              Car care, delivered at your doorstep.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-lg mb-8 max-w-xl text-customgrey font-semibold"
            >
              Get your car cleaned in as little as one hour—Caarvo brings speed and convenience to your doorstep!
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.07, backgroundColor: '#00ddff', color: '#545454' }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-[color:#00ddff] text-black font-bold px-10 py-4 rounded-xl text-xl hover:bg-customgrey hover:text-black transition"
              onClick={() => navigate('/register')}
            >
              Book Now
            </motion.button>
            {/* Everything below Book Now is wrapped in a solid black background, truly full width, with a grey border and entrance animation */}
            <motion.div
              initial={{ opacity: 0, x: -120 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="absolute left-0 top-auto w-full bg-black border-4 border-gray-700 rounded-2xl mt-40"
              style={{ position: 'relative', left: 0, width: '100%' }}
            >
              {/* 5 Steps of Deep Cleaning Section with Lottie animation (static, classic layout) */}
              <div className="w-full mt-10 flex flex-col lg:flex-row gap-8 items-stretch" style={{ marginLeft: 0 }}>
                <div className="flex-1 bg-black rounded-2xl p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-[color:#00ddff] text-left">
                      5 Steps of Deep Cleaning
                    </h3>
                    <p className="text-xl md:text-2xl text-white font-semibold mt-2 text-left">Your Vehicle, Like New Again!</p>
                  </div>
                  <div className="flex flex-col gap-6">
                    {[
                      { name: 'Pre-Wash Rinse', img: '/pictures/Pre-Wash Rinse.jpg' },
                      { name: 'Foam Soak', img: '/pictures/Foam Soak.webp' },
                      { name: 'Detail Scrubbing', img: '/pictures/Detail Scrubbing.jpg' },
                      { name: 'Interior Vacuum & Wipe', img: '/pictures/Interior Vacuum & Wipe.jpg' },
                      { name: 'Shine & Finish', img: '/pictures/Shine & Finish.webp' },
                    ].map((step, idx) => (
                      <motion.div
                        key={step.name}
                        className="relative rounded-none shadow-xl overflow-hidden w-full left-0"
                        style={{ height: 320 }}
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, delay: idx * 0.1 }}
                      >
                        <img src={step.img} alt={step.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center text-[color:#00ddff] font-bold text-2xl md:text-3xl text-center drop-shadow-lg" style={{textShadow: '0 2px 8px #000, 0 0px 2px #000'}}>{step.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Lottie Animation below the 5 steps, centered on all screens */}
                {/* Removed car animation here */}
              </div>
              {/* Everything else below Book Now remains inside this black background */}
              {/* Features Section, Testimonials, etc. */}

              {/* Features Section */}
              <motion.section
                className="w-full flex flex-col items-center py-12 relative overflow-hidden"
                initial={{ opacity: 0, x: -120 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                {/* Sliding black background */}
                <motion.div
                  className="absolute inset-0 w-full h-full bg-black z-0 rounded-2xl shadow-2xl"
                  initial={{ x: '-100%' }}
                  whileInView={{ x: 0 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                />
                <motion.div
                  className="flex flex-col md:flex-row gap-8 justify-center items-center relative z-10"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.18
                      }
                    }
                  }}
                >
                  {features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-black border-2 border-customgrey rounded-2xl p-8 flex flex-col items-center w-72 shadow-lg text-center"
                      variants={{
                        hidden: { opacity: 0, y: 40 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.7, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.04, boxShadow: '0 8px 32px #c1ff72' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="mb-4 flex justify-center w-full">{feature.icon}</div>
                      <h3 className="text-2xl font-bold mb-2 text-[color:#00ddff] border-b-4 border-customgrey pb-2 inline-block w-full text-center">{feature.title}</h3>
                      <p className="text-lg text-customgrey w-full text-center">{feature.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>

                {/* How It Works Section */}
                <motion.section
                  className="w-full flex flex-col items-center py-12 bg-black relative overflow-hidden"
                  initial={{ opacity: 0, x: -120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  <motion.div
                    className="absolute inset-0 w-full h-full bg-black z-0 rounded-2xl shadow-2xl"
                    initial={{ x: '-100%' }}
                    whileInView={{ x: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                  />
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <h2 data-aos="fade-right" className="text-3xl font-bold mb-8 text-[color:#00ddff] border-b-4 border-customgrey pb-2 inline-block">How It Works</h2>
                    <div className="flex flex-col md:flex-row gap-8 justify-center">
                      <div className="flex flex-col items-center bg-gradient-to-br from-lime-400/20 via-black to-lime-900/30 border-2 border-lime shadow-2xl rounded-2xl p-8 transition-transform duration-300 hover:scale-105 hover:border-lime-300 hover:shadow-lime-400/40" data-aos="fade-up" style={{boxShadow: '0 8px 32px 0 rgba(192,255,114,0.18)', borderRadius: '1.5rem'}}>
                        <div className="w-16 h-16 bg-[color:#00ddff] rounded-full flex items-center justify-center mb-4 shadow-lg">
                          <span className="text-white font-bold text-2xl">1</span>
                        </div>
                        <h4 className="text-xl font-bold text-[color:#00ddff] mb-2">Book Online</h4>
                        <p className="text-customgrey">Choose your service and schedule a time that works for you.</p>
                      </div>
                      <div className="flex flex-col items-center bg-gradient-to-br from-lime-400/20 via-black to-lime-900/30 border-2 border-lime shadow-2xl rounded-2xl p-8 transition-transform duration-300 hover:scale-105 hover:border-lime-300 hover:shadow-lime-400/40" data-aos="fade-up" data-aos-delay="100" style={{boxShadow: '0 8px 32px 0 rgba(192,255,114,0.18)', borderRadius: '1.5rem'}}>
                        <div className="w-16 h-16 bg-[color:#00ddff] rounded-full flex items-center justify-center mb-4 shadow-lg">
                          <span className="text-white font-bold text-2xl">2</span>
                        </div>
                        <h4 className="text-xl font-bold text-[color:#00ddff] mb-2">We Arrive</h4>
                        <p className="text-customgrey">Our professionals come to your location and get to work.</p>
                      </div>
                      <div className="flex flex-col items-center bg-gradient-to-br from-lime-400/20 via-black to-lime-900/30 border-2 border-lime shadow-2xl rounded-2xl p-8 transition-transform duration-300 hover:scale-105 hover:border-lime-300 hover:shadow-lime-400/40" data-aos="fade-up" data-aos-delay="200" style={{boxShadow: '0 8px 32px 0 rgba(192,255,114,0.18)', borderRadius: '1.5rem'}}>
                        <div className="w-16 h-16 bg-[color:#00ddff] rounded-full flex items-center justify-center mb-4 shadow-lg">
                          <span className="text-white font-bold text-2xl">3</span>
                        </div>
                        <h4 className="text-xl font-bold text-[color:#00ddff] mb-2">Enjoy</h4>
                        <p className="text-customgrey">Relax while we make your car shine—fast and hassle-free!</p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Testimonials Section */}
                <motion.section
                  className="w-full flex flex-col items-center py-12 bg-black relative overflow-hidden"
                  initial={{ opacity: 0, x: -120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  <motion.div
                    className="absolute inset-0 w-full h-full bg-black z-0 rounded-2xl shadow-2xl"
                    initial={{ x: '-100%' }}
                    whileInView={{ x: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                  />
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <h2 data-aos="fade-right" className="text-3xl font-bold mb-8 text-[color:#00ddff] border-b-4 border-customgrey pb-2 inline-block">What Our Customers Say</h2>
                    <div className="flex flex-col md:flex-row gap-8 justify-center">
                      <div className="bg-black border border-lime rounded-2xl p-6 w-80 shadow-md" data-aos="fade-up">
                        <p className="text-lg text-lime mb-2">“Super fast and so convenient! My car was spotless in under an hour.”</p>
                        <span className="text-customgrey font-semibold">— Priya S.</span>
                      </div>
                      <div className="bg-black border border-lime rounded-2xl p-6 w-80 shadow-md" data-aos="fade-up" data-aos-delay="100">
                        <p className="text-lg text-lime mb-2">“Caarvo is the best car care service I’ve ever used. Highly recommend!”</p>
                        <span className="text-customgrey font-semibold">— Rahul M.</span>
                      </div>
                      <div className="bg-black border border-lime rounded-2xl p-6 w-80 shadow-md" data-aos="fade-up" data-aos-delay="200">
                        <p className="text-lg text-lime mb-2">“Affordable, professional, and right at my doorstep. Love it!”</p>
                        <span className="text-customgrey font-semibold">— Ayesha K.</span>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Contact/Support Callout */}
                <motion.section
                  className="w-full flex flex-col items-center py-8 bg-black relative overflow-hidden"
                  initial={{ opacity: 0, x: -120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  <motion.div
                    className="absolute inset-0 w-full h-full bg-black z-0 rounded-2xl shadow-2xl"
                    initial={{ x: '-100%' }}
                    whileInView={{ x: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                  />
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="bg-[color:#00ddff] rounded-2xl px-8 py-6 shadow-lg flex flex-col md:flex-row items-center gap-4" data-aos="fade-up">
                      <span className="text-black text-lg font-bold">Need help or have questions?</span>
                      <a href="mailto:support@caarvo.com" className="text-customgrey font-bold underline">Contact us at support@caarvo.com</a>
                    </div>
                  </div>
                </motion.section>

                {/* FAQ Section */}
                <motion.section
                  className="w-full flex flex-col items-center py-12 bg-black relative overflow-hidden"
                  initial={{ opacity: 0, x: -120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  <motion.div
                    className="absolute inset-0 w-full h-full bg-black z-0 rounded-2xl shadow-2xl"
                    initial={{ x: '-100%' }}
                    whileInView={{ x: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                  />
                  <div className="relative z-10 w-full flex flex-col items-center">
                    {/* FAQ content here */}
                  </div>
                </motion.section>

                {/* Footer */}
                <motion.footer
                  className="w-full flex flex-col items-center py-6 bg-black relative overflow-hidden"
                  initial={{ opacity: 0, x: -120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  {/* Book Now button above logo */}
                  <button
                    className="bg-[color:#00ddff] text-black font-bold px-10 py-4 rounded-xl text-xl hover:bg-customgrey hover:text-black transition mb-6"
                    onClick={() => navigate('/register')}
                  >
                    Book Now
                  </button>
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2 justify-center w-full">
                      <span className="relative z-10 text-2xl font-bold text-center">Caarvo</span>
                    </div>
                    <a href="mailto:support@caarvo.com" className="text-customgrey hover:underline">support@caarvo.com</a>
                    
                    {/* Policy Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-4">
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
                    
                    <div className="text-center text-customgrey mt-4 text-sm">&copy; {new Date().getFullYear()} Caarvo. All rights reserved.</div>
                  </div>
                </motion.footer>
            </motion.div>
          </div>
        </section>
    </div>
    </>
  );
};

export default LandingPage; 