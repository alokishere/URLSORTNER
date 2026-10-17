import { useState } from "react";
import CreateLinkModal from "./CreateLinkModal";
import { CreateLinkContext } from "./useCreateLinkModal";

const CreateLinkProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [createdVersion, setCreatedVersion] = useState(0);

  return (
    <CreateLinkContext.Provider
      value={{
        openCreateLink: () => setOpen(true),
        createdVersion,
      }}
    >
      {children}
      <CreateLinkModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => setCreatedVersion((version) => version + 1)}
      />
    </CreateLinkContext.Provider>
  );
};

export default CreateLinkProvider;
