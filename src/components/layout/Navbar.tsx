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
import { GoogleLogin } from '@react-oauth/google';

const Navbar = () => {
  const logout = useAuthStore((state) => state.logout);
  const checkGoogleConnection = useGoogleStore((state) => state.checkGoogleConnection);
  const handleGoogleCallback = useGoogleStore((state) => state.handleGoogleCallback);
  const isConnected = useGoogleStore((state) => state.isConnected);
  const googleUser = useGoogleStore((state) => state.googleUser);
  const [isChecking, setIsChecking] = useState(true);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  
  // Check connection status on mount
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        setIsChecking(true);
        await checkGoogleConnection();
      } catch (error) {
        console.error("Failed to verify Google connection:", error);
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyConnection();
  }, [checkGoogleConnection]);
  
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setIsChecking(true);
      
      // Process the credential response
      await handleGoogleCallback(credentialResponse);
      
      toast({
        title: "Google Account Connected",
        description: "Your Google account has been successfully connected.",
      });
      
      // Hide the Google login button after successful login
      setShowGoogleLogin(false);
    } catch (error) {
      console.error("Failed to connect Google account:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect your Google account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast({
      title: "Connection Failed",
      description: "Failed to connect your Google account. Please try again.",
      variant: "destructive",
    });
    setShowGoogleLogin(false);
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
      console.error("Failed to check Google connection:", error);
      toast({
        title: "Connection Check Failed",
        description: "Unable to verify Google connection status.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleGoogleConnect = () => {
    setShowGoogleLogin(true);
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
              <span className="text-xl font-bold md:hidden">AD</span>
              <span className="text-xl font-bold hidden md:block">Ads Dashboard</span>
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
              
              {/* Google Login/Connect Button */}
              {showGoogleLogin ? (
                <div className="google-login-container flex items-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    useOneTap
                    theme="outline"
                    text="signin_with"
                    shape="rectangular"
                    width="210px"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => setShowGoogleLogin(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
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
              )}
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
