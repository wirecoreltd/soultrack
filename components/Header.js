"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState(null);
  const [branche, setBranche] = useState(null);

  useEffect(() => {
    const loadProfile = async (userId) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("prenom, eglise_nom, branche_nom")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setPrenom(data.prenom || "Utilisateur");
        setEglise(data.eglise_nom);
        setBranche(data.branche_nom);
      }
    };

    // 1️⃣ Charger si session déjà prête
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        loadProfile(data.session.user.id);
      }
    });

    // 2️⃣ Écouter les changements d’auth (clé du bug)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadProfile(session.user.id);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-1">
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

      {/* Logo + Église */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="/logo.png"
          alt="Logo SoulTrack"
          className="w-20 h-auto mb-2"
        />

        {(eglise || branche) && (
          <p className="text-white text-base font-medium">
            {eglise}
            {branche && (
              <span className="text-amber-300 font-semibold">
                {" "}
                — {branche}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
