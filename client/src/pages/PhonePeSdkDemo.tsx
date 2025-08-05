import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Divider, Grid, Card, CardContent, Button } from '@mui/material';
import PhonePeSdkPayment from '../components/PhonePeSdkPayment';
import PhonePeFrontendSdkPayment from '../components/PhonePeFrontendSdkPayment';
import { Booking } from '../types';

const PhonePeSdkDemo: React.FC = () => {
  // Mock booking data for demonstration
  const [mockBooking, setMockBooking] = useState<Booking>({
    _id: 'test-booking-id',
    customer: 'test-user-id',
    vehicle: 'test-vehicle-id',
    serviceType: 'full-service',
    scheduledDate: new Date().toISOString(),
    scheduledTime: '10:00 AM',
    location: {
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      }
    },
    status: 'pending',
    price: 100, // Amount in INR
    paymentStatus: 'pending',
    paymentMethod: 'phonepe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    // You would typically redirect to a success page or update the UI
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    // You would typically show an error message or update the UI
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        PhonePe SDK Payment Demo
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Booking Details
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>Booking ID:</strong> {mockBooking._id}
          </Typography>
          <Typography variant="body1">
            <strong>Service:</strong> {mockBooking.serviceType}
          </Typography>
          <Typography variant="body1">
            <strong>Amount:</strong> ₹{mockBooking.price}
          </Typography>
          <Typography variant="body1">
            <strong>Date:</strong> {new Date(mockBooking.scheduledDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">
            <strong>Time:</strong> {mockBooking.scheduledTime}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Backend SDK Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This method uses the PhonePe SDK on the server side to create a payment URL.
                The user is redirected to PhonePe's payment page.
              </Typography>
              <PhonePeSdkPayment 
                booking={mockBooking} 
                onSuccess={handlePaymentSuccess} 
                onError={handlePaymentError} 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Frontend SDK Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This method uses the PhonePe JavaScript SDK on the client side.
                The payment flow happens within a popup or modal on the same page.
              </Typography>
              <PhonePeFrontendSdkPayment 
                booking={mockBooking} 
                onSuccess={handlePaymentSuccess} 
                onError={handlePaymentError} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          This is a demonstration of PhonePe SDK integration. No actual payments will be processed.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          For testing, you can use any valid phone number and OTP.
        </Typography>
      </Box>
    </Container>
  );
};

export default PhonePeSdkDemo;