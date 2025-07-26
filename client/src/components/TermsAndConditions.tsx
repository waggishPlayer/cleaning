import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsAndConditions: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-[color:#00ddff] mb-8 text-center">Terms and Conditions</h1>
        
        <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
          <div className="text-lg text-gray-300 leading-relaxed space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-400">Effective Date: 1 May 2025</p>
              <p className="mt-2">These Terms & Conditions govern your use of Caarvo's services. By booking a car wash via our website, app, or phone, you agree to the following terms:</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">1. Service Eligibility</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Services are available only in Indore, Madhya Pradesh.</li>
                <li>Customer must provide accurate address and contact information during booking.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">2. Booking & Payments</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You may pay via advance payment or choose Cash on Delivery (COD) (location-dependent).</li>
                <li>Advance payments confirm your slot with higher priority.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">3. Appointment Timing</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We operate 24×7 except Sundays.</li>
                <li>You must be available or have someone present at the time of booking.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">4. Worker Allocation</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Two trained cleaners are assigned per booking.</li>
                <li>Customers are requested to cooperate with the service team on arrival.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">5. Service Limitations</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We do not guarantee results in case of extreme vehicle neglect, damage, or inaccessible areas.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">6. Cancellation & No-Show</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>See our separate Refund Policy.</li>
                <li>Caarvo reserves the right to cancel appointments in case of unavailability or safety concerns.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">7. Liability</h2>
              <p className="mb-2">Caarvo is not responsible for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Pre-existing vehicle damage</li>
                <li>Delays due to traffic or weather</li>
                <li>Issues caused by customer non-cooperation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">8. Changes to Terms</h2>
              <p>Caarvo may revise these Terms at any time. Continued use of our services implies agreement with updated terms.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;
