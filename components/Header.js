// components/Header.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "./LogoutLink";

export default function Header() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("prenom, eglise_nom, branche_nom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;

        setPrenom(profileData?.prenom || "Utilisateur");
        setEglise(profileData?.eglise_nom || "Église Principale");
        setBranche(profileData?.branche_nom || "Maurice");
      } catch (err) {
        console.error("Erreur récupération profil :", err);
        setPrenom("Utilisateur");
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-amber-300 text-base hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>

        <LogoutLink />
      </div>

      {/* Info utilisateur */}
      <div className="mt-1 text-right">
        <p className="text-white text-base">👋 Bienvenue <span className="font-semibold">{prenom}</span></p>
        <p className="text-white text-base">
          <span>{eglise}</span>{" "}
          <span className="font-semibold text-amber-300">- {branche}</span>
        </p>
      </div>

      {/* Logo centré */}
      <div className="flex justify-center mt-4 mb-4">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18" />
      </div>
    </div>
  );
}
