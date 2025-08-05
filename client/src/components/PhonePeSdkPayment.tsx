import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Typography, Box, Alert } from '@mui/material';
import apiService from '../services/api';
import { Booking } from '../types';

interface PhonePeSdkPaymentProps {
  booking: Booking;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const PhonePeSdkPayment: React.FC<PhonePeSdkPaymentProps> = ({ booking, onSuccess, onError }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Initiating PhonePe SDK payment for booking:', booking._id);
      
      // Call the API to create a PhonePe SDK order
      const response = await apiService.createPhonePeSdkOrder(
        booking._id,
        booking.price
      );

      console.log('PhonePe SDK payment response:', response);

      if (response.success && response.data) {
        // Standard response format
        if (response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
          return;
        }
        
        // Handle different response formats with type assertions
        const responseData = response.data as any;
        
        // Check for instrumentResponse format
        if (responseData.instrumentResponse && 
            responseData.instrumentResponse.redirectInfo && 
            responseData.instrumentResponse.redirectInfo.url) {
          window.location.href = responseData.instrumentResponse.redirectInfo.url;
          return;
        }
        
        // Check for sample app format
        if (responseData.checkoutPageUrl) {
          window.location.href = responseData.checkoutPageUrl;
          return;
        }
        
        throw new Error('Invalid payment response format');
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (err: any) {
      console.error('Error initiating PhonePe SDK payment:', err);
      setError(err.message || 'Failed to initiate payment');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        onClick={handlePayment}
        sx={{
          backgroundColor: '#5f259f', // PhonePe purple color
          '&:hover': {
            backgroundColor: '#4a1d7a',
          },
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <>
            Pay with PhonePe SDK
          </>
        )}
      </Button>
      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
        You will be redirected to PhonePe to complete the payment
      </Typography>
    </Box>
  );
};

export default PhonePeSdkPayment;