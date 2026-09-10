"use client";
import { useEffect } from "react";
import { SafeArea } from "@capacitor-community/safe-area";

export default function NavigationBarSync() {
  useEffect(() => {
    SafeArea.enable({
      config: {
        customColorsForSystemBars: true,
        statusBarColor: "#333699",
        statusBarContent: "light",
        navigationBarColor: "#3E7DCF",
        navigationBarContent: "light",
      },
    });
  }, []);

  return null;
}
