import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhonePePayment from './PhonePePayment';
import apiService from '../services/api';
import { BookingFormData } from '../types';

interface BookingData {
  vehicle: any;
  service: any;
  dateTime: {
    date: string;
    time: string;
  };
  address: any;
  specialInstructions: string;
  paymentMethod: string;
}

const PhonePeBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<BookingData>({
    vehicle: null,
    service: null,
    dateTime: { date: '', time: '' },
    address: null,
    specialInstructions: '',
    paymentMethod: 'phonepe'
  });
  const [showPayment, setShowPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Available services
  const services = [
    { id: 1, name: 'Wash & Vacuum', price: 500, description: 'Exterior wash and interior vacuum' },
    { id: 2, name: 'Full Detail', price: 1500, description: 'Complete interior and exterior detailing' },
    { id: 3, name: 'Interior Deep Clean', price: 800, description: 'Deep cleaning of interior surfaces' },
    { id: 4, name: 'Exterior Wash & Wax', price: 700, description: 'Exterior wash with wax protection' },
    { id: 5, name: 'Premium Package', price: 2000, description: 'Complete premium detailing service' }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load vehicles
      const vehiclesResponse = await apiService.getVehicles();
      if (vehiclesResponse.success && vehiclesResponse.data) {
        setVehicles(vehiclesResponse.data);
      }

      // Load addresses
      const addressesResponse = await apiService.getAddresses();
      if (addressesResponse.success && addressesResponse.data) {
        setAddresses(addressesResponse.data);
      }
    } catch (error: any) {
      setError('Failed to load user data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: any) => {
    setBookingData(prev => ({ ...prev, service }));
  };

  const handleVehicleSelect = (vehicle: any) => {
    setBookingData(prev => ({ ...prev, vehicle }));
  };

  const handleAddressSelect = (address: any) => {
    setBookingData(prev => ({ ...prev, address }));
  };

  const handleDateTimeChange = (field: 'date' | 'time', value: string) => {
    setBookingData(prev => ({
      ...prev,
      dateTime: { ...prev.dateTime, [field]: value }
    }));
  };

  const handleSpecialInstructionsChange = (value: string) => {
    setBookingData(prev => ({ ...prev, specialInstructions: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!bookingData.service;
      case 2:
        return !!bookingData.vehicle;
      case 3:
        return !!bookingData.dateTime.date && !!bookingData.dateTime.time;
      case 4:
        return !!bookingData.address;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        // Create booking and show payment
        createBooking();
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setError('Please complete all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const createBooking = async () => {
    try {
      setLoading(true);
      setError('');

      // Map service names to valid enum values
      const serviceTypeMap: { [key: string]: string } = {
        'Wash & Vacuum': 'exterior',
        'Full Detail': 'full-service',
        'Interior Deep Clean': 'interior',
        'Exterior Wash & Wax': 'exterior',
        'Premium Package': 'premium'
      };

      const serviceType = (serviceTypeMap[bookingData.service?.name || ''] || 'exterior') as 'exterior' | 'interior' | 'full-service' | 'premium' | 'deep-clean' | 'detail-clean' | 'demo';

      const bookingPayload: BookingFormData = {
        vehicleId: bookingData.vehicle._id,
        serviceType: serviceType,
        scheduledDate: bookingData.dateTime.date,
        scheduledTime: bookingData.dateTime.time,
        location: {
          address: bookingData.address.street || '',
          city: bookingData.address.city || '',
          state: bookingData.address.state || '',
          zipCode: bookingData.address.zipCode || ''
        },
        notes: bookingData.specialInstructions,
        price: bookingData.service?.price || 0,
        paymentMethod: 'phonepe'
      };

      const response = await apiService.createBooking(bookingPayload);
      
      if (response.success) {
        setCreatedBooking(response.data);
        setShowPayment(true);
      } else {
        setError(response.error || 'Failed to create booking');
      }
    } catch (error: any) {
      setError('Error creating booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log('Payment successful with transaction ID:', transactionId);
    // The user will be redirected to payment status page by PhonePe
  };

  const handlePaymentError = (error: string) => {
    setError('Payment failed: ' + error);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setCreatedBooking(null);
  };

  const renderStepContent = () => {
    if (showPayment && createdBooking) {
      return (
        <PhonePePayment
          bookingId={createdBooking._id}
          amount={bookingData.service?.price || 0}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Select Service</h3>
            <div className="grid gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    bookingData.service?.id === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{service.name}</h4>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">₹{service.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Select Vehicle</h3>
            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No vehicles found</p>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      bookingData.vehicle?._id === vehicle._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{vehicle.make} {vehicle.model}</h4>
                        <p className="text-gray-600 text-sm">{vehicle.year} • {vehicle.color}</p>
                      </div>
                      <div className="text-blue-600">
                        {bookingData.vehicle?._id === vehicle._id && '✓'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Select Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={bookingData.dateTime.date}
                  onChange={(e) => handleDateTimeChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={bookingData.dateTime.time}
                  onChange={(e) => handleDateTimeChange('time', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Select Service Location</h3>
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No addresses found</p>
                <button
                  onClick={() => navigate('/addresses')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    onClick={() => handleAddressSelect(address)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      bookingData.address?._id === address._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{address.street}</h4>
                        <p className="text-gray-600 text-sm">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                      <div className="text-blue-600">
                        {bookingData.address?._id === address._id && '✓'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
              <textarea
                value={bookingData.specialInstructions}
                onChange={(e) => handleSpecialInstructionsChange(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special instructions for our team..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { id: 1, title: 'Service', icon: '🔧' },
    { id: 2, title: 'Vehicle', icon: '🚗' },
    { id: 3, title: 'Schedule', icon: '📅' },
    { id: 4, title: 'Location', icon: '📍' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-4">Book Your Service</h2>
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center space-x-2 ${
                      currentStep >= step.id ? 'text-white' : 'text-blue-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= step.id ? 'bg-white text-blue-600' : 'bg-blue-700'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-sm font-medium hidden md:block">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-white' : 'bg-blue-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {renderStepContent()}

                {!showPayment && (
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!validateStep(currentStep)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentStep === 4 ? 'Proceed to Payment' : 'Next'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePeBookingPage; 