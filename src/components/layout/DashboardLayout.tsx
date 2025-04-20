import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuthStore } from "@/stores/authStore";
import { Navigate, useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
    
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <Navbar />
          
          {/* Page Content */}
          <main className="relative flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
