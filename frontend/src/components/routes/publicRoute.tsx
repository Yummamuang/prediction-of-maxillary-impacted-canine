import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authUtils } from '../../utils/auth';

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = authUtils.isAuthenticated();

  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
