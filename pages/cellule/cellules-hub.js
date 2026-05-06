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

  const NOTIF_CARD = (
    <Link href="/admin/notifications" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer" style={{ borderTopColor: "#ef4444" }}>
      <div className="text-5xl mb-2">🔔</div>
      <div className="text-lg font-bold text-gray-800 text-center">Notifications</div>
    </Link>
  );

  // ─── ResponsableCellule : cartes détaillées directement ──────────────────
  if (isResponsableCellule) {
    return (
      <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
        <HeaderPages />
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mt-4 mb-6 text-white">Espace Cellule</h1>
          <div className="max-w-3xl w-full mb-6 text-center">
            <p className="italic text-base text-white/90">
              Chaque cellule est un <span className="text-blue-300 font-semibold">espace</span> où les âmes grandissent,
              sont <span className="text-blue-300 font-semibold">accompagnées et encouragées dans leur cheminement</span>.
              Ensemble, unissons nos forces, construisons et faisons fructifier chaque vie,
              afin que chacun puisse <span className="text-blue-300 font-semibold">s'épanouir pleinement dans la foi</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
          <Link href="/cellule/list-cellules" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
            <div className="text-5xl mb-2">🏠</div>
            <div className="text-lg font-bold text-gray-800 text-center">Liste des Cellules</div>
          </Link>

          {role === "ResponsableCellule" && (
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

          <Link href="/Presence" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
            <div className="text-5xl mb-2">✍️</div>
            <div className="text-lg font-bold text-gray-800 text-center">Présence</div>
          </Link>  

          {NOTIF_CARD}
        </div>

        <div className="w-full max-w-md mb-3">
          <SendLinkPopup label="Envoyer formulaire Cellule – Nouveau membre" type="ajouter_membre_cellule" buttonColor="from-[#f7971e] to-[#ffd200]" />
        </div>
        <div className="w-full max-w-md mb-6">
          <SendLinkPopup label="Envoyer formulaire Cellule – Évangélisation" type="ajouter_evangelise_cellule" buttonColor="from-[#11998e] to-[#38ef7d]" />
        </div>

        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Administrateur / SuperviseurCellule : toutes les cartes ─────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-white">Espace Cellule</h1>
        <div className="max-w-3xl w-full mb-6 text-center">
          <p className="italic text-base text-white/90">
            Chaque cellule est un <span className="text-blue-300 font-semibold">espace</span> où les âmes grandissent,
            sont <span className="text-blue-300 font-semibold">accompagnées et encouragées dans leur cheminement</span>.
            Ensemble, unissons nos forces, construisons et faisons fructifier chaque vie,
            afin que chacun puisse <span className="text-blue-300 font-semibold">s'épanouir pleinement dans la foi</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-5xl mb-6 flex-wrap">
        <Link href="/cellule/list-cellules" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">🏠</div>
          <div className="text-lg font-bold text-gray-800 text-center">Liste des Cellules</div>
        </Link>

        <Link href="/cellule/ajouter-membre-cellule" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-blue-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
          <div className="text-5xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-800 text-center">Ajouter un membre à la Cellule</div>
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

          <Link href="/admin/notifications" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-3xl shadow-md flex flex-col justify-center items-center border-t-4 border-yellow-500 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer">
                    <div className="text-5xl mb-2">✍️</div>
                    <div className="text-lg font-bold text-gray-800 text-center">Notificatoins</div>
                  </Link>

        {isAdmin && (
          <>
            <Link href="/admin/import" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer" style={{ borderTopColor: "#F97316" }}>
              <div className="text-4xl mb-1">📤</div>
              <div className="text-lg font-bold text-gray-800 text-center">Import Une liste des membres</div>
            </Link>

            <Link href="/admin/create-cellule" className="flex-1 min-w-[250px] w-full h-32 bg-white rounded-2xl shadow-md flex flex-col justify-center items-center border-t-4 p-3 hover:shadow-lg transition-all duration-200 cursor-pointer" style={{ borderTopColor: "#F97316" }}>
              <div className="text-4xl mb-1">🛠️</div>
              <div className="text-lg font-bold text-gray-800 text-center">Créer une Cellule</div>
            </Link>
          
          </>
        )}

        {NOTIF_CARD}
      </div>

      <div className="w-full max-w-md mb-3">
        <SendLinkPopup label="Envoyer formulaire Cellule – Nouveau membre" type="ajouter_membre_cellule" buttonColor="from-[#f7971e] to-[#ffd200]" />
      </div>
      <div className="w-full max-w-md mb-6">
        <SendLinkPopup label="Envoyer formulaire Cellule – Évangélisation" type="ajouter_evangelise_cellule" buttonColor="from-[#11998e] to-[#38ef7d]" />
      </div>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          La famille est le plus grand trésor. Prenez soin les uns des autres avec amour et patience.
        </p>
      </div>

      <Footer />
    </div>
  );
}
