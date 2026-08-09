"use client";
import { createContext, useState, useEffect } from "react";

export const LangContext = createContext(null);

export function LangProvider({ children }) {
  // On démarre toujours en "fr" côté serveur pour éviter les mismatchs
  // d'hydratation, puis on synchronise avec localStorage une fois monté côté client.
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored) setLang(stored);
  }, []);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, changeLang }}>
      {children}
    </LangContext.Provider>
  );
}
