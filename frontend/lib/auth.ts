import axios from 'axios';
import { api } from './axios'; // Import the axios instance
import { User } from '@/types/user';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  password: string;
  role?: string;
  companyId?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

class AuthService {
  private refreshPromise: Promise<AuthResponse> | null = null;

  login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth-service/api/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Google OAuth login - redirects to backend
  initiateGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';
    window.location.href = `${apiUrl}/auth-service/api/auth/oauth2/authorization/google`;
  };
  initiateGithubLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';
    window.location.href = `${apiUrl}/auth-service/api/auth/oauth2/authorization/github`;
  };

  register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const endpoint = data.role === 'developer'
        ? '/auth-service/api/auth/register/developer'
        : '/auth-service/api/auth/register/recruiter';

      const payload: Record<string, any> = {
        username: data.username || data.email.split('@')[0],
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        password: data.password,
      };

      if (data.role === 'recruiter' && data.companyId) {
        payload.companyId = data.companyId;
      }

      const response = await api.post(endpoint, payload);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  refresh = async (): Promise<AuthResponse> => {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  };

  private performRefresh = async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth-service/api/auth/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails with 401/403, it means refresh token is invalid
      if (axios.isAxiosError(error) && 
          (error.response?.status === 401 || error.response?.status === 403)) {
        throw new Error('REFRESH_TOKEN_INVALID');
      }
      
      throw error;
    }
  };

  getCurrentUser = async (): Promise<User | null> => {
    try {
      // First check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('getCurrentUser can only be called in browser environment');
      }

      console.log('Fetching current user...');
      const response = await api.get('/auth-service/api/auth/me');
      console.log('Current user fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          throw new Error('Unable to connect to server. Please check if the API server is running.');
        }
        // If 401 (not authenticated), return null instead of throwing
        // This is normal - user is just not logged in yet
        if (error.response?.status === 401) {
          console.log('User not authenticated (401) - returning null');
          return null;
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied.');
        }
      }
      
      throw error;
    }
  };

  logout = async (): Promise<void> => {
    try {
      await api.post('/auth-service/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear any pending refresh promise
      this.refreshPromise = null;
    }
  };

  // Health check method to verify API connectivity
  healthCheck = async (): Promise<boolean> => {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  };
}

export const authService = new AuthService();
