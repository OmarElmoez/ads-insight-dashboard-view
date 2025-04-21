import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BarChart2, Menu, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useClickOutside } from "@/hooks/use-click-outside";
import logoImage from "@/assets/logo.jpeg";
import { useAuthStore } from "@/stores/authStore";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart2,
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  // Auto-collapse sidebar on mobile
  const sidebarVisible = isMobile ? isOpen : true;

  // Disable click outside when navigating (prevents sidebar from expanding on navigation)
  const [disableClickOutside, setDisableClickOutside] = useState(false);

  // Track navigation changes to prevent sidebar expanding on navigation
  useEffect(() => {
    setDisableClickOutside(true);
    const timer = setTimeout(() => setDisableClickOutside(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Use click outside hook globally to close sidebar
  useClickOutside(sidebarRef, () => {
    if (isOpen && !isCollapsed && !disableClickOutside) {
      setIsCollapsed(true);
    }
  }, !isMobile); // Only enable on desktop

  // For mobile, still use click outside to close the mobile sidebar
  useClickOutside(sidebarRef, () => {
    if (isOpen && !disableClickOutside) {
      setIsOpen(false);
    }
  }, isMobile);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out md:relative md:translate-y-0",
          sidebarVisible ? "translate-y-0" : "-translate-y-full",
          isCollapsed ? "w-16" : "w-64"
        )}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside sidebar from propagating
      >
        <div className="flex flex-col h-full relative">
          {/* Toggle button - centered on sidebar edge */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm z-10"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>

          {/* Logo */}
          <div className={cn(
            "flex items-center h-16 px-6 border-b transition-all",
            isCollapsed ? "justify-center px-2" : "justify-center"
          )}>
            <img src={logoImage} alt="Logo" className={cn(
              "transition-all",
              isCollapsed ? "h-8 w-auto" : "h-10 w-auto"
            )} />
          </div>

          {/* Nav Links */}
          <nav className={cn(
            "flex-1 py-4 space-y-1 transition-all",
            isCollapsed ? "px-2" : "px-3"
          )}>
            {menuItems.map((item) => (
              <div key={item.path} onClick={(e) => {
                if (isCollapsed) {
                  // e.stopPropagation();
                  console.log("clicked icon");
                }
              }}>
                <NavLink
                  to={item.path}
                  // onClick={(e) => {
                  //   // When sidebar is collapsed and we're clicking a navigation link,
                  //   // prevent event propagation to keep sidebar collapsed
                  //   if (isCollapsed) {
                  //     e.stopPropagation();
                  //     // console.log("clicked icon");
                  //     // setIsCollapsed(true);
                  //   }
                  // }}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center py-2 text-sm font-medium rounded-md transition-all",
                      isCollapsed ? "justify-center px-2" : "px-3",
                      isActive
                        ? "bg-gray-100 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isCollapsed ? "" : "mr-3"
                  )} />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              </div>
            ))}
          </nav>

          {/* Logout Button - now alone at the bottom */}
          <div className={cn(
            "p-4 border-t border-gray-200 transition-all",
            isCollapsed ? "flex justify-center p-2" : ""
          )}>
            {isCollapsed ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent sidebar from expanding
                  handleLogout();
                }}
                className="h-8 w-8"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
