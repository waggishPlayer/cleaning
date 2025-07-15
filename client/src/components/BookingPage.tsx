import React, { useState, useEffect } from 'react';
import { Car, Plus, MapPin, Calendar, Clock, CreditCard, Check, X } from 'lucide-react';
import { apiService } from '../services/api';
import { Vehicle } from '../types';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string;
}

interface BookingData {
  vehicle: Vehicle | null;
  service: Service | null;
  address: Address | null;
  dateTime: {
    date: string;
    time: string;
  };
  specialInstructions: string;
  paymentMethod: string;
}

const BookingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingData, setBookingData] = useState<BookingData>({
    vehicle: null,
    service: null,
    address: null,
    dateTime: { date: '', time: '' },
    specialInstructions: '',
    paymentMethod: 'card'
  });

  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    vehicleType: 'sedan' as const,
    size: 'medium' as const
  });

  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  const services: Service[] = [
    { id: '1', name: 'Wash & Vacuum', price: 25, description: 'Basic exterior wash and interior vacuum', duration: '45 min' },
    { id: '2', name: 'Full Detail', price: 75, description: 'Complete interior and exterior detailing', duration: '2 hours' },
    { id: '3', name: 'Interior Deep Clean', price: 45, description: 'Deep cleaning of interior surfaces', duration: '1 hour' },
    { id: '4', name: 'Exterior Wash & Wax', price: 35, description: 'Exterior wash with protective wax coating', duration: '1 hour' },
    { id: '5', name: 'Premium Package', price: 100, description: 'Full detail plus ceramic coating', duration: '3 hours' }
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
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
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.licensePlate) {
      setError('Please fill in all required vehicle information');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.createVehicle({
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year,
        licensePlate: newVehicle.licensePlate,
        color: newVehicle.color,
        vehicleType: newVehicle.vehicleType,
        size: newVehicle.size,
        notes: ''
      });
      
      if (response.success && response.data) {
        setVehicles([...vehicles, response.data]);
        setBookingData({ ...bookingData, vehicle: response.data });
        setNewVehicle({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          licensePlate: '',
          vehicleType: 'sedan' as const,
          size: 'medium' as const
        });
        setShowAddVehicle(false);
        setError('');
      } else {
        setError(response.error || 'Failed to add vehicle');
      }
    } catch (error: any) {
      setError(error.message || 'Error adding vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      setError('Please fill in all required address information');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      
      if (response.ok) {
        const address = await response.json();
        setAddresses([...addresses, address]);
        setBookingData({ ...bookingData, address });
        setNewAddress({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          isDefault: false
        });
        setShowAddAddress(false);
        setError('');
      } else {
        setError('Failed to add address');
      }
    } catch (error) {
      setError('Error adding address');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: bookingData.vehicle?._id,
          serviceId: bookingData.service?.id,
          addressId: bookingData.address?._id,
          scheduledDate: bookingData.dateTime.date,
          scheduledTime: bookingData.dateTime.time,
          specialInstructions: bookingData.specialInstructions,
          paymentMethod: bookingData.paymentMethod
        })
      });
      
      if (response.ok) {
        // Handle successful booking
        alert('Booking created successfully!');
        // Reset form or redirect
        setCurrentStep(1);
        setBookingData({
          vehicle: null,
          service: null,
          address: null,
          dateTime: { date: '', time: '' },
          specialInstructions: '',
          paymentMethod: 'card'
        });
      } else {
        setError('Failed to create booking');
      }
    } catch (error) {
      setError('Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.vehicle !== null;
      case 2:
        return bookingData.service !== null;
      case 3:
        return bookingData.address !== null;
      case 4:
        return bookingData.dateTime.date && bookingData.dateTime.time;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Car className="mr-2" /> Select Your Vehicle
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    bookingData.vehicle?._id === vehicle._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData({ ...bookingData, vehicle })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                      <p className="text-gray-600">{vehicle.color} • {vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-500 capitalize">{vehicle.vehicleType}</p>
                    </div>
                    {bookingData.vehicle?._id === vehicle._id && (
                      <Check className="text-blue-500" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddVehicle(true)}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Plus className="mr-2" size={20} />
              Add New Vehicle
            </button>

            {showAddVehicle && (
              <div className="mt-6 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Add New Vehicle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Make *"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Model *"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Year"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="License Plate *"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newVehicle.vehicleType}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value as any })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="luxury">Luxury</option>
                    <option value="sports">Sports Car</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={newVehicle.size}
                    onChange={(e) => setNewVehicle({ ...newVehicle, size: e.target.value as any })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => setShowAddVehicle(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Vehicle'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="text-2xl font-bold mb-6">Select Cleaning Service</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                    bookingData.service?.id === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData({ ...bookingData, service })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    {bookingData.service?.id === service.id && (
                      <Check className="text-blue-500" size={20} />
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">${service.price}</span>
                    <span className="text-sm text-gray-500">{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <MapPin className="mr-2" /> Select Service Address
            </h2>
            
            <div className="space-y-4 mb-6">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    bookingData.address?._id === address._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData({ ...bookingData, address })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{address.street}</h3>
                      <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                      {address.isDefault && (
                        <span className="text-sm text-blue-600">Default Address</span>
                      )}
                    </div>
                    {bookingData.address?._id === address._id && (
                      <Check className="text-blue-500" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddAddress(true)}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Plus className="mr-2" size={20} />
              Add New Address
            </button>

            {showAddAddress && (
              <div className="mt-6 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Street Address *"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code *"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="mr-2"
                    />
                    Set as default address
                  </label>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAddress}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Address'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="mr-2" /> Select Date & Time
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <input
                  type="date"
                  value={bookingData.dateTime.date}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    dateTime: { ...bookingData.dateTime, date: e.target.value }
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Select Time</label>
                <select
                  value={bookingData.dateTime.time}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    dateTime: { ...bookingData.dateTime, time: e.target.value }
                  })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
              <textarea
                value={bookingData.specialInstructions}
                onChange={(e) => setBookingData({ ...bookingData, specialInstructions: e.target.value })}
                placeholder="Any special requests or instructions for our cleaning team..."
                rows={4}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2 className="text-2xl font-bold mb-6">Review & Payment</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">
                    {bookingData.vehicle?.year} {bookingData.vehicle?.make} {bookingData.vehicle?.model}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{bookingData.service?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{bookingData.address?.street}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(bookingData.dateTime.date).toLocaleDateString()} at {bookingData.dateTime.time}
                  </span>
                </div>
                
                {bookingData.specialInstructions && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Special Instructions:</span>
                    <span className="font-medium">{bookingData.specialInstructions}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${bookingData.service?.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2" /> Payment Method
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={bookingData.paymentMethod === 'card'}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  <CreditCard className="mr-2" size={20} />
                  Credit/Debit Card
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={bookingData.paymentMethod === 'cash'}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                    className="mr-3"
                  />
                  💵 Cash on Service
                </label>
              </div>
            </div>

            <button
              onClick={handleBookingSubmit}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-4 rounded-lg text-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Confirm Booking - $${bookingData.service?.price}`}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-gray-600">
              Step {currentStep} of 5
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <X className="text-red-500 mr-2" size={20} />
              <span className="text-red-600">{error}</span>
            </div>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
