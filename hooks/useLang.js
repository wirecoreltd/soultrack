"use client";
import { useContext } from "react";
import { LangContext } from "../context/LangContext";

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang doit être utilisé à l'intérieur d'un <LangProvider>");
  }
  return context;
}
