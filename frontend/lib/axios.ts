import axios from 'axios';
import { authService } from './auth';

// In development, use same-origin relative URLs so cookies work on localhost
const API_URL = process.env.NODE_ENV !== 'production'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088')
  : (process.env.NEXT_PUBLIC_API_URL || '');

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable httpOnly cookies - critical for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add any auth headers if needed
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.headers['X-Timestamp'] = Date.now().toString();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error responses
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401: 
          console.error('Unauthorized access - possibly invalid token:', data.message);
          // AuthContext will handle token refresh via its own interceptor
          break;
        case 403:
          console.error('Forbidden - you do not have permission:', data.message);
          break;
        case 404:
          console.error('Resource not found:', data.message);
          break;
        case 422:
          console.error('Validation error:', data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || 'Unknown error occurred');
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);
