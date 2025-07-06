import { useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  element: ReactNode;
}

const ProtectedAdminRoute = ({ element }: ProtectedAdminRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminAuth === 'true' && adminUser) {
      try {
        const user = JSON.parse(adminUser);
        if (user && user.role === 'admin') {
          setIsAuthenticated(true);
          return;
        }
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
    }
    
    setIsAuthenticated(false);
  }, []);

  // While checking authentication status, show nothing
  if (isAuthenticated === null) {
    return null;
  }

  // If not authenticated as admin, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If admin authenticated, render the component
  return <>{element}</>;
};

export default ProtectedAdminRoute; 