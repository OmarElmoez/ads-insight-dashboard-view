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
      // Open the OAuth URL in a popup window
      const googleOAuthUrl = `${baseURL}/google/oauth/install`;
      
      // Configure popup window dimensions and position
      const width = 800;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // Open the popup window
      const popup = window.open(
        googleOAuthUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );
      
      // Check if popup was blocked
      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }
      
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
