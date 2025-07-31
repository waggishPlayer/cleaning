import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Staff: React.FC = () => {
  const navigate = useNavigate();
  const { user, login: authLogin, register: authRegister } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [roleToggle, setRoleToggle] = useState<'admin' | 'worker'>('admin');
  const [showRegister, setShowRegister] = useState(false);
  // Admin registration fields
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
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
      setError('Invalid phone number or password.');
      setLoginAttempted(false);
      setLoading(false);
    }
  }, [user, loginAttempted, loading, navigate, roleToggle]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    const formatted = limited.replace(/(\d{5})(\d{5})/, '$1 $2');
    setPhone(formatted);
  };

  const handleAdminPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    const formatted = limited.replace(/(\d{5})(\d{5})/, '$1 $2');
    setAdminPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !password) {
      setError('Please enter both phone number and password.');
      return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setLoading(true);
    try {
      const fullPhone = `+91${cleanPhone}`;
      await authLogin(fullPhone, password);
      setLoginAttempted(true);
    } catch (err) {
      setLoading(false);
      setError('Invalid phone number or password.');
    }
  };

  // Admin registration logic
  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    if (!adminName || !adminPhone || !adminPassword) {
      setRegisterError('Please fill all fields.');
      return;
    }
    
    const cleanPhone = adminPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setRegisterError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setRegisterLoading(true);
    try {
      const fullPhone = `+91${cleanPhone}`;
      await authRegister({ name: adminName, phone: fullPhone, password: adminPassword, role: 'admin', email: '' });
      setRegisterSuccess('Admin registered successfully! You can now log in as admin.');
      setAdminName('');
      setAdminPhone('');
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
        <img
          src="/Caarvo no back 2.png"
          alt="Caarvo Logo"
          className="h-[56px] w-auto"
          style={{
            filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))',
            maxHeight: '56px',
            maxWidth: '100%'
          }}
        />
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
          <label htmlFor="phone" className="text-sm font-semibold" style={{ color: '#c1ff72' }}>Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">🇮🇳 +91</span>
            </div>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="rounded-lg px-4 py-2 pl-16 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
              autoComplete="tel"
              style={{ fontSize: 16 }}
              placeholder="Enter 10-digit mobile number"
              maxLength={11}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold" style={{ color: '#c1ff72' }}>Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-lg px-4 py-2 pr-12 bg-black text-white border border-[#00ddff] focus:outline-none focus:ring-2 focus:ring-[#00ddff]"
              autoComplete="current-password"
              style={{ fontSize: 16 }}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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