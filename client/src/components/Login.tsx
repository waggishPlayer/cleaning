import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validatePhone = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove all non-digit characters
      const cleanPhone = formData.phone.replace(/\D/g, '');
      
      // Check if it's a valid 10-digit Indian mobile number
      if (cleanPhone.length !== 10) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
      } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9';
      }
    }
    
    setErrors(prev => ({ ...prev, phone: newErrors.phone || '' }));
    return !newErrors.phone;
  };

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(prev => ({ ...prev, password: newErrors.password || '' }));
    return !newErrors.password;
  };

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    // Prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Add this to ensure the event doesn't bubble up
    }
    
    // Validate form fields
    if (!validatePhone() || !validatePassword()) {
      console.log('Validation failed, stopping login process');
      return;
    }
    
    setLoading(true);
    setGeneralError('');
    
    try {
      // Clean the phone number properly
      const cleanPhone = formData.phone.replace(/\D/g, '');
      
      // Ensure it's a valid 10-digit Indian mobile number
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setErrors(prev => ({ ...prev, phone: 'Please enter a valid 10-digit Indian mobile number' }));
        setLoading(false);
        return;
      }
      
      const fullPhone = `+91${cleanPhone}`;
      console.log('Attempting login with:', { phone: fullPhone, passwordLength: formData.password.length });
      
      // Login with phone and password using AuthContext
      await login(fullPhone, formData.password);
      
      console.log('Login successful, navigating to dashboard');
      // Navigate to dashboard after successful login
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setGeneralError('Invalid phone number or password. Please try again.');
      } else if (error.response?.status === 429) {
        setGeneralError('Too many login attempts. Please try again later.');
      } else {
        setGeneralError(error.message || error.response?.data?.message || 'Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError('');
    }
    
    // Format phone number
    if (name === 'phone') {
      // Only allow digits
      const cleaned = value.replace(/\D/g, '');
      // Limit to 10 digits for Indian mobile numbers
      const limited = cleaned.slice(0, 10);
      
      // Format with a space after 5 digits for readability
      let formatted = limited;
      if (limited.length > 5) {
        formatted = limited.replace(/(\d{5})(\d{1,5})/, '$1 $2');
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/Caarvo no back 2.png"
              alt="Caarvo Logo"
              className="h-[40px] w-auto"
              style={{
                filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))',
                maxHeight: '40px',
                maxWidth: '100%'
              }}
            />
          </div>
        </div>
        
        <div className="card mt-8">
          <form className="space-y-6" onSubmit={handleLogin} noValidate>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold gradient-text">
                Welcome Back!
              </h2>
              <p className="mt-2 text-gray-600 text-lg">
                Sign in to your account
              </p>
            </div>

            {generalError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {generalError}
              </div>
            )}
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">🇮🇳 +91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`input-field pl-16 ${errors.phone ? 'error' : ''}`}
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={11}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`input-field pr-12 ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
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
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center py-4 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
            
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                >
                  Sign up here
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-gray-700 transition-colors duration-200"
                >
                  ← Back to home
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;