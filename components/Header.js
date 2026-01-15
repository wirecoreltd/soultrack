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
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("prenom, eglise_nom, branche_nom")
        .eq("id", data.user.id)
        .single();

      if (!profile) return;

      setPrenom(profile.prenom || "");
      setEglise(profile.eglise_nom || "");
      setBranche(profile.branche_nom || "");
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
          👋 Bienvenue <span className="font-semibold">{prenom}</span>
        </p>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-auto" />

        {/* Église / Branche */}
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
