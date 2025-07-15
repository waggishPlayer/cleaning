import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Car, Droplets, MapPin, Calendar, CreditCard, Plus, Edit2, Trash2, Clock, User, Phone, Mail, Home } from 'lucide-react';
import { vehicleService } from '../services/api';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
  size: string;
  notes?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface BookingData {
  vehicle: Vehicle | null;
  service: Service | null;
  address: Address | null;
  dateTime: string;
  specialInstructions: string;
}

const BookingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    vehicle: null,
    service: null,
    address: null,
    dateTime: '',
    specialInstructions: ''
  });

  // Vehicle management state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    vehicleType: 'car',
    size: 'medium',
    notes: ''
  });

  // Service options
  const services: Service[] = [
    {
      id: 'exterior-wash',
      name: 'Exterior Wash',
      price: 99
    },
    {
      id: 'premium-detailing',
      name: 'Premium Detailing',
      price: 599,
      description: 'Complete interior and exterior cleaning with premium products and detailing'
    },
    {
      id: 'deep-wash',
      name: 'Deep Wash',
      price: 549
    }
  ];

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      isDefault: true
    }
  ]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const steps = [
    { id: 1, title: 'Select Vehicle', icon: Car },
    { id: 2, title: 'Select Service', icon: Droplets },
    { id: 3, title: 'Select Address', icon: MapPin },
    { id: 4, title: 'Date & Time', icon: Calendar },
    { id: 5, title: 'Review & Payment', icon: CreditCard }
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAddVehicle = async () => {
    try {
      const addedVehicle = await vehicleService.addVehicle(newVehicle);
      setVehicles([...vehicles, addedVehicle]);
      setNewVehicle({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        color: '',
        vehicleType: 'car',
        size: 'medium',
        notes: ''
      });
      setShowAddVehicle(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleAddAddress = () => {
    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, address]);
    setNewAddress({
      type: 'home',
      street: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setShowAddAddress(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return bookingData.vehicle !== null;
      case 2:
        return bookingData.service !== null;
      case 3:
        return bookingData.address !== null;
      case 4:
        return bookingData.dateTime !== '';
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Select Vehicle</h3>
            <p className="text-gray-600">Choose a vehicle for your booking or add a new one.</p>
            
            {loadingVehicles ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      bookingData.vehicle?._id === vehicle._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setBookingData({ ...bookingData, vehicle })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </h4>
                        <p className="text-sm text-gray-600">
                          {vehicle.licensePlate} • {vehicle.color} • {vehicle.vehicleType}
                        </p>
                      </div>
                      <Car className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                ))}
                
                {!showAddVehicle && (
                  <button
                    onClick={() => setShowAddVehicle(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add New Vehicle</span>
                  </button>
                )}
                
                {showAddVehicle && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-4">Add New Vehicle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Make"
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Model"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Year"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="License Plate"
                        value={newVehicle.licensePlate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Color"
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                      <select
                        value={newVehicle.vehicleType}
                        onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value })}
                        className="p-2 border rounded-lg"
                      >
                        <option value="car">Car</option>
                        <option value="suv">SUV</option>
                        <option value="truck">Truck</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="van">Van</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={handleAddVehicle}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Vehicle
                      </button>
                      <button
                        onClick={() => setShowAddVehicle(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Select Cleaning Service</h3>
            <p className="text-gray-600">Choose the type of cleaning service you need.</p>
            
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    bookingData.service?.id === service.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData({ ...bookingData, service })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Droplets className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{service.name}</h4>
                          <p className="text-2xl font-bold text-blue-600">₹{service.price}</p>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Select Address</h3>
            <p className="text-gray-600">Choose your registered address or add a new one.</p>
            
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    bookingData.address?.id === address.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData({ ...bookingData, address })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Home className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-800 capitalize">{address.type}</h4>
                          {address.isDefault && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Address</span>
                </button>
              )}
              
              {showAddAddress && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-4">Add New Address</h4>
                  <div className="space-y-4">
                    <select
                      value={newAddress.type}
                      onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'home' | 'work' | 'other' })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleAddAddress}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Address
                    </button>
                    <button
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Select Date & Time</h3>
            <p className="text-gray-600">Choose your preferred date and time for the service.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={bookingData.dateTime.split('T')[0] || ''}
                  onChange={(e) => {
                    const currentTime = bookingData.dateTime.split('T')[1] || '09:00';
                    setBookingData({ ...bookingData, dateTime: `${e.target.value}T${currentTime}` });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <select
                  value={bookingData.dateTime.split('T')[1] || ''}
                  onChange={(e) => {
                    const currentDate = bookingData.dateTime.split('T')[0] || new Date().toISOString().split('T')[0];
                    setBookingData({ ...bookingData, dateTime: `${currentDate}T${e.target.value}` });
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={bookingData.specialInstructions}
                  onChange={(e) => setBookingData({ ...bookingData, specialInstructions: e.target.value })}
                  placeholder="Any special instructions for the service provider..."
                  className="w-full p-2 border rounded-lg h-20"
                />
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Review & Payment</h3>
            <p className="text-gray-600">Review your booking details and proceed to payment.</p>
            
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">Booking Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">
                      {bookingData.vehicle?.make} {bookingData.vehicle?.model} ({bookingData.vehicle?.licensePlate})
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{bookingData.service?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">
                      {bookingData.address?.street}, {bookingData.address?.city}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {new Date(bookingData.dateTime).toLocaleDateString()} at {new Date(bookingData.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-blue-600">₹{bookingData.service?.price}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Options */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Payment Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value="card" className="text-blue-600" />
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value="upi" className="text-blue-600" />
                    <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">₹</div>
                    <span>UPI Payment</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value="cash" className="text-blue-600" />
                    <div className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">₹</div>
                    <span>Cash on Service</span>
                  </label>
                </div>
              </div>
              
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                Confirm Booking & Pay ₹{bookingData.service?.price}
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Step Progress Bar */}
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-4">Book Your Service</h2>
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
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
                        <Icon className="w-4 h-4" />
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
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length || !canProceedToNext()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === steps.length ? 'Complete' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
