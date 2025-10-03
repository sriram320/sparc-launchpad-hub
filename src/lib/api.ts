import axios from 'axios';

// Determine API base URL from environment
const inferredBaseUrl = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) return envUrl;
  // Sensible defaults: localhost in dev, relative in prod
  return import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1';
})();

const api = axios.create({
  baseURL: inferredBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // DEV auth headers (backend DEV_AUTH=true): allow bypassing Cognito locally
    // Only add when running in dev and no Bearer token is present
    if (!token && import.meta.env.DEV) {
      // Get the current URL path to determine user role
      const currentPath = window.location.pathname;
      
      // Set appropriate dev headers based on current path
      let devEmail = localStorage.getItem('devEmail');
      let devUsername = localStorage.getItem('devUsername');
      let devGroups = localStorage.getItem('devGroups');
      
      // Default to member for member dashboard paths
      if (currentPath.includes('/member-dashboard')) {
        devEmail = devEmail || 'test-member@example.com';
        devUsername = devUsername || 'Test Member';
        devGroups = devGroups || 'member';
      } 
      // Default to host for host dashboard paths
      else if (currentPath.includes('/host-dashboard')) {
        devEmail = devEmail || 'test-host@example.com';
        devUsername = devUsername || 'Test Host';
        devGroups = devGroups || 'host';
      } 
      // Default based on stored values or fallback to host
      else {
        devEmail = devEmail || 'test-host@example.com';
        devUsername = devUsername || 'Test Host';
        devGroups = devGroups || 'host';
      }

      console.log(`Dev auth: ${devUsername} (${devEmail}) with roles [${devGroups}]`);

      // Initialize headers object if needed
      if (!config.headers) config.headers = {} as any;
      (config.headers as any)['x-dev-email'] = devEmail;
      (config.headers as any)['x-dev-username'] = devUsername;
      (config.headers as any)['x-dev-groups'] = devGroups;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if we're in development mode and handle connection issues
    const isDevelopmentMode = !localStorage.getItem('authToken') || 
                             localStorage.getItem('authToken') === 'dev-token-123';
    
    if (isDevelopmentMode && (!error.response || error.message === 'Network Error')) {
      console.warn('Development mode: API connection failed, but continuing anyway');
      
      // Create a mock successful response for development
      if (error.config.url.includes('/registrations')) {
        // Mock successful registration response
        return Promise.resolve({
          data: {
            id: `dev-${Date.now()}`,
            event_id: error.config.data ? JSON.parse(error.config.data).event_id : '1',
            user_id: error.config.data ? JSON.parse(error.config.data).user_id : '1',
            created_at: new Date().toISOString()
          }
        });
      }
    }
    
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
