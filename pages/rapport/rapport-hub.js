/* ✅ pages/rapport-hub.js */

"use client";

import Link from "next/link";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

      {/* 🔹 Texte explicatif */}
      <div className="text-center mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Espace Rapports
        </h1>
        <p className="italic text-base text-white/90">
          Chaque rapport <span className="text-blue-300 font-semibold">raconte</span> une étape de la <span className="text-blue-300 font-semibold">vie spirituelle</span> : 
          les <span className="text-blue-300 font-semibold">conseillers</span> qui soutiennent, les <span className="text-blue-300 font-semibold">cellules</span> qui accompagnent, 
          les âmes qui grandissent, les <span className="text-blue-300 font-semibold">baptêmes</span> qui marquent l’engagement et les <span className="text-blue-300 font-semibold">formations</span> qui font mûrir. 
          Avec patience, écoute et foi, nous construisons ensemble et célébrons chaque progrès. 🌱
        </p>
      </div>

      {/* 🔹 Liste des rapports */}
      <div className="text-center mb-6 max-w-5xl w-full">
        <h2 className="text-xl font-bold mb-4 text-amber-300">Liste des Rapports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Link
            href="/rapport/attendance"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">⛪</div>
            <div className="text-lg font-bold text-gray-800 text-center">Présences & Statistiques</div>
          </Link>

          <Link
            href="/rapport/Rapport-evangelisation"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#38BDF8] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">🗣️</div>
            <div className="text-lg font-bold text-gray-800 text-center">Évangélisation</div>
          </Link>

          <Link
            href="/rapport/RapportBaptemePage"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#10B981] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">💧</div>
            <div className="text-lg font-bold text-gray-800 text-center">Baptêmes</div>
          </Link>

          <Link
            href="/rapport/RapportFormationPage"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#FBBF24] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">✒️</div>
            <div className="text-lg font-bold text-gray-800 text-center">Formation</div>
          </Link>

          <Link
            href="/rapport/RapportMinisterePage"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#3B82F6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">💢</div>
            <div className="text-lg font-bold text-gray-800 text-center">Ministère</div>
          </Link>

          <Link
            href="/rapport/RapportBesoinPage"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#F472B6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">❓</div>
            <div className="text-lg font-bold text-gray-800 text-center">Difficultés / Besoins</div>
          </Link>

          <Link
            href="/rapport/EtatConseillerPage"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#22D3EE] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">🌱</div>
            <div className="text-lg font-bold text-gray-800 text-center">Évolution des Âmes par Conseiller</div>
          </Link>

          <Link
            href="/rapport/EtatCellulePage"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#A78BFA] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">🪴</div>
            <div className="text-lg font-bold text-gray-800 text-center">État Cellule</div>
          </Link>

          <Link
            href="/rapport/StatGlobalPage"
            className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center 
            border-t-4 border-[#84CC16] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="text-lg font-bold text-gray-800 text-center">Statistiques Globales</div>
          </Link>         

        </div>
      </div>

      {/* 🔹 Texte biblique / motivant en bas */}
      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          Et le Seigneur ajoutait chaque jour à l’Église ceux qui étaient sauvés. <br />
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
