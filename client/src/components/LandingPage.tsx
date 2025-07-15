import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    title: 'Eco-Friendly Cleaning',
    desc: 'We use biodegradable products that are safe for your vehicle and the environment.',
    color: 'from-green-500 to-emerald-600',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
    benefits: ['100% Biodegradable', 'Safe for Environment', 'Non-toxic Formula']
  },
  {
    title: 'Mobile Service',
    desc: 'We come to you! Home, office, or anywhere convenient.',
    color: 'from-blue-500 to-cyan-600',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-5 5m0 0l-5-5m5 5v-13" />
      </svg>
    ),
    benefits: ['Doorstep Service', 'No Travel Required', 'Flexible Scheduling']
  },
  {
    title: 'Fleet Discounts',
    desc: 'Special pricing for businesses and multiple vehicles.',
    color: 'from-purple-500 to-indigo-600',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    benefits: ['Bulk Discounts', 'Business Friendly', 'Volume Pricing']
  },
  {
    title: 'Premium Detailing',
    desc: 'Complete interior and exterior detailing for the ultimate shine.',
    color: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    benefits: ['Deep Cleaning', 'Paint Protection', 'Interior Detailing']
  },
];

const howItWorks = [
  {
    step: 'Book Online',
    desc: 'Choose your service and schedule a time that works for you.',
  },
  {
    step: 'We Clean',
    desc: 'Our professionals arrive and clean your vehicle with care.',
  },
  {
    step: 'Enjoy',
    desc: 'Drive away in a spotless, refreshed vehicle!',
  },
];

const whyChooseUs = [
  'Trained and background-checked professionals',
  'Satisfaction guaranteed or your money back',
  'Flexible scheduling and easy online booking',
  'Fully insured and eco-conscious',
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navbar */}
      <nav className="navbar" style={{ background: '#000', borderBottom: 'none', boxShadow: 'none' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-28 h-12 bg-black rounded-3xl overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Caarvo Logo" className="h-full w-auto object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" onClick={() => navigate('/login')}>Login</button>
            <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative section pt-8 pb-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-shadow-lg gradient-text">Caarvo</h1>
            <p className="text-xl md:text-2xl text-lime-400 mb-8 max-w-3xl mx-auto">
              Professional vehicle cleaning services that come to you. Experience the ultimate in convenience, quality, and eco-friendly care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                className="btn-primary text-lg px-8 py-4 animate-pulse-slow"
                onClick={() => navigate('/register')}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Book Now - It's Free!
              </button>
              <button className="btn-outline text-lg px-8 py-4">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Learn More
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-lime-400 mb-2">1000+</div>
              <div className="text-white">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-lime-400 mb-2">24/7</div>
              <div className="text-white">Service Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-lime-400 mb-2">100%</div>
              <div className="text-white">Eco-Friendly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="section bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">Our Services</h2>
            <p className="text-xl text-lime-400 max-w-3xl mx-auto">
              From basic washes to premium detailing, we offer comprehensive cleaning solutions for all your vehicle needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="feature-card bg-black border-lime-400">
                <div className="feature-icon" style={{background: 'linear-gradient(135deg, #c1ff72 0%, #00ddff 100%)'}}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-lime-400 text-center mb-4">{service.desc}</p>
                <div className="space-y-2">
                  {service.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-azure-400">
                      <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-lime-400 max-w-3xl mx-auto">
              Getting your vehicle cleaned has never been easier. Follow these simple steps to book your service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="card text-center bg-black">
                  <div className="w-16 h-16 bg-lime-400 rounded-3xl flex items-center justify-center text-black font-bold text-2xl mb-6 mx-auto animate-bounce-slow">
                    {idx + 1}
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">{step.step}</h4>
                  <p className="text-lime-400">{step.desc}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-lime-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">Why Choose Caarvo?</h2>
            <p className="text-xl text-lime-400 max-w-3xl mx-auto">
              We're committed to providing exceptional service that exceeds your expectations every time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyChooseUs.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-black border border-lime-400 rounded-2xl">
                <div className="w-8 h-8 bg-lime-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg text-white font-medium">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-28 h-12 bg-black rounded-3xl overflow-hidden flex items-center justify-center">
                  <img src="/logo.png" alt="Caarvo Logo" className="h-full w-auto object-contain" />
                </div>
              </div>
              <p className="text-lime-400 mb-4">
                Professional vehicle cleaning services that come to you. Experience the ultimate in convenience, quality, and eco-friendly care.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-lime-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-lime-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-lime-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-lime-400">Services</h3>
              <ul className="space-y-2 text-white">
                <li><a href="#" className="hover:text-lime-400 transition-colors">Basic Wash</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Premium Detailing</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Fleet Services</a></li>
                <li><a href="#" className="hover:text-lime-400 transition-colors">Mobile Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-lime-400">Contact</h3>
              <ul className="space-y-2 text-white">
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@caarvo.com</li>
                <li>Hours: 7AM - 9PM Daily</li>
                <li>Emergency: 24/7 Available</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SparkleWash. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 