import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { ArrowLeft, AlertCircle } from 'react-feather';

const RetryPayment: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!bookingId) {
          setError('Booking ID not found');
          setLoading(false);
          return;
        }

        // Fetch booking details
        const response = await apiService.getBooking(bookingId);
        
        if (response.success && response.data) {
          setBookingDetails(response.data);
        } else {
          setError(response.error || 'Failed to fetch booking details');
        }
      } catch (error: any) {
        setError(error.message || 'Error fetching booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleRetryPayment = async () => {
    setLoading(true);
    try {
      if (!bookingId || !bookingDetails) {
        setError('Booking information is missing');
        setLoading(false);
        return;
      }

      // Create a new PhonePe payment order
      const paymentResponse = await apiService.createPhonePeOrder(bookingId, bookingDetails.price);
      
      if (paymentResponse.success && paymentResponse.data) {
        // Store transaction ID in session storage for reference
        if (paymentResponse.data.transactionId) {
          sessionStorage.setItem('phonePeTransactionId', paymentResponse.data.transactionId);
          sessionStorage.setItem('bookingId', bookingId);
        }
        
        // Redirect to PhonePe payment page
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        setError(paymentResponse.error || 'Failed to create payment order');
        setLoading(false);
      }
    } catch (error: any) {
      setError(error.message || 'Error processing payment');
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold ml-2">Retry Payment</h1>
          </div>
          
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold ml-2">Retry Payment</h1>
          </div>
          
          <div className="text-center">
            <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-red-500 mb-6">{error}</p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleGoToDashboard}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/booking')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Create New Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold ml-2">Retry Payment</h1>
        </div>
        
        {bookingDetails && (
          <div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-3">
                {bookingDetails.vehicle && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">
                      {bookingDetails.vehicle.year} {bookingDetails.vehicle.make} {bookingDetails.vehicle.model}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{bookingDetails.serviceType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(bookingDetails.scheduledDate).toLocaleDateString()} at {bookingDetails.scheduledTime}
                  </span>
                </div>
                
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{bookingDetails.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Your previous payment attempt was unsuccessful. You can retry the payment now.
            </p>

            <button
              onClick={handleRetryPayment}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-4 rounded-lg text-lg font-semibold hover:bg-blue-600 disabled:opacity-50 mb-3"
            >
              {loading ? 'Processing...' : 'Retry Payment'}
            </button>

            <button
              onClick={handleGoToDashboard}
              className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel and Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetryPayment;