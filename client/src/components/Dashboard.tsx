import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const sections = [
  { id: 'bookings', label: 'All Bookings' },
  { id: 'revenue', label: 'Revenue Overview' },
  { id: 'activity', label: 'Recent Activity' },
  { id: 'users', label: 'Manage Users' },
  { id: 'register-worker', label: 'Register Worker' },
  { id: 'register-admin', label: 'Register Admin' },
];

type UserRole = 'user' | 'admin' | 'worker';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('revenue');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerRole, setRegisterRole] = useState<'worker' | 'admin'>('worker');
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '', street: '', city: '', state: '', zipCode: '', isActive: true });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Booking action notifications
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Real data state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  // Edit User State
  const [editUser, setEditUser] = useState<any>(null);
  const [editUserForm, setEditUserForm] = useState<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }>({
    _id: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setAnalyticsLoading(true);
    setUsersLoading(true);
    setBookingsLoading(true);
    setAnalyticsError('');
    setUsersError('');
    setBookingsError('');
    try {
      const [analyticsRes, usersRes, bookingsRes] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getAllUsers(),
        apiService.getAllBookings(),
      ]);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      else setAnalyticsError(analyticsRes.message || 'Failed to load analytics');
      if (usersRes.success) setUsers(usersRes.data || []);
      else setUsersError(usersRes.message || 'Failed to load users');
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      else setBookingsError(bookingsRes.message || 'Failed to load bookings');
    } catch (err: any) {
      setAnalyticsError('Failed to load analytics');
      setUsersError('Failed to load users');
      setBookingsError('Failed to load bookings');
    } finally {
      setAnalyticsLoading(false);
      setUsersLoading(false);
      setBookingsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);
    try {
      let res;
      if (registerRole === 'admin') {
        res = await apiService.registerAdmin({
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
      } else {
        res = await apiService.registerWorker({
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
      }
      if (res.success) {
        setRegisterSuccess(`${registerRole === 'worker' ? 'Worker' : 'Admin'} registered successfully!`);
        setRegisterForm({ name: '', email: '', password: '', phone: '', street: '', city: '', state: '', zipCode: '', isActive: true });
        fetchDashboardData();
      } else {
        setRegisterError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
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
        setRegisterForm({ name: '', email: '', password: '', phone: '', street: '', city: '', state: '', zipCode: '', isActive: true });
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
        setRegisterForm({ name: '', email: '', password: '', phone: '', street: '', city: '', state: '', zipCode: '', isActive: true });
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

  const handleAssignBooking = async (bookingId: string) => {
    try {
      setBookingSuccess(''); setBookingError('');
      // Prompt for worker selection (for now, assign to self or first worker)
      const workerId = users.find(u => u.role === 'worker')?._id || user?._id;
      const res = await apiService.assignBooking(bookingId, workerId);
      if (res.success) {
        setBookingSuccess('Booking assigned successfully!');
        fetchDashboardData();
        setTimeout(() => setBookingSuccess(''), 3000);
      } else {
        setBookingError(res.message || 'Failed to assign booking');
        setTimeout(() => setBookingError(''), 3000);
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to assign booking');
      setTimeout(() => setBookingError(''), 3000);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setBookingSuccess(''); setBookingError('');
      const res = await apiService.cancelBooking(bookingId);
      if (res.success) {
        setBookingSuccess('Booking cancelled successfully!');
        fetchDashboardData();
        setTimeout(() => setBookingSuccess(''), 3000);
      } else {
        setBookingError(res.message || 'Failed to cancel booking');
        setTimeout(() => setBookingError(''), 3000);
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to cancel booking');
      setTimeout(() => setBookingError(''), 3000);
    }
  };

  const handleMarkComplete = async (bookingId: string) => {
    try {
      setBookingSuccess(''); setBookingError('');
      const res = await apiService.markBookingComplete(bookingId);
      if (res.success) {
        setBookingSuccess('Booking marked as complete!');
        fetchDashboardData();
        setTimeout(() => setBookingSuccess(''), 3000);
      } else {
        setBookingError(res.message || 'Failed to mark booking complete');
        setTimeout(() => setBookingError(''), 3000);
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to mark booking complete');
      setTimeout(() => setBookingError(''), 3000);
    }
  };

  // Add handler to move booking back to pending
  const handleMoveToPending = async (bookingId: string) => {
    try {
      setBookingSuccess(''); setBookingError('');
      const res = await apiService.updateBookingStatus(bookingId, 'pending');
      if (res.success) {
        setBookingSuccess('Booking moved to pending!');
        fetchDashboardData();
        setTimeout(() => setBookingSuccess(''), 3000);
      } else {
        setBookingError(res.message || 'Failed to move booking to pending');
        setTimeout(() => setBookingError(''), 3000);
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to move booking to pending');
      setTimeout(() => setBookingError(''), 3000);
    }
  };

  const handleEditUser = (user: any) => {
    setEditUser(user);
    setEditUserForm({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      isActive: user.isActive,
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);
    try {
      const res = await apiService.updateUser(editUserForm._id, {
        name: editUserForm.name,
        email: editUserForm.email,
        phone: editUserForm.phone,
        role: editUserForm.role,
        isActive: editUserForm.isActive,
        address: {
          street: editUserForm.street,
          city: editUserForm.city,
          state: editUserForm.state,
          zipCode: editUserForm.zipCode,
        },
      });
      if (res.success) {
        setRegisterSuccess('User updated successfully!');
        fetchDashboardData();
        setEditUser(null);
      } else {
        setRegisterError(res.message || 'Failed to update user');
      }
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setRegisterLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">{user?.name} ({user?.role})</span>
          </div>
        </header>
        {/* Section Content */}
        {activeSection === 'revenue' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Revenue Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-[#23272f] rounded-xl p-8 flex flex-col items-center shadow-lg">
                <span className="text-4xl font-bold text-[#00ddff]">₹{analytics?.totalRevenue || 'N/A'}</span>
                <span className="text-lg mt-2 text-gray-300">Total Revenue</span>
              </div>
              <div className="bg-[#23272f] rounded-xl p-8 flex flex-col items-center shadow-lg">
                <span className="text-4xl font-bold text-[#c1ff72]">{analytics?.totalBookings || 'N/A'}</span>
                <span className="text-lg mt-2 text-gray-300">Total Bookings</span>
              </div>
              <div className="bg-[#23272f] rounded-xl p-8 flex flex-col items-center shadow-lg">
                <span className="text-4xl font-bold text-[#00ddff]">{analytics?.activeWorkers || 'N/A'}</span>
                <span className="text-lg mt-2 text-gray-300">Active Workers</span>
              </div>
            </div>
            {/* Optionally add a chart here */}
          </section>
        )}
        {activeSection === 'bookings' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">All Bookings</h2>
            {bookingError && <div className="text-red-500 text-center font-semibold bg-red-50 rounded-lg py-2 px-3 border border-red-200 mb-4">{bookingError}</div>}
            {bookingSuccess && <div className="text-green-500 text-center font-semibold bg-green-50 rounded-lg py-2 px-3 border border-green-200 mb-4">{bookingSuccess}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#23272f] rounded-xl">
                <thead>
                  <tr className="text-left text-[#00ddff]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Worker</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sort bookings: pending > assigned > cancelled/completed */}
                  {bookings
                    .slice()
                    .sort((a, b) => {
                      const statusOrder: any = { pending: 0, assigned: 1, cancelled: 2, completed: 3 };
                      return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
                    })
                    .map((b) => (
                      <tr key={b._id} className={`border-b border-[#18181b] ${b.status === 'pending' ? 'bg-yellow-100 text-black' : ''}`}>
                        <td className="py-2 px-4">{typeof b.customer === 'object' ? b.customer.name : b.customer}</td>
                        <td className="py-2 px-4">{b.serviceType}</td>
                        <td className="py-2 px-4">{b.scheduledDate}</td>
                        <td className="py-2 px-4">{b.status}</td>
                        <td className="py-2 px-4">{typeof b.worker === 'object' ? b.worker.name : b.worker || '-'}</td>
                        <td className="py-2 px-4 flex gap-2">
                          {b.status === 'pending' && (
                            <>
                              <button type="button" className="btn-primary" onClick={() => { console.log('Assign', b._id); handleAssignBooking(b._id); }}>Assign</button>
                              <button type="button" className="btn-success" style={{ background: '#00ddff', color: '#000', border: 'none', fontWeight: 600 }} onClick={() => { console.log('Mark as Completed', b._id); handleMarkComplete(b._id); }}>Mark as Completed</button>
                              <button type="button" className="btn-danger" style={{ background: '#ff4d4f', color: '#fff', border: 'none' }} onClick={() => { console.log('Cancel', b._id); handleCancelBooking(b._id); }}>Cancel</button>
                            </>
                          )}
                          {b.status === 'assigned' && (
                            <>
                              <button type="button" className="btn-success" style={{ background: '#00ddff', color: '#000', border: 'none', fontWeight: 600 }} onClick={() => { console.log('Mark as Completed', b._id); handleMarkComplete(b._id); }}>Mark as Completed</button>
                              <button type="button" className="btn-outline" style={{ borderColor: '#c1ff72', color: '#c1ff72' }} onClick={() => handleMoveToPending(b._id)}>Move to Pending</button>
                            </>
                          )}
                          {(b.status === 'completed' || b.status === 'cancelled') && (
                            <button type="button" className="btn-outline" style={{ borderColor: '#00ddff', color: '#00ddff' }} onClick={() => handleMoveToPending(b._id)}>Move to Pending</button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {activeSection === 'activity' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <ul className="space-y-4">
              {bookings.map((b) => (
                <li key={b._id} className="bg-[#23272f] rounded-lg p-4 flex items-center gap-4 shadow">
                  <span className="w-3 h-3 rounded-full bg-[#00ddff] inline-block"></span>
                  <span className="flex-1">{typeof b.customer === 'object' ? b.customer.name : b.customer} booked {b.serviceType} on {b.scheduledDate} - Status: {b.status}</span>
                  <span className="text-sm text-gray-400">{b.createdAt}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {activeSection === 'users' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Users & Permissions</h2>
            </div>
            <table className="min-w-full bg-[#23272f] rounded-xl mb-8">
              <thead>
                <tr className="text-left text-[#00ddff]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-[#18181b]">
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">{u.role}</td>
                    <td className="py-2 px-4">{u.isActive ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4">
                      <button className="btn-outline" style={{ borderColor: '#00ddff', color: '#00ddff' }} onClick={() => handleEditUser(u)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Edit User Modal */}
            {editUser && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <form
                  onSubmit={handleUpdateUser}
                  className="bg-[#23272f] rounded-2xl shadow-xl p-8 flex flex-col gap-6 w-full max-w-md border-2 border-[#00ddff]"
                >
                  <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#00ddff', letterSpacing: 0.5 }}>
                    Edit User
                  </h2>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Name</label>
                    <input
                      type="text"
                      value={editUserForm.name}
                      onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Email</label>
                    <input
                      type="email"
                      value={editUserForm.email}
                      onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Phone</label>
                    <input
                      type="text"
                      value={editUserForm.phone}
                      onChange={e => setEditUserForm(f => ({ ...f, phone: e.target.value }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Role</label>
                    <select
                      value={editUserForm.role}
                      onChange={e => setEditUserForm(f => ({ ...f, role: e.target.value as UserRole }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    >
                      <option value="user">User</option>
                      <option value="worker">Worker</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Active</label>
                    <select
                      value={editUserForm.isActive ? 'yes' : 'no'}
                      onChange={e => setEditUserForm(f => ({ ...f, isActive: e.target.value === 'yes' }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Street</label>
                    <input
                      type="text"
                      value={editUserForm.street}
                      onChange={e => setEditUserForm(f => ({ ...f, street: e.target.value }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">City</label>
                    <input
                      type="text"
                      value={editUserForm.city}
                      onChange={e => setEditUserForm(f => ({ ...f, city: e.target.value }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">State</label>
                    <input
                      type="text"
                      value={editUserForm.state}
                      onChange={e => setEditUserForm(f => ({ ...f, state: e.target.value }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Zip Code</label>
                    <input
                      type="text"
                      value={editUserForm.zipCode}
                      onChange={e => setEditUserForm(f => ({ ...f, zipCode: e.target.value }))}
                      className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
                      style={{ fontSize: 16 }}
                    />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button type="submit" className="btn-primary flex-1">Save</button>
                    <button type="button" className="btn-outline flex-1" onClick={() => setEditUser(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}
        {activeSection === 'register-worker' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Register Worker</h2>
            <form className="space-y-4 max-w-lg" onSubmit={e => handleRegisterWorker(e)}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Full Name</label>
                  <input className="input-field w-full" required value={registerForm.name || ''} onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Email</label>
                  <input className="input-field w-full" type="email" required value={registerForm.email || ''} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Phone</label>
                  <input className="input-field w-full" required value={registerForm.phone || ''} onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Password</label>
                  <input className="input-field w-full" type="password" required value={registerForm.password || ''} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Street</label>
                  <input className="input-field w-full" required value={registerForm.street || ''} onChange={e => setRegisterForm(f => ({ ...f, street: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">City</label>
                  <input className="input-field w-full" required value={registerForm.city || ''} onChange={e => setRegisterForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">State</label>
                  <input className="input-field w-full" required value={registerForm.state || ''} onChange={e => setRegisterForm(f => ({ ...f, state: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Zip Code</label>
                  <input className="input-field w-full" required value={registerForm.zipCode || ''} onChange={e => setRegisterForm(f => ({ ...f, zipCode: e.target.value }))} />
                </div>
              </div>
              {registerError && <div className="text-red-500 font-semibold">{registerError}</div>}
              {registerSuccess && <div className="text-green-500 font-semibold">{registerSuccess}</div>}
              <button className="btn-primary w-full" type="submit" disabled={registerLoading}>{registerLoading ? 'Registering...' : 'Register Worker'}</button>
            </form>
          </section>
        )}
        {activeSection === 'register-admin' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Register Admin</h2>
            <form className="space-y-4 max-w-lg" onSubmit={e => handleRegisterAdmin(e)}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Full Name</label>
                  <input className="input-field w-full" required value={registerForm.name || ''} onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Email</label>
                  <input className="input-field w-full" type="email" required value={registerForm.email || ''} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Phone</label>
                  <input className="input-field w-full" required value={registerForm.phone || ''} onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Password</label>
                  <input className="input-field w-full" type="password" required value={registerForm.password || ''} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Street</label>
                  <input className="input-field w-full" required value={registerForm.street || ''} onChange={e => setRegisterForm(f => ({ ...f, street: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">City</label>
                  <input className="input-field w-full" required value={registerForm.city || ''} onChange={e => setRegisterForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">State</label>
                  <input className="input-field w-full" required value={registerForm.state || ''} onChange={e => setRegisterForm(f => ({ ...f, state: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Zip Code</label>
                  <input className="input-field w-full" required value={registerForm.zipCode || ''} onChange={e => setRegisterForm(f => ({ ...f, zipCode: e.target.value }))} />
                </div>
              </div>
              {registerError && <div className="text-red-500 font-semibold">{registerError}</div>}
              {registerSuccess && <div className="text-green-500 font-semibold">{registerSuccess}</div>}
              <button className="btn-primary w-full" type="submit" disabled={registerLoading}>{registerLoading ? 'Registering...' : 'Register Admin'}</button>
            </form>
          </section>
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

export default AdminDashboard;
