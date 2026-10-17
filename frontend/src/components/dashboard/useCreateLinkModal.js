import { createContext, useContext } from "react";

export const CreateLinkContext = createContext(null);

export const useCreateLinkModal = () => {
  const context = useContext(CreateLinkContext);
  if (!context) {
    throw new Error("useCreateLinkModal must be used inside CreateLinkProvider");
  }
  return context;
};
