"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";

  function RapportHubContent() {
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

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">Espace Rapport</h1>
      
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
           Chaque rapport <span className="text-blue-300 font-semibold">raconte</span> une étape de la <span className="text-blue-300 font-semibold">vie spirituelle</span> : <span className="text-blue-300 font-semibold">les conseillers</span> qui accompagnent, <span className="text-blue-300 font-semibold">les cellules</span> qui soutiennent, 
           les âmes qui se rapprochent, <span className="text-blue-300 font-semibold">les baptêmes</span> qui marquent l’engagement, et les <span className="text-blue-300 font-semibold">formations</span> qui font grandir. Suivre ces 
           évolutions nous aide à construire ensemble des vies solides, à célébrer chaque <span className="text-blue-300 font-semibold">progrès</span>.
          </p>
        </div>
      </div>

<div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">Liste des Rapport</h1>

      {/* 🔹 Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mb-10">

        {/* Rapport culte */}
        <Link
          href="/attendance"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">⛪</div>
          <div className="text-lg font-bold text-gray-800 text-center">Présences & Statistiques</div>
        </Link>

        {/* Rapport évangélisation */}
        <Link
          href="/Rapport-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">🗣️</div>
          <div className="text-lg font-bold text-gray-800 text-center">Évangélisation</div>
        </Link>

        {/* Rapport baptême */}
        <Link
          href="/RapportBaptemePage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#F59E0B] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">💧</div>
          <div className="text-lg font-bold text-gray-800 text-center">Baptêmes</div>
        </Link>

        {/* Rapport Formation */}
        <Link
          href="/RapportFormationPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#10B981] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">✒️</div>
          <div className="text-lg font-bold text-gray-800 text-center">Formation</div>
        </Link>

        {/* Rapport Ministere */}
        <Link
          href="/RapportMinisterePage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#EF4444] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">💢</div>
          <div className="text-lg font-bold text-gray-800 text-center">Ministère</div>
        </Link>

        {/* Rapport Besoin */}
        <Link
          href="/RapportBesoinPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#8B5CF6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">❓</div>
          <div className="text-lg font-bold text-gray-800 text-center">Difficultés / Besoins</div>
        </Link>
            
        <Link
          href="/EtatConseillerPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#F43F5E] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">L'évolution des Ames par Conseiller</div>
        </Link>

         <Link
          href="/EtatCellulePage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#EAB308] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">🪴</div>
          <div className="text-lg font-bold text-gray-800 text-center">Etat Cellule</div>
        </Link>


        {/* Statistiques globales */}
        <Link
          href="/StatGlobalPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#6366F1] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">📊</div>
          <div className="text-lg font-bold text-gray-800 text-center">Statistiques Globales</div>
        </Link>
      </div>     

        {/* Texte motivant en bas */}
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            Et le Seigneur ajoutait chaque jour à l’Église ceux qui étaient sauvés.  <br />
            Actes 2:47
          </p>
        </div>
    </div>
  );
}

export default function Administrateur() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur"]}>
      <RapportHubContent />
    </ProtectedRoute>
  );
}
