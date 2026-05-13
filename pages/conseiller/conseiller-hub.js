"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function ConseillerHub() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "Conseiller",
        "ResponsableIntegration",
      ]}
    >
      <ConseillerHubContent />
    </ProtectedRoute>
  );
}

function ConseillerHubContent() {
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <HeaderPages />

      {/* HEADER */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">Espace Conseiller</h1>

        <div className="max-w-3xl mx-auto">
          <p className="italic text-base text-white/90 leading-relaxed">
            Chaque{" "}
            <span className="text-blue-300 font-semibold">
              conseiller
            </span>{" "}
            est un soutien attentif et un{" "}
            <span className="text-blue-300 font-semibold">
              bâtisseur de vies
            </span>
            . Ensemble nous accompagnons, encourageons et faisons grandir
            chaque âme avec foi, patience et amour.
          </p>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mb-10">

        {/* Membres */}
        <Link
          href="/membres/list-members"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#0D9488] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36"
        >
          <div className="text-5xl mb-3">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Gérer les membres
          </div>
        </Link>

        {/* Suivis membres */}
        <Link
          href="/membres/suivis-membres"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#38BDF8] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36"
        >
          <div className="text-5xl mb-3">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis des membres
          </div>
        </Link>

        {/* Evangelisation */}
        <Link
          href="/evangelisation/suivis-evangelisation"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-[#10B981] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36"
        >
          <div className="text-5xl mb-3">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis des évangélisés
          </div>
        </Link>

        {/* Evolution */}
        <Link
          href="/conseiller/EtatConseillerPage"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36"
        >
          <div className="text-5xl mb-3">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            L'évolution des Âmes
          </div>
        </Link>

        {/* Présence */}
        <Link
          href="/Presence"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-purple-500 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36"
        >
          <div className="text-5xl mb-3">✍🏻</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Registre des présences
          </div>
        </Link>

        {/* Notifications */}
        <Link
          href="/admin/notifications"
          className="bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-red-500 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-36"
        >
          <div className="text-5xl mb-3">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Notifications
          </div>
        </Link>
      </div>

      {/* FOOT TEXT */}
      <div className="max-w-3xl text-center mb-8">
        <p className="italic text-base text-white/90">
          Chaque vie que nous touchons est précieuse. Continuons à servir avec
          amour, sagesse et fidélité.
        </p>
      </div>

      <Footer />
    </div>
  );
}
