"use client";

import Link from "next/link";
import SendLinkPopup from "../../components/SendLinkPopup";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

export default function CellulesHub() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "ResponsableCellule",
        "SuperviseurCellule",
      ]}
    >
      <CellulesHubContent />
    </ProtectedRoute>
  );
}

function CellulesHubContent() {
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

  const isAdmin =
    role === "Administrateur" ||
    role === "SuperviseurCellule" ||
    role === "SuperAdmin";

  const isResponsableCellule = role === "ResponsableCellule";

  const CARD_CLASS =
    "flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center p-6 hover:shadow-xl transition-all duration-200 cursor-pointer";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-white">
        Espace Cellule
      </h1>

      <div className="flex flex-col md:flex-row gap-6 flex-wrap w-full max-w-5xl">

        {/* Liste Cellules */}
        <Link href="/cellule/list-cellules" className={CARD_CLASS} style={{ borderTop: "4px solid #3b82f6" }}>
          <div className="text-5xl mb-2">🏠</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Liste des Cellules
          </div>
        </Link>

        {/* Ajouter membre */}
        {isResponsableCellule && (
          <Link href="/cellule/ajouter-membre-cellule" className={CARD_CLASS} style={{ borderTop: "4px solid #10b981" }}>
            <div className="text-5xl mb-2">➕</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Ajouter un membre
            </div>
          </Link>
        )}

        {/* Import */}
        {isResponsableCellule && (
          <Link href="/admin/import" className={CARD_CLASS} style={{ borderTop: "4px solid #f97316" }}>
            <div className="text-4xl mb-1">📤</div>
            <div className="text-lg font-bold text-gray-800 text-center">
              Import liste membres
            </div>
          </Link>
        )}

        {/* Membres */}
        <Link href="/cellule/membres-cellule" className={CARD_CLASS} style={{ borderTop: "4px solid #22c55e" }}>
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Membres de la Cellule
          </div>
        </Link>

        {/* Évangélisation */}
        <Link href="/evangelisation/suivis-evangelisation" className={CARD_CLASS} style={{ borderTop: "4px solid #ec4899" }}>
          <div className="text-5xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis évangélisation
          </div>
        </Link>

        {/* Suivis membres */}
        <Link href="/membres/suivis-membres" className={CARD_CLASS} style={{ borderTop: "4px solid #eab308" }}>
          <div className="text-5xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis des membres
          </div>
        </Link>

        {/* Présences stats */}
        <Link href="/cellule/attendance_cellule" className={CARD_CLASS} style={{ borderTop: "4px solid #6366f1" }}>
          <div className="text-5xl mb-2">👨‍👩‍👦‍👦</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Présences & stats
          </div>
        </Link>

        {/* Etat cellule */}
        <Link href="/cellule/EtatCellulePage" className={CARD_CLASS} style={{ borderTop: "4px solid #a855f7" }}>
          <div className="text-5xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            État Cellule
          </div>
        </Link>

        {/* Registre présences */}
        <Link href="/Presence" className={CARD_CLASS} style={{ borderTop: "4px solid #06b6d4" }}>
          <div className="text-5xl mb-2">✍️</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Registre des présences
          </div>
        </Link>

        {/* Notifications */}
        <Link href="/admin/notifications" className={CARD_CLASS} style={{ borderTop: "4px solid #ef4444" }}>
          <div className="text-5xl mb-2">🔔</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Notifications
          </div>
        </Link>

      </div>
      {/* Formulaires visibles uniquement ResponsableCellule */}
      {isResponsableCellule && (
        <>
          <div className="w-full max-w-md mt-3 mb-3">
            <SendLinkPopup
              label="Envoyer formulaire Cellule – Nouveau membre"
              type="ajouter_membre_cellule"
              buttonColor="from-[#f7971e] to-[#ffd200]"
            />
          </div>

          <div className="w-full max-w-md mb-6">
            <SendLinkPopup
              label="Envoyer formulaire Cellule – Évangélisation"
              type="ajouter_evangelise_cellule"
              buttonColor="from-[#11998e] to-[#38ef7d]"
            />
          </div>
        </>
      )}

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          La famille est le plus grand trésor. Prenez soin les uns des autres
          avec amour et patience.
        </p>
      </div>

      <Footer />
    </div>
  );
}
