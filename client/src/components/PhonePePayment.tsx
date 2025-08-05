import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

interface PhonePePaymentProps {
  bookingId: string;
  amount: number;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const PhonePePayment: React.FC<PhonePePaymentProps> = ({
  bookingId,
  amount,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Initiating PhonePe payment for booking:', bookingId, 'amount:', amount);
      
      // Generate a unique transaction ID
      const merchantTransactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Call the phone-pe API to create payment
      const response = await fetch('/api/phonepe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          merchantTransactionId,
          bookingId
        })
      });

      const result = await response.json();
      console.log('PhonePe payment response:', result);

      if (result.success && result.data) {
        // Store transaction ID in session storage for reference
        sessionStorage.setItem('phonePeTransactionId', result.data.transactionId);
        sessionStorage.setItem('bookingId', bookingId);
        
        console.log('Payment initiated successfully, redirecting to:', result.data.paymentUrl);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data.transactionId);
        }
        
        // Redirect to PhonePe payment page
        window.location.href = result.data.paymentUrl;
      } else {
        const errorMessage = result.message || result.error || 'Failed to initiate payment';
        console.error('Payment initiation failed:', errorMessage);
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error initiating PhonePe payment:', error);
      const errorMessage = error.message || 'Network error. Please try again.';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
        <p className="text-gray-600">Secure payment via PhonePe</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium text-gray-900">{bookingId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="font-bold text-xl text-green-600">₹{amount}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={initiatePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Pay ₹{amount} with PhonePe
            </>
          )}
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured by PhonePe's industry-standard encryption
        </p>
      </div>
    </div>
  );
};

export default PhonePePayment; 