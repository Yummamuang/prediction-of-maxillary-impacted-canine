import axiosInstance from "../config/axiosConfig";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface JwtPayload {
  exp: number;
  iat: number;
  jti: string;
  type: string;
  sub: number;
  nbf?: number;
  identity?: {
    id: number;
    username: string;
    role: string;
  };
}

export const AUTH_TOKEN_KEY = "auth_token";
export const USER_KEY = "user_data";

export const authUtils = {
  // Set authentication data
  setAuth(token: string, userData: User): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  // Clear authentication data
  clearAuth(): void {
    // Try to logout on server if we have a token
    const token = this.getToken();
    if (token) {
      axiosInstance.post("/logout").catch(() => {
        // Ignore errors during logout
      });
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp < currentTime) {
        this.clearAuth();
        return false;
      }

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.clearAuth();
      return false;
    }
  },

  // Get token
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Get user data
  getUser(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Role checks
  hasRole(role: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  },

  isAdmin(): boolean {
    return this.hasRole("admin");
  },

  // Validate token with backend
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        this.clearAuth();
        return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.clearAuth();
      return false;
    }

    try {
      // Add a flag in localStorage to track API connection attempts
      const lastApiAttempt = localStorage.getItem('last_api_attempt');
      const now = new Date().getTime();

      // If we've tried to connect recently (within last 30 seconds), use cached auth
      if (lastApiAttempt && (now - parseInt(lastApiAttempt)) < 30000) {
        console.log("Using cached authentication due to recent API failure");
        return true;
      }

      // Update last attempt time
      localStorage.setItem('last_api_attempt', now.toString());

      // Send request to validate token
      const response = await axiosInstance.get("/validate-token", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Clear failed attempt counter on success
      localStorage.removeItem('api_failure_count');

      // Update user data if available
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || !error.response) {
          // API is not available
          // Increment the failure counter
          const failureCount = parseInt(localStorage.getItem('api_failure_count') || '0') + 1;
          localStorage.setItem('api_failure_count', failureCount.toString());

          // Only redirect to login after multiple consecutive failures
          if (failureCount > 3) {
            window.location.href = '/';
          } else {
            // Instead of redirecting, return true to maintain the session temporarily
            console.warn("API connection failed, using cached credentials");
            return true;
          }
        } else if (error.response?.status === 401 || error.response?.status === 422) {
          // Token is invalid
          console.log("Token is invalid or expired, logging out");
          this.clearAuth();
          window.location.reload();
        }
      } else {
        // For non-axios errors, don't immediately clear auth
        console.error("Non-axios error during token validation:", error);

        // Increment failure counter
        const failureCount = parseInt(localStorage.getItem('api_failure_count') || '0') + 1;
        localStorage.setItem('api_failure_count', failureCount.toString());

        if (failureCount > 3) {
          this.clearAuth();
          window.location.href = '/';
        } else {
          return true;
        }
      }
      return false;
    }
  },
};
