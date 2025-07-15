import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Vehicle, 
  Booking, 
  AuthResponse, 
  ApiResponse, 
  LoginCredentials, 
  PhoneLoginCredentials,
  RegisterData,
  VehicleFormData,
  BookingFormData,
  Analytics
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async loginWithPhone(credentials: PhoneLoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login-phone', credentials);
    return response.data;
  }

  async sendOTP(phone: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/send-otp', { phone });
    return response.data;
  }

  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/verify-otp', { phone, otp });
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/auth/me', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Address endpoints
  async getAddresses(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/addresses');
    return response.data;
  }

  async getAddress(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/addresses/${id}`);
    return response.data;
  }

  async createAddress(data: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/addresses', data);
    return response.data;
  }

  async updateAddress(id: string, data: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(`/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/addresses/${id}`);
    return response.data;
  }

  async setDefaultAddress(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(`/addresses/${id}/default`);
    return response.data;
  }

  async getDefaultAddress(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/addresses/default');
    return response.data;
  }

  // Vehicle endpoints
  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    const response: AxiosResponse<ApiResponse<Vehicle[]>> = await this.api.get('/vehicles');
    return response.data;
  }

  async getVehicle(id: string): Promise<ApiResponse<Vehicle>> {
    const response: AxiosResponse<ApiResponse<Vehicle>> = await this.api.get(`/vehicles/${id}`);
    return response.data;
  }

  async createVehicle(data: VehicleFormData): Promise<ApiResponse<Vehicle>> {
    const response: AxiosResponse<ApiResponse<Vehicle>> = await this.api.post('/vehicles', data);
    return response.data;
  }

  async updateVehicle(id: string, data: VehicleFormData): Promise<ApiResponse<Vehicle>> {
    const response: AxiosResponse<ApiResponse<Vehicle>> = await this.api.put(`/vehicles/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/vehicles/${id}`);
    return response.data;
  }

  // Booking endpoints
  async getBookings(): Promise<ApiResponse<Booking[]>> {
    const response: AxiosResponse<ApiResponse<Booking[]>> = await this.api.get('/bookings');
    return response.data;
  }

  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    const response: AxiosResponse<ApiResponse<Booking>> = await this.api.get(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(data: BookingFormData): Promise<ApiResponse<Booking>> {
    const response: AxiosResponse<ApiResponse<Booking>> = await this.api.post('/bookings', data);
    return response.data;
  }

  async updateBookingStatus(id: string, status: string, notes?: string): Promise<ApiResponse<Booking>> {
    const response: AxiosResponse<ApiResponse<Booking>> = await this.api.put(`/bookings/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  }

  async cancelBooking(id: string, reason: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.put(`/bookings/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  async addReview(id: string, rating: number, review: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.put(`/bookings/${id}/review`, {
      rating,
      review,
    });
    return response.data;
  }

  // Worker endpoints
  async updateAvailability(isAvailable: boolean): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/users/availability', {
      isAvailable,
    });
    return response.data;
  }

  // Admin endpoints
  async getUsers(params?: { role?: string; page?: number; limit?: number }): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async getWorkers(): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/admin/workers');
    return response.data;
  }

  async getAdminBookings(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<Booking[]>> {
    const response: AxiosResponse<ApiResponse<Booking[]>> = await this.api.get('/admin/bookings', { params });
    return response.data;
  }

  async assignBooking(bookingId: string, workerId: string): Promise<ApiResponse<Booking>> {
    const response: AxiosResponse<ApiResponse<Booking>> = await this.api.put(`/admin/bookings/${bookingId}/assign`, {
      workerId,
    });
    return response.data;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(`/admin/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  }

  async updateWorkerAvailability(workerId: string, isAvailable: boolean): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(`/admin/workers/${workerId}/availability`, {
      isAvailable,
    });
    return response.data;
  }

  async getAnalytics(period: string = 'month'): Promise<ApiResponse<Analytics>> {
    const response: AxiosResponse<ApiResponse<Analytics>> = await this.api.get('/admin/analytics', {
      params: { period },
    });
    return response.data;
  }

  // Payment endpoints
  async createPaymentOrder(bookingId: string): Promise<ApiResponse<{ orderId: string; amount: number; currency: string }>> {
    const response: AxiosResponse<ApiResponse<{ orderId: string; amount: number; currency: string }>> = await this.api.post('/payments/create-order', {
      bookingId
    });
    return response.data;
  }

  async verifyPayment(paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
    bookingId: string;
  }): Promise<ApiResponse<{ verified: boolean; booking: Booking }>> {
    const response: AxiosResponse<ApiResponse<{ verified: boolean; booking: Booking }>> = await this.api.post('/payments/verify', paymentData);
    return response.data;
  }

  async getPaymentStatus(bookingId: string): Promise<ApiResponse<{ status: string; details: any }>> {
    const response: AxiosResponse<ApiResponse<{ status: string; details: any }>> = await this.api.get(`/payments/status/${bookingId}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response: AxiosResponse<{ status: string; message: string }> = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 