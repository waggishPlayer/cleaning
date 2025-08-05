import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Typography, Box, Alert } from '@mui/material';
import apiService from '../services/api';
import { Booking } from '../types';

interface PhonePeFrontendSdkPaymentProps {
  booking: Booking;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PhonePe: any;
  }
}

const PhonePeFrontendSdkPayment: React.FC<PhonePeFrontendSdkPaymentProps> = ({
  booking,
  onSuccess,
  onError,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState<boolean>(false);

  // Load PhonePe SDK script
  useEffect(() => {
    const loadPhonePeSdk = () => {
      const script = document.createElement('script');
      script.src = 'https://sdk.phonepe.com/checkout/PhonePeCheckout.js';
      script.async = true;
      script.onload = () => {
        console.log('PhonePe SDK loaded successfully');
        setSdkLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load PhonePe SDK');
        setError('Failed to load PhonePe SDK');
      };
      document.body.appendChild(script);
    };

    loadPhonePeSdk();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!sdkLoaded) {
        throw new Error('PhonePe SDK not loaded yet');
      }

      console.log('Initiating PhonePe Frontend SDK payment for booking:', booking._id);
      
      // Call the API to create a PhonePe SDK order and get token
      const response = await apiService.createPhonePeFrontendSdkOrder(
        booking._id,
        booking.price
      );

      console.log('PhonePe Frontend SDK order response:', response);

      if (response.success && response.data && response.data.token) {
        const token = response.data.token;
        const merchantId = response.data.merchantId || 'MERCHANTUAT';
        const merchantOrderId = response.data.merchantOrderId;
        
        // Use the PhonePe SDK to open the checkout
        const checkout = new window.PhonePe.PhonePeCheckout({
          onSuccess: (data: any) => {
            console.log('PhonePe payment success:', data);
            if (onSuccess) onSuccess(data);
          },
          onError: (error: any) => {
            console.error('PhonePe payment error:', error);
            setError('Payment failed: ' + (error.message || 'Unknown error'));
            if (onError) onError(error);
          },
          onClose: () => {
            console.log('PhonePe checkout closed');
            if (onClose) onClose();
          }
        });

        checkout.build({
          environment: 'SANDBOX',
          merchantId: merchantId,
          merchantTransactionId: merchantOrderId, // Using merchantOrderId from response
          token: token,
          amount: response.data.amount, // Use amount from response
          tokenType: 'TOKEN',
          redirectUrl: window.location.origin + '/payment-status',
          redirectMode: 'REDIRECT',
          paymentFlow: 'STANDARD',
        });

        checkout.open();
      } else {
        throw new Error('Failed to create payment token');
      }
    } catch (err: any) {
      console.error('Error initiating PhonePe Frontend SDK payment:', err);
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
        disabled={loading || !sdkLoaded}
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
        ) : !sdkLoaded ? (
          'Loading PhonePe SDK...'
        ) : (
          'Pay with PhonePe'
        )}
      </Button>
      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
        Secure payment powered by PhonePe
      </Typography>
    </Box>
  );
};

export default PhonePeFrontendSdkPayment;