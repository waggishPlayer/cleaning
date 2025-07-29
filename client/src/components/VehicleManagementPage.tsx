import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Vehicle, VehicleFormData } from '../types';
import { apiService } from '../services/api';

const VehicleManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    vehicleType: 'sedan',
    size: 'medium',
    notes: ''
  });

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'truck', label: 'Truck' },
    { value: 'van', label: 'Van' },
    { value: 'luxury', label: 'Luxury Car' },
    { value: 'sports', label: 'Sports Car' },
    { value: 'other', label: 'Other' }
  ];

  const vehicleSizes = [
    { value: '2-seater', label: '2 Seater' },
    { value: '4-seater', label: '4 Seater' },
    { value: '7-seater', label: '7 Seater' },
    { value: '10+', label: '10+ Seater' }
  ];

  useEffect(() => {
    fetchVehicles();
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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (editingVehicle) {
        const response = await apiService.updateVehicle(editingVehicle._id, formData);
        if (response.success) {
          setVehicles(vehicles.map(v => 
            v._id === editingVehicle._id ? response.data! : v
          ));
          resetForm();
          setShowForm(false);
        } else {
          setError(response.error || 'Failed to update vehicle');
        }
      } else {
        const response = await apiService.createVehicle(formData);
        if (response.success) {
          setVehicles([...vehicles, response.data!]);
          resetForm();
          setShowForm(false);
        } else {
          setError(response.error || 'Failed to create vehicle');
        }
      }
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await apiService.deleteVehicle(vehicleId);
        if (response.success) {
          setVehicles(vehicles.filter(v => v._id !== vehicleId));
        } else {
          setError(response.error || 'Failed to delete vehicle');
        }
      } catch (error: any) {
        setError(error.message || 'Error deleting vehicle');
      }
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      color: vehicle.color,
      vehicleType: vehicle.vehicleType,
      size: vehicle.size,
      notes: vehicle.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      color: '',
      vehicleType: 'sedan',
      size: 'medium',
      notes: ''
    });
    setEditingVehicle(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
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
            <h1 className="text-2xl font-bold text-white">Manage Your Vehicles</h1>
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
                Add Vehicle
              </button>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {showForm && (
              <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Company *</label>
                      <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="e.g., BMW, Mercedes, Toyota"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Model *</label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="e.g., X5, C-Class, Camry"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Year *</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">License Plate *</label>
                      <input
                        type="text"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="e.g., MH12AB1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Color</label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                        placeholder="e.g., Black, White, Red"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Vehicle Type</label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                      >
                        {vehicleTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#00ddff] mb-2">Number of Seats</label>
                      <select
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ddff] text-white"
                      >
                        {vehicleSizes.map(size => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
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
                      placeholder="Any additional notes about your vehicle..."
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#00ddff] text-black px-6 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
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
                <p className="mt-2 text-gray-400">Loading vehicles...</p>
              </div>
            ) : !showForm && vehicles.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-400 mb-4">No vehicles found</p>
              </div>
            ) : !showForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle._id} className="bg-gray-900 rounded-lg border border-gray-700 p-6 hover:border-[#00ddff] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-gray-400">{vehicle.year}</p>
                      </div>
                      <span className="text-xs bg-[#00ddff] text-black px-2 py-1 rounded-full font-medium">
                        {vehicle.vehicleType}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-300">
                        <span className="text-[#c1ff72]">License:</span> {vehicle.licensePlate}
                      </p>
                      {vehicle.color && (
                        <p className="text-sm text-gray-300">
                          <span className="text-[#c1ff72]">Color:</span> {vehicle.color}
                        </p>
                      )}
                      <p className="text-sm text-gray-300">
                        <span className="text-[#c1ff72]">Seats:</span> {vehicle.size}
                      </p>
                    </div>
                    {vehicle.notes && (
                      <p className="text-sm text-gray-400 mb-4 italic">"{vehicle.notes}"</p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="flex-1 bg-[#00ddff] text-black px-3 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
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

export default VehicleManagementPage; 