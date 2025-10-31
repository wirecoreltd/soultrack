/* ✅ pages/evangelisation-hub.js */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import SendLinkPopup from "../components/SendLinkPopup";
import LogoutLink from "../components/LogoutLink";
import { useEffect, useState } from "react";

export default function EvangelisationHub() {
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
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-6">
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
        <Image src="/logo.png" alt="SoulTrack Logo" width={100} height={100} />
      </div>

      {/* 🔹 Titre + texte motivant */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Espace Évangélisation
        </h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Bienvenue ! Chaque évangélisé compte et ensemble, nous grandissons dans la foi. ✝️
        </p>
      </div>

      {/* 🔹 Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6">
        <Link
          href="/add-evangelise"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0E7490] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Ajouter un évangélisé
          </div>
        </Link>

        <Link
          href="/evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Liste des évangélisés
          </div>
        </Link>

        <Link
          href="/suivis-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#FBBF24] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">📋</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis des évangélisés
          </div>
        </Link>
      </div>

      {/* 🔹 Bouton popup sous les cartes */}
      <div className="w-full max-w-md mb-10">
        <SendLinkPopup
          label="Envoyer l'appli – Évangélisé"
          type="ajouter_evangelise"
          buttonColor="from-[#09203F] to-[#537895]"
        />
      </div>

      {/* 🔹 Verset biblique sous les cartes */}
      <div className="mt-auto mb-4 text-center text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}

