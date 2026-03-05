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
  const [pendingToken, setPendingToken] = useState(null); // 🔹 token pour redirection

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("prenom, eglise_id, branche_id, role")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        setPrenom(profile?.prenom || "Utilisateur");
        setUserRole(profile?.role || null);

        if (profile?.eglise_id) {
          const { data: egliseData } = await supabase
            .from("eglises")
            .select("nom")
            .eq("id", profile.eglise_id)
            .single();
          if (egliseData) setEglise(egliseData.nom);
        }

        if (profile?.branche_id) {
          const { data: brancheData } = await supabase
            .from("branches")
            .select("nom, superviseur_nom")
            .eq("id", profile.branche_id)
            .single();

          if (brancheData) {
            setBranche(brancheData.nom);
            if (brancheData.superviseur_nom) setSuperviseur(brancheData.superviseur_nom);
          }

          if (profile.role === "Administrateur") {
            const { data: invites } = await supabase
              .from("eglise_supervisions")
              .select("invitation_token")
              .eq("supervisee_branche_id", profile.branche_id)
              .eq("statut", "pending")
              .limit(1);

            if (invites && invites.length > 0) {
              setInvitationPending(true);
              setPendingToken(invites[0].invitation_token); // 🔹 token de l’invitation
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

  const handleClickInvitation = () => {
    if (pendingToken) {
      router.push(`/accept-invitation?token=${pendingToken}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={() => router.back()}
          className="text-amber-300 hover:text-gray-200 transition"
        >
          ← Retour
        </button>

        <div className="flex items-center space-x-2">
          {userRole === "Administrateur" && invitationPending && (
            <button
              onClick={handleClickInvitation}
              className="text-amber-300 text-xl hover:text-gray-200 transition relative mr-3"
              title="Invitation en attente"
            >
              🔔
              {/* 🔴 Point rouge */}
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full transform translate-x-1/4 -translate-y-1/4"></span>
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
