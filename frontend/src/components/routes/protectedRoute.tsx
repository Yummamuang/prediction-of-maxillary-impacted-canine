import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authUtils } from "../../utils/auth";
import { useLoading } from "../contexts/loadingContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { setLoading } = useLoading();
  const location = useLocation();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const validateAuth = async () => {
      setLoading(true);
      if (!authUtils.isAuthenticated()) {
        setIsValid(false);
        setLoading(false);
        return;
      }

      const valid = await authUtils.validateToken();
      setIsValid(valid);
      setLoading(false);
    };

    validateAuth();
  }, [setLoading]);

  if (isValid === null) {
    return null;
  }

  if (!isValid) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
