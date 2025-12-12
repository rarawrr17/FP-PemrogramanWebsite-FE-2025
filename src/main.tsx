import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.tsx";
import AuthGate from "./providers/AuthGate.tsx";
<<<<<<< HEAD
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthGate>
        <BrowserRouter>
          <Toaster position="top-center" />
          <App />
        </BrowserRouter>
      </AuthGate>
    </ErrorBoundary>
=======

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthGate>
      <BrowserRouter>
        <Toaster position="top-center" />
        <App />
      </BrowserRouter>
    </AuthGate>
>>>>>>> 4a519201c77062e5487d87a8d07b44f3e1fcebf9
  </StrictMode>,
);
