import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import BookingDetailsModal from './BookingDetailsModal';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type UserRole = 'user' | 'admin' | 'worker';

const sections = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'bookings', label: 'All Bookings' },
  { id: 'users', label: 'Manage Users' },
  { id: 'register-worker', label: 'Register Worker' },
  { id: 'register-admin', label: 'Register Admin' },
];

// UserRole is now imported from types

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalUsers: 0,
    totalWorkers: 0,
    recentBookings: [] as any[],
    allBookings: [] as any[],
    allUsers: [] as any[],
    workers: [] as any[],
    period: '',
    totalRevenue: 0,
    averageRating: 0,
    statusDistribution: [] as {_id: string, count: number}[],
    landingPageViews: 0,
    registerPageViews: 0,
    dailyViews: [] as any[],
  });
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState('');
  
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const res = await apiService.deleteBooking(bookingId);
      if (res.success) {
        fetchDashboardData();
        setShowDeleteConfirmation(false);
        setBookingToDelete('');
      } else {
        setError(res.message || 'Failed to delete booking');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete booking');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Use getAnalytics instead of getAdminDashboardData which doesn't exist
      const res = await apiService.getAnalytics('month');
      if (res.success && res.data) {
        // Merge analytics data with existing dashboard data structure
        setDashboardData({
          ...dashboardData,
          totalBookings: res.data.totalBookings,
          pendingBookings: res.data.pendingBookings,
          completedBookings: res.data.completedBookings,
          totalUsers: res.data.totalUsers,
          totalWorkers: res.data.totalWorkers,
          period: res.data.period,
          totalRevenue: res.data.totalRevenue,
          averageRating: res.data.averageRating,
          statusDistribution: res.data.statusDistribution,
        });
        
        // Also fetch bookings and users data
        fetchBookingsAndUsers();
        
        // Fetch page view analytics
        fetchPageViewAnalytics();
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    }
  };
  
  const fetchPageViewAnalytics = async () => {
    try {
      const res = await apiService.getPageViewAnalytics();
      if (res.success && res.data) {
        setDashboardData(prev => ({
          ...prev,
          landingPageViews: res.data?.landingPageViews || 0,
          registerPageViews: res.data?.registerPageViews || 0,
          dailyViews: res.data?.dailyViews || []
        }));
      }
    } catch (err: any) {
      console.error('Error fetching page view analytics:', err);
    }
  };
  
  const fetchBookingsAndUsers = async () => {
    try {
      // Fetch all bookings
      const bookingsRes = await apiService.getAllBookings();
      if (bookingsRes.success && bookingsRes.data) {
        const bookings = bookingsRes.data || [];
        setDashboardData(prev => ({
          ...prev,
          allBookings: bookings,
          recentBookings: bookings.slice(0, 5),
        }));
      }
      
      // Fetch all users
      const usersRes = await apiService.getAllUsers();
      if (usersRes.success && usersRes.data) {
        const users = usersRes.data || [];
        setDashboardData(prev => ({
          ...prev,
          allUsers: users,
          workers: users.filter((user: any) => user.role === 'worker'),
        }));
      }
    } catch (err: any) {
      console.error('Error fetching bookings and users:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    try {
      // Validate form
      if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone) {
        setRegisterError('Please fill in all required fields');
        setRegisterLoading(false);
        return;
      }

      // Prepare data for worker registration
      const workerData = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        address: {
          street: registerForm.street,
          city: registerForm.city,
          state: registerForm.state,
          zipCode: registerForm.zipCode
        },
        isActive: registerForm.isActive
      };
      
      const res = await apiService.registerWorker(workerData);

      if (res.success) {
        setRegisterForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          isActive: true,
        });
        setRegisterSuccess('Worker registered successfully!');
        // Refresh dashboard data to include the new worker
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
      // Validate form
      if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone) {
        setRegisterError('Please fill in all required fields');
        setRegisterLoading(false);
        return;
      }

      // Prepare data for admin registration
      const adminData = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        address: {
          street: registerForm.street,
          city: registerForm.city,
          state: registerForm.state,
          zipCode: registerForm.zipCode
        },
        isActive: registerForm.isActive
      };
      
      const res = await apiService.registerAdmin(adminData);

      if (res.success) {
        setRegisterForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          isActive: true,
        });
        setRegisterSuccess('Admin registered successfully!');
        // Refresh dashboard data
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

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [showWorkerSelection, setShowWorkerSelection] = useState<boolean>(false);
  const [bookingToAssign, setBookingToAssign] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState<boolean>(false);
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const [userDetailsError, setUserDetailsError] = useState<string>('');
  
  // Booking details modal state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState<boolean>(false);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState<boolean>(false);
  const [bookingDetailsError, setBookingDetailsError] = useState<string>('');

  const handleBookingAction = async (action: string, bookingId: string) => {
    try {
      setError('');
      let res;
      
      switch (action) {
        case 'assign':
          // Show worker selection modal instead of auto-assigning
          setBookingToAssign(bookingId);
          setShowWorkerSelection(true);
          break;
        case 'complete':
          res = await apiService.markBookingComplete(bookingId);
          break;
        case 'cancel':
          res = await apiService.cancelBooking(bookingId);
          break;
        case 'reactivate':
          res = await apiService.updateBookingStatus(bookingId, 'pending');
          break;
      }

      if (res && res.success) {
        // Refresh dashboard data
        fetchDashboardData();
      } else if (res) {
        setError(res.message || `Failed to ${action} booking`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || `Failed to ${action} booking`);
    }
  };

  const handleAssignWorker = async () => {
    try {
      if (!selectedWorkerId) {
        setError('Please select a worker');
        return;
      }

      const res = await apiService.assignBooking(bookingToAssign, selectedWorkerId);

      if (res.success) {
        fetchDashboardData();
        setShowWorkerSelection(false);
        setBookingToAssign('');
        setSelectedWorkerId('');
      } else {
        setError(res.message || 'Failed to assign booking');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to assign booking');
    }
  };
  
  const handleViewUser = async (userId: string) => {
    setUserDetailsLoading(true);
    setUserDetailsError('');
    setSelectedUser(null);
    setShowUserDetails(true);
    
    try {
      const res = await apiService.getUserDetails(userId);
      if (res.success && res.data) {
        setSelectedUser(res.data);
      } else {
        setUserDetailsError(res.message || 'Failed to fetch user details');
      }
    } catch (err: any) {
      setUserDetailsError(err.response?.data?.message || err.message || 'Failed to fetch user details');
    } finally {
      setUserDetailsLoading(false);
    }
  };
  
  const handleViewBooking = async (bookingId: string) => {
    setBookingDetailsLoading(true);
    setBookingDetailsError('');
    setSelectedBooking(null);
    setShowBookingDetails(true);
    
    try {
      const res = await apiService.getBooking(bookingId);
      if (res.success && res.data) {
        setSelectedBooking(res.data);
      } else {
        setBookingDetailsError(res.message || 'Failed to fetch booking details');
      }
    } catch (err: any) {
      setBookingDetailsError(err.response?.data?.message || err.message || 'Failed to fetch booking details');
    } finally {
      setBookingDetailsLoading(false);
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
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Sidebar - Hidden on mobile, visible on md screens and up */}
      <aside className="w-full md:w-64 bg-[#18181b] shadow-lg border-r border-gray-800 flex flex-col md:sticky md:top-0 md:h-screen">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 py-2">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`w-full text-left py-3 px-4 mb-2 rounded-lg transition-colors ${
                activeSection === section.id 
                  ? 'bg-gradient-to-r from-[#00ddff] to-[#c1ff72] text-black font-semibold' 
                  : 'text-gray-300 hover:bg-gray-800 border border-gray-700'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => logout()}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Navigation - Visible only on small screens */}
      <div className="md:hidden sticky top-0 z-10 bg-[#18181b] border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
          <select 
            className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-white"
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 gradient-text">Dashboard Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg transition-transform hover:scale-105">
                <h3 className="text-gray-400 mb-2 text-sm">Total Bookings</h3>
                <p className="text-3xl font-bold text-[#00ddff]">{dashboardData.totalBookings}</p>
              </div>
              
              <div className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg transition-transform hover:scale-105">
                <h3 className="text-gray-400 mb-2 text-sm">Pending Bookings</h3>
                <p className="text-3xl font-bold text-yellow-400">{dashboardData.pendingBookings}</p>
              </div>
              
              <div className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg transition-transform hover:scale-105">
                <h3 className="text-gray-400 mb-2 text-sm">Completed Bookings</h3>
                <p className="text-3xl font-bold text-green-400">{dashboardData.completedBookings}</p>
              </div>
              
              <div className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg transition-transform hover:scale-105">
                <h3 className="text-gray-400 mb-2 text-sm">Total Users</h3>
                <p className="text-3xl font-bold text-[#c1ff72]">{dashboardData.totalUsers}</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 gradient-text">Recent Bookings</h3>
            <div className="bg-[#18181b] rounded-lg border border-gray-800 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dashboardData.recentBookings.length > 0 ? (
                    dashboardData.recentBookings.map((booking: any) => (
                      <tr key={booking._id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dashboardData.recentBookings.indexOf(booking) + 1}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <button 
                            onClick={() => handleViewBooking(booking._id)}
                            className="text-[#00ddff] hover:text-[#c1ff72] transition-colors"
                          >
                            {booking.customer?.name || 'Unknown'}
                          </button>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.serviceType}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 md:px-6 py-4 text-center text-sm text-gray-500">No recent bookings</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Page View Analytics Section */}
            <h3 className="text-xl font-semibold mt-8 mb-4 gradient-text">Page View Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Landing Page vs Register Page Views */}
              <div className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-300">Page Views Comparison</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <h5 className="text-gray-400 mb-2 text-sm">Landing Page</h5>
                    <p className="text-3xl font-bold text-[#00ddff]">{dashboardData.landingPageViews}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <h5 className="text-gray-400 mb-2 text-sm">Register Page</h5>
                    <p className="text-3xl font-bold text-[#c1ff72]">{dashboardData.registerPageViews}</p>
                  </div>
                </div>
                <div className="h-64">
                  {(dashboardData.landingPageViews !== undefined && dashboardData.registerPageViews !== undefined) ? (
                    <Bar 
                      data={{
                      labels: ['Page Views'],
                      datasets: [
                        {
                          label: 'Landing Page',
                          data: [dashboardData.landingPageViews],
                          backgroundColor: 'rgba(0, 221, 255, 0.6)',
                          borderColor: '#00ddff',
                          borderWidth: 1,
                        },
                        {
                          label: 'Register Page',
                          data: [dashboardData.registerPageViews],
                          backgroundColor: 'rgba(193, 255, 114, 0.6)',
                          borderColor: '#c1ff72',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(75, 85, 99, 0.2)',
                          },
                          ticks: {
                            color: 'rgba(156, 163, 175, 1)',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: 'rgba(156, 163, 175, 1)',
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(156, 163, 175, 1)',
                          },
                        },
                      },
                    }}
                  />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">No page view data available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Daily Views Chart */}
              <div className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-300">Daily Page Views (Last 30 Days)</h4>
                <div className="h-64">
                  {dashboardData.dailyViews && dashboardData.dailyViews.length > 0 ? (
                    <Line
                      data={{
                        labels: dashboardData.dailyViews.map((item: any) => new Date(item._id.date).toLocaleDateString()),
                        datasets: [
                          {
                            label: 'Daily Views',
                            data: dashboardData.dailyViews.map((item: any) => item.count),
                            borderColor: 'rgba(0, 221, 255, 1)',
                            backgroundColor: 'rgba(0, 221, 255, 0.1)',
                            tension: 0.4,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(75, 85, 99, 0.2)',
                            },
                            ticks: {
                              color: 'rgba(156, 163, 175, 1)',
                            },
                          },
                          x: {
                            grid: {
                              color: 'rgba(75, 85, 99, 0.1)',
                            },
                            ticks: {
                              color: 'rgba(156, 163, 175, 1)',
                              maxRotation: 45,
                              minRotation: 45,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: 'rgba(156, 163, 175, 1)',
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No daily view data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Bookings Section */}
        {activeSection === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 gradient-text">All Bookings</h2>
            
            <div className="glass-card rounded-lg border border-gray-800 shadow-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dashboardData.allBookings.length > 0 ? (
                    dashboardData.allBookings.map((booking: any) => (
                      <tr key={booking._id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dashboardData.allBookings.indexOf(booking) + 1}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <button 
                            onClick={() => handleViewBooking(booking._id)}
                            className="text-[#00ddff] hover:text-[#c1ff72] transition-colors"
                          >
                            {booking.customer?.name || 'Unknown'}
                          </button>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.serviceType}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleBookingAction('assign', booking._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs transition-colors"
                              >
                                Assign
                              </button>
                            )}
                            {(booking.status === 'pending' || booking.status === 'assigned') && (
                              <button
                                onClick={() => handleBookingAction('complete', booking._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs transition-colors"
                              >
                                Complete
                              </button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => handleBookingAction('cancel', booking._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {booking.status === 'cancelled' && (
                              <button
                                onClick={() => handleBookingAction('reactivate', booking._id)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded-md text-xs transition-colors"
                              >
                                Reactivate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setBookingToDelete(booking._id);
                                setShowDeleteConfirmation(true);
                              }}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-md text-xs transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 md:px-6 py-4 text-center text-sm text-gray-500">No bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manage Users Section */}
        {activeSection === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 gradient-text">Manage Users</h2>
            
            <div className="glass-card rounded-lg border border-gray-800 shadow-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dashboardData.allUsers.length > 0 ? (
                    dashboardData.allUsers.map((user: any) => (
                      <tr key={user._id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.name}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{user.role}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs transition-colors"
                onClick={() => handleViewUser(user._id)}
              >
                View
              </button>
                            {/* Add more actions as needed */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 md:px-6 py-4 text-center text-sm text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Register Worker Section */}
        {activeSection === 'register-worker' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 gradient-text">Register New Worker</h2>
            
            {registerSuccess && (
              <div className="mb-4 p-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 rounded-lg">
                {registerSuccess}
              </div>
            )}
            
            {registerError && (
              <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-400 rounded-lg">
                {registerError}
              </div>
            )}
            
            <form onSubmit={handleRegisterWorker} className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="worker-name">Name</label>
                    <input
                      id="worker-name"
                      type="text"
                      placeholder="Enter full name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      required={true}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="worker-email">Email</label>
                    <input
                      id="worker-email"
                      type="email"
                      placeholder="Enter email address"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      required={true}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="worker-password">Password</label>
                    <div className="relative">
                      <input
                        id="worker-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                        required={true}
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="worker-phone">Phone</label>
                    <input
                      id="worker-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      required={true}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="worker-street">Street Address</label>
                    <input
                      id="worker-street"
                      type="text"
                      placeholder="Enter street address"
                      value={registerForm.street}
                      onChange={(e) => setRegisterForm({...registerForm, street: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2" htmlFor="worker-city">City</label>
                      <input
                        id="worker-city"
                        type="text"
                        placeholder="Enter city"
                        value={registerForm.city}
                        onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2" htmlFor="worker-state">State</label>
                      <input
                        id="worker-state"
                        type="text"
                        placeholder="Enter state"
                        value={registerForm.state}
                        onChange={(e) => setRegisterForm({...registerForm, state: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="worker-zip">ZIP Code</label>
                    <input
                      id="worker-zip"
                      type="text"
                      placeholder="Enter ZIP code"
                      value={registerForm.zipCode}
                      onChange={(e) => setRegisterForm({...registerForm, zipCode: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                    />
                  </div>
                  
                  <div className="flex items-center mt-6">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={registerForm.isActive}
                      onChange={(e) => setRegisterForm({...registerForm, isActive: e.target.checked})}
                      className="h-5 w-5 text-[#00ddff] focus:ring-[#00ddff] border-gray-700 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-gray-400">
                      Active Account
                    </label>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#00ddff] to-[#c1ff72] hover:opacity-90 rounded-lg text-black font-semibold transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {registerLoading ? 'Registering...' : 'Register Worker'}
              </button>
            </form>
          </div>
        )}

        {/* Register Admin Section */}
        {activeSection === 'register-admin' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 gradient-text">Register New Admin</h2>
            
            {registerSuccess && (
              <div className="mb-4 p-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 rounded-lg">
                {registerSuccess}
              </div>
            )}
            
            {registerError && (
              <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-400 rounded-lg">
                {registerError}
              </div>
            )}
            
            <form onSubmit={handleRegisterAdmin} className="glass-card p-6 rounded-lg border border-gray-800 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="admin-name">Name</label>
                    <input
                      id="admin-name"
                      type="text"
                      placeholder="Enter full name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      required={true}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="admin-email">Email</label>
                    <input
                      id="admin-email"
                      type="email"
                      placeholder="Enter email address"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      required={true}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="admin-password">Password</label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                        required={true}
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="admin-phone">Phone</label>
                    <input
                      id="admin-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      required={true}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="admin-street">Street Address</label>
                    <input
                      id="admin-street"
                      type="text"
                      placeholder="Enter street address"
                      value={registerForm.street}
                      onChange={(e) => setRegisterForm({...registerForm, street: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2" htmlFor="admin-city">City</label>
                      <input
                        id="admin-city"
                        type="text"
                        placeholder="Enter city"
                        value={registerForm.city}
                        onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2" htmlFor="admin-state">State</label>
                      <input
                        id="admin-state"
                        type="text"
                        placeholder="Enter state"
                        value={registerForm.state}
                        onChange={(e) => setRegisterForm({...registerForm, state: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="admin-zip">ZIP Code</label>
                    <input
                      id="admin-zip"
                      type="text"
                      placeholder="Enter ZIP code"
                      value={registerForm.zipCode}
                      onChange={(e) => setRegisterForm({...registerForm, zipCode: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] placeholder-gray-500 transition-colors"
                    />
                  </div>
                  
                  <div className="flex items-center mt-6">
                    <input
                      id="isActiveAdmin"
                      type="checkbox"
                      checked={registerForm.isActive}
                      onChange={(e) => setRegisterForm({...registerForm, isActive: e.target.checked})}
                      className="h-5 w-5 text-[#00ddff] focus:ring-[#00ddff] border-gray-700 rounded"
                    />
                    <label htmlFor="isActiveAdmin" className="ml-2 block text-gray-400">
                      Active Account
                    </label>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#00ddff] to-[#c1ff72] hover:opacity-90 rounded-lg text-black font-semibold transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {registerLoading ? 'Registering...' : 'Register Admin'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Worker Selection Modal */}
      {showWorkerSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-lg border border-gray-800 w-full max-w-md animate-fadeInScale">
            <h3 className="text-xl font-bold mb-4 gradient-text">Assign Worker</h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Select Worker</label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ddff] focus:border-[#00ddff] transition-colors"
              >
                <option value="">Select a worker</option>
                {dashboardData.workers.length > 0 ? (
                  dashboardData.workers.map((worker: any) => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No available workers</option>
                )}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWorkerSelection(false);
                  setBookingToAssign('');
                  setSelectedWorkerId('');
                }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWorker}
                className="px-4 py-2 bg-gradient-to-r from-[#00ddff] to-[#c1ff72] rounded-lg text-black font-semibold hover:opacity-90 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedWorkerId}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-lg border border-gray-800 w-full max-w-md animate-fadeInScale">
            <h3 className="text-xl font-bold mb-4 text-red-500">Confirm Delete</h3>
            <p className="mb-6 text-gray-300">Are you sure you want to delete this booking? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setBookingToDelete('');
                }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-all transform hover:scale-[1.01]"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteBooking(bookingToDelete)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all transform hover:scale-[1.01]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-lg border border-gray-800 w-full max-w-4xl animate-fadeInScale max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold gradient-text">User Details</h3>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="btn-secondary px-3 py-1 rounded-lg text-sm"
              >
                Close
              </button>
            </div>

            {userDetailsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ddff]"></div>
              </div>
            ) : userDetailsError ? (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-lg">
                {userDetailsError}
              </div>
            ) : selectedUser ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-800">User Information</h4>
                  
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
                        <span className={`status-badge ${selectedUser.role === 'admin' ? 'status-success' : selectedUser.role === 'worker' ? 'status-info' : 'status-default'}`}>
                          {selectedUser.role}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p className="text-white font-medium">
                        <span className={`status-badge ${selectedUser.isActive ? 'status-success' : 'status-danger'}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    {selectedUser.role === 'worker' && (
                      <div>
                        <p className="text-gray-400 text-sm">Availability</p>
                        <p className="text-white font-medium">
                          <span className={`status-badge ${selectedUser.isAvailable ? 'status-success' : 'status-warning'}`}>
                            {selectedUser.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Address Information */}
                  {selectedUser.address && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2 pb-2 border-b border-gray-800">Address</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Street</p>
                          <p className="text-white font-medium">{selectedUser.address.street || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">City</p>
                          <p className="text-white font-medium">{selectedUser.address.city || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">State</p>
                          <p className="text-white font-medium">{selectedUser.address.state || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">ZIP Code</p>
                          <p className="text-white font-medium">{selectedUser.address.zipCode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User Bookings */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-800">
                    {selectedUser.role === 'worker' ? 'Assigned Bookings' : 'Bookings'}
                  </h4>
                  
                  {selectedUser.bookings && selectedUser.bookings.length > 0 ? (
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
                        <tbody>
                          {selectedUser.bookings.map((booking: any) => (
                            <tr key={booking._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {booking.serviceType}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {new Date(booking.scheduledDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`status-badge ${
                                  booking.status === 'pending' ? 'status-warning' :
                                  booking.status === 'confirmed' ? 'status-info' :
                                  booking.status === 'in-progress' ? 'status-primary' :
                                  booking.status === 'completed' ? 'status-success' :
                                  'status-danger'
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
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No bookings found for this user.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                User details not available.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {bookingDetailsLoading ? (
            <div className="glass-card p-6 rounded-lg border border-gray-800 w-full max-w-md animate-fadeInScale">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ddff]"></div>
              </div>
            </div>
          ) : bookingDetailsError ? (
            <div className="glass-card p-6 rounded-lg border border-gray-800 w-full max-w-md animate-fadeInScale">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-500">Error</h3>
                <button
                  onClick={() => {
                    setShowBookingDetails(false);
                    setSelectedBooking(null);
                  }}
                  className="btn-secondary px-3 py-1 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-lg">
                {bookingDetailsError}
              </div>
            </div>
          ) : selectedBooking ? (
            <BookingDetailsModal
              booking={selectedBooking}
              onClose={() => {
                setShowBookingDetails(false);
                setSelectedBooking(null);
              }}
              isOpen={showBookingDetails}
            />
          ) : (
            <div className="glass-card p-6 rounded-lg border border-gray-800 w-full max-w-md animate-fadeInScale">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold gradient-text">Booking Details</h3>
                <button
                  onClick={() => {
                    setShowBookingDetails(false);
                    setSelectedBooking(null);
                  }}
                  className="btn-secondary px-3 py-1 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
              <div className="text-center py-8 text-gray-400">
                Booking details not available.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
