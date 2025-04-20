import { create } from 'zustand';
import api from '@/lib/axios';

interface GoogleState {
  isConnected: boolean;
  googleUser: any | null;
  connectGoogle: () => Promise<void>;
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

// The baseURL for API calls
const baseURL = 'https://webnwellapiv2.otomatika.tech';

export const useGoogleStore = create<GoogleState>((set, get) => ({
  ...initializeFromStorage(),
  
  connectGoogle: async () => {
    try {
      // Instead of making an API call, directly open the OAuth URL
      // This is the most reliable approach as it skips any potential CORS issues
      const googleOAuthUrl = `${baseURL}/google/oauth/install`;
      
      // Open the URL in a new tab - this will redirect to Google's auth page
      window.open(googleOAuthUrl, '_blank');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to connect to Google:', error);
      throw error;
    }
  },
  
  checkGoogleConnection: async () => {
    try {
      // First check localStorage
      if (localStorage.getItem('google_connected') === 'true') {
        // Verify with API to ensure connection is still valid
        const response = await api.get('/google/oauth/status');
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
