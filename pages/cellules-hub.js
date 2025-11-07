/* ✅ pages/cellules-hub.js */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import SendLinkPopup from "../components/SendLinkPopup";
import LogoutLink from "../components/LogoutLink";
import AccessGuard from "../components/AccessGuard";
import { useEffect, useState } from "react";

export default function CellulesHub() {
  const router = useRouter();
  const [userName, setUserName] = useState("Utilisateur");

  useEffect(() => {
    const storedName = localStorage.getItem("userName"); // stocké lors du login
    if (storedName) setUserName(storedName.split(" ")[0]); // prend le prénom
  }, []);

  return (
    <AccessGuard allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <div
        className="min-h-screen flex flex-col items-center p-6"
        style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
      >
        {/* 🔹 Top bar: Retour + Déconnexion */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

          <LogoutLink className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors" />
        </div>

        {/* 🔹 Prénom utilisateur sous déconnexion */}
        <p className="text-left w-full max-w-5xl mb-6 text-gray-200 italic">
          Bienvenue {userName} !
        </p>

        {/* 🔹 Logo centré */}
        <div className="mb-6">
          <Image src="/logo.png" alt="SoulTrack Logo" width={90} height={90} />
        </div>

        {/* 🔹 Cartes principales */}
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
          <Link
            href="/ajouter-membre-cellule"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">➕</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Ajouter un membre à la Cellule
            </div>
          </Link>

          <Link
            href="/membres-cellule"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">👥</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Membres de la Cellule
            </div>
          </Link>

          <Link
            href="/suivis-evangelisation"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-orange-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">📋</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des évangélisés
            </div>
          </Link>

          <Link
            href="/suivis-membres"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">📋</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des membres
            </div>
          </Link>
        </div>

        {/* 🔹 Bouton popup ajouté sous les cartes */}
        <div className="w-full max-w-md mb-10">
          <SendLinkPopup
            label="Envoyer l'appli – Évangélisé"
            type="ajouter_evangelise"
            buttonColor="from-[#09203F] to-[#537895]"
          />
        </div>

        {/* 🔹 Verset biblique / texte motivant */}
        <div className="mt-auto mb-4 text-center text-white text-lg font-handwriting max-w-2xl">
          La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience. <br />
          1 Corinthiens 12:14 ❤️
        </div>
      </div>
    </AccessGuard>
  );
}
