/* ✅ pages/evangelisation-hub.js */

"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SendLinkPopup from "../components/SendLinkPopup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function EvangelisationHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <EvangelisationHubContent />
    </ProtectedRoute>
  );
}
  
function EvangelisationHubContent() {
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
        <h1 className="text-3xl font-bold text-white mb-2">
          Espace Évangélisation
        </h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Va, fais de toutes les nations des disciples.  
          Chaque rencontre compte, chaque âme est précieuse. ✨
        </p>
      </div>

      {/* 🔹 Cartes principales */}
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6">     

        {/* Liste des évangélisés */}
        <Link
          href="/evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#34a853] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Liste des évangélisés
          </div>
        </Link>

        {/* Suivis des évangélisés */}
        <Link
          href="/suivis-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#ff9800] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">📋</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis des évangélisés
          </div>
        </Link>

          {/* Suivis des évangélisés */}
        <Link
          href="/Rapport-evangelisation"
          className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#ff9800] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32"
        >
          <div className="text-4xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Rapport Evangélisation
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

      {/* 🔹 Verset biblique inspirant */}
      <div className="mt-auto mb-4 text-center text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light">
        “Comment donc invoqueront-ils celui en qui ils n’ont pas cru ?  
        Et comment croiront-ils en celui dont ils n’ont pas entendu parler ?”  
        <br />
        Romains 10:14 ❤️
      </div>
        <Footer />
    </div>
  );
}
