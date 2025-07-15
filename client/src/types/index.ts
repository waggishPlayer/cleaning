export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'worker' | 'admin';
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isActive: boolean;
  profileImage?: string;
  workerDetails?: {
    isAvailable: boolean;
    rating: number;
    totalJobs: number;
    specialties: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  owner: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'van' | 'luxury' | 'sports' | 'other';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  customer: string | User;
  vehicle: string | Vehicle;
  worker?: string | User;
  serviceType: 'exterior' | 'interior' | 'full-service' | 'premium';
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: 'pending' | 'assigned' | 'en-route' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: {
    customer?: string;
    worker?: string;
  };
  rating?: number;
  review?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'customer' | 'worker' | 'admin';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PhoneLoginCredentials {
  phone: string;
  otp: string;
}

export interface RegisterData {
  name: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone: string;
  role?: 'user' | 'worker' | 'admin';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export interface UserRegisterData {
  name: string;
  phone: string;
  role: 'user';
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'van' | 'luxury' | 'sports' | 'other';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  notes?: string;
}

export interface BookingFormData {
  vehicleId: string;
  serviceType: 'exterior' | 'interior' | 'full-service' | 'premium';
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  price: number;
}

export interface Analytics {
  period: string;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalUsers: number;
  totalWorkers: number;
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
} 