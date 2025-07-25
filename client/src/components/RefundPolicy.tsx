import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RefundPolicy: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-[color:#00ddff] mb-8 text-center">Refund Policy</h1>
        
        <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
          <div className="text-lg text-gray-300 leading-relaxed space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-400">Effective Date: 1 May 2025</p>
              <p className="mt-2">At Caarvo, we aim to offer a smooth and transparent service experience. This Refund Policy outlines the conditions under which refunds are applicable for our doorstep car wash services.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">1. Cancellations by Customers</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>100% refund will be issued for cancellations made at least 1 hour before the scheduled service time (for advance payments only).</li>
                <li>No refund will be provided for cancellations made within 1 hour of the scheduled appointment.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">2. Cancellations by Caarvo</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If Caarvo is unable to provide the service for any reason, a full refund (if prepaid) will be processed within 7 business days.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">3. Cash on Delivery (COD) Bookings</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>COD bookings cancelled by us will not be charged.</li>
                <li>No refund is applicable on COD payments as no advance amount is collected.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">4. Refund Method</h2>
              <p className="mb-2">Refunds (if applicable) are processed to the original payment method:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>UPI / Net Banking</li>
                <li>Credit/Debit Card</li>
                <li>Wallets</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[color:#00ddff] mb-3">5. Contact for Refunds</h2>
              <p className="mb-4">For refund-related support:</p>
              <div className="bg-black rounded-xl p-4 border border-[color:#00ddff]">
                <p className="text-[color:#00ddff]">📞 +91-9203240991</p>
                <p className="text-[color:#00ddff]">📧 support@caarvo.in</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RefundPolicy;
