import React, { useState, useEffect } from 'react';
import { Vehicle, BookingFormData } from '../types';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Address {
  _id?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface BookingFormProps {
  onSubmit: (bookingData: BookingFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  hasUsedDemoWash?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onCancel, isLoading, hasUsedDemoWash }) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [formData, setFormData] = useState<BookingFormData>({
    vehicleId: '',
    serviceType: 'exterior',
    scheduledDate: '',
    scheduledTime: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    notes: '',
    price: 0
  });

  // Helper to get seat count from vehicle size
  const getSeatType = (size: Vehicle['size']) => {
    if (size === 'large' || size === 'extra-large') return '7+';
    return '5-';
  };

  // Service types and pricing logic
  const getServiceTypes = () => {
    const selectedVehicle = vehicles.find(v => v._id === formData.vehicleId);
    const seatType = selectedVehicle ? getSeatType(selectedVehicle.size) : '5-';
    const services = [
      {
        value: 'exterior',
        label: 'Exterior Cleaning',
        price: seatType === '7+' ? 349 : 299,
        description: 'Exterior wash and clean',
      },
      {
        value: 'deep-clean',
        label: 'Deep Clean',
        price: seatType === '7+' ? 749 : 649,
        description: 'Full interior and exterior deep cleaning',
      },
      {
        value: 'detail-clean',
        label: 'Detail Clean',
        price: seatType === '7+' ? 949 : 849,
        description: 'Detailing, deep cleaning, and polish',
      },
    ];
    if (!hasUsedDemoWash) {
      services.unshift({
        value: 'demo',
        label: 'Demo Wash (First Time Only)',
        price: 299,
        description: 'Try our service at a special price! Only available once.',
      });
    }
    return services;
  };

  const serviceTypes = getServiceTypes();

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    fetchVehicles();
    fetchAddresses();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await apiService.getVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await apiService.getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Auto-detect location function
  const detectLocation = async () => {
    setDetectingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setDetectingLocation(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 30000, // Increased timeout from 10s to 30s
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get address from coordinates
      const address = await reverseGeocode(latitude, longitude);
      
      if (address) {
        setFormData(prev => ({
          ...prev,
          location: {
            address: address.address,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode
          }
        }));
        setSelectedAddressId('new');
        setAddingNewAddress(true);
      } else {
        setLocationError('Could not determine address from location. Please enter manually.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location services and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please check your device location settings and try again, or enter your address manually.');
            break;
          default:
            setLocationError('Error detecting location. Please enter address manually.');
        }
      } else {
        setLocationError('Error detecting location. Please enter address manually.');
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  // Reverse geocoding function using OpenStreetMap Nominatim API
  const reverseGeocode = async (lat: number, lng: number): Promise<{
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const address = data.address;
      
      return {
        address: address.house_number && address.road 
          ? `${address.house_number} ${address.road}`
          : address.road || address.suburb || address.neighbourhood || '',
        city: address.city || address.town || address.village || address.county || '',
        state: address.state || address.province || '',
        zipCode: address.postcode || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  // When an address is selected, update formData.location
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== 'new') {
      const addr = addresses.find(a => a._id === selectedAddressId);
      if (addr) {
        setFormData(prev => ({
          ...prev,
          location: {
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode
          }
        }));
        setAddingNewAddress(false);
      }
    } else if (selectedAddressId === 'new') {
      setAddingNewAddress(true);
      setFormData(prev => ({
        ...prev,
        location: { address: '', city: '', state: '', zipCode: '' }
      }));
    }
  }, [selectedAddressId, addresses]);

  const handleServiceTypeChange = (serviceType: string) => {
    const selectedService = serviceTypes.find(s => s.value === serviceType);
    setFormData(prev => ({
      ...prev,
      serviceType: serviceType as BookingFormData['serviceType'],
      price: selectedService?.price || 0
    }));
  };

  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBooking(true);
    setPaymentError('');

    // Comprehensive form validation
    if (!formData.vehicleId) {
      setPaymentError('Please select a vehicle');
      setSubmittingBooking(false);
      return;
    }

    if (!formData.serviceType) {
      setPaymentError('Please select a service type');
      setSubmittingBooking(false);
      return;
    }

    if (!formData.scheduledDate) {
      setPaymentError('Please select a date');
      setSubmittingBooking(false);
      return;
    }

    if (!formData.scheduledTime) {
      setPaymentError('Please select a time');
      setSubmittingBooking(false);
      return;
    }

    if (!formData.location.address || !formData.location.city || !formData.location.state || !formData.location.zipCode) {
      setPaymentError('Please fill in all location details (address, city, state, and ZIP code)');
      setSubmittingBooking(false);
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setPaymentError('Please select a service to see pricing');
      setSubmittingBooking(false);
      return;
    }

    try {
      console.log('Submitting booking with data:', formData);
      // Create booking first
      const bookingResponse = await apiService.createBooking(formData);
      
      if (bookingResponse.success && bookingResponse.data) {
        // Now initiate PhonePe payment
        const paymentResponse = await apiService.createPhonePeOrder(bookingResponse.data._id, formData.price);
        
        if (paymentResponse.success && paymentResponse.data) {
          // Store booking and transaction IDs for reference
          sessionStorage.setItem('bookingId', bookingResponse.data._id);
          sessionStorage.setItem('phonePeTransactionId', paymentResponse.data.transactionId);
          
          // Redirect to PhonePe payment page
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          setPaymentError(paymentResponse.error || 'Failed to initiate payment');
        }
      } else {
        setPaymentError(bookingResponse.error || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error creating booking or payment:', error);
      setPaymentError(error.message || 'An error occurred while processing your request');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleAddVehicle = () => {
    onCancel(); // Close the booking modal
    navigate('/vehicles'); // Navigate to vehicles page
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Book Cleaning Service</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
        >
          ×
        </button>
      </div>

      {loadingVehicles ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vehicle *
            </label>
            {vehicles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No vehicles found. Please add a vehicle first.</p>
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceTypes.map(service => (
                <div
                  key={service.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.serviceType === service.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleServiceTypeChange(service.value)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{service.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600">₹{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                min={minDate}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time *
              </label>
              <select
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Location *
            </label>
            <div className="space-y-4">
              {loadingAddresses ? (
                <div>Loading addresses...</div>
              ) : addresses.length > 0 && !addingNewAddress ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={selectedAddressId}
                  onChange={e => setSelectedAddressId(e.target.value)}
                  required
                >
                  <option value="">Select an address</option>
                  {addresses.map(addr => (
                    <option key={addr._id} value={addr._id}>
                      {addr.address}, {addr.city}, {addr.state} - {addr.zipCode}
                    </option>
                  ))}
                  <option value="new">Add New Address</option>
                </select>
              ) : null}
              
              {/* Auto-detect location button */}
              {(addingNewAddress || addresses.length === 0) && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {detectingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Detecting Location...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Auto-detect My Location
                      </>
                    )}
                  </button>
                  {locationError && (
                    <p className="text-red-600 text-sm mt-2">{locationError}</p>
                  )}
                </div>
              )}
              
              {(addingNewAddress || addresses.length === 0) && (
                <>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <input
                      type="text"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP Code"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="text-blue-600 underline mt-2"
                      onClick={() => { setAddingNewAddress(false); setSelectedAddressId(''); }}
                    >
                      Cancel Add New Address
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any special instructions or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Payment Error */}
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{paymentError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Price:</span>
              <span className="text-2xl font-bold text-blue-600">₹{formData.price}</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-3 sm:px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingBooking || vehicles.length === 0}
              className="flex-1 py-2 px-3 sm:px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center"
            >
              {submittingBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Book Service & Pay'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm;
