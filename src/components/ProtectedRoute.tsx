import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles: string[];
  requireCompleteProfile?: boolean;
}

const ProtectedRoute = ({ 
  element, 
  allowedRoles,
  requireCompleteProfile = true 
}: ProtectedRouteProps) => {
  const { isAuthenticated, role, user } = useUser();
  const location = useLocation();

  // Track the current path for redirects
  useEffect(() => {
    if (isAuthenticated && location.pathname !== '/profile-setup') {
      sessionStorage.setItem('lastPath', location.pathname);
    }
  }, [isAuthenticated, location.pathname]);

  // 1. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/auth?type=signin&redirect=${location.pathname}`} replace />;
  }

  // 2. If authenticated but profile not complete, redirect to profile setup
  // Skip this check if we're already on the profile setup page or if requireCompleteProfile is false
  if (
    requireCompleteProfile &&
    user && 
    !user.profileComplete && 
    location.pathname !== '/profile-setup'
  ) {
    // Store that we're in profile setup flow
    sessionStorage.setItem('inProfileSetup', 'true');
    return <Navigate to="/profile-setup" replace />;
  }

  // 3. If authenticated but not authorized for this route, redirect to dashboard
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. If authenticated, profile complete, and authorized, render the component
  return <>{element}</>;
};

export default ProtectedRoute;
