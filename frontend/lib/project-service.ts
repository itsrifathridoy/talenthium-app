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

// Helper: check GitHub App installation status (DB-only, lightweight)
export const checkGithubInstallationStatus = () => {
  return projectApi.get('/github/status');
};

// Helper: manually sync contributions from GitHub for a project
export const syncContributions = (projectId: string | number) => {
  return projectApi.post(`/api/projects/${projectId}/sync-contributions`);
};

// Helper: search users with a linked GitHub account
export const searchGithubUsers = (query: string) => {
  return projectApi.get(`/api/projects/users/search?query=${encodeURIComponent(query)}`);
};

// Helper: add a contributor to a project by GitHub username
export const addContributor = (projectId: string | number, githubUsername: string) => {
  return projectApi.post(`/api/projects/${projectId}/contributors`, { githubUsername });
};

// Helper: remove contributor access (sets active=false, keeps contribution history)
export const removeContributorAccess = (projectId: string | number, contributorId: number) => {
  return projectApi.patch(`/api/projects/${projectId}/contributors/${contributorId}/access`);
};

// Helper: fully delete a contributor (only allowed if they have no contributions)
export const deleteContributor = (projectId: string | number, contributorId: number) => {
  return projectApi.delete(`/api/projects/${projectId}/contributors/${contributorId}`);
};

// Helper: get projects where the current user is listed as a contributor
export const getContributedProjects = () => {
  return projectApi.get('/api/projects/contributed');
};

// Helper: trigger a deployment for a project
export const triggerDeploy = (projectId: string | number, payload?: { branch?: string; commitHash?: string; title?: string }) => {
  return projectApi.post(`/api/projects/${projectId}/deploy`, payload ?? {});
};

// Helper: list deployments for a project
export const getDeployments = (projectId: string | number) => {
  return projectApi.get(`/api/projects/${projectId}/deployments`);
};

// Helper: sync a deployment status from Dokploy
export const syncDeployment = (projectId: string | number, deploymentId: number) => {
  return projectApi.post(`/api/projects/${projectId}/deployments/${deploymentId}/sync`);
};

// Returns the SSE URL for streaming deployment logs
export const getDeploymentLogsUrl = (projectId: string | number, deploymentId: string): string => {
  return `${API_URL}/project-service/api/projects/${projectId}/deployments/${deploymentId}/logs`;
};

// Helper: get environment variables for a project's Dokploy app
export const getEnvironment = (projectId: string | number) =>
  projectApi.get(`/api/projects/${projectId}/environment`);

// Helper: save environment variables for a project's Dokploy app
export const saveEnvironment = (
  projectId: string | number,
  payload: { env: string; buildArgs?: string; buildSecrets?: string; createEnvFile?: boolean }
) => projectApi.post(`/api/projects/${projectId}/environment`, payload);

// Helper: list domains for a project
export const getDomains = (projectId: string | number) =>
  projectApi.get(`/api/projects/${projectId}/domains`);

// Helper: auto-generate a hostname for the project's Dokploy app
export const generateDomainHost = (projectId: string | number) =>
  projectApi.post(`/api/projects/${projectId}/domains/generate`);

// Helper: create a domain on Dokploy for a project
export const createDomain = (
  projectId: string | number,
  payload: { host: string; https: boolean; certificateType?: string; port?: number | null; path?: string | null }
) => projectApi.post(`/api/projects/${projectId}/domains`, payload);

// Helper: create Dokploy project + application for a project
export const provisionDeployment = (projectId: string | number) => {
  return projectApi.post(`/api/projects/${projectId}/deploy/provision`);
};

// Helper: generate SSH key + configure git provider on Dokploy
export const configureGit = (
  projectId: string | number,
  params?: { branch?: string; buildPath?: string; watchPaths?: string[]; enableSubmodules?: boolean; reuseExistingKey?: boolean }
) => {
  return projectApi.post(`/api/projects/${projectId}/deploy/configure-git`, params ?? {});
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
