import { createContext, useContext } from "react";

export const AuthModalContext = createContext(null);
export const useAuthModal = () => useContext(AuthModalContext);
