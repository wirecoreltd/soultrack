"use client";

import Link from "next/link";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import SendLinkPopup from "../components/SendLinkPopup";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Administrateur() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadInvitations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 🔹 Récupérer les invitations pending ou refusee pour le membre
      const { data: invites } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .in("statut", ["pending", "refusee"])
        .or(`responsable_email.eq.${user.email},responsable_telephone.eq.${user.phone}`);

      setInvitations(invites || []);
      setLoading(false);
    };

    loadInvitations();
  }, []);

  if (loading) return <div className="p-10 text-white">Chargement…</div>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-tr from-[#2E3192] to-[#92EFFD]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-amber-300 text-center mb-10">
        Tableau de bord
      </h1>

      {/* 🔹 Carte invitation si existante */}
      {invitations.length > 0 &&
        invitations.map((inv) => (
          <div
            key={inv.id}
            className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 mb-6 cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => router.push(`/accept-invitation?token=${inv.invitation_token}`)}
          >
            <p className="font-semibold text-lg text-gray-800">
              Vous avez une invitation en attente de l'église <b>{inv.eglise_nom}</b>
            </p>
            <p className="text-gray-600">
              Branche : {inv.eglise_branche} | Statut :{" "}
              <span className={`font-semibold ${
                inv.statut === "pending" ? "text-orange-500" : "text-red-500"
              }`}>
                {inv.statut === "pending" ? "En attente" : "Refusée"}
              </span>
            </p>
            <p className="mt-2 text-sm text-gray-500">Cliquez pour répondre à l’invitation</p>
          </div>
        ))}

      {/* 🔹 Cartes principales du dashboard */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl flex-wrap mb-6">
        {/* Liste des utilisateurs */}
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

        {/* Relier une Église */}
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

        {/* Liste des Cellules */}
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

        {/* Créer une Cellule */}
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

        {/* Créer un Utilisateur */}
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

      {/* 🔹 Bouton popup sous les cartes */}
      <div className="w-full max-w-md mb-10">
        <SendLinkPopup
          label="Envoyer l'appli – Nouveau membre"
          type="ajouter_membre"
          buttonColor="from-[#09203F] to-[#537895]"
        />
      </div>

      <Footer />
    </div>
  );
}
