import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Booking, User } from '../types';

const sections = [
  { id: 'pending', label: 'Pending Bookings' },
  { id: 'past', label: 'Past Bookings' },
];

const WorkerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('pending');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getBookings();
      if (res.success && res.data) {
        // Only bookings assigned to this worker
        setBookings(res.data.filter(
          (b: Booking) => (typeof b.worker === 'object' ? b.worker._id : b.worker) === user?._id
        ));
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

  const handleMarkComplete = async (bookingId: string) => {
    setSuccess('');
    setError('');
    try {
      const res = await apiService.markBookingComplete(bookingId);
      if (res.success) {
        setSuccess('Booking marked as complete!');
        fetchBookings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Failed to mark booking complete');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to mark booking complete');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewUser = (booking: Booking) => {
    if (typeof booking.customer === 'object') {
      setSelectedUser(booking.customer);
      setSelectedBooking(booking);
    }
  };

  // Filter bookings
  const pendingBookings = bookings.filter(b => b.status === 'assigned' || b.status === 'in-progress');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="min-h-screen flex bg-[#10141a] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#18181b] flex flex-col items-center py-8 shadow-xl">
        <img src="/logo.png" alt="Logo" className="w-32 mb-8 rounded-xl bg-white p-2" />
        <nav className="flex flex-col gap-4 w-full px-4">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`py-3 px-4 rounded-lg text-lg font-semibold transition-colors duration-200 w-full text-left ${activeSection === section.id ? 'bg-[#00ddff] text-black' : 'bg-[#23272f] hover:bg-[#00ddff] hover:text-black'}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto w-full px-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 mt-8 rounded-lg font-bold bg-[#c1ff72] text-black hover:bg-[#00ddff] transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 bg-[#10141a]">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text">Worker Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">{user?.name} (Worker)</span>
          </div>
        </header>
        {/* Section Content */}
        {activeSection === 'pending' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Pending Bookings</h2>
            {error && <div className="text-red-500 text-center font-semibold bg-red-50 rounded-lg py-2 px-3 border border-red-200 mb-4">{error}</div>}
            {success && <div className="text-green-500 text-center font-semibold bg-green-50 rounded-lg py-2 px-3 border border-green-200 mb-4">{success}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#23272f] rounded-xl">
                <thead>
                  <tr className="text-left text-[#00ddff]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((b) => (
                    <tr key={b._id} className="border-b border-[#18181b]">
                      <td className="py-2 px-4">{typeof b.customer === 'object' ? b.customer.name : b.customer}</td>
                      <td className="py-2 px-4">{b.serviceType}</td>
                      <td className="py-2 px-4">{b.scheduledDate}</td>
                      <td className="py-2 px-4">{b.status}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button type="button" className="btn-success" style={{ background: '#00ddff', color: '#000', border: 'none', fontWeight: 600 }} onClick={() => handleMarkComplete(b._id)}>Mark as Completed</button>
                        <button type="button" className="btn-outline" style={{ borderColor: '#c1ff72', color: '#c1ff72' }} onClick={() => handleViewUser(b)}>View User</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {activeSection === 'past' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Past Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#23272f] rounded-xl">
                <thead>
                  <tr className="text-left text-[#00ddff]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastBookings.map((b) => (
                    <tr key={b._id} className="border-b border-[#18181b]">
                      <td className="py-2 px-4">{typeof b.customer === 'object' ? b.customer.name : b.customer}</td>
                      <td className="py-2 px-4">{b.serviceType}</td>
                      <td className="py-2 px-4">{b.scheduledDate}</td>
                      <td className="py-2 px-4">{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {/* User Details Modal */}
        {selectedUser && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-[#23272f] rounded-2xl shadow-xl p-8 flex flex-col gap-6 w-full max-w-md border-2 border-[#00ddff]">
              <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#00ddff', letterSpacing: 0.5 }}>
                User Details
              </h2>
              <div className="flex flex-col gap-2">
                <span><strong>Name:</strong> {selectedUser.name}</span>
                <span><strong>Mobile:</strong> {selectedUser.phone}</span>
                <span><strong>Address:</strong> {selectedUser.address?.street}, {selectedUser.address?.city}, {selectedUser.address?.state}, {selectedUser.address?.zipCode}</span>
                <span><strong>Cleaning Type:</strong> {selectedBooking.serviceType}</span>
              </div>
              <button className="btn-primary mt-4" onClick={() => { setSelectedUser(null); setSelectedBooking(null); }}>Close</button>
            </div>
          </div>
        )}
      </main>
      <style>{`
        .gradient-text {
          background: linear-gradient(90deg, #00ddff 0%, #c1ff72 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default WorkerDashboard; 