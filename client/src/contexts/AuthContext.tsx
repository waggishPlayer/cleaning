import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrPhone: string, passwordOrOtp: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (emailOrPhone: string, passwordOrOtp: string) => {
    try {
      let response;
      
      // Check if it's email (contains @) or phone number
      if (emailOrPhone.includes('@')) {
        // Email login for staff
        response = await apiService.login({ email: emailOrPhone, password: passwordOrOtp });
      } else {
        // Phone login for users
        // TODO: Implement phone + OTP login API
        // For now, we'll simulate it
        response = await apiService.loginWithPhone({ phone: emailOrPhone, otp: passwordOrOtp });
      }
      
      if (response.success && response.data) {
        const { user: userData, token: tokenData } = response.data;
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await apiService.register(data);
      if (response.success && response.data) {
        const { user: userData, token: tokenData } = response.data;
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 