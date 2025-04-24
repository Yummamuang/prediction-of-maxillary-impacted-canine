import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// import main CSS
import "./main.css";

// Import fontAwesome
import "./assets/fontAwesome/css/all.css";
import "./assets/fontAwesome/css/sharp-solid.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
