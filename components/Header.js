"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import LogoutLink from "./LogoutLink";

export default function Header() {
  const [prenom, setPrenom] = useState("");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");

  useEffect(() => {
    const fetchProfile = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("prenom, eglise_nom, branche_nom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;

        setPrenom(profile?.prenom || "Utilisateur");
        setEglise(profile?.eglise_nom || "Église Principale");
        setBranche(profile?.branche_nom || "Maurice");
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Top bar: ← Retour et Déconnexion */}
      <div className="flex justify-between items-center mb-1">
        <button className="text-amber-300 hover:text-gray-200">← Retour</button>
        <LogoutLink />
      </div>

      {/* Info utilisateur sous Déconnexion */}
      <div className="text-left ml-2 space-y-1 mb-6">
        <p className="text-white text-sm">👋 Bienvenue <span className="font-semibold">{prenom}</span></p>
        <p className="text-white text-sm">{eglise} <span className="text-amber-300 font-semibold">- {branche}</span></p>
      </div>

      {/* Logo centré sous le header */}
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18" />
      </div>
    </div>
  );
}
