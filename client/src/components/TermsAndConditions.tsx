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
          <img src="/Caarvo no back 2.png" alt="Caarvo Logo" className="h-8 w-auto" />
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
          <div className="text-lg text-gray-300 leading-relaxed">
            <p className="text-center text-gray-400 italic">
              Terms and Conditions content will be updated soon.
            </p>
            <p className="text-center text-gray-400 mt-4">
              For any questions regarding our terms, please contact us at:
            </p>
            <div className="text-center mt-6">
              <p className="text-[color:#00ddff]">📞 +91-9203240991</p>
              <p className="text-[color:#00ddff]">📧 support@caarvo.in</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;
