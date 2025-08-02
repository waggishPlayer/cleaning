import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault: boolean;
  nickname?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  nickname: string;
  notes: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const AddressManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false,
    nickname: '',
    notes: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await apiService.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (editingAddress) {
        const response = await apiService.updateAddress(editingAddress._id, formData);
        if (response.success) {
          setAddresses(addresses.map(a => 
            a._id === editingAddress._id ? response.data! : a
          ));
          resetForm();
          setShowForm(false);
        } else {
          setError(response.error || 'Failed to update address');
        }
      } else {
        const response = await apiService.createAddress(formData);
        if (response.success) {
          setAddresses([...addresses, response.data!]);
          resetForm();
          setShowForm(false);
        } else {
          setError(response.error || 'Failed to create address');
        }
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await apiService.deleteAddress(addressId);
        if (response.success) {
          setAddresses(addresses.filter(a => a._id !== addressId));
        } else {
          setError(response.error || 'Failed to delete address');
        }
      } catch (error: any) {
        setError(error.message || 'Error deleting address');
      }
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await apiService.setDefaultAddress(addressId);
      if (response.success) {
        // Update the addresses list to reflect the new default
        setAddresses(addresses.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        })));
      } else {
        setError(response.error || 'Failed to set default address');
      }
    } catch (error: any) {
      setError(error.message || 'Error setting default address');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'India',
      isDefault: address.isDefault,
      nickname: address.nickname || '',
      notes: address.notes || '',
      coordinates: address.coordinates
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false,
      nickname: '',
      notes: ''
    });
    setEditingAddress(null);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setDetectingLocation(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 30000, // Increased timeout from 10s to 30s
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get address details
      const addressDetails = await reverseGeocode(latitude, longitude);
      
      if (addressDetails) {
        setFormData(prev => ({
          ...prev,
          street: addressDetails.street || '',
          city: addressDetails.city || '',
          state: addressDetails.state || '',
          zipCode: addressDetails.zipCode || '',
          country: addressDetails.country || 'India',
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        }));
        
        // Show success message
        setError(null);
        setSuccess('Location detected successfully! Please review and save the address.');
      } else {
        setError('Could not determine address from your location. Please enter manually.');
      }
    } catch (error: any) {
      console.error('Location detection error:', error);
      if (error.code === 1) {
        setError('Location access denied. Please allow location access in your browser settings.');
      } else if (error.code === 2) {
        setError('Location unavailable. Please check your device location settings.');
      } else if (error.code === 3) {
        setError('Location request timed out. Please check your device location settings and try again, or enter your address manually.');
      } else {
        setError('Unable to detect your location. Please enter your address manually.');
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<{
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null> => {
    try {
      // Use OpenStreetMap Nominatim API for reverse geocoding (free and no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const address = data.address;
      
      // Check if we have at least some basic address information
      const hasBasicInfo = address.road || address.city || address.town || address.village || address.state;
      
      if (!hasBasicInfo) {
        return null;
      }
      
      return {
        street: address.road ? `${address.house_number || ''} ${address.road}`.trim() : address.suburb || '',
        city: address.city || address.town || address.village || address.county || '',
        state: address.state || address.province || '',
        zipCode: address.postcode || '',
        country: address.country || 'India'
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  if (!user || user.role !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-[#18181b] shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/Caarvo no back 2.png" 
                alt="Caarvo Logo" 
                className="h-8 w-auto"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))',
                  maxHeight: '40px',
                  maxWidth: '100%'
                }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#00ddff] text-black px-4 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#18181b] rounded-xl shadow-lg border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Manage Your Addresses</h1>
            {!showForm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-[#00ddff] text-black px-4 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Address
              </button>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-900 border border-green-700 rounded-lg text-green-200">
                {success}
              </div>
            )}

            {showForm && (
              <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="Enter your street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Nickname</label>
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="e.g., Home, Work, Office"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#00ddff] mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                      placeholder="Any additional notes about this address..."
                    />
                  </div>
                  {formData.coordinates && (
                    <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-[#00ddff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Coordinates detected: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                        className="mr-2 w-4 h-4 text-[#00ddff] bg-black border-gray-700 rounded focus:ring-[#00ddff] focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">Set as default address</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className={`text-sm transition-colors flex items-center ${
                          detectingLocation 
                            ? 'text-gray-500 cursor-not-allowed' 
                            : 'text-[#c1ff72] hover:text-[#00ddff]'
                        }`}
                        title="Automatically fill address fields using your current location"
                      >
                        {detectingLocation && (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {detectingLocation ? 'Detecting Location...' : 'Use My Location'}
                      </button>
                      <svg 
                        className="w-4 h-4 text-gray-500 cursor-help" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-label="This will use your device's GPS to automatically fill in your address. Make sure to allow location access when prompted."
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formData.coordinates && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs bg-[#00ddff] text-black px-2 py-1 rounded-full font-medium">
                            📍 Location Set
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, coordinates: undefined }))}
                            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                            title="Clear detected location"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#00ddff] text-black px-6 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ddff] mx-auto"></div>
                <p className="mt-2 text-gray-400">Loading addresses...</p>
              </div>
            ) : !showForm && addresses.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-400 mb-4">No addresses found</p>
              </div>
            ) : !showForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map((address) => (
                  <div key={address._id} className="bg-gray-900 rounded-lg border border-gray-700 p-6 hover:border-[#00ddff] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {address.nickname || 'Address'}
                        </h3>
                        {address.isDefault && (
                          <span className="text-xs bg-[#c1ff72] text-black px-2 py-1 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <svg className="w-6 h-6 text-[#00ddff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-300">{address.street}</p>
                      <p className="text-sm text-gray-300">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      {address.country && address.country !== 'India' && (
                        <p className="text-sm text-gray-400">{address.country}</p>
                      )}
                    </div>
                    {address.notes && (
                      <p className="text-sm text-gray-400 mb-4 italic">"{address.notes}"</p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="flex-1 bg-[#00ddff] text-black px-3 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address._id)}
                          className="flex-1 bg-[#c1ff72] text-black px-3 py-2 rounded-lg hover:bg-[#00ddff] transition-colors text-sm font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(address._id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddressManagementPage;