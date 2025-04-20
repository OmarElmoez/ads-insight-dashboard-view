
import { create } from 'zustand';
import api from '@/lib/axios';

interface GoogleState {
  isConnected: boolean;
  connectGoogle: () => Promise<void>;
  checkGoogleConnection: () => boolean;
}

export const useGoogleStore = create<GoogleState>((set, get) => ({
  isConnected: false,
  
  connectGoogle: async () => {
    try {
      // Call the Google OAuth install endpoint
      const response = await api.get('google/oauth/install');
      
      // Open the Google popup
      const authUrl = response.data.auth_url;
      
      if (authUrl) {
        // Open Google OAuth popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        window.open(
          authUrl,
          'Google OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Listen for a message from the popup window
        window.addEventListener('message', (event) => {
          // Check origin for security
          if (event.origin !== window.location.origin) return;
          
          if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            // Update state on successful connection
            set({ isConnected: true });
          }
        }, { once: true });
      } else {
        throw new Error('Failed to get Google authentication URL');
      }
    } catch (error) {
      console.error('Failed to connect to Google:', error);
      throw error;
    }
  },
  
  checkGoogleConnection: () => {
    // Check if Google account is connected
    // This is a placeholder - in a real implementation, you might check
    // a token or call an API endpoint to verify the connection
    return get().isConnected;
  }
}));
