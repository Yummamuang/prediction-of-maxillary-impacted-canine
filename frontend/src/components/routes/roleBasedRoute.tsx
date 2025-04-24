import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authUtils } from '../../utils/auth';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleBasedRoute = ({children, allowedRoles, redirectTo = "/"}: RoleBasedRouteProps) => {
  const location = useLocation();
  const userRole = authUtils.getUser()?.role;

  // Check if user is authenticated and has the required role
  if (!authUtils.isAuthenticated() || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default RoleBasedRoute;
