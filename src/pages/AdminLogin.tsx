import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Lock, Mail, AlertCircle, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the redirect path from query params (if any)
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  // Check if user is already authenticated and handle any state messages
  useEffect(() => {
    // Check for messages in location state (e.g., after logout or redirect)
    if (location.state) {
      if (location.state.loggedOut) {
        setStatusMessage(location.state.message || 'You have been logged out successfully');
      } else if (location.state.message) {
        setStatusMessage(location.state.message);
      }
    }
    
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuth');
      const adminUserData = localStorage.getItem('adminUser');
      
      if (adminAuth === 'true' && adminUserData) {
        try {
          const user = JSON.parse(adminUserData);
          if (user && user.role === 'admin') {
            // Only redirect automatically if not just logged out
            if (!location.state?.loggedOut) {
              // If already logged in, redirect to intended destination
              navigate(redirectPath);
              return true;
            }
          }
        } catch (error) {
          console.error('Error parsing admin user data:', error);
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminUser');
        }
      }
      return false;
    };
    
    checkAuth();
  }, [navigate, redirectPath, location.state]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Simple admin authentication with security protections
    setTimeout(() => {
      // In a real application, this would be a secure API call
      // For security, avoid hardcoding credentials in the frontend
      // This is for demonstration only
      if (email === 'admin@admin.com' && password === 'admin') {
        // Generate a mock admin token
        const adminToken = btoa(`admin:${email}:${new Date().getTime()}`);

        // Set admin session with proper token
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', JSON.stringify({ 
          email, 
          role: 'admin',
          name: 'Administrator',
          loginTime: new Date().toISOString(),
          token: adminToken,
          permissions: ['users.manage', 'products.manage', 'settings.manage']
        }));
        
        console.log("Admin login successful - Token generated");
        
        // Redirect to dashboard or intended destination
        navigate(redirectPath);
      } else {
        setError('Invalid email or password');
        // For security, don't reveal which field was incorrect
      }
      setIsLoading(false);
    }, 1000); // Simulate API call
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="inline-block mb-2"
          >
            <div className="bg-primary/10 p-3 rounded-full inline-flex">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-gray-400">Access the system management interface</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white">Admin Login</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                      <Input
                        id="email"
                        placeholder="admin@admin.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-gray-900/50 border-gray-800 text-white"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                      <Input
                        id="password"
                        placeholder="••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-gray-900/50 border-gray-800 text-white"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-md"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {error}
                    </motion.div>
                  )}

                  {statusMessage && !error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center p-3 text-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      {statusMessage}
                    </motion.div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      Sign In
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-500">
                Management access only. For regular login, <a href="/login" className="text-primary hover:underline">click here</a>.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin; 