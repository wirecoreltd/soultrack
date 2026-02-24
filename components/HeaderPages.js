"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function HeaderPages() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");
  const [superviseur, setSuperviseur] = useState(""); // 🔹 superviseur affiché
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        // Récupère le profil
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, eglise_id, branche_id")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        setPrenom(profile?.prenom || "Utilisateur");

        // 🔹 Garde l'église et branche de l'utilisateur comme avant
        if (profile?.eglise_id) {
          const { data: egliseData, error: egliseError } = await supabase
            .from("eglises")
            .select("nom")
            .eq("id", profile.eglise_id)
            .single();
          if (!egliseError && egliseData) setEglise(egliseData.nom);
        }

        if (profile?.branche_id) {
          const { data: brancheData, error: brancheError } = await supabase
            .from("branches")
            .select("nom")
            .eq("id", profile.branche_id)
            .single();
          if (!brancheError && brancheData) setBranche(brancheData.nom);
        }

        // 🔹 Récupérer le superviseur de cette église, seulement si supervisee existe
        if (profile?.eglise_id) {
          const { data: supervisionData, error: supervisionError } = await supabase
            .from("eglise_supervisions")
            .select("superviseur_eglise_id, superviseur_branche_id")
            .eq("supervisee_eglise_id", profile.eglise_id)
            .eq("statut", "acceptee")
            .single();

          if (!supervisionError && supervisionData) {
            const { superviseur_eglise_id, superviseur_branche_id } = supervisionData;

            const { data: supEgliseData } = await supabase
              .from("eglises")
              .select("nom")
              .eq("id", superviseur_eglise_id)
              .single();

            const { data: supBrancheData } = await supabase
              .from("branches")
              .select("nom")
              .eq("id", superviseur_branche_id)
              .single();

            if (supEgliseData && supBrancheData) {
              setSuperviseur(`Superviseur : ${supEgliseData.nom} - ${supBrancheData.nom}`);
            }
          }
        }

      } catch (err) {
        console.error("Erreur récupération profil :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

      {/* User info en haut à droite */}
      <div className="flex justify-end flex-col text-right space-y-1 mb-2">
        <p className="text-white text-sm">
          Connecté : <span className="font-semibold">{loading ? "..." : prenom}</span>
        </p>
        {/* 🔹 Affiche le superviseur sous connecté, seulement si existe */}
        {superviseur && (
          <p className="text-white text-xs italic">{superviseur}</p>
        )}
      </div>

      {/* Logo centré */}
      <div className="flex flex-col items-center mb-4">
        <img
          src="/logo.png"
          alt="Logo SoulTrack"
          className="w-20 h-auto cursor-pointer hover:opacity-80 transition"
          onClick={() => router.push("/index")}
        />
        {/* 🔹 Affiche le nom et branche de l'église connectée comme avant */}
        <p className="text-white text-sm mt-2">{eglise} - {branche}</p>
      </div>
    </div>
  );
}
