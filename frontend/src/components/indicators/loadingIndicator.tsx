import React, { useEffect, useRef, useState } from "react";

// Import Context
import { useLoading } from "../contexts/loadingContext";

// Import Styles
import "./loadingIndicator.css";

// Import Images
import icon from "/logo.svg";

const LoadingIndicator: React.FC = () => {
  // use loading
  const { loading } = useLoading();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // loading ref
  const loadingContainerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const loaderRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (loading) {
      setIsLoading(true);

      if (loadingContainerRef.current) {
        loadingContainerRef.current.style.height = "100%";
      }
      if (iconRef.current) {
        iconRef.current.style.transform = "scale(1.2)";
      }
      if (loaderRef.current) {
        loaderRef.current.style.opacity = "1";
      }
    }
  }, [loading]);

  if (!loading) {
    iconRef.current?.style.setProperty("transform", "scale(1.2)");

    setTimeout(() => {
      iconRef.current?.style.setProperty("transform", "scale(0)");
      loaderRef.current?.style.setProperty("opacity", "0");

      setTimeout(() => {
        loadingContainerRef.current?.style.setProperty("height", "0%");
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }, 200);
    }, 400);

    if (!isLoading) {
      return null;
    }
  }

  return (
    <div ref={loadingContainerRef} className="loading-container">
      <div className="icon">
        <img
          ref={iconRef}
          className="icon-image"
          src={icon}
          height={200}
          width={200}
        />
      </div>
      <span ref={loaderRef} className="loader"></span>
    </div>
  );
};

export default LoadingIndicator;
