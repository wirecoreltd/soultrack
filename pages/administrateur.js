"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AdministrateurContent() {
  const [userName, setUserName] = useState("Utilisateur");
  const [user, setUser] = useState(null);
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    // 🔹 Récupérer user connecté
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName.split(" ")[0]);

        // 🔹 Vérifier si invitation en pending/refusee pour sa branche
        const { data: invites } = await supabase
          .from("eglise_supervisions")
          .select("*")
          .in("statut", ["pending", "refusee"])
          .eq("supervisee_branche_id", user?.branche_id) // filtre sur branche du membre
          .limit(1); // on prend une seule invitation pour la carte

        if (invites && invites.length > 0) {
          setInvitation(invites[0]);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 text-center space-y-6 bg-gradient-to-br from-[#2E3192] to-[#92EFFD]">
      <HeaderPages />

      {/* 🔹 Titre */}
      <h1 className="text-3xl font-bold text-white mb-6">
        Espace Admin
      </h1>

      {/* 🔹 Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">

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
            Relier une Église
          </div>
        </Link>

        {/* 🔹 Carte : Liste des Cellules */}
        <Link
          href="/admin/list-cellules"
          className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
          style={{ borderTopColor: "#10B981" }}
        >
          <div className="text-4xl mb-1">🏠</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Liste des Cellules
          </div>
        </Link>

        {/* 🔹 Carte : Créer une Cellule */}
        <Link
          href="/admin/create-cellule"
          className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
          style={{ borderTopColor: "#F97316" }}
        >
          <div className="text-4xl mb-1">🛠️</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Créer une Cellule
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

        {/* 🔹 Carte : Invitation (si pending/refusee) */}
        {invitation && (
          <Link
            href={`/accept-invitation?token=${invitation.invitation_token}`}
            className="flex-1 min-w-[250px] w-full h-32 bg-yellow-300 rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: "#F59E0B" }}
          >
            <div className="text-4xl mb-1">📩</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Invitation en attente
            </div>
          </Link>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function Administrateur() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <AdministrateurContent />
    </ProtectedRoute>
  );
}
