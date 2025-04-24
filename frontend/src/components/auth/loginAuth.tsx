// Import React
import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import Auth Utils
import { authUtils, User } from "../../utils/auth";

// Import Context
import { useLoading } from "../contexts/loadingContext";


// Import logo
import logo from "/logo.svg";

const Login = () => {
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  // Login State
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Can click login button
  const [canClick, setCanClick] = useState<boolean>(true);

  // Define function inside useEffect to avoid dependency issues
  const navigateByUserRole = useCallback(
    (user: User | null) => {
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    },
    [navigate],
  );

  useEffect(() => {
    // Check if user is already authenticated on component mount
    if (authUtils.isAuthenticated()) {
      navigateByUserRole(authUtils.getUser());
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [setLoading, navigate, navigateByUserRole]);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setCanClick(false);

    axiosInstance.post('/login', {
      username: username,
      password: password
    }).then((res) => {
      if (res.data.user && res.data.token) {
        authUtils.setAuth(res.data.token, res.data.user);
        // Navigate based on user role
        navigateByUserRole(res.data.user);
      } else {
        setError("Invalid response from server");
        setLoading(false);
        setCanClick(true);
      }
    }).catch((error) => {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || !error.response) {
          // Connection timeout or server unreachable
          setError("Cannot connect to server.");
        } else {
          // Server responded with an error
          setError(error.response?.data?.message || "An error occurred during login");
        }
      } else {
        // Non-axios error
        setError("An unexpected error occurred. Please try again.");
      }
      setTimeout(() => {
        setLoading(false);
        setCanClick(true);
      }, 1000);
    })
  };

  return (
    <div className="h-lvh flex justify-center items-center">
      <div>
        <div className="mb-2 md:mb-5">
          <img
            className="mx-auto drop-shadow-md"
            src={logo}
            width={100}
            height={100}
            alt="Logo"
          />
        </div>
        <div className="poppins text-xl md:text-3xl font-medium heading-text mb-2 md:mb-3">
          Login to your account.
        </div>
        <div className="poppins md:text-sm text-gray-500">
          Enter your username and password to login.
        </div>
        {/* Error */}
        {error && (
          <div className="poppins font-medium text-sm text-red-500 mt-4 md:mt-6 py-2 md:py-4 rounded-md bg-white text-center border-2">
            {error}
          </div>
        )}
        <div>
          {/* Form */}
          <form className="mt-4 md:mt-8">
            {/* Username */}
            <div className="mb-4 input-primary group focus-within:ring-2 focus-within:ring-blue-300">
              <i
                id="userIcon"
                className="fa-solid fa-circle-user fa-lg transition-colors"
              ></i>
              <input
                className="poppins outline-none py-1 px-2 group-focus-within:text-blue w-full"
                type="text"
                placeholder="Username"
                onFocus={() =>
                  document
                    .getElementById("userIcon")
                    ?.classList.add("text-blue")
                }
                onBlur={() =>
                  document
                    .getElementById("userIcon")
                    ?.classList.remove("text-blue")
                }
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {/* Password */}
            <div className="mb-8 input-primary group focus-within:ring-2 focus-within:ring-blue-300">
              <i
                id="lockIcon"
                className="fa-solid fa-lock-keyhole fa-lg w-[20px] transition-colors"
              ></i>
              <input
                className="poppins outline-none py-1 px-2 group-focus-within:text-blue w-full"
                type="password"
                placeholder="Password"
                onFocus={() =>
                  document
                    .getElementById("lockIcon")
                    ?.classList.add("text-blue")
                }
                onBlur={() =>
                  document
                    .getElementById("lockIcon")
                    ?.classList.remove("text-blue")
                }
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <button
                className="btn-primary"
                onClick={handleLogin}
                style={canClick ? {} : { pointerEvents: "none" }}
              >
                Login
              </button>
            </div>
          </form>
          {/* Don't have account */}
          <div className="poppins text-sm text-gray-500 mt-4 text-center">
            Want to create an account?{" "}
            <span className="text-blue">
              Please contact your administrator.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
