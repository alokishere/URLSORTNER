import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { AuthModalProvider } from "./auth/AuthModalProvider.jsx";

const app = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AuthModalProvider>
          <App />
        </AuthModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
const root = document.getElementById("root");
if (window.location.pathname === "/" && root.dataset.prerendered === "true")
  hydrateRoot(root, app);
else createRoot(root).render(app);
