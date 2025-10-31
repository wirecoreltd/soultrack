/* ✅ pages/administrateur.js */
"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SendLinkPopup from "../components/SendLinkPopup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Administrateur() {
  const router = useRouter();
  const [userName, setUserName] = useState("Utilisateur");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName.split(" ")[0]);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-4">
        {/* Ligne principale : Retour à gauche, Déconnexion à droite */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink />
        </div>

        {/* Ligne du dessous : Bienvenue aligné à droite */}
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">
            👋 Bienvenue {userName}
          </p>
        </div>
      </div>

      {/* 🔹 Logo centré */}
      <div className="mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      {/* 🔹 Titre */}
      <h1 className="text-3xl font-bold text-white mb-6">
        Espace Admin
      </h1>

      {/* 🔹 Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
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

        {/* Créer un Responsable */}
        <Link
          href="/admin/create-internal-user"
          className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
          style={{ borderTopColor: "#0EA5E9" }}
        >
          <div className="text-4xl mb-1">🧑‍💻</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Créer un Responsable
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

      {/* 🔹 Verset biblique */}
      <div className="mt-auto mb-4 text-center text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
