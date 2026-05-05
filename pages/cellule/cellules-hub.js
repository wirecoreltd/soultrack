"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SendLinkPopup from "../../components/SendLinkPopup";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function CellulesHub() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <CellulesHubContent />
    </ProtectedRoute>
  );
}

function CellulesHubContent() {
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(data?.role || null);
      setLoadingRole(false);
    };
    fetchRole();
  }, []);

  if (loadingRole) return null;

  const isAdmin = role === "Administrateur" || role === "SuperviseurCellule" || role === "SuperAdmin";
  const isResponsableCellule = role === "ResponsableCellule";

  return (
    // Après : if (loadingRole) return null;
// Remplacez tout le return par ceci :

if (isResponsableCellule) {
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <HeaderPages />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">Espace Cellule</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">

        <Link href="/cellule/list-cellules" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">🏠</div>
          <div className="text-lg font-bold text-gray-800 text-center">Liste des Cellules</div>
        </Link>

        <Link href="/cellule/membres-cellule" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-green-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">Membres de la Cellule</div>
        </Link>

        <Link href="/evangelisation/suivis-evangelisation" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-orange-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">Suivis des évangélisés</div>
        </Link>

        <Link href="/membres/suivis-membres" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">Suivis des membres</div>
        </Link>

        <Link href="/cellule/attendance_cellule" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">👨‍👩‍👦‍👦</div>
          <div className="text-lg font-bold text-gray-800 text-center">Présences & statistiques</div>
        </Link>

        <Link href="/cellule/EtatCellulePage" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">Etat Cellule</div>
        </Link>

        <Link href="/admin/notifications" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer" style={{ borderTopColor: "#ef4444" }}>
          <div className="text-5xl mb-2">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">Notifications</div>
        </Link>

      </div>

      <div className="w-full max-w-md mb-3">
        <SendLinkPopup label="Envoyer formulaire Cellule – Nouveau membre" type="ajouter_membre_cellule" buttonColor="from-[#f7971e] to-[#ffd200]" />
      </div>
      <div className="w-full max-w-md mb-6">
        <SendLinkPopup label="Envoyer formulaire Cellule – Évangélisation" type="ajouter_evangelise_cellule" buttonColor="from-[#11998e] to-[#38ef7d]" />
      </div>
      <Footer />
    </div>
  );
}

// Admin / SuperviseurCellule — garder le return existant mais ajouter Notifications
// Dans le return existant, après la carte EtatCellule et AVANT {isAdmin && (...)}, ajoutez :
<Link href="/admin/notifications" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer" style={{ borderTopColor: "#ef4444" }}>
  <div className="text-5xl mb-2">🔔</div>
  <div className="text-lg font-bold text-gray-800 text-center">Notifications</div>
</Link>
