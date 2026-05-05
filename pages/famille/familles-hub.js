/* ✅ pages/Familles-hub.js */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SendLinkPopup from "../../components/SendLinkPopup";
import LogoutLink from "../../components/LogoutLink";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute"; 
import Footer from "../../components/Footer";
import SendLinkFamillePopup from "../../components/SendLinkFamillePopup";

export default function FamillesHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFamilles"]}>
      <FamillesHubContent />
    </ProtectedRoute>
  );
}

function FamillesHubContent() {
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

  const [role, setRole] = useState(null);

useEffect(() => {
  const fetchRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setRole(data?.role);
  };

  fetchRole();
}, []);

  return (    
      <div
        className="min-h-screen flex flex-col items-center p-6"
        style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
      >
        <HeaderPages />

        {/* 🔹 Titre + texte motivant */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">Espace Familles</h1>
        
          <div className="max-w-3xl w-full mb-6 text-center">
            <p className="italic text-base text-white/90">
              Chaque Famille est un <span className="text-blue-300 font-semibold">espace</span> où les âmes grandissent, sont <span className="text-blue-300 font-semibold">accompagnées et encouragées dans leur cheminement</span>. 
              Ensemble, unissons nos forces, construisons et faisons fructifier chaque vie, 
              afin que chacun puisse <span className="text-blue-300 font-semibold">s'épanouir pleinement dans la foi</span>.
            </p>
          </div>
        </div>       

        {/* Liste des Familles */}
        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
        
          <Link
            href="/admin/list-familles"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">🏠</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Liste des Familles
            </div>
          </Link>
        
          {!loadingRole && role === "ResponsableFamilles" && (
            <Link
              href="/cellule/ajouter-membre-cellule"
              className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <div className="text-5xl mb-2">➕</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                Ajouter un membre à la Cellule
              </div>
            </Link>
          )}
        
          <Link
            href="/famille/membres-famille"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">👥</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Membres de ma Famille
            </div>
          </Link>
        
          <Link
            href="/evangelisation/suivis-evangelisation"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-orange-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">💗</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des évangélisés
            </div>
          </Link>
        
          <Link
            href="/membres/suivis-membres"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">💌</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Suivis des membres
            </div>
          </Link>   

          <Link
            href="/famille/attendance_famille"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">👨‍👩‍👦‍👦</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Présences & statistiques
            </div>
          </Link> 
              
          <Link
            href="/famille/EtatCellulePage"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <div className="text-5xl mb-2">🌱</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Etat Cellule
            </div>
          </Link>   

          <Link
            href="/admin/import-famille"
            className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ borderTopColor: "#F97316" }}
          >
            <div className="text-4xl mb-1">📤</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Import Une liste des membres
            </div>
          </Link>

            {role !== "ResponsableFamilles" && (
              <Link
                href="/admin/create-famille"
                className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
                style={{ borderTopColor: "#F97316" }}
              >
                <div className="text-4xl mb-1">🛠️</div>
                <div className="text-lg font-bold text-gray-800 text-center">
                  Créer une Famille
                </div>
              </Link>
            )}          
        </div>               

        {/* ✅ Bouton Envoyer formulaire Cellule – Évangélisation */}
        <div className="w-full max-w-md mb-3">
  <SendLinkFamillePopup
    label="Envoyer formulaire Famille – Nouveau membre"
    type="ajouter_membre_famille"
    buttonColor="from-[#f7971e] to-[#ffd200]"
  />
</div>

<div className="w-full max-w-md mb-6">
  <SendLinkFamillePopup
    label="Envoyer formulaire Famille – Évangélisation"
    type="ajouter_evangelise_famille"
    buttonColor="from-[#11998e] to-[#38ef7d]"
  />
</div>
                  
        <Footer />
      </div>  
  );
}
