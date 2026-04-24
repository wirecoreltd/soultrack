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
         <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">Espace Super Admin</h1>     
    </div>   

      {/* Cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mb-6">
        <Link href="/Superadmin/temoignages" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">💡</div>
          <div className="text-lg font-bold text-gray-800 text-center">Témoignages</div>
        </Link>   
        <Link href="/Superadmin/AdminDashboard" className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-32">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-lg font-bold text-gray-800 text-center">Eglise Count</div>
        </Link> 
      </div>
      
      <Footer />
    </div>
  );
}
