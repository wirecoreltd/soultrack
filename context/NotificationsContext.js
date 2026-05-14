"use client";
import { createContext, useContext, useState } from "react";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [seenIds, setSeenIds] = useState(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("seen_nouveaux") || "[]");
  });

  const markAsSeen = (id) => {
    setSeenIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("seen_nouveaux", JSON.stringify(next));
      return next;
    });
  };

  return (
    <NotificationsContext.Provider value={{ seenIds, markAsSeen }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  return useContext(NotificationsContext);
}
