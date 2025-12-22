"use client";

import { createContext, useContext, useState } from "react";

const MembersContext = createContext(null);

export function MembersProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // 🔹 Mise à jour d’un membre
  const updateMember = (updatedMember) => {
    if (!updatedMember?.id) return;
    setMembers(prev =>
      prev.map(m => (m.id === updatedMember.id ? { ...m, ...updatedMember } : m))
    );
  };

  // 🔹 Initialisation complète
  const setAllMembers = (data) => {
    setMembers(data || []);
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
