import axios from 'axios';

// Get base URL from environment
const API_URL = process.env.NODE_ENV !== 'production'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088')
  : (process.env.NEXT_PUBLIC_API_URL || '');

// Create axios instance for project service
export const projectApi = axios.create({
  baseURL: `${API_URL}/project-service`,
  withCredentials: true, // Enable httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for GitHub operations
});

// Helper: create a project (auth handled by access token cookies)
export const createProject = (payload: any) => {
  return projectApi.post('/api/projects/create', payload);
};

// Helper: get all projects
export const getAllProjects = () => {
  return projectApi.get('/api/projects');
};

// Helper: get authenticated user's projects
export const getMyProjects = () => {
  return projectApi.get('/api/projects/my');
};

// Helper: check project creation capability
export const checkProjectCreationCapability = () => {
  return projectApi.get('/api/projects/check-creation-capability');
};

// Request interceptor
projectApi.interceptors.request.use(
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
projectApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Unauthorized - authentication required:', data.message);
          break;
        case 403:
          console.error('Forbidden - insufficient permissions:', data.message);
          break;
        case 404:
          console.error('Resource not found:', data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error(`API Error (${status}):`, data.message);
      }
    } else if (error.request) {
      console.error('No response received from server:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
