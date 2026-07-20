"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import EditFamilleModal from "../../components/EditFamilleModal";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    // Page
    pageTitle1: "Liste des",
    pageTitle2: "Familles",
    intro1: "Gérez et consultez facilement vos familles",
    introMid:
      ". Recherchez par nom, filtrez rapidement, visualisez les responsables et le nombre de membres, et accédez aux ",
    intro2: "détails pour un suivi précis",
    loading: "Chargement...",

    // Filtres / recherche
    searchPlaceholder: "Chercher...",
    filterAll: "Toutes",
    total: "Total :",

    // Bouton ajout
    addFamille: "➕ Ajouter une Famille",

    // Header tableau desktop
    colVille: "Ville",
    colFamille: "Famille",
    colResponsable: "Responsable",
    colTelephone: "Téléphone",
    colCount: "Count",
    colAction: "Action",

    // Ligne famille
    labelVille: "📍 Ville :",
    labelResponsable: "👤 Responsable :",
    labelMembres: "👥",
    membre: "membre",
    membres: "membres",
    details: "Détails",
    voirDetails: "Voir détails →",
    modifier: "✏️ Modifier",

    // Menu téléphone
    call: "📞 Appeler",
    sms: "✉️ SMS",
    whatsappCall: "📱 Appel WhatsApp",
    whatsappMsg: "💬 WhatsApp",

    // Vide
    noFamille: "Aucune famille",
  },
  en: {
    // Page
    pageTitle1: "List of",
    pageTitle2: "Families",
    intro1: "Easily manage and browse your families",
    introMid:
      ". Search by name, filter quickly, view responsible people and member counts, and access ",
    intro2: "details for precise follow-up",
    loading: "Loading...",

    // Filtres / recherche
    searchPlaceholder: "Search...",
    filterAll: "All",
    total: "Total:",

    // Bouton ajout
    addFamille: "➕ Add a Family",

    // Header tableau desktop
    colVille: "City",
    colFamille: "Family",
    colResponsable: "Leader",
    colTelephone: "Phone",
    colCount: "Count",
    colAction: "Action",

    // Ligne famille
    labelVille: "📍 City:",
    labelResponsable: "👤 Leader:",
    labelMembres: "👥",
    membre: "member",
    membres: "members",
    details: "Details",
    voirDetails: "View details →",
    modifier: "✏️ Edit",

    // Menu téléphone
    call: "📞 Call",
    sms: "✉️ SMS",
    whatsappCall: "📱 WhatsApp call",
    whatsappMsg: "💬 WhatsApp",

    // Vide
    noFamille: "No family found",
  },
};

/* =========================
   Ligne Famille (RESPONSIVE)
========================= */
function FamilleRow({ f, router, canEdit, onEdit, t }) {
  const [openPhoneMenu, setOpenPhoneMenu] = useState(false);
  const phoneMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const phoneClean = (f.telephone_responsable || "").replace(/[^0-9]/g, "");

  const phoneMenu = (
    <div
      ref={phoneMenuRef}
      className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border z-[9999] w-56"
    >
      <a href={`tel:${f.telephone_responsable}`} className="block px-4 py-2 hover:bg-gray-100">{t.call}</a>
      <a href={`sms:${f.telephone_responsable}`} className="block px-4 py-2 hover:bg-gray-100">{t.sms}</a>
      <a href={`https://wa.me/${phoneClean}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.whatsappCall}</a>
      <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.whatsappMsg}</a>
    </div>
  );

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <div
        className="hidden sm:flex flex-row items-center px-2 py-2 rounded-lg gap-2 bg-white/15 border-l-4"
        style={{ borderLeftColor: "#10B981" }}
      >
        <div className="flex-[2] text-white text-sm">{f.ville}</div>
        <div className="flex-[2] text-white font-semibold text-sm">{f.famille_full}</div>
        <div className="flex-[2] text-white text-sm">{f.responsable}</div>

        {/* Téléphone */}
        <div className="flex-[2] flex justify-center relative text-sm">
          <span
            className="text-emerald-400 underline cursor-pointer"
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
          >
            {f.telephone_responsable || "—"}
          </span>
          {openPhoneMenu && phoneMenu}
        </div>

        <div className="flex-[1] flex justify-center text-white text-sm">{f.membre_count}</div>

        <div className="flex-[1] flex justify-center gap-2">
          <span
            className="text-emerald-400 underline cursor-pointer text-sm"
            onClick={() =>
              router.push(
                `${window.location.origin}/famille/membres-famille?familleId=${f.id}`
              )
            }
          >
            {t.details}
          </span>
          {canEdit && (
            <span
              className="text-blue-300 underline cursor-pointer text-sm"
              onClick={() => onEdit(f)}
            >
              ✏️
            </span>
          )}
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        className="sm:hidden bg-white/10 backdrop-blur-md rounded-xl p-4 border-l-4 mb-2 relative overflow-visible"
        style={{ borderLeftColor: "#10B981" }}
      >
        {/* Nom */}
        <div className="text-white font-semibold text-lg">{f.famille_full}</div>

        {/* Ville */}
        <div className="text-white text-sm mb-2 mt-3">
          {t.labelVille} <span className="font-semibold">{f.ville}</span>
        </div>

        {/* Responsable */}
        <div className="text-white text-sm mb-2">
          {t.labelResponsable}{" "}
          <span className="text-emerald-300 font-semibold">
            {f.responsable || "—"}
          </span>
        </div>

        {/* Téléphone */}
        <div className="relative mb-2">
          <span
            className="text-sm cursor-pointer"
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
          >
            📞{" "}
            <span className="text-emerald-400 underline">
              {f.telephone_responsable || "—"}
            </span>
          </span>
          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute z-[9999] mt-2 bg-white rounded-lg shadow-xl border w-56"
            >
              <a href={`tel:${f.telephone_responsable}`} className="block px-4 py-2 hover:bg-gray-100">{t.call}</a>
              <a href={`sms:${f.telephone_responsable}`} className="block px-4 py-2 hover:bg-gray-100">{t.sms}</a>
              <a href={`https://wa.me/${phoneClean}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.whatsappCall}</a>
              <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.whatsappMsg}</a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-white text-sm">
            {t.labelMembres} {f.membre_count}{" "}
            {f.membre_count > 1 ? t.membres : t.membre}
          </div>
          <div className="flex gap-3 items-center">
            {canEdit && (
              <button
                onClick={() => onEdit(f)}
                className="text-blue-300 underline text-sm"
              >
                {t.modifier}
              </button>
            )}
            <button
              onClick={() =>
                router.push(
                  `${window.location.origin}/famille/membres-famille?familleId=${f.id}`
                )
              }
              className="text-emerald-400 underline text-sm"
            >
              {t.voirDetails}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================
   Page principale
========================= */
export default function ListFamilles() {
  return (
     <ProtectedRoute
      allowedRoles={["Administrateur", "ResponsableFamilles", "SuperviseurFamilles"]}
      requiredFeature="familles"
    >
      <ListFamillesContent />
    </ProtectedRoute>
  );
}

function ListFamillesContent() {
  const { lang } = useLang();
  const t = translations[lang];

  const router = useRouter();
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // ── Modal état ──
  const [selectedFamille, setSelectedFamille] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [search, setSearch] = useState("");
  const [filterFamille, setFilterFamille] = useState("");

  useEffect(() => {
    fetchFamilles();
  }, []);

  const fetchFamilles = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, eglise_id")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    setUserRole(profile.role);

    let query = supabase
      .from("familles")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .order("famille_full");

    if (profile.role === "ResponsableFamille") {
      query = query.eq("responsable_id", profile.id);
    } else if (profile.role === "SuperviseurFamille") {
      query = query.eq("branche_id", profile.branche_id);
    } else if (profile.role !== "Administrateur") {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data: famillesData } = await query;

    const withCount = await Promise.all(
      (famillesData || []).map(async (f) => {
        const { count } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("famille_id", f.id)
          .eq("statut_suivis", 3)
          .neq("etat_contact", "supprime");
        return { ...f, membre_count: count || 0 };
      })
    );

    setFamilles(withCount);
    setLoading(false);
  };

  const handleEdit = (famille) => {
    setSelectedFamille(famille);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedFamille(null);
  };

  const handleUpdated = (updatedFamille) => {
    setFamilles((prev) =>
      prev.map((f) =>
        f.id === updatedFamille.id
          ? {
              ...f,
              famille: updatedFamille.famille,
              ville: updatedFamille.ville,
              responsable: updatedFamille.responsable,
              telephone_responsable: updatedFamille.telephone_responsable,
              famille_full: updatedFamille.famille_full ?? f.famille_full,
            }
          : f
      )
    );
  };

  const canEdit = ["Administrateur", "SuperviseurFamille"].includes(userRole);

  const famillesFiltrees = familles.filter((f) => {
    const matchSearch = f.famille_full
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter = filterFamille ? f.famille_full === filterFamille : true;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return <p className="text-center mt-10 text-white">{t.loading}</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        {t.pageTitle1}{" "}
        <span className="text-emerald-300">{t.pageTitle2}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          <span className="text-blue-300 font-semibold">{t.intro1}</span>
          {t.introMid}
          <span className="text-blue-300 font-semibold">{t.intro2}</span>.
        </p>
      </div>

      {/* Recherche */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-md text-black"
        />
      </div>

      {/* Filtre */}
      <div className="max-w-6xl mx-auto mb-4 flex justify-center gap-4">
        <select
          value={filterFamille}
          onChange={(e) => setFilterFamille(e.target.value)}
          className="px-3 py-2 rounded-md text-black"
        >
          <option value="">{t.filterAll}</option>
          {familles.map((f) => (
            <option key={f.id} value={f.famille_full}>
              {f.famille_full}
            </option>
          ))}
        </select>

        <span className="text-white font-semibold">
          {t.total} {famillesFiltrees.length}
        </span>
      </div>

      {/* Bouton ajout */}
      {(userRole === "Administrateur" || userRole === "SuperviseurFamilles") && (
        <div className="max-w-6xl mx-auto flex justify-end mb-3">
          <button
            onClick={() => router.push("/admin/create-famille")}
            className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
          >
            {t.addFamille}
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="max-w-6xl mx-auto space-y-2">

        {/* Header Desktop */}
        <div className="hidden sm:flex text-sm font-semibold text-white border-b pb-2">
          <div className="flex-[2]">{t.colVille}</div>
          <div className="flex-[2]">{t.colFamille}</div>
          <div className="flex-[2]">{t.colResponsable}</div>
          <div className="flex-[2] text-center">{t.colTelephone}</div>
          <div className="flex-[1] text-center">{t.colCount}</div>
          <div className="flex-[1] text-center">{t.colAction}</div>
        </div>

        {famillesFiltrees.length === 0 ? (
          <p className="text-white text-center mt-6">{t.noFamille}</p>
        ) : (
          famillesFiltrees.map((f) => (
            <FamilleRow
              key={f.id}
              f={f}
              router={router}
              canEdit={canEdit}
              onEdit={handleEdit}
              t={t}
            />
          ))
        )}
      </div>

      {/* ── Modal d'édition ── */}
      {showEditModal && selectedFamille && (
        <EditFamilleModal
          famille={selectedFamille}
          onClose={handleCloseModal}
          onUpdated={handleUpdated}
        />
      )}

      <Footer />
    </div>
  );
}
