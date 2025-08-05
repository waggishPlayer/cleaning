import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'react-feather';

const PaymentStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [error, setError] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get transaction ID from URL query params
        const params = new URLSearchParams(location.search);
        const transactionId = params.get('transactionId');

        // Try to get transaction ID from session storage if not in URL
        const storedTransactionId = sessionStorage.getItem('phonePeTransactionId');
        
        const finalTransactionId = transactionId || storedTransactionId;

        console.log('%c PAYMENT STATUS CHECK', 'background: #ff0000; color: #ffffff; font-size: 20px');
        console.log('Transaction ID from URL:', transactionId);
        console.log('Transaction ID from session storage:', storedTransactionId);
        console.log('Final Transaction ID being used:', finalTransactionId);

        if (!finalTransactionId) {
          console.error('No transaction ID found in URL or session storage');
          setError('Transaction ID not found. Please contact support if you believe this is an error.');
          setStatus('failed');
          return;
        }

        // Check payment status from PhonePe SDK
        console.log('Calling checkPhonePeSdkStatus with transaction ID:', finalTransactionId);
        const response = await apiService.checkPhonePeSdkStatus(finalTransactionId);
        console.log('PhonePe status response:', response);

        if (response.success && response.data) {
          setBookingDetails(response.data.booking);
          console.log('Booking details:', response.data.booking);
          console.log('Payment status:', response.data.paymentStatus);
          console.log('PhonePe status:', response.data.phonePeStatus);
          
          if (response.data.paymentStatus === 'completed' || response.data.phonePeStatus === 'SUCCESS') {
            console.log('Payment successful, setting status to success');
            setStatus('success');
            // Clear transaction ID from session storage on successful payment
            sessionStorage.removeItem('phonePeTransactionId');
            sessionStorage.removeItem('bookingId');
          } else if (response.data.paymentStatus === 'failed' || response.data.phonePeStatus === 'FAILED') {
            console.log('Payment failed, setting status to failed');
            setStatus('failed');
          } else {
            // If status is still pending, set up a retry mechanism
            console.log('Payment pending, setting up retry mechanism');
            setStatus('pending');
            
            // Set up a timer to check again after 5 seconds if status is pending
            const timer = setTimeout(() => {
              console.log('Retrying payment status check after timeout');
              checkPaymentStatus();
            }, 5000);
            
            // Clean up timer on component unmount
            return () => clearTimeout(timer);
          }
        } else {
          console.error('Failed to check payment status:', response.error);
          setError(response.error || 'Failed to check payment status. Please try again or contact support.');
          setStatus('failed');
        }
      } catch (error: any) {
        console.error('Error checking payment status:', error);
        setError(error.message || 'Error checking payment status. Please try again later.');
        setStatus('failed');
      }
    };

    checkPaymentStatus();
  }, [location]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Checking Payment Status</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your booking has been confirmed.</p>
            
            {bookingDetails && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Service:</span> {bookingDetails.serviceType}</p>
                  <p><span className="font-medium">Date:</span> {new Date(bookingDetails.scheduledDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {bookingDetails.scheduledTime}</p>
                  <p><span className="font-medium">Amount:</span> ₹{bookingDetails.price}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleGoToDashboard}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );

      case 'failed':
        // Get booking ID from session storage if available
        const bookingId = sessionStorage.getItem('bookingId');
        
        return (
          <div className="text-center">
            <XCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-2">Your payment could not be processed.</p>
            {error && <p className="text-red-500 mb-6">{error}</p>}
            
            <div className="flex flex-col space-y-3">
              {bookingId ? (
                <button
                  onClick={() => {
                    // If we have the booking ID, we can try to initiate payment again
                    navigate(`/retry-payment/${bookingId}`);
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry Payment
                </button>
              ) : (
                <button
                  onClick={() => navigate('/booking')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create New Booking
                </button>
              )}
              <button
                onClick={handleGoToDashboard}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = 'mailto:support@caarvo.com?subject=Payment%20Issue&body=Transaction%20ID:%20' + (sessionStorage.getItem('phonePeTransactionId') || 'Not%20Available')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <AlertCircle className="text-yellow-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Pending</h2>
            <p className="text-gray-600 mb-6">Your payment is being processed. Please check back later.</p>
            
            <button
              onClick={handleGoToDashboard}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold ml-2">Payment Status</h1>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentStatus;