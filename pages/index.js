//✅/pages/index.js

"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SendLinkPopup from "../components/SendLinkPopup";
import { useRouter } from "next/router";

export default function MembresHub() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 font-sans"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* 🔹 Top bar: Retour + Déconnexion */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200 transition-colors"
        >
          ← Retour
        </button>

        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      {/* 🔹 Logo centré */}
      <div className="mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={100} height={100} />
      </div>

      {/* 🔹 Message motivant */}
      <p className="text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light mb-6 text-center">
        Bienvenue ! Chaque membre compte et ensemble, nous grandissons plus fort. 🌟
      </p>

      {/* 🔹 Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6">
        <Link
          href="/add-member"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#4285F4] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Ajouter un membre
          </div>
        </Link>

        <Link
          href="/list-members"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#34a853] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Liste des membres
          </div>
        </Link>

        <Link
          href="/suivis-membres"
          className="flex-1 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#ff9800] p-6 hover:shadow-xl transition-all duration-200 cursor-pointer h-32"
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
          label="Envoyer l'appli – Nouveau membre"
          type="ajouter_membre"
          buttonColor="from-[#09203F] to-[#537895]"
        />
      </div>

      {/* 🔹 Verset biblique et texte motivant */}
      <div className="text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light text-center">
        Bienvenue ! Chaque membre compte et ensemble, nous grandissons plus fort. 🌟
      </div>

      <div className="mt-4 text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light text-center">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}

