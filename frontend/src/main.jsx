import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { AuthModalProvider } from "./auth/AuthModalProvider.jsx";

createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}><BrowserRouter>
      <AuthProvider>
        <AuthModalProvider><App /></AuthModalProvider>
      </AuthProvider>
    </BrowserRouter></QueryClientProvider>

);
