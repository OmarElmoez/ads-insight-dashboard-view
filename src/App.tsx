import { useEffect, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { useAuthStore, initializeAuth } from "@/stores/authStore";

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Debug log for authentication state
  console.log('Protected Route - Auth State:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('Protected Route - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  
  // Initialize auth state from localStorage once on component mount
  const initAuth = useCallback(() => {
    console.log('App - Initializing auth from localStorage');
    const result = initializeAuth();
    console.log('App - Auth initialized, result:', result);
    console.log('App - Auth state after init:', useAuthStore.getState().isAuthenticated);
    console.log('App - User data after init:', useAuthStore.getState().user);
    setIsAuthInitialized(true);
  }, []);
  
  useEffect(() => {
    if (!isAuthInitialized) {
      initAuth();
    }
  }, [isAuthInitialized, initAuth]);
  
  // Don't render routes until auth is initialized
  if (!isAuthInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading application...</h2>
          <p className="text-gray-500">Please wait while we set up your session</p>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
