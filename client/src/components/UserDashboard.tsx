import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import BookingForm from './BookingForm';

const SUPPORT_EMAIL = 'support@caarvo.com';
const SUPPORT_PHONE = '+91 9753644482';
const SUPPORT_WHATSAPP = '+91 9753644482';

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setError(res.message || 'Failed to load bookings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleNewBooking = () => {
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    setBookingLoading(true);
    setBookingError('');
    try {
      const response = await apiService.createBooking(bookingData);
      if (response.success) {
        setShowBookingModal(false);
        fetchUserBookings();
      } else {
        setBookingError(response.error || 'Failed to create booking');
      }
    } catch (error: any) {
      setBookingError(error.message || 'Error creating booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookingCancel = () => {
    setShowBookingModal(false);
    setBookingError('');
  };

  const handleManageCars = () => {
    navigate('/vehicles');
  };

  const handleManageAddresses = () => {
    navigate('/addresses');
  };

  const handleProfileSettings = () => {
    setShowProfileDropdown(false);
    navigate('/profile-settings');
  };

  const handleSupport = () => {
    setShowProfileDropdown(false);
    setShowSupportModal(true);
  };

  const closeSupportModal = () => setShowSupportModal(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'in-progress':
        return 'text-orange-600 bg-orange-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate > now && booking.status !== 'completed' && booking.status !== 'cancelled';
    });
  };

  const getPastBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate <= now || booking.status === 'completed' || booking.status === 'cancelled';
    });
  };

  // Determine if user has used Demo Wash
  const hasUsedDemoWash = bookings.some(b => b.serviceType === 'demo');

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

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Modal for Booking */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative z-10 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="bg-[#18181b] rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-800">
              <BookingForm
                onSubmit={handleBookingSubmit}
                onCancel={handleBookingCancel}
                isLoading={bookingLoading}
                hasUsedDemoWash={hasUsedDemoWash}
              />
              {bookingError && <div className="text-red-400 text-center mt-2">{bookingError}</div>}
            </div>
          </div>
        </div>
      )}
      {/* Blur background when modal is open */}
      <div className={showBookingModal ? 'pointer-events-none filter blur-sm select-none' : ''}>
        {/* Header */}
        <header className="bg-[#18181b] shadow-lg border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 gap-4 sm:gap-0">
              <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
                <img 
                  src="/Caarvo no back 2.png" 
                  alt="Caarvo Logo" 
                  className="h-10 w-auto sm:h-8"
                  style={{
                    filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))',
                    maxHeight: '40px',
                    maxWidth: '100%'
                  }}
                />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
                <span className="text-xs sm:text-sm text-gray-300">Welcome, {user.name}</span>
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-[#00ddff] text-black flex items-center justify-center hover:bg-[#c1ff72] transition-colors"
                  >
                    <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#18181b] rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                      <button
                        onClick={handleProfileSettings}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Profile Settings
                      </button>
                      <button
                        onClick={handleNewBooking}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Book a Car Wash
                      </button>
                      <button
                        onClick={handleSupport}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                        </svg>
                        Support
                      </button>
                      <hr className="my-2 border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#18181b] rounded-xl shadow-lg p-8 border border-gray-800 max-w-sm w-full relative">
            <button
              onClick={closeSupportModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-[#00ddff] text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#00ddff] text-center">Contact Support</h2>
            <div className="space-y-4">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center px-4 py-3 rounded-lg bg-black border border-gray-700 hover:bg-[#00ddff] hover:text-black transition-colors"
                target="_blank" rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" />
                </svg>
                Email: {SUPPORT_EMAIL}
              </a>
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, '')}`}
                className="flex items-center px-4 py-3 rounded-lg bg-black border border-gray-700 hover:bg-[#c1ff72] hover:text-black transition-colors"
                target="_blank" rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 15.674A8.001 8.001 0 1112 4a8.001 8.001 0 014.862 11.674z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                </svg>
                WhatsApp: {SUPPORT_WHATSAPP}
              </a>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="flex items-center px-4 py-3 rounded-lg bg-black border border-gray-700 hover:bg-[#00ddff] hover:text-black transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm10-10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Call: {SUPPORT_PHONE}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-[#18181b] rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <button
                onClick={handleNewBooking}
                className="bg-[#00ddff] text-black px-4 py-3 sm:px-6 sm:py-4 rounded-lg hover:bg-[#c1ff72] transition-colors font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book New Service
              </button>
              <button
                onClick={handleManageCars}
                className="bg-[#c1ff72] text-black px-4 py-3 sm:px-6 sm:py-4 rounded-lg hover:bg-[#00ddff] transition-colors font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Manage Cars
              </button>
              <button
                onClick={handleManageAddresses}
                className="bg-gradient-to-r from-[#00ddff] to-[#c1ff72] text-black px-4 py-3 sm:px-6 sm:py-4 rounded-lg hover:from-[#c1ff72] hover:to-[#00ddff] transition-all font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Addresses
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-[#18181b] rounded-xl shadow-lg border border-gray-800">
          <div className="px-2 sm:px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <h2 className="text-base sm:text-lg font-semibold text-white">My Bookings</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleNewBooking}
                className="p-2 text-[#00ddff] hover:bg-[#00ddff] hover:text-black rounded-lg transition-colors"
                title="Add New Booking"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={fetchUserBookings}
                className="p-2 text-[#c1ff72] hover:bg-[#c1ff72] hover:text-black rounded-lg transition-colors"
                title="Refresh Bookings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ddff] mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchUserBookings}
                className="mt-2 bg-[#00ddff] text-black px-4 py-2 rounded hover:bg-[#c1ff72] font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">No bookings found.</p>
            </div>
          ) : (
            <div className="p-2 sm:p-6">
              {/* Upcoming Bookings */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Upcoming Bookings</h3>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-700">
                    <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">No upcoming bookings</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700 text-xs sm:text-sm">
                      <thead className="bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#18181b] divide-y divide-gray-700">
                        {upcomingBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {booking.serviceType}
                              </div>
                              <div className="text-sm text-gray-400">
                                {booking.vehicle?.make} {booking.vehicle?.model}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(booking.scheduledDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c1ff72] font-semibold">
                              ₹{booking.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Past Bookings */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Past Bookings</h3>
                {pastBookings.length === 0 ? (
                  <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-700">
                    <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No past bookings</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700 text-xs sm:text-sm">
                      <thead className="bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00ddff] uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#18181b] divide-y divide-gray-700">
                        {pastBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {booking.serviceType}
                              </div>
                              <div className="text-sm text-gray-400">
                                {booking.vehicle?.make} {booking.vehicle?.model}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(booking.scheduledDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c1ff72] font-semibold">
                              ₹{booking.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div> {/* <-- close the blurred content div here */}
  </div>
  );
};

export default UserDashboard; 