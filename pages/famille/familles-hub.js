"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import SendLinkFamillePopup from "../../components/SendLinkFamillePopup";

export default function FamillesHub() {
  return (
    <ProtectedRoute
      allowedRoles={["Administrateur", "ResponsableFamilles"]}
    >
      <FamillesHubContent />
    </ProtectedRoute>
  );
}

function FamillesHubContent() {
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

  const isAdmin = role === "Administrateur" || role === "SuperAdmin";
  const isResponsableFamilles = role === "ResponsableFamilles";

  const cardClass =
    "flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer";

  const NOTIF_CARD = (
    <Link
      href="/admin/notifications"
      className={cardClass}
      style={{ borderTopColor: "#EF4444" }}
    >
      <div className="text-5xl mb-2">🔔</div>
      <div className="text-lg font-bold text-gray-800 text-center">
        Notifications
      </div>
    </Link>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold mt-4 mb-6 text-white drop-shadow-lg">
          👨‍👩‍👧‍👦 Espace Familles
        </h1>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90 leading-relaxed">
            Chaque Famille est un{" "}
            <span className="text-blue-200 font-semibold">espace</span> où les
            âmes grandissent, sont{" "}
            <span className="text-cyan-200 font-semibold">
              accompagnées et encouragées dans leur cheminement
            </span>
            . Ensemble, unissons nos forces, construisons et faisons fructifier
            chaque vie, afin que chacun puisse{" "}
            <span className="text-yellow-200 font-semibold">
              s'épanouir pleinement dans la foi
            </span>
            .
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-6xl mb-6 flex-wrap">
        {/* Liste Familles */}
        <Link
          href="/admin/list-familles"
          className={cardClass}
          style={{ borderTopColor: "#3B82F6" }}
        >
          <div className="text-5xl mb-2">👑</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Liste des Familles
          </div>
        </Link>

        {/* Responsable Familles */}
        {isResponsableFamilles && (
          <>
            <Link
              href="/famille/ajouter-membre-famille"
              className={cardClass}
              style={{ borderTopColor: "#10B981" }}
            >
              <div className="text-5xl mb-2">➕</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                Ajouter un membre
              </div>
            </Link>

            <Link
              href="/admin/import-famille"
              className={cardClass}
              style={{ borderTopColor: "#F97316" }}
            >
              <div className="text-5xl mb-2">📤</div>
              <div className="text-lg font-bold text-gray-800 text-center">
                Importer une liste
              </div>
            </Link>
          </>
        )}

        {/* Membres */}
        <Link
          href="/famille/membres-famille"
          className={cardClass}
          style={{ borderTopColor: "#22C55E" }}
        >
          <div className="text-5xl mb-2">👥</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Membres de ma Famille
          </div>
        </Link>

        {/* Evangelisation */}
        <Link
          href="/evangelisation/suivis-evangelisation"
          className={cardClass}
          style={{ borderTopColor: "#F97316" }}
        >
          <div className="text-5xl mb-2">💗</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis des évangélisés
          </div>
        </Link>

        {/* Suivis membres */}
        <Link
          href="/membres/suivis-membres"
          className={cardClass}
          style={{ borderTopColor: "#EAB308" }}
        >
          <div className="text-5xl mb-2">💌</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Suivis des membres
          </div>
        </Link>

        {/* Présences */}
        <Link
          href="/famille/attendance_famille"
          className={cardClass}
          style={{ borderTopColor: "#8B5CF6" }}
        >
          <div className="text-5xl mb-2">👨‍👩‍👦‍👦</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Présences & statistiques
          </div>
        </Link>

        {/* Etat famille */}
        <Link
          href="/famille/EtatCellulePage"
          className={cardClass}
          style={{ borderTopColor: "#14B8A6" }}
        >
          <div className="text-5xl mb-2">🌱</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Etat Famille
          </div>
        </Link>

        {/* Registre */}
        <Link
          href="/Presence"
          className={cardClass}
          style={{ borderTopColor: "#EC4899" }}
        >
          <div className="text-5xl mb-2">✍️</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Registre des présences
          </div>
        </Link>

        {/* Rapport */}
        <Link
          href="/rapport/RapportPresence"
          className={cardClass}
          style={{ borderTopColor: "#6366F1" }}
        >
          <div className="text-5xl mb-2">✅</div>
          <div className="text-lg font-bold text-gray-800 text-center">
            Rapport des Registres
          </div>
        </Link>

        {/* Notifications */}
        {NOTIF_CARD}
      </div>

      {/* Formulaires */}
      {isResponsableFamilles && (
        <>
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
