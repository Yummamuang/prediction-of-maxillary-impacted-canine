import axios, { AxiosInstance } from "axios";
import { authUtils } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosParams = {
  // Set your base URL
  baseURL: API_URL,

  // Common headers
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 3000
};

// Create instance
const axiosInstance: AxiosInstance = axios.create(axiosParams);

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization header with JWT token if available
    const token = authUtils.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
