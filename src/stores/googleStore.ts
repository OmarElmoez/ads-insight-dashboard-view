import { create } from 'zustand';
import api from '@/lib/axios';

interface GoogleState {
  isConnected: boolean;
  googleUser: any | null;
  connectGoogle: () => Promise<void>;
  handleGoogleCallback: (response: any) => Promise<void>;
  checkGoogleConnection: () => Promise<boolean>;
  setConnectionState: (state: boolean, userData?: any) => void;
}

// Initialize state from localStorage
const initializeFromStorage = () => {
  try {
    const googleConnected = localStorage.getItem('google_connected') === 'true';
    const googleUserData = localStorage.getItem('google_user_data');
    
    return {
      isConnected: googleConnected,
      googleUser: googleUserData ? JSON.parse(googleUserData) : null,
    };
  } catch (error) {
    console.error('Error initializing Google connection state:', error);
    return {
      isConnected: false,
      googleUser: null,
    };
  }
};

export const useGoogleStore = create<GoogleState>((set, get) => ({
  ...initializeFromStorage(),
  
  connectGoogle: async () => {
    try {
      // Call the native Google OAuth flow instead of backend
      // This is just a placeholder since the actual OAuth flow 
      // will be handled by the GoogleLogin component
      console.log('Opening Google OAuth flow');
      
      // The actual authentication will be handled by the GoogleLogin component
      // and the handleGoogleCallback method below
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to connect to Google:', error);
      throw error;
    }
  },
  
  handleGoogleCallback: async (response: any) => {
    try {
      if (!response || !response.credential) {
        throw new Error('Invalid Google OAuth response');
      }
      
      // Send the token ID to the backend
      const tokenResponse = await api.post('google/oauth/token', { 
        credential: response.credential 
      });
      
      if (tokenResponse.data.success) {
        // Get user data from response
        const userData = tokenResponse.data.user || {};
        
        // Store connection state in localStorage
        localStorage.setItem('google_connected', 'true');
        localStorage.setItem('google_user_data', JSON.stringify(userData));
        
        // Update state on successful connection
        set({ 
          isConnected: true,
          googleUser: userData,
        });
        
        return userData;
      } else {
        throw new Error(tokenResponse.data.message || 'Failed to authenticate with Google');
      }
    } catch (error) {
      console.error('Failed to process Google callback:', error);
      
      // Update state on failed connection
      localStorage.setItem('google_connected', 'false');
      localStorage.removeItem('google_user_data');
      set({ isConnected: false, googleUser: null });
      
      throw error;
    }
  },
  
  checkGoogleConnection: async () => {
    try {
      // First check localStorage
      if (localStorage.getItem('google_connected') === 'true') {
        // Verify with API to ensure connection is still valid
        const response = await api.get('google/oauth/status');
        const isConnected = response.data.connected === true;
        
        // Update localStorage and state based on response
        localStorage.setItem('google_connected', isConnected ? 'true' : 'false');
        
        if (!isConnected) {
          localStorage.removeItem('google_user_data');
          set({ isConnected: false, googleUser: null });
        } else if (response.data.user) {
          // Update user data if available
          localStorage.setItem('google_user_data', JSON.stringify(response.data.user));
          set({ 
            isConnected: true,
            googleUser: response.data.user
          });
        } else {
          set({ isConnected: true });
        }
        
        return isConnected;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check Google connection:', error);
      return get().isConnected;
    }
  },
  
  setConnectionState: (state, userData = null) => {
    localStorage.setItem('google_connected', state ? 'true' : 'false');
    
    if (state && userData) {
      localStorage.setItem('google_user_data', JSON.stringify(userData));
    } else if (!state) {
      localStorage.removeItem('google_user_data');
    }
    
    set({ 
      isConnected: state,
      googleUser: state ? userData : null
    });
  }
}));
