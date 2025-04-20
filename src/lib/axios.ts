import axios from 'axios';

// For temporary testing - bypass CORS issues
const baseURL = 'https://webnwellapiv2.otomatika.tech/';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add missing endpoints if not in the backend
api.interceptors.request.use(
  (config) => {
    // Handle missing endpoints for Google OAuth
    if (config.url === 'google/oauth/token' && config.method === 'post') {
      // Modify to use the install endpoint if token endpoint doesn't exist
      // This is a temporary solution until the backend implements the token endpoint
      config.url = 'google/oauth/install';
      config.method = 'get';
      // The credential will be ignored, and we'll get a redirect URL instead
    }
    
    // Add token to headers
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('Adding token to request headers');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage for request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.log('Response error status:', error.response?.status);
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting to refresh token due to 401 error');
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${baseURL}api/auth/refresh-token/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        
        // Store the new token
        localStorage.setItem('access_token', access);
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // If refresh fails, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
