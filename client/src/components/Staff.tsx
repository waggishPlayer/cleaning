import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Staff: React.FC = () => {
  const navigate = useNavigate();
  const { user, login: authLogin, register: authRegister } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [roleToggle, setRoleToggle] = useState<'admin' | 'worker'>('admin');
  const [showRegister, setShowRegister] = useState(false);
  // Admin registration fields
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    if (!loginAttempted) return;
    if (loading) return;
    if (user) {
      console.log('Logged in user:', user);
      if (roleToggle === 'admin' && user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (roleToggle === 'worker' && user.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        setError(`You are not authorized as a ${roleToggle}. Please check your credentials or contact your administrator.`);
        // Clear the invalid login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoginAttempted(false);
      setLoading(false);
    } else if (!loading && loginAttempted) {
      setError('Invalid email or password.');
      setLoginAttempted(false);
      setLoading(false);
    }
  }, [user, loginAttempted, loading, navigate, roleToggle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await authLogin(email, password);
      setLoginAttempted(true);
    } catch (err) {
      setLoading(false);
      setError('Invalid email or password.');
    }
  };

  // Admin registration logic
  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    if (!adminName || !adminEmail || !adminPassword) {
      setRegisterError('Please fill all fields.');
      return;
    }
    setRegisterLoading(true);
    try {
      await authRegister({ name: adminName, email: adminEmail, password: adminPassword, role: 'admin', phone: '' });
      setRegisterSuccess('Admin registered successfully! You can now log in as admin.');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err: any) {
      setRegisterError(err.message || 'Registration failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-8">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div style={{ background: 'black', borderRadius: 24, boxShadow: '0 2px 24px 0 rgba(0,0,0,0.08)' }}>
          <img src="/logo.png" alt="Caarvo Logo" style={{ width: 140, height: 48, objectFit: 'contain', borderRadius: 24, background: 'transparent', display: 'block' }} />
        </div>
      </div>
      {/* Toggle bar */}
      <div className="flex justify-center mb-6">
        <div className="flex rounded-full overflow-hidden border-2 border-[#00ddff]">
          <button
            type="button"
            className={`px-6 py-2 font-bold text-lg transition-colors duration-200 ${roleToggle === 'admin' ? 'bg-[#00ddff] text-black' : 'bg-black text-[#c1ff72]'}`}
            onClick={() => setRoleToggle('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`px-6 py-2 font-bold text-lg transition-colors duration-200 ${roleToggle === 'worker' ? 'bg-[#00ddff] text-black' : 'bg-black text-[#c1ff72]'}`}
            onClick={() => setRoleToggle('worker')}
          >
            Worker
          </button>
        </div>
      </div>
      {/* Staff Login Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-xl p-8 flex flex-col gap-6"
        style={{ border: '2px solid #00ddff' }}
      >
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#c1ff72', letterSpacing: 0.5 }}>Staff Login</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold" style={{ color: '#c1ff72' }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
            autoComplete="username"
            style={{ fontSize: 16 }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold" style={{ color: '#c1ff72' }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="rounded-lg px-4 py-2 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
            autoComplete="current-password"
            style={{ fontSize: 16 }}
          />
        </div>
        {loading && <div className="text-blue-400 text-center font-semibold">Logging in, please wait...</div>}
        {error && <div className="text-red-500 text-center font-semibold bg-red-50 rounded-lg py-2 px-3 border border-red-200">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded-lg font-bold text-lg mt-2"
          style={{ background: 'linear-gradient(90deg, #c1ff72 0%, #00ddff 100%)', color: '#000', boxShadow: '0 2px 12px 0 rgba(0,221,255,0.08)' }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Staff; 