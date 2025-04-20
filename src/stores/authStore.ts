
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
          const response = await api.post('api/auth/login/', {
            username,
            password,
          });
          
          const { access, refresh, user } = response.data;
          
          // Store tokens in localStorage for interceptors
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          
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
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (accessToken && refreshToken) {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken,
      refreshToken,
    });
  }
};
