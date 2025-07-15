import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleManagement from './VehicleManagement';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Vehicle, Booking } from '../types';

const Dashboard: React.FC = () => {
const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [showVehicleManager, setShowVehicleManager] = useState(false);
  const [userStats, setUserStats] = useState({ bookings: 0, vehicles: 0, moneySaved: 0, nextBooking: 'None' });
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    if (user?.role === 'user') {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch bookings
      const bookingsResponse = await apiService.getBookings();
      const bookings = bookingsResponse.success ? bookingsResponse.data || [] : [];
      
      // Fetch vehicles
      const vehiclesResponse = await apiService.getVehicles();
      const vehicles = vehiclesResponse.success ? vehiclesResponse.data || [] : [];
      
      // Calculate user stats
      const totalBookings = bookings.length;
      const totalVehicles = vehicles.length;
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const moneySaved = completedBookings.reduce((sum, booking) => sum + (booking.price * 0.1), 0); // 10% savings calculation
      
      // Find next booking
      const futureBookings = bookings.filter(b => new Date(b.scheduledDate) > new Date() && b.status !== 'cancelled');
      const nextBooking = futureBookings.length > 0 ? 
        new Date(futureBookings[0].scheduledDate).toLocaleDateString() : 'None';
      
      setUserStats({
        bookings: totalBookings,
        vehicles: totalVehicles,
        moneySaved: Math.round(moneySaved),
        nextBooking
      });
      
      // Set recent vehicles (limit to 2)
      setRecentVehicles(vehicles.slice(0, 2));
      
      // Set upcoming bookings
      setUpcomingBookings(futureBookings.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const stats = {
    admin: [
      { label: 'Total Users', value: '1,234', color: 'bg-blue-500', icon: '👥' },
      { label: 'Active Bookings', value: '87', color: 'bg-green-500', icon: '📅' },
      { label: 'Total Revenue', value: '$12,450', color: 'bg-purple-500', icon: '💰' },
      { label: 'Workers Active', value: '23', color: 'bg-orange-500', icon: '🧑‍💼' }
    ],
    user: [
      { label: 'Total Bookings', value: userStats.bookings.toString(), color: 'bg-blue-500', icon: '📅' },
      { label: 'Vehicles', value: userStats.vehicles.toString(), color: 'bg-green-500', icon: '🚗' },
      { label: 'Money Saved', value: `$${userStats.moneySaved}`, color: 'bg-purple-500', icon: '💰' },
      { label: 'Next Booking', value: userStats.nextBooking, color: 'bg-orange-500', icon: '⏰' }
    ],
    worker: [
      { label: 'Jobs Today', value: '8', color: 'bg-blue-500', icon: '📋' },
      { label: 'Completed', value: '5', color: 'bg-green-500', icon: '✅' },
      { label: 'Earnings', value: '$320', color: 'bg-purple-500', icon: '💰' },
      { label: 'Rating', value: '4.9', color: 'bg-orange-500', icon: '⭐' }
    ]
  };

  const quickActions = {
    admin: [
      { title: 'User Management', desc: 'Manage users and permissions', icon: '👤' },
      { title: 'Booking Overview', desc: 'View all bookings', icon: '📊' },
      { title: 'Analytics', desc: 'View detailed analytics', icon: '📈' },
      { title: 'Settings', desc: 'System settings', icon: '⚙️' }
    ],
    user: [
      { title: 'Book Service', desc: 'Schedule a new cleaning', icon: '📅' },
      { title: 'Booking History', desc: 'View past bookings', icon: '📋' },
      { title: 'Profile', desc: 'Update your profile', icon: '👤' }
    ],
    worker: [
      { title: 'Today\'s Jobs', desc: 'View assigned jobs', icon: '📋' },
      { title: 'Update Status', desc: 'Update job status', icon: '✅' },
      { title: 'Schedule', desc: 'View your schedule', icon: '📅' },
      { title: 'Profile', desc: 'Update your profile', icon: '👤' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">SparkleWash</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.name} <span className="text-gray-500">({user?.role})</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
Hello, {user?.name}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            {user?.role === 'admin' && 'Manage your car wash business from here.'}
            {user?.role === 'user' && 'Ready to book your car wash?'}
            {user?.role === 'worker' && 'Here are your tasks for today.'}
          </p>
        </div>

{/* Vehicle Management */}
        {showVehicleManager && (
          <VehicleManagement 
            onClose={() => {
              setShowVehicleManager(false);
              // Refresh data after vehicle management
              fetchUserData();
            }}
          />
        )}


        {/* Stats Grid - Only show for admin and worker roles */}
        {user?.role !== 'user' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats[user?.role as keyof typeof stats]?.map((stat, index) => (
              <div key={index} className="card hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white text-xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions[user?.role as keyof typeof quickActions]?.map((action, index) => (
              <div 
                key={index} 
                className="card card-hover cursor-pointer group"
                onClick={() => {
                  if (action.title === 'Book Service') {
                    navigate('/booking');
                  }
                  // Add more actions as needed
                }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role-specific content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {user?.role === 'admin' && (
            <>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-500">📊</span>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">U</div>
                    <div>
                      <p className="font-medium text-gray-900">New user registered</p>
                      <p className="text-sm text-gray-600">John Doe joined 5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">B</div>
                    <div>
                      <p className="font-medium text-gray-900">Booking completed</p>
                      <p className="text-sm text-gray-600">Tesla Model 3 - Premium wash</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-purple-500">💰</span>
                  Revenue Overview
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today</span>
                    <span className="font-semibold text-gray-900">$1,240</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold text-gray-900">$8,670</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">$32,450</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {user?.role === 'user' && (
            <>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-500">🚗</span>
                  My Vehicles
                </h3>
                <div className="space-y-3">
                  {recentVehicles.length > 0 ? (
                    recentVehicles.map((vehicle: Vehicle, index: number) => (
                      <div key={vehicle._id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                          {vehicle.make.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No vehicles added yet.</p>
                      <button
                        onClick={() => setShowVehicleManager(true)}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Add your first vehicle
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-500">📅</span>
                  Upcoming Bookings
                </h3>
                <div className="space-y-3">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking: Booking) => (
                      <div key={booking._id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-gray-900">{booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)} Wash</p>
                        <p className="text-sm text-gray-600">{new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}</p>
                        <p className="text-sm text-blue-600 font-medium">{(booking.vehicle as any)?.make} {(booking.vehicle as any)?.model}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No upcoming bookings.</p>
                      <button
                      onClick={() => navigate('/booking') }
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Book your first service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {user?.role === 'worker' && (
            <>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-orange-500">📋</span>
                  Today's Jobs
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">1</div>
                    <div>
                      <p className="font-medium text-gray-900">BMW X5 - Premium Wash</p>
                      <p className="text-sm text-gray-600">10:00 AM - 123 Main St</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                    <div>
                      <p className="font-medium text-gray-900">Toyota Camry - Basic Wash</p>
                      <p className="text-sm text-gray-600">Completed - 456 Oak Ave</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-purple-500">📈</span>
                  Performance
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Jobs Completed</span>
                    <span className="font-semibold text-gray-900">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold text-gray-900">4.9 ⭐</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">32 jobs</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
