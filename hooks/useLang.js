import { useState } from "react";

export function useLang() {
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lang") || "fr";
    }
    return "fr";
  });

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  return { lang, changeLang };
}
