import { useAuthStore } from "@/stores/authStore";
import { useGoogleStore } from "@/stores/googleStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const logout = useAuthStore((state) => state.logout);
  const connectGoogle = useGoogleStore((state) => state.connectGoogle);
  const checkGoogleConnection = useGoogleStore((state) => state.checkGoogleConnection);
  const isConnected = useGoogleStore((state) => state.isConnected);
  const googleUser = useGoogleStore((state) => state.googleUser);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check connection status on mount
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        setIsChecking(true);
        await checkGoogleConnection();
      } catch (error) {
        // Error already logged in the store
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyConnection();
    
    // Setup periodic connection check (every 30 seconds)
    const intervalId = setInterval(verifyConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, [checkGoogleConnection]);
  
  const handleGoogleConnect = async () => {
    if (isChecking) return;
    
    try {
      // Simply open the auth URL - nothing complex needed
      await connectGoogle();
      
      // Toast a message that a new tab was opened
      toast({
        title: "Google Authentication",
        description: "A new tab has been opened to connect your Google account. Please complete the authentication there.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to open the Google authentication page. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleManualCheck = async () => {
    if (isChecking) return;
    
    try {
      setIsChecking(true);
      const connected = await checkGoogleConnection();
      
      if (connected) {
        toast({
          title: "Connection Verified",
          description: "Your Google account is connected and working properly.",
        });
      } else {
        toast({
          title: "Not Connected",
          description: "Your Google account is not connected. Click Connect Google to connect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Check Failed",
        description: "Unable to verify Google connection status.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className={cn(
                "font-bold text-xl tracking-tight",
                "bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
              )}>
                <span className="font-extrabold">webn</span>
                <span className="italic">well</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Google Connection Status */}
            <div className="flex items-center mr-4">
              {isConnected && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="mr-2"
                  title="Check connection"
                >
                  <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                </Button>
              )}
              
              {/* Google Connect Button */}
              <Button
                variant={isConnected ? "outline" : "default"}
                size="sm"
                onClick={handleGoogleConnect}
                disabled={isChecking}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                {isChecking ? "Checking..." : isConnected ? "Google Connected" : "Connect Google"}
              </Button>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">U</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                {googleUser && (
                  <>
                    <DropdownMenuItem disabled className="text-xs opacity-75">
                      Google: {googleUser.email || 'Connected'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
