import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="w-full h-2 bg-[color:#00ddff]"></div>
      <nav className="w-full flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="bg-[color:#00ddff] text-black font-bold px-6 py-2 rounded-xl hover:bg-customgrey transition"
        >
          Back to Home
        </button>
      </nav>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-8 py-12"
      >
        <h1 className="text-4xl font-bold text-[color:#00ddff] mb-8 text-center">Privacy Policy</h1>
        
        <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
          <div className="text-lg text-gray-300 leading-relaxed space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-400">Effective Date: 1 May 2025</p>
              <p className="mt-2">At Caarvo, your privacy is important. This Privacy Policy explains how we collect, use, and protect your personal data.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">1. Information We Collect</h2>
              <p className="mb-2">We collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Name</li>
                <li>Phone number</li>
                <li>Vehicle details</li>
                <li>Location and service preferences</li>
                <li>Booking and feedback history</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">2. How We Use Your Data</h2>
              <p className="mb-2">Your data helps us:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Deliver and manage car wash bookings</li>
                <li>Send updates, confirmations, and offers</li>
                <li>Improve service and respond to support requests</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">3. Data Protection</h2>
              <p className="mb-2">We use:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>SSL encryption</li>
                <li>Secure cloud servers</li>
                <li>Limited access controls</li>
              </ul>
              <p className="mt-2">Your data is never sold or exposed without consent.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">4. Third-Party Sharing</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We share your data only with essential partners (e.g., payment gateways, SMS/email services).</li>
                <li>We do not sell your data to advertisers or external agencies.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">5. Cookies</h2>
              <p>Our website uses cookies for performance and personalization. You may control these via browser settings.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">6. Your Rights</h2>
              <p className="mb-2">You may request:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access to your data</li>
                <li>Correction of inaccurate info</li>
                <li>Deletion of your data</li>
              </ul>
              <p className="mt-2">Email us anytime at support@caarvo.in for such requests.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
