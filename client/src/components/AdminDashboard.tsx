import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const sections = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'bookings', label: 'All Bookings' },
  { id: 'users', label: 'Manage Users' },
  { id: 'register-worker', label: 'Register Worker' },
  { id: 'register-admin', label: 'Register Admin' },
];

type UserRole = 'user' | 'admin' | 'worker';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('analytics');
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '', 
    street: '', 
    city: '', 
    state: '', 
    zipCode: '', 
    isActive: true 
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setAnalyticsLoading(true);
    setUsersLoading(true);
    setBookingsLoading(true);
    setError('');

    try {
      const [analyticsRes, usersRes, bookingsRes] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getAllUsers(),
        apiService.getAllBookings(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      else setError(prev => prev + 'Failed to load analytics. ');

      if (usersRes.success) setUsers(usersRes.data || []);
      else setError(prev => prev + 'Failed to load users. ');

      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      else setError(prev => prev + 'Failed to load bookings. ');

    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setAnalyticsLoading(false);
      setUsersLoading(false);
      setBookingsLoading(false);
    }
  };

  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    try {
      const res = await apiService.registerWorker({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        address: {
          street: registerForm.street,
          city: registerForm.city,
          state: registerForm.state,
          zipCode: registerForm.zipCode,
        },
      });

      if (res.success) {
        setRegisterSuccess('Worker registered successfully!');
        setRegisterForm({ 
          name: '', 
          email: '', 
          password: '', 
          phone: '', 
          street: '', 
          city: '', 
          state: '', 
          zipCode: '', 
          isActive: true 
        });
        fetchDashboardData();
      } else {
        setRegisterError(res.message || 'Failed to register worker');
      }
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || err.message || 'Failed to register worker');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    try {
      const res = await apiService.registerAdmin({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        address: {
          street: registerForm.street,
          city: registerForm.city,
          state: registerForm.state,
          zipCode: registerForm.zipCode,
        },
      });

      if (res.success) {
        setRegisterSuccess('Admin registered successfully!');
        setRegisterForm({ 
          name: '', 
          email: '', 
          password: '', 
          phone: '', 
          street: '', 
          city: '', 
          state: '', 
          zipCode: '', 
          isActive: true 
        });
        fetchDashboardData();
      } else {
        setRegisterError(res.message || 'Failed to register admin');
      }
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || err.message || 'Failed to register admin');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleBookingAction = async (action: string, bookingId: string) => {
    try {
      setError('');
      let res;
      
      switch (action) {
        case 'assign':
          const workerId = users.find(u => u.role === 'worker')?._id || user?._id;
          if (!workerId) {
            setError('No workers available for assignment');
            return;
          }
          res = await apiService.assignBooking(bookingId, workerId);
          break;
        case 'complete':
          res = await apiService.markBookingComplete(bookingId);
          break;
        case 'cancel':
          res = await apiService.cancelBooking(bookingId);
          break;
        default:
          return;
      }
      
      if (res.success) {
        fetchDashboardData();
      } else {
        setError(res.message || `Failed to ${action} booking`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || `Failed to ${action} booking`);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 py-2">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`w-full text-left py-3 px-4 mb-2 rounded-lg transition-colors ${
                activeSection === section.id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-2">
            Logged in as: {user.name}
          </div>
          <button
            onClick={logout}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
            
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-600">₹{analytics?.totalRevenue || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
                  <p className="text-2xl font-bold text-blue-600">{analytics?.totalBookings || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
                  <p className="text-2xl font-bold text-green-600">{analytics?.completedBookings || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
                  <p className="text-2xl font-bold text-orange-600">{analytics?.pendingBookings || 0}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Section */}
        {activeSection === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Bookings</h2>
            
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customer?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.customer?.phone || booking.customer?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.serviceType || 'Standard Clean'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{booking.price || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleBookingAction('assign', booking._id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              Assign
                            </button>
                          )}
                          {booking.status === 'assigned' && (
                            <button
                              onClick={() => handleBookingAction('complete', booking._id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Complete
                            </button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button
                              onClick={() => handleBookingAction('cancel', booking._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h2>
            
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'worker' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Register Worker Section */}
        {activeSection === 'register-worker' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Worker</h2>
            
            <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
              {registerError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {registerError}
                </div>
              )}
              
              {registerSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {registerSuccess}
                </div>
              )}
              
              <form onSubmit={handleRegisterWorker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street"
                      value={registerForm.street}
                      onChange={(e) => setRegisterForm({...registerForm, street: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={registerForm.state}
                      onChange={(e) => setRegisterForm({...registerForm, state: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={registerForm.zipCode}
                      onChange={(e) => setRegisterForm({...registerForm, zipCode: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {registerLoading ? 'Registering...' : 'Register Worker'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Register Admin Section */}
        {activeSection === 'register-admin' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Admin</h2>
            
            <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
              {registerError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {registerError}
                </div>
              )}
              
              {registerSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {registerSuccess}
                </div>
              )}
              
              <form onSubmit={handleRegisterAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street"
                      value={registerForm.street}
                      onChange={(e) => setRegisterForm({...registerForm, street: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={registerForm.state}
                      onChange={(e) => setRegisterForm({...registerForm, state: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={registerForm.zipCode}
                      onChange={(e) => setRegisterForm({...registerForm, zipCode: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {registerLoading ? 'Registering...' : 'Register Admin'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
