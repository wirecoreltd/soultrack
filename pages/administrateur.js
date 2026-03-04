"use client";

import Link from "next/link";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import SendLinkPopup from "../components/SendLinkPopup";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Administrateur() {
  const [invitations, setInvitations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAndInvitations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // 🔹 Récupérer invitations en pending ou refusee
      const { data: invites } = await supabase
        .from("eglise_supervisions")
        .select("*")
        .eq("supervisee_id", user.id)
        .in("statut", ["pending", "refusee"]);

      setInvitations(invites || []);
      setLoading(false);
    };

    loadUserAndInvitations();
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
            className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex-1 text-left space-y-1">
              <p><b>Église superviseuse :</b> {inv.eglise_nom}</p>
              <p><b>Branche :</b> {inv.eglise_branche}</p>
              <p>
                <b>Statut :</b>{" "}
                <span
                  className={`font-semibold ${
                    inv.statut === "pending"
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  {inv.statut === "pending" ? "En attente" : "Refusée"}
                </span>
              </p>
            </div>

            <div className="flex gap-3 mt-3 md:mt-0">
              {inv.statut === "pending" && (
                <>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-80">
                    Accepter
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-80">
                    Refuser
                  </button>
                </>
              )}
              {inv.statut === "refusee" && (
                <button className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-80">
                  Accepter
                </button>
              )}
            </div>
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

        {/* Créer un Utilisateur interne */}
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
