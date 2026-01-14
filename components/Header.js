"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "./LogoutLink";

export default function Header() {
  const [prenom, setPrenom] = useState("");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        // 🔹 On récupère uniquement le profil de l'utilisateur
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("prenom, eglise_name, branche_name") // ici mettre les champs réels dans ta table profiles
          .eq("email", userEmail)
          .single();

        if (error) throw error;

        setPrenom(profile?.prenom || "");
        setEglise(profile?.eglise_name || "Église Principale");
        setBranche(profile?.branche_name || "Maurice");
      } catch (err) {
        console.error("Erreur récupération user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Ligne retour / déconnexion */}
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={() => router.back()}
          className="text-amber-300 text-base hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>
        <LogoutLink />
      </div>

      {/* Texte sous Déconnexion */}
      <div className="flex flex-col items-end text-right space-y-0 mb-4">
        <p className="text-white text-base">👋 Bienvenue <span className="font-semibold">{prenom}</span></p>
        <p className="text-white text-base">
          {eglise} <span className="text-amber-300 font-semibold">- {branche}</span>
        </p>
      </div>

      {/* Logo centré */}
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-20" />
      </div>
    </div>
  );
}
