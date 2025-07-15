import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Phone+Name, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    otp: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Start countdown for resend OTP
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validatePhone = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
      } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateName = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateName() || !validatePhone()) return;
    setLoading(true);
    setGeneralError('');
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const fullPhone = `+91${cleanPhone}`;
      const response = await apiService.sendOTP(fullPhone);
      if (response.success) {
        setCurrentStep(2);
        startResendTimer();
      } else {
        setGeneralError(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTPAndRegister = async () => {
    if (!validateOTP()) return;
    setLoading(true);
    setGeneralError('');
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const fullPhone = `+91${cleanPhone}`;
      // Verify OTP
      const response = await apiService.verifyOTP(fullPhone, formData.otp);
      if (response.success) {
        // Register user with phone-based authentication
        await register({ name: formData.name, phone: fullPhone, role: 'user' });
        navigate('/dashboard');
      } else {
        setGeneralError(response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setGeneralError('');
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const fullPhone = `+91${cleanPhone}`;
      const response = await apiService.sendOTP(fullPhone);
      if (response.success) {
        startResendTimer();
      } else {
        setGeneralError(response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 10);
      const formatted = limited.replace(/(\d{5})(\d{5})/, '$1 $2');
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'otp') {
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: limited }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold gradient-text">Join SparkleWash!</h2>
            <p className="mt-2 text-gray-600 text-lg">Create your account to get started</p>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={`input-field ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
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
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              disabled={loading}
              className="btn-primary flex-1 flex justify-center items-center py-4 text-lg font-semibold"
              onClick={handleSendOTP}
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Send OTP
                </>
              )}
            </button>
          </div>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold gradient-text">Verify OTP</h2>
            <p className="mt-2 text-gray-600 text-lg">Enter the OTP sent to your mobile number</p>
          </div>
          <div>
            <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              autoComplete="one-time-code"
              required
              className={`input-field ${errors.otp ? 'error' : ''}`}
              placeholder="Enter 6-digit OTP"
              value={formData.otp}
              onChange={handleChange}
              maxLength={6}
            />
            {errors.otp && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.otp}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              disabled={loading}
              className="btn-primary flex-1 flex justify-center items-center py-4 text-lg font-semibold"
              onClick={handleVerifyOTPAndRegister}
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Verify & Register
                </>
              )}
            </button>
            <button
              type="button"
              disabled={resendTimer > 0 || loading}
              className="btn-outline flex-1 flex justify-center items-center py-4 text-lg font-semibold"
              onClick={handleResendOTP}
            >
              {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-10 bg-black rounded-full overflow-hidden flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="Caarvo Logo" className="h-8 w-auto object-contain" />
            </div>
          </div>
        </div>
        <div className="card mt-8">
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            {generalError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {generalError}
              </div>
            )}
            {renderStepContent()}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                >
                  Sign in here
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
              <p className="text-sm text-gray-500 mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/staff')}
                  className="hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Staff? Register/Login here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 