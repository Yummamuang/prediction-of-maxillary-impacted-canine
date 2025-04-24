// Import React
import { useState } from "react";
import axiosInstance from "../../../../../config/axiosConfig";
import axios from "axios";

// Import Context
import { useLoading } from "../../../../contexts/loadingContext";

const AddUserPanel = () => {
  const { setLoading } = useLoading();

  // Signup state
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSucess] = useState<string | null>(null);

  const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    // User object
    const user = {
      email,
      username,
      password,
      confirmPassword,
    };

    try {
      const response = await axiosInstance.post("/signup", user);
      if (response.data.status === "success") {
        setSucess(response.data.message);
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError(null);
      } else {
        setError("Invalid response from server");
        setSucess(null);
      }
      setLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED" || !error.response) {
          // Connection timeout or server unreachable
          setError("Cannot connect to server.");
          setSucess(null);
        } else {
          // Server responded with an error
          setError(
            error.response?.data?.message || "An error occurred during login",
          );
          setSucess(null);
        }
      } else {
        // Non-axios error
        setError("An unexpected error occurred. Please try again.");
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="px-8 mt-18">
      <div>
        <div className="poppins text-xl md:text-2xl font-medium heading-text mb-2 md:mb-3">
          Create user account.
        </div>
        <div className="poppins md:text-sm text-gray-500 mb-4 lg:mb-8">
          Enter your email, username and password to register.
        </div>
        <div>
          {/* Form */}
          <form className="grid grid-cols-[minmax(400px,_500px)] xl:grid-cols-[750px]">
            {/* Error and Success */}
            {(error || success) && (
              <div className={`poppins font-medium text-sm ${error ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'} mb-4 md:mb-6 py-2 md:py-4 rounded-md bg-white text-center border-2`}>
                {error || success}
              </div>
            )}
            <div className="flex gap-4">
              {/* Email */}
              <div className="mb-4 input-primary group focus-within:ring-2 focus-within:ring-blue-300">
                <i
                  id="emailIcon"
                  className="fa-solid fa-envelope fa-lg transition-colors w-[20px]"
                ></i>
                <input
                  className="poppins outline-none py-1 px-2 group-focus-within:text-blue w-full"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onFocus={() =>
                    document
                      .getElementById("emailIcon")
                      ?.classList.add("text-blue")
                  }
                  onBlur={() =>
                    document
                      .getElementById("emailIcon")
                      ?.classList.remove("text-blue")
                  }
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {/* Username */}
              <div className="mb-4 input-primary group focus-within:ring-2 focus-within:ring-blue-300 flex items-center">
                <i
                  id="userIcon"
                  className="fa-solid fa-circle-user fa-lg transition-colors"
                ></i>
                <input
                  className="poppins outline-none py-1 px-2 group-focus-within:text-blue w-full"
                  type="text"
                  placeholder="Username"
                  value={username}
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
            </div>

            <div className="flex gap-4">
              {/* Password */}
              <div className="mb-8 input-primary group focus-within:ring-2 focus-within:ring-blue-300 flex items-center">
                <i
                  id="lockIcon"
                  className="fa-solid fa-lock-keyhole fa-lg w-[20px] transition-colors"
                ></i>
                <input
                  className="poppins outline-none py-1 px-2 group-focus-within:text-blue w-full"
                  type="password"
                  placeholder="Password"
                  value={password}
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
              {/* Confirm password */}
              <div className="mb-8 input-primary group focus-within:ring-2 focus-within:ring-blue-300 flex items-center">
                <i
                  id="lockIcon2"
                  className="fa-solid fa-lock-keyhole fa-lg w-[20px] transition-colors"
                ></i>
                <input
                  className="poppins outline-none py-1 px-2 group-focus-within:text-blue w-full"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onFocus={() =>
                    document
                      .getElementById("lockIcon2")
                      ?.classList.add("text-blue")
                  }
                  onBlur={() =>
                    document
                      .getElementById("lockIcon2")
                      ?.classList.remove("text-blue")
                  }
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex">
              <button className="btn-primary" onClick={handleSignup}>
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserPanel;
