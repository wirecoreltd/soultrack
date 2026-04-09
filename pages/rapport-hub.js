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

      {/* 🔹 Titre */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">
          Espace Rapports
        </h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Suivez l’évolution de votre assemblée et célébrez chaque victoire 🙌
        </p>
      </div>

      {/* 🔹 Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mb-10">

        {/* Rapport culte */}
        <Link
          href="/attendance"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">⛪</div>
          <div className="text-lg font-bold text-gray-800 text-center">Rapport du Culte</div>
        </Link>

        {/* Rapport évangélisation */}
        <Link
          href="/Rapport-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#FBBF24] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">🗣️</div>
          <div className="text-lg font-bold text-gray-800 text-center">Rapport Évangélisation</div>
        </Link>

        {/* Rapport baptême */}
        <Link
          href="/RapportBaptemePage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">💧</div>
          <div className="text-lg font-bold text-gray-800 text-center">Rapport Baptêmes</div>
        </Link>

        {/* Rapport Formation */}
        <Link
          href="/RapportFormationPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">✒️</div>
          <div className="text-lg font-bold text-gray-800 text-center">Rapport Formation</div>
        </Link>

        {/* Rapport Ministere */}
        <Link
          href="/RapportMinisterePage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">💢</div>
          <div className="text-lg font-bold text-gray-800 text-center">Rapport par Ministère</div>
        </Link>

        {/* Rapport Besoin */}
        <Link
          href="/RapportBesoinPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">❓</div>
          <div className="text-lg font-bold text-gray-800 text-center">Rapport par Difficultés / Besoins</div>
        </Link>
            
        <Link
          href="/EtatConseillerPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">L'évolution des Ames par Conseiller</div>
        </Link>

         <Link
          href="/EtatCellulePage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">🪴</div>
          <div className="text-lg font-bold text-gray-800 text-center">Etat Cellule</div>
        </Link>


        {/* Statistiques globales */}
        <Link
          href="/StatGlobalPage"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
          border-t-4 border-[#10B981] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">📊</div>
          <div className="text-lg font-bold text-gray-800 text-center">Statistiques Globales</div>
        </Link>

      </div>

      {/* 🔹 Verset biblique */}
      <div className="mt-auto mb-4 text-center text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light">
        Et le Seigneur ajoutait chaque jour à l’Église ceux qui étaient sauvés. <br />
        Actes 2:47 ✨
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
