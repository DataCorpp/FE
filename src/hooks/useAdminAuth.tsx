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
    const checkAdminPermission = async () => {
      setIsLoading(true);
      
      try {
        // Prepare headers with admin data from localStorage
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        const adminAuth = localStorage.getItem('adminAuth');
        const adminUserData = localStorage.getItem('adminUser');
        if (adminAuth === 'true' && adminUserData) {
          try {
            const adminUser = JSON.parse(adminUserData);
            const token = adminUser.token || 'admin-token';
            headers.AdminAuthorization = `Bearer ${token}`;
            headers['X-Admin-Role'] = adminUser.role;
            headers['X-Admin-Email'] = adminUser.email;
          } catch (err) {
            console.error('Error parsing admin storage:', err);
          }
        }

        // Check admin session via API
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/me`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.role === 'admin') {
            setIsAdmin(true);
            setAdminUser(userData);
            setIsLoading(false);
            return true;
          }
        }
        
        // Session invalid or not admin
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
      } catch (error) {
        console.error('Error checking admin session:', error);
        setIsAdmin(false);
        setAdminUser(null);
        setIsLoading(false);
        
        // Redirect to login on error
        if (redirectOnFailure) {
          navigate('/admin/login', { 
            state: { 
              from: window.location.pathname,
              message: 'Please log in to access the admin panel' 
            } 
          });
        }
        
        return false;
      }
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