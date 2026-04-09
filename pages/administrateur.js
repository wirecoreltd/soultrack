"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Administrateur() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Utilisateur");
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    const fetchUserAndInvitation = async () => {
      // 🔹 1. Récupérer l'utilisateur connecté
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;
      setUser(user);

      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName.split(" ")[0]);

      // 🔹 2. Récupérer branche du superviseé
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("branche_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.branche_id) return;

      // 🔹 3. Vérifier invitation en pending/refusee pour sa branche
      const { data: invites, error: inviteError } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("supervisee_branche_id", profile.branche_id)
        .in("statut", ["pending", "refusee"])
        .limit(1);

      if (!inviteError && invites && invites.length > 0) {
        setInvitation(invites[0]);
      }
    };

    fetchUserAndInvitation();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <div className="min-h-screen flex flex-col items-center p-6 text-center space-y-6 bg-gradient-to-br from-[#2E3192] to-[#92EFFD]">

        <HeaderPages />

        {/* 🔹 Titre */}
         <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">Espace Administrateur</h1>  

  <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
        Gérez l’ensemble de votre plateforme en toute simplicité.  
    Depuis cet espace, vous pouvez organiser les{" "}
    <span className="text-amber-300 font-semibold">utilisateurs</span>, structurer les{" "}
    <span className="text-amber-300 font-semibold">cellules</span> et gérer les{" "}
    <span className="text-amber-300 font-semibold">liens entre églises</span>.  
  </p>

  <p className="italic text-base text-white/90 mt-2">
    Chaque action contribue à une meilleure organisation et à une croissance harmonieuse de l’ensemble.
  </p>
        </div>

        {/* 🔹 Cartes principales */}
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">

          {/* 🔹 Carte Invitation (si pending/refusee) */}
          {invitation && (
            <Link
              href={`/accept-invitation?token=${invitation.invitation_token}`}
              className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
              style={{ borderTopColor: "#F59E0B" }}
            >
              <div className="text-4xl mb-1">📩</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                Invitation {invitation.statut === "pending" ? "en attente" : "refusée"}
              </div>
            </Link>
          )}

          {/* 🔹 Carte : Liste des utilisateurs */}
          <Link
            href="/admin/list-users"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: "#0E7490" }}
          >
            <div className="text-4xl mb-1">👤</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Liste des Utilisateurs
            </div>
          </Link>

          {/* 🔹 Carte : Relier une Église */}
          <Link
            href="/admin/link-eglise"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: "#8B5CF6" }}
          >
            <div className="text-4xl mb-1">🔗</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Invitations & Liens d’églises
            </div>
          </Link>      
          
          {/* 🔹 Carte : Créer un Utilisateur */}
          <Link
            href="/admin/create-internal-user"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: "#0EA5E9" }}
          >
            <div className="text-4xl mb-1">🧑‍💻</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Créer un Utilisateur
            </div>
          </Link>

        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
