/* ✅ pages/cellules-hub.js */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import SendLinkPopup from "../components/SendLinkPopup";
import LogoutLink from "../components/LogoutLink";
import AccessGuard from "../components/AccessGuard";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute"; 
import Footer from "../components/Footer";

export default function CellulesHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <CellulesHubContent />
    </ProtectedRoute>
  );
}

function CellulesHubContent() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("cher membre");

  
  useEffect(() => {
    const fetchPrenom = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("prenom")
          .eq("email", userEmail)
          .single();

        if (error) throw error;
        setPrenom(profileData?.prenom || "cher membre");
      } catch (err) {
        console.error("Erreur récupération prénom :", err);
        setPrenom("cher membre");
      }
    };

    fetchPrenom();
  }, []);

  return (
    <AccessGuard allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <div
        className="min-h-screen flex flex-col items-center p-6"
        style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
      >
         <HeaderPages />

      {/* 🔹 Titre + texte motivant */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Espace Cellule
        </h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Grandir ensemble dans la foi, s’encourager et marcher selon la Parole.  
          Chaque pas vers Dieu compte. 🌱
        </p>
      </div>

         {/* Liste des Cellules */}
            <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
            
              <Link
                href="/admin/list-cellules"
                className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-2">🏠</div>
                <div className="text-lg font-bold text-gray-800 text-center">
                  Liste des Cellules
                </div>
              </Link>
            
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

        {/* 🔹 Verset biblique / texte motivant */}
        <div className="mt-auto mb-4 text-center text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light">
          La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience. <br />
          1 Corinthiens 12:14 ❤️
        </div>
          <Footer />
      </div>
    </AccessGuard>
  );
}
