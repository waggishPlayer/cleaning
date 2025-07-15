import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface UserRegisterProps {}

const UserRegister: React.FC<UserRegisterProps> = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Phone, 2: OTP, 3: Details
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    otp: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [, setOtpSent] = useState(false);
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

  const validateDetails = () => {
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
    if (!validatePhone()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const fullPhone = `+91${cleanPhone}`;
      
      // Send OTP to the phone number
      const response = await apiService.sendOTP(fullPhone);
      
      if (response.success) {
        setOtpSent(true);
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

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const fullPhone = `+91${cleanPhone}`;
      
      // Verify OTP
      const response = await apiService.verifyOTP(fullPhone, formData.otp);
      
      if (response.success) {
        setCurrentStep(3);
      } else {
        setGeneralError(response.message || 'Invalid OTP');
      }
      
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateDetails()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const fullPhone = `+91${cleanPhone}`;
      
      // Register user with phone-based authentication
      await register({
        name: formData.name,
        phone: fullPhone,
        role: 'user' // Fixed to user role
      });
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
      
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
      
      // Resend OTP
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
    
    // Format phone number
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      // Limit to 10 digits for Indian mobile numbers
      const limited = cleaned.slice(0, 10);
      const formatted = limited.replace(/(\d{5})(\d{5})/, '$1 $2');
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'otp') {
      // Only allow numbers for OTP
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: limited }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold gradient-text">
                Get Started
              </h2>
              <p className="mt-2 text-gray-600 text-lg">
                Enter your phone number to create your account
              </p>
            </div>
            
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
            
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center py-4 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send OTP
                </>
              )}
            </button>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold gradient-text">
                Verify Phone Number
              </h2>
              <p className="mt-2 text-gray-600 text-lg">
                Enter the 6-digit code sent to {formData.phone}
              </p>
            </div>
            
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="off"
                  required
                  className={`input-field text-center text-2xl tracking-widest ${errors.otp ? 'error' : ''}`}
                  placeholder="000000"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.otp}
                </p>
              )}
            </div>
            
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center py-4 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify OTP
                </>
              )}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </p>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold gradient-text">
                Complete Your Profile
              </h2>
              <p className="mt-2 text-gray-600 text-lg">
                Tell us a bit about yourself
              </p>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
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
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>
            
            <button
              onClick={handleRegister}
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center py-4 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        
        <div className="card mt-8">
          <div className="space-y-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
