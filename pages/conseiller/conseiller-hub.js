"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute"; 
import AccessGuard from "../../components/AccessGuard";
import Footer from "../../components/Footer";

export default function ConseillerHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Conseiller", "ResponsableIntegration"]}>
      <ConseillerHubContent />
    </ProtectedRoute>
  );
}

function ConseillerHubContent() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    const prenom = name.split(" ")[0];
    setUserName(prenom);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

     {/* 🔹 Titre + texte motivant */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
            Espace Conseiller
          </h1>

          <div className="max-w-3xl w-full mb-6 text-center">
            <p className="italic text-base text-white/90">
              Chaque <span className="text-blue-300 font-semibold">conseiller</span> est un soutien attentif et un <span className="text-blue-300 font-semibold">bâtisseur de vies</span> pour les âmes qui grandissent. 
              <span className="text-blue-300 font-semibold"> Ensemble</span>, nous construisons, accompagnons et faisons fructifier chaque <span className="text-blue-300 font-semibold">vie</span> avec patience, écoute et foi.
            </p>
          </div>
        </div>

      {/* 🔹 Cartes principales */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between gap-6 mb-6">
        <Link
          href="/membres/list-members"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">Gérer les membres</div>
        </Link>
            
        <Link
          href="/membres/suivis-membres"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#38BDF8] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">Suivis des membres</div>
        </Link>        

        <Link
          href="/evangelisation/suivis-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#10B981] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">Suivis des évangélisés</div>
        </Link>    
          <Link
                href="/conseiller/EtatConseillerPage"
                className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-2">🌱</div>
                <div className="text-lg font-bold text-gray-800 text-center">
                  L'évolution des Ames
                </div>
              </Link>  
                  <Link
                href="/Presence"
                className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-2">✍🏻</div>
                <div className="text-lg font-bold text-gray-800 text-center">
                Présence
                </div>
              </Link>

                  
            
      </div>

      {/* Texte motivant en bas */}
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            Chaque vie que nous touchons est précieuse. Accompagnons chacun avec soin pour grandir.
          </p>
        </div>
    </div>
  );
}
