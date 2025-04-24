import React from "react";

// Import Router
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import Auth Utils
import { authUtils } from "./utils/auth";

// Import Context
import { LoadingProvider } from "./components/contexts/loadingContext";
import LoadingIndicator from "./components/indicators/loadingIndicator";

// Import Components
import {
  Login,
  PublicRoute,
  ProtectedRoute,
  UserPanel,
  NotFound,
  RoleBasedRoute,
  AdminPanel,
  PredictionPanel,
} from "./components";

const App: React.FC = () => {
  return (
    <LoadingProvider>
      <Router>
        <LoadingIndicator />
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["admin"]} redirectTo="/404">
                  <AdminPanel />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["admin", "user"]} redirectTo="/">
                  <UserPanel />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prediction/:detectionId"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["admin", "user"]} redirectTo="/">
                  <PredictionPanel />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              authUtils.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LoadingProvider>
  );
};

export default App;
