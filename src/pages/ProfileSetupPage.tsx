import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSetup from "@/components/ProfileSetup";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ProfileSetupPage = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Track that the user is in profile setup flow
  const [isInSetupFlow, setIsInSetupFlow] = useState(true);
  
  // Page title effect
  useEffect(() => {
    document.title = t('profile-setup-title', "Complete Your Profile - CPG Matchmaker");
  }, [t]);

  // Track the setup flow in session storage to maintain flow state across refreshes
  useEffect(() => {
    if (!user?.profileComplete) {
      sessionStorage.setItem('inProfileSetup', 'true');
      setIsInSetupFlow(true);
    } else {
      sessionStorage.removeItem('inProfileSetup');
      setIsInSetupFlow(false);
    }
    
    // This cleanup function will run when the component unmounts
    return () => {
      if (user?.profileComplete) {
        sessionStorage.removeItem('inProfileSetup');
      }
    };
  }, [user]);

  // Block navigation to dashboard if profile is incomplete
  // This only runs on subsequent renders if user is defined
  useEffect(() => {
    if (user && !user.profileComplete && location.pathname !== '/profile-setup') {
      navigate('/profile-setup', { replace: true });
    }
  }, [user, navigate, location.pathname]);

  // Check if user already has a complete profile
  useEffect(() => {
    if (user?.profileComplete) {
      // If profile is complete and not arriving from auth flow, go to dashboard
      if (!sessionStorage.getItem('inProfileSetup')) {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Listen for the back button and prevent leaving
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isInSetupFlow && !user?.profileComplete) {
        // Prevent default navigation
        event.preventDefault();
        
        // Show toast notification
        toast({
          title: t("profile-setup-required", "Profile Setup Required"),
          description: t("please-complete-profile", "Please complete your profile setup before continuing."),
          variant: "default",
        });
        
        // Navigate back to setup page
        navigate('/profile-setup', { replace: true });
        return false;
      }
    };

    // Add event listener
    window.addEventListener('popstate', handlePopState);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isInSetupFlow, user, navigate, toast, t]);

  // Function to manually mark profile as complete (for testing/development)
  const handleSkipSetup = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfile({ 
        profileComplete: true,
        // Set minimal required profile data if skipping
        companyName: user.companyName || "Company Name",
        role: user.role
      });
      
      toast({
        title: t("setup-skipped", "Setup Skipped"),
        description: t("setup-skipped-desc", "Your profile has been marked as complete."),
      });
      
      // Clean up setup flow state
      sessionStorage.removeItem('inProfileSetup');
      setIsInSetupFlow(false);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: t("error", "Error"),
        description: t("unable-to-skip", "Unable to skip setup. Please try again."),
        variant: "destructive",
      });
      console.error("Error skipping profile setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect back to profile setup if user tries to access dashboard before completing
  if (location.pathname === '/dashboard' && !user?.profileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* <Navbar /> */}
      
      <div className="flex-grow pt-16 pb-12 flex flex-col items-center justify-start relative overflow-x-hidden">
        {/* Background blur circles */}
        <div className="absolute top-40 -left-40 w-80 h-80 bg-primary/30 rounded-full filter blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-accent/30 rounded-full filter blur-3xl opacity-30 animate-pulse-slow" />
        
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold">{t('complete-your-profile', 'Complete Your Profile')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('profile-setup-description', 'Tell us more about your business to get started')}
              </p>
              
              {/* {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipSetup}
                  disabled={isLoading}
                  className="mt-4 opacity-70 hover:opacity-100"
                >
                  {isLoading ? t("processing", "Processing...") : t("dev-skip-setup", "Dev: Skip Setup")}
                </Button>
              )} */}
            </div>
            
            <ProfileSetup />
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfileSetupPage; 