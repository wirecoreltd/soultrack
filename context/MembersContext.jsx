"use client";

import { createContext, useContext, useState } from "react";

const MembersContext = createContext(null);

export function MembersProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const updateMember = (updated) => {
    setMembers(prev =>
      prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m))
    );
  };

  const setAllMembers = (data) => {
    setMembers(data);
    setLoadingMembers(false);
  };

  return (
    <MembersContext.Provider
      value={{
        members,
        setAllMembers,
        updateMember,
        loadingMembers,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error("useMembers must be used inside MembersProvider");
  return ctx;
}
