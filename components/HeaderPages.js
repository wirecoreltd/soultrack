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
  const [userRole, setUserRole] = useState(null);
  const [invitationPending, setInvitationPending] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        // 🔹 Récupérer rôle pour savoir si admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, eglise_id, branche_id, role")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        setPrenom(profile?.prenom || "Utilisateur");
        setUserRole(profile?.role || null);

        // 🔹 Nom de l'église
        if (profile?.eglise_id) {
          const { data: egliseData, error: egliseError } = await supabase
            .from("eglises")
            .select("nom")
            .eq("id", profile.eglise_id)
            .single();
          if (!egliseError && egliseData) setEglise(egliseData.nom);
        }

        // 🔹 Nom de la branche et superviseur
        if (profile?.branche_id) {
          const { data: brancheData, error: brancheError } = await supabase
            .from("branches")
            .select("nom, superviseur_nom")
            .eq("id", profile.branche_id)
            .single();

          if (!brancheError && brancheData) {
            setBranche(brancheData.nom);
            if (brancheData.superviseur_nom) setSuperviseur(brancheData.superviseur_nom);
          }

          // 🔹 Vérifier invitations pending pour admin
          if (profile?.role === "Administrateur") {
            const { data: invites } = await supabase
              .from("eglise_supervisions")
              .select("*")
              .eq("supervisee_branche_id", profile.branche_id)
              .eq("statut", "pending")
              .limit(1); // suffit qu'il y en ait une

            if (invites && invites.length > 0) setInvitationPending(true);
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

  const handleClickInvitation = () => {
    router.push("/accept-invitation");
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

        <div className="flex items-center space-x-4">
          {/* 🔔 Cloche pour admin si invitation pending */}
          {userRole === "Administrateur" && invitationPending && (
            <button
              onClick={handleClickInvitation}
              className="text-amber-300 text-xl hover:text-gray-200 transition"
              title="Invitation en attente"
            >
              🔔
            </button>
          )}

          <button
            onClick={handleLogout}
            className="text-amber-300 text-sm hover:text-gray-200 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="flex justify-end flex-col text-right space-y-1 mb-2 text-sm">
        <p className="text-white text-sm">
          Connecté : <span className="font-semibold">{loading ? "..." : prenom}</span>
        </p>
        {superviseur && (
          <p className="flex justify-end space-x-1 text-right mb-2 text-sm">
            <span style={{ color: "#fcd34d" }}>Superviseur :</span>
            <span className="text-white">{superviseur}</span>
          </p>
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
        <p className="text-white font-semibold text-lg mt-2">
          {eglise} <span className="text-amber-300">- {branche}</span>
        </p>
      </div>
    </div>
  );
}
