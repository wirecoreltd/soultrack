"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import SendLinkPopup from "../components/SendLinkPopup";
import { canAccessPage } from "../lib/accessControl";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ role: null });

  // ✅ Vérifie si l'utilisateur est connecté et a accès à la page
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");

    if (!userId || !userRole) {
      router.push("/login");
      return;
    }

    if (!canAccessPage(userRole, "/index")) {
      alert("⛔ Accès non autorisé !");
      router.push("/login");
      return;
    }

    setProfile({ id: userId, role: userRole, email: userEmail });
  }, [router]);

  const handleRedirect = (path) => {
    router.push(path);
  };

  /* 🧩 DÉBUT DU CODE DE DÉCONNEXION — À COPIER SUR TES AUTRES PAGES */
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };
  /* 🧩 FIN DU CODE DE DÉCONNEXION */
  
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-6 gap-2"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      {/* Logo */}
      <div className="mt-1 flex items-center justify-between w-full max-w-5xl">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />

        {/* 🧩 Texte cliquable pour déconnexion */}
        <p
          onClick={handleLogout}
          className="text-white text-sm cursor-pointer hover:underline ml-auto"
        >
          Déconnexion
        </p>
      </div>

      {/* Titre */}
      <h1 className="text-5xl sm:text-5xl font-handwriting text-white text-center mt-1">
        SoulTrack
      </h1>

      {/* Message */}
      <div className="mt-1 mb-2 text-center text-white text-lg font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons, nous
        grandissons, et nous partageons l’amour de Christ dans chaque action ❤️
      </div>

      {/* Cartes principales */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center w-full max-w-5xl mt-2">
        {(profile.role === "ResponsableIntegration" ||
          profile.role === "Admin") && (
          <div
            className="flex-1 min-w-[250px] w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleRedirect("/membres-hub")}
          >
            <div className="text-4xl mb-1">👤</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des membres
            </div>
          </div>
        )}

        {(profile.role === "ResponsableEvangelisation" ||
          profile.role === "Admin") && (
          <div
            className="flex-1 min-w-[250px] w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleRedirect("/evangelisation-hub")}
          >
            <div className="text-4xl mb-1">🙌</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Évangélisation
            </div>
          </div>
        )}

        {profile.role === "Admin" && (
          <>
            <div
              className="flex-1 min-w-[250px] w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-red-500 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleRedirect("/rapport")}
            >
              <div className="text-4xl mb-1">📊</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                Rapport
              </div>
            </div>

            <div
              className="flex-1 min-w-[250px] w-full h-28 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-400 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleRedirect("/admin/create-internal-user")}
            >
              <div className="text-4xl mb-1">🧑‍💻</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                Créer un utilisateur
              </div>
            </div>
          </>
        )}
      </div>

      {/* Boutons popup */}
      <div className="flex flex-col gap-3 mt-4 w-full max-w-md">
        {(profile.role === "ResponsableIntegration" ||
          profile.role === "Admin") && (
          <SendLinkPopup
            label="Envoyer l'appli – Nouveau membre"
            type="ajouter_membre"
            buttonColor="from-[#09203F] to-[#537895]"
          />
        )}

        {(profile.role === "ResponsableEvangelisation" ||
          profile.role === "Admin") && (
          <SendLinkPopup
            label="Envoyer l'appli – Évangélisé"
            type="ajouter_evangelise"
            buttonColor="from-[#09203F] to-[#537895]"
          />
        )}

        {profile.role === "Admin" && (
          <SendLinkPopup
            label="Voir / Copier liens…"
            type="voir_copier"
            buttonColor="from-[#005AA7] to-[#FFFDE4]"
          />
        )}
      </div>

      {/* Verset */}
      <div className="mt-4 mb-2 text-center text-white text-lg font-handwriting-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. 1
        Corinthiens 12:14 ❤️
      </div>
    </div>
  );
}
