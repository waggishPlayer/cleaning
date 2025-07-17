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
  setUserAndToken: (user: User, token: string) => void;
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
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
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
        response = await apiService.loginWithPhone({ phone: emailOrPhone, otp: passwordOrOtp });
      }
      
      if (response.success && response.data) {
        const { user: userData, token: tokenData } = response.data;
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        // Do NOT call getProfile here
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
      let response;
      if (data.role === 'admin') {
        response = await apiService.registerAdmin({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          address: {
            street: data.street || (data.address && data.address.street) || '',
            city: data.city || (data.address && data.address.city) || '',
            state: data.state || (data.address && data.address.state) || '',
            zipCode: data.zipCode || (data.address && data.address.zipCode) || '',
          },
          isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
        });
      } else {
        response = await apiService.register(data);
      }
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

  const setUserAndToken = (userObj: User, tokenStr: string) => {
    setUser(userObj);
    setToken(tokenStr);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', tokenStr);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    setUserAndToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 