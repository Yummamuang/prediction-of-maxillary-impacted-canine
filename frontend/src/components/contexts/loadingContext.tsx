import React, { createContext, useState, useContext, ReactNode } from "react";

// set the type of the context
interface LoadingContextType {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

// set the type of the props
interface LoadingProviderProps {
  children: ReactNode;
}

// create the context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// create the provider
export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
