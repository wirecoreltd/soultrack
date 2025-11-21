"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SendLinkPopup from "../components/SendLinkPopup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MembresHub() {
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
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink />
        </div>

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

      {/* 🔹 Titre + texte motivant */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Espace Membres
        </h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Bienvenue ! Chaque membre compte et ensemble, nous grandissons plus fort. 🌟
        </p>
      </div>

      {/* 🔹 Cartes principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mb-6">
          <Link href="/list-members" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-lg font-bold text-gray-800 text-center">Liste des membres</div>
          </Link>
        
          <Link href="/suivis-membres" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#FBBF24] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-lg font-bold text-gray-800 text-center">Suivis des membres</div>
          </Link>
        
          <Link href="/create-conseiller" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#FBBF24] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
            <div className="text-4xl mb-2">➕</div>
            <div className="text-lg font-bold text-gray-800 text-center">Créer un Conseiller</div>
          </Link>
        
          <Link href="/list-conseillers" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#10B981] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
            <div className="text-4xl mb-2">👔</div>
            <div className="text-lg font-bold text-gray-800 text-center">Liste des Conseillers</div>
          </Link>
        </div>
        
        {/* 🔹 Bouton popup ajouté sous les cartes */}
        <div className="w-full max-w-md mb-10">
          <SendLinkPopup
            label="Envoyer l'appli – Nouveau membre"
            type="ajouter_membre"
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
