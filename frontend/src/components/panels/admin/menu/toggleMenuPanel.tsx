import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import Auth
import { authUtils } from "../../../../utils/auth";

// import Context
import { useLoading } from "../../../contexts/loadingContext";
import axiosInstance from "../../../../config/axiosConfig";

// Import style
import "./styles/toggleMenuPanel.css";

const ToggleMenuPanel = () => {
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  // Get user from auth
  const user = authUtils.getUser();

  // Use Ref
  const angleDownRef = useRef<HTMLLIElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check menu open
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Toggle Menu Function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    menuButtonRef.current?.style.setProperty("pointer-events", "none");

    // carpet animate
    if (angleDownRef.current) {
      angleDownRef.current.style.transform = isMenuOpen
        ? "rotate(0deg)"
        : "rotate(180deg)";
    }

    // Menu style animate
    if (!isMenuOpen) {
      menuRef.current?.style.setProperty("transform", "translateY(120%)");
    } else {
      menuRef.current?.style.setProperty("transform", "translateY(-120%)");
    }

    setTimeout(
      () => menuButtonRef.current?.style.setProperty("pointer-events", "auto"),
      600,
    );
  };

  // Logout
  const logout = () => {
    setLoading(true);
    try {
      axiosInstance.post("/logout").then(() => {
        authUtils.clearAuth();
        navigate("/");
        setLoading(false);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      authUtils.clearAuth();
      navigate("/");
      setLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const clickOutsideMenu = (event: MouseEvent) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false);
        angleDownRef.current?.style.setProperty("transform", "rotate(0deg)");
        menuRef.current?.style.setProperty("transform", "translateY(-120%)");
      }
    };

    // Add event listener
    document.addEventListener("mousedown", clickOutsideMenu);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", clickOutsideMenu);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex flex-row-reverse pr-4">
      <div className="select-none" ref={menuButtonRef}>
        <div
          className="poppins font-medium heading-text text-base md:text-lg cursor-pointer hover-text-blue bg-white py-2 px-4 rounded-xl shadow-2xs z-10"
          onClick={toggleMenu}
        >
          <span>
            <i className="fa-solid fa-circle-user mr-2 lg:mr-4 text-xl text-blue translate-y-[2px]"></i>
          </span>
          <span className="mr-1 hover-text-blue">{user?.username}</span>
          <span>
            <i
              ref={angleDownRef}
              className="fa-sharp fa-solid fa-angle-down translate-y-[2px]"
            ></i>
          </span>
        </div>
        <div className="overflow-hidden absolute right-8 mt-2">
          <div
            id="menu"
            ref={menuRef}
            className="poppins bg-white py-2 px-4 rounded-xl shadow-2xs -translate-y-[120%] -z-10"
          >
            <div
              className="cursor-pointer hover-text-blue p-2 flex items-center justify-end"
              onClick={logout}
            >
              <span className="mr-2">Logout</span>
              <i className="fa-sharp fa-solid fa-arrow-right-from-bracket fa-sm"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToggleMenuPanel;
