"use client";

import Link from "next/link";
import Image from "next/image";
import LogoutLink from "../../components/LogoutLink";
import SendLinkPopup from "../../components/SendLinkPopup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import supabase from "../../lib/supabaseClient"; // 🔹 importer supabase

export default function SuperadminHub() {
  return (
    <ProtectedRoute allowedRoles={["Superadmin"]}>
      <SuperadminHubContent />
    </ProtectedRoute>
  );
}

function SuperadminHubContent() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null); // 🔹 état pour userId
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // 🔹 récupérer la session de supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Erreur récupération session :", error?.message);
        setLoadingUser(false);
        return;
      }

      setUserId(session.user.id); // 🔹 définir le userId pour SendLinkPopup

      const name = session.user.user_metadata?.full_name || "Utilisateur";
      const prenom = name.split(" ")[0];
      setUserName(prenom);

      setLoadingUser(false);
    };

    fetchUser();
  }, []);

  if (loadingUser) return <p className="text-white mt-10 text-center">Chargement de l'utilisateur...</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
         <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">Espace Membres</h1>
      
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
          Accédez facilement à toutes les <span className="text-blue-300 font-semibold"> fonctionnalités</span> de votre 
         équipe : gestion des membres, suivi des familles, création et suivi des conseillers, ainsi que les rapports et présences. <span className="text-blue-300 font-semibold"> Tout votre suivi au même endroit</span>.      
          </p>
        </div>
      </div>   

      {/* Cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mb-6">
        <Link href="/list-members" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🏛️</div>
          <div className="text-lg font-bold text-gray-800 text-center">Gérer les membres</div>
        </Link>

        <Link href="/suivis-membres" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#38BDF8] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">Suivi des membres</div>
        </Link>

        <Link href="/create-conseiller" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#F97316] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">Créer un Conseiller</div>
        </Link>

        <Link href="/list-conseillers" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#F472B6] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🗃️</div>
          <div className="text-lg font-bold text-gray-800 text-center">Liste des Conseillers</div>
        </Link>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link href="/attendance" className="bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#84CC16] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🗒️</div>
          <div className="text-lg font-bold text-gray-800 text-center">Présences & Rapports</div>
        </Link>
      </div>

      {/* Bouton popup pour envoyer le lien */}
      <div className="w-full max-w-md mb-10">
        <SendLinkPopup
          label="Envoyer l'appli – Nouveau membre"
          type="ajouter_membre"
          buttonColor="from-[#09203F] to-[#537895]"
          userId={userId} // 🔹 passer le userId
        />
      </div>

      <div className="mt-auto mb-4 text-center text-white text-base italic max-w-2xl leading-relaxed tracking-wide font-light">
        Car le corps ne se compose pas d’un seul membre, mais de plusieurs. <br />
        1 Corinthiens 12:14 ❤️
      </div>
      <Footer />
    </div>
  );
}
