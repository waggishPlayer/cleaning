import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Navbar from './Navbar';

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('User ID is missing');
      return;
    }
    
    fetchUserDetails(id);
  }, [id]);

  // Fetch user details and bookings
  const fetchUserDetails = async (userId: string) => {
    try {
      setError('');
      setLoading(true);
      
      // Fetch user details
      const userRes = await apiService.getUserDetails(userId);
      if (userRes.success) {
        setSelectedUser(userRes.data);
        
        // Fetch user bookings
        const bookingsRes = await apiService.getUserBookings(userId);
        if (bookingsRes.success) {
          setUserBookings(bookingsRes.data || []);
        } else {
          setError(bookingsRes.message || 'Failed to fetch user bookings');
        }
      } else {
        setError(userRes.message || 'Failed to fetch user details');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };
  
  // Update user details
  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      setError('');
      
      const res = await apiService.updateUser(userId, data);
      if (res.success) {
        // Refresh user details
        fetchUserDetails(userId);
      } else {
        setError(res.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    }
  };

  // Toggle user active status
  const toggleUserStatus = () => {
    if (!selectedUser) return;
    
    handleUpdateUser(selectedUser._id, {
      isActive: !selectedUser.isActive
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#00ddff] text-black px-4 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-500/20 text-yellow-400 p-4 rounded-lg mb-6">
            User not found
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#00ddff] text-black px-4 py-2 rounded-lg hover:bg-[#c1ff72] transition-colors font-semibold shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#00ddff]">User Details</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#23272f] text-[#00ddff] border border-[#00ddff] px-4 py-2 rounded-lg hover:bg-[#00ddff] hover:text-black transition-colors font-semibold shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Details Card */}
          <div className="bg-[#18181b] rounded-xl shadow-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">User Information</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="text-white font-medium">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.role === 'admin' ? 'bg-[#c1ff72]/20 text-[#c1ff72]' :
                    selectedUser.role === 'worker' ? 'bg-[#00ddff]/20 text-[#00ddff]' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {selectedUser.role}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-white font-medium">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isActive ? 'bg-[#c1ff72]/20 text-[#c1ff72]' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              {selectedUser.role === 'worker' && (
                <div>
                  <p className="text-gray-400 text-sm">Availability</p>
                  <p className="text-white font-medium">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.isAvailable ? 'bg-[#c1ff72]/20 text-[#c1ff72]' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedUser.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            {selectedUser.address && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-1">Address</p>
                <p className="text-white">
                  {selectedUser.address.street}, {selectedUser.address.city}, {selectedUser.address.state} - {selectedUser.address.zipCode}
                </p>
              </div>
            )}
            
            {user?.role === 'admin' && (
              <div className="flex justify-end">
                <button
                  onClick={toggleUserStatus}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-lg ${
                    selectedUser.isActive 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-[#c1ff72]/20 text-[#c1ff72] hover:bg-[#c1ff72]/30'
                  }`}
                >
                  {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                </button>
              </div>
            )}
          </div>

          {/* User Bookings */}
          <div className="bg-[#18181b] rounded-xl shadow-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">
              {selectedUser.role === 'worker' ? 'Assigned Bookings' : 'Bookings'}
            </h2>
            
            {userBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No bookings found for this user.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-black/30 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#00ddff] uppercase">Service</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#00ddff] uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#00ddff] uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#00ddff] uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {userBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-black/20 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {booking.serviceType || 'Standard Clean'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'completed' ? 'bg-[#c1ff72]/20 text-[#c1ff72]' :
                            booking.status === 'assigned' ? 'bg-[#00ddff]/20 text-[#00ddff]' :
                            booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#c1ff72] font-semibold">
                          ₹{booking.price || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;