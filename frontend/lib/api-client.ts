import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Handle 401 errors by attempting token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already refreshing
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Only try to refresh once per failure
          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              // Attempt to refresh token - server will set new cookies
              await axios.post(
                `${API_BASE_URL}/auth-service/api/auth/refresh-token`,
                {},
                { withCredentials: true }
              );

              this.isRefreshing = false;

              // Retry original request with new token from cookies
              return this.axiosInstance(originalRequest);
            } catch (refreshError) {
              this.isRefreshing = false;
              // Redirect to login on refresh failure (unless already on auth page)
              if (typeof window !== 'undefined') {
                const authPages = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/otp-verification'];
                const isAuthPage = authPages.some(page => window.location.pathname.startsWith(page));
                
                if (!isAuthPage) {
                  window.location.href = '/auth/login';
                }
              }
              throw refreshError;
            }
          }
        }

        throw new Error(
          (error.response?.data as any)?.message || `HTTP ${error.response?.status}: ${error.message}`
        );
      }
    );
  }

  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  async post<T = any>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, body, config);
    return response.data;
  }

  async put<T = any>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, body, config);
    return response.data;
  }

  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
