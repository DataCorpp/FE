import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  email: string;
  role: string;
  name?: string;
  id?: string;
}

/**
 * Custom hook to check if the current user has admin authentication
 * @param redirectOnFailure If true, redirects to admin login page when not authenticated
 * @returns Authentication status and admin user data
 */
export const useAdminAuth = (redirectOnFailure = true) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminPermission = () => {
      setIsLoading(true);
      
      // Check localStorage for admin authentication
      const adminAuth = localStorage.getItem('adminAuth');
      const adminUserData = localStorage.getItem('adminUser');
      
      if (adminAuth === 'true' && adminUserData) {
        try {
          const userData = JSON.parse(adminUserData);
          if (userData && userData.role === 'admin') {
            setIsAdmin(true);
            setAdminUser(userData);
            setIsLoading(false);
            return true;
          }
        } catch (error) {
          console.error('Error parsing admin user data:', error);
          // Clear invalid data
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminUser');
        }
      }
      
      setIsAdmin(false);
      setAdminUser(null);
      setIsLoading(false);
      
      // Redirect to login if needed
      if (redirectOnFailure) {
        navigate('/admin/login', { 
          state: { 
            from: window.location.pathname,
            message: 'Please log in to access the admin panel' 
          } 
        });
      }
      
      return false;
    };
    
    checkAdminPermission();
  }, [navigate, redirectOnFailure]);

  return {
    isAdmin,
    adminUser,
    isLoading
  };
};

export default useAdminAuth; 