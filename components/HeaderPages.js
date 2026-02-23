"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";

export default function HeaderPages() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("Utilisateur");
  const [eglise, setEglise] = useState("Église Principale");
  const [branche, setBranche] = useState("Maurice");
  const [superviseur, setSuperviseur] = useState(""); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) return;

        // 🔹 Récupération du profil
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, eglise_id, branche_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setPrenom(profile?.prenom || "Utilisateur");

        // 🔹 Nom de l'église
        if (profile?.eglise_id) {
          const { data: egliseData } = await supabase
            .from("eglises")
            .select("nom")
            .eq("id", profile.eglise_id)
            .single();

          if (egliseData) setEglise(egliseData.nom);
        }

        // 🔹 Nom de la branche
        if (profile?.branche_id) {
          const { data: brancheData } = await supabase
            .from("branches")
            .select("nom")
            .eq("id", profile.branche_id)
            .single();

          if (brancheData) setBranche(brancheData.nom);
        }

        // 🔹 Récupération de la supervision (église + branche superviseur)
        if (profile?.eglise_id) {
          const { data: supervisionData } = await supabase
  .from("eglise_supervisions")
  .select(`
    superviseur_eglise_id,
    superviseur_branche_id
  `)
  .eq("supervisee_eglise_id", profile.eglise_id)
  .eq("statut", "acceptee")
  .maybeSingle();

if (supervisionData) {
  // 🔹 Récupérer nom église superviseur
  const { data: supEglise } = await supabase
    .from("eglises")
    .select("nom")
    .eq("id", supervisionData.superviseur_eglise_id)
    .single();

  // 🔹 Récupérer nom branche superviseur
  const { data: supBranche } = await supabase
    .from("branches")
    .select("nom")
    .eq("id", supervisionData.superviseur_branche_id)
    .single();

  if (supEglise) {
    setSuperviseur(
      supBranche
        ? `${supEglise.nom} - ${supBranche?.nom || ""}`
        : supEglise.nom
    );
  }
}


          if (!supervisionError && supervisionData) {
            const nomEglise =
              supervisionData.superviseur_eglise?.nom || "";
            const nomBranche =
              supervisionData.superviseur_branche?.nom || "";

            if (nomEglise) {
              setSuperviseur(
                nomBranche
                  ? `${nomEglise} - ${nomBranche}`
                  : nomEglise
              );
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

      {/* User info */}
      <div className="flex justify-end flex-col text-right space-y-1 mb-2">
        <p className="text-white text-sm">
          Connecté :{" "}
          <span className="font-semibold">
            {loading ? "..." : prenom}
          </span>
        </p>

        {superviseur && (
          <p className="text-white text-xs">
            Supervision :{" "}
            <span className="font-semibold">
              {superviseur}
            </span>
          </p>
        )}
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-4">
        <img
          src="/logo.png"
          alt="Logo SoulTrack"
          className="w-20 h-auto cursor-pointer hover:opacity-80 transition"
          onClick={() => router.push("/index")}
        />
      </div>
    </div>
  );
}
