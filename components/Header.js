"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("");
  const [eglise, setEglise] = useState("");
  const [branche, setBranche] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 🔹 1️⃣ Récupérer user Supabase
        const { data: authData, error } = await supabase.auth.getUser();
        if (error || !authData?.user) return;

        const userId = authData.user.id;

        // 🔹 2️⃣ Récupérer profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, eglise_id, branche_id")
          .eq("id", userId)
          .single();

        if (profileError || !profile) return;

        setPrenom(profile.prenom || "");

        // 🔹 3️⃣ Récupérer le nom de l'église si eglise_id existe
        if (profile.eglise_id) {
          const { data: egliseData } = await supabase
            .from("eglises")
            .select("nom")
            .eq("id", profile.eglise_id)
            .single();
          setEglise(egliseData?.nom || "");
        }

        // 🔹 4️⃣ Récupérer le nom de la branche si branche_id existe
        if (profile.branche_id) {
          const { data: brancheData } = await supabase
            .from("branches")
            .select("nom")
            .eq("id", profile.branche_id)
            .single();
          setBranche(brancheData?.nom || "");
        }
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => router.back()}
          className="text-amber-300 hover:text-gray-200 transition"
        >
          ← Retour
        </button>

        <button
          onClick={handleLogout}
          className="text-amber-300 text-sm hover:text-gray-200 transition"
        >
          Déconnexion
        </button>
      </div>

      {/* Welcome */}
      <div className="flex justify-end mb-4">
        <p className="text-white text-sm">
          👋 Bienvenue <span className="font-semibold">{prenom || "—"}</span>
        </p>
      </div>

      {/* Logo + Église / Branche */}
      <div className="flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-auto" />

        {(eglise || branche) && (
          <p className="text-white text-base font-medium tracking-wide">
            {eglise}
            {branche && (
              <span className="text-amber-300 font-semibold">
                {" "}
                – {branche}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
