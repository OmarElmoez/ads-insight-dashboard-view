import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

interface User {
  id: string;
  username: string;
  // Add other user properties as needed
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      
      login: async (username: string, password: string) => {
        try {
          // Real authentication API call
          const response = await api.post('api/auth/login/', {
            username,
            password,
          });
          
          const { access, refresh, user } = response.data;
          
          // Store tokens in localStorage for interceptors
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          // Also store user data in localStorage for persistence
          localStorage.setItem('user_data', JSON.stringify(user));
          
          set({
            isAuthenticated: true,
            user,
            accessToken: access,
            refreshToken: refresh,
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
      
      logout: () => {
        // Remove tokens from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
      
      checkAuth: () => {
        const { accessToken } = get();
        return !!accessToken;
      },
    }),
    {
      name: 'auth-storage',
      // Only store non-function properties
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Helper function to initialize auth from localStorage on app load
export const initializeAuth = () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const storedUserData = localStorage.getItem('user_data');
    
    if (accessToken && refreshToken) {
      // Get user from localStorage if available, or create a default dummy user
      let user: User | null = null;
      if (storedUserData) {
        try {
          user = JSON.parse(storedUserData);
        } catch (e) {
          // Clean up bad data
          localStorage.removeItem('user_data');
        }
      }
      
      // Fallback to a default user if parsing failed
      if (!user) {
        user = {
          id: "default-user-id",
          username: "default_user"
        };
        // Store the fallback user for consistency
        localStorage.setItem('user_data', JSON.stringify(user));
      }
      
      // Force synchronous state update to ensure it's available immediately
      useAuthStore.setState({
        isAuthenticated: true,
        accessToken,
        refreshToken,
        user,
      });
      
      return true; // Auth was successful
    } else {
      // Clean up any leftover data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      
      return false; // Auth failed
    }
  } catch (error) {
    console.error('INIT AUTH: Exception during auth initialization:', error);
    return false; // Auth failed due to error
  }
};
