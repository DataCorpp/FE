import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSetup from "@/components/ProfileSetup";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ProfileSetupPage = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Page title effect
  useEffect(() => {
    document.title = t('profile-setup-title', "Complete Your Profile - CPG Matchmaker");
  }, [t]);

  // Check if user already has a complete profile
  useEffect(() => {
    if (user?.profileComplete) {
      // If user profile is already complete, redirect to dashboard
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
              
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipSetup}
                  disabled={isLoading}
                  className="mt-4 opacity-70 hover:opacity-100"
                >
                  {isLoading ? t("processing", "Processing...") : t("dev-skip-setup", "Dev: Skip Setup")}
                </Button>
              )}
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