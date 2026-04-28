"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import SendLinkPopup from "../components/SendLinkPopup";
import AccessGuard from "../components/AccessGuard";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute"; 
import Footer from "../components/Footer";

export default function FamillesHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Superadmin", "ResponsableFamilles"]}>
      <FamillesHubContent />
    </ProtectedRoute>
  );
}

function FamillesHubContent() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("cher membre");

  useEffect(() => {
    const fetchPrenom = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("prenom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;
        setPrenom(profileData?.prenom || "cher membre");
      } catch (err) {
        console.error("Erreur récupération prénom :", err);
      }
    };

    fetchPrenom();
  }, []);

  return (
    <AccessGuard allowedRoles={["Administrateur", "Superadmin", "ResponsableFamilles"]}>
      <div
        className="min-h-screen flex flex-col items-center p-6"
        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #FDE68A 100%)" }}
      >
        <HeaderPages />

        {/* 🔹 TITRE */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
            👑 Espace Familles
          </h1>

          <div className="max-w-3xl w-full mb-6 text-center">
            <p className="italic text-base text-white/90">
              Les familles sont au cœur de la vision.  
              Accompagner, soutenir et fortifier chaque foyer permet de bâtir 
              une église solide et remplie d’amour.
            </p>
          </div>
        </div>

        {/* 🔥 CARTES */}
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">

          <Link href="/familles/liste" className="card">
            <div className="text-5xl">👨‍👩‍👧‍👦</div>
            <div className="title">Liste des familles</div>
          </Link>

          <Link href="/familles/ajouter" className="card">
            <div className="text-5xl">➕</div>
            <div className="title">Ajouter une famille</div>
          </Link>

          <Link href="/familles/membres" className="card">
            <div className="text-5xl">🏡</div>
            <div className="title">Membres des familles</div>
          </Link>

          <Link href="/familles/suivi" className="card">
            <div className="text-5xl">💖</div>
            <div className="title">Suivi des familles</div>
          </Link>

          <Link href="/familles/stats" className="card">
            <div className="text-5xl">📊</div>
            <div className="title">Statistiques familles</div>
          </Link>

        </div>

        {/* 🔘 FORMULAIRES */}
        <div className="w-full max-w-md mb-3">
          <SendLinkPopup
            label="Envoyer formulaire Famille – Nouveau foyer"
            type="ajouter_famille"
            buttonColor="from-[#F59E0B] to-[#FDE68A]"
          />
        </div>

        <div className="w-full max-w-md mb-6">
          <SendLinkPopup
            label="Envoyer formulaire Famille – Suivi"
            type="suivi_famille"
            buttonColor="from-[#8B5CF6] to-[#C4B5FD]"
          />
        </div>

        <Footer />
      </div>

      {/* 🔥 STYLE RAPIDE */}
      <style jsx>{`
        .card {
          flex: 1;
          min-width: 250px;
          height: 130px;
          background: white;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .title {
          margin-top: 8px;
          font-size: 16px;
          text-align: center;
        }
      `}</style>
    </AccessGuard>
  );
}
