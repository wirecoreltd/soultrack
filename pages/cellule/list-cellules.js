"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import EditCelluleModal from "../../components/EditCelluleModal";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    pageTitle: "Liste des",
    pageTitleAccent: "Cellules",
    introAccent: "Gérez et consultez facilement vos cellules",
    intro: ". Recherchez par nom, filtrez rapidement, visualisez les responsables et le nombre de membres, et accédez aux",
    introAccent2: "détails pour un suivi précis",
    chercher: "Chercher...",
    toutes: "Toutes",
    total: "Total :",
    btnAjouterCellule: "➕ Ajouter une Cellule",
    colVille: "Ville",
    colCellule: "Cellule",
    colResponsable: "Responsable",
    colParent: "Parent",
    colTelephone: "Téléphone",
    colCount: "Count",
    colAction: "Action",
    details: "Détails",
    voirDetails: "Voir détails →",
    modifier: "✏️ Modifier",
    appeler: "📞 Appeler",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 Appel WhatsApp",
    whatsApp: "💬 WhatsApp",
    ville: "📍 Ville :",
    responsable: "👤 Responsable :",
    parent: "👤 Parent :",
    membreSing: "membre",
    membrePlur: "membres",
    chargement: "Chargement...",
    aucuneCellule: "Aucune cellule",
  },
  en: {
    pageTitle: "List of",
    pageTitleAccent: "Cell Groups",
    introAccent: "Easily manage and view your cell groups",
    intro: ". Search by name, filter quickly, see leaders and member counts, and access",
    introAccent2: "details for precise follow-up",
    chercher: "Search...",
    toutes: "All",
    total: "Total:",
    btnAjouterCellule: "➕ Add a Cell Group",
    colVille: "City",
    colCellule: "Cell group",
    colResponsable: "Leader",
    colParent: "Parent",
    colTelephone: "Phone",
    colCount: "Count",
    colAction: "Action",
    details: "Details",
    voirDetails: "View details →",
    modifier: "✏️ Edit",
    appeler: "📞 Call",
    sms: "✉️ SMS",
    appelWhatsApp: "📱 WhatsApp call",
    whatsApp: "💬 WhatsApp",
    ville: "📍 City:",
    responsable: "👤 Leader:",
    parent: "👤 Parent:",
    membreSing: "member",
    membrePlur: "members",
    chargement: "Loading...",
    aucuneCellule: "No cell groups found",
  },
};

/* =========================
   Ligne Cellule (RESPONSIVE)
========================= */
function CelluleRow({ c, router, canEdit, onEdit, t }) {
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

  const phoneClean = (c.telephone || "").replace(/[^0-9]/g, "");

  return (
    <>
      {/* DESKTOP */}
      <div
        className="hidden sm:flex flex-row items-center px-2 py-2 rounded-lg gap-2 bg-white/15 border-l-4"
        style={{ borderLeftColor: "#F59E0B" }}
      >
        <div className="flex-[2] text-white text-sm">{c.ville}</div>
        <div className="flex-[2] text-white font-semibold text-sm">{c.cellule_full}</div>
        <div className="flex-[2] text-white text-sm">{c.responsable}</div>
        <div className="flex-[2] text-white text-sm">
          {c.superviseur ? `${c.superviseur.prenom} ${c.superviseur.nom}` : "—"}
        </div>

        {/* Téléphone */}
        <div className="flex-[2] flex justify-center relative text-sm">
          <span
            className="text-orange-400 underline cursor-pointer"
            onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
          >
            {c.telephone || "—"}
          </span>
          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border z-[9999] w-56"
            >
              <a href={`tel:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">{t.appeler}</a>
              <a href={`sms:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">{t.sms}</a>
              <a href={`https://wa.me/${phoneClean}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.appelWhatsApp}</a>
              <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.whatsApp}</a>
            </div>
          )}
        </div>

        <div className="flex-[1] flex justify-center text-white text-sm">{c.membre_count}</div>

        <div className="flex-[1] flex justify-center gap-2">
          <span
            className="text-orange-400 underline cursor-pointer text-sm"
            onClick={() => router.push(`${window.location.origin}/cellule/membres-cellule?celluleId=${c.id}`)}
          >
            {t.details}
          </span>
          {canEdit && (
            <span
              className="text-blue-300 underline cursor-pointer text-sm"
              onClick={() => onEdit(c)}
            >
              ✏️
            </span>
          )}
        </div>
      </div>

      {/* MOBILE */}
      <div
        className="sm:hidden bg-white/10 backdrop-blur-md rounded-xl p-4 border-l-4 mb-2 relative overflow-visible"
        style={{ borderLeftColor: "#F59E0B" }}
      >
        <div className="text-white font-semibold text-lg">{c.cellule_full}</div>

        <div className="text-white text-sm mb-2 mt-3">
          {t.ville} <span className="font-semibold">{c.ville}</span>
        </div>

        <div className="text-white text-sm mb-2">
          {t.responsable}{" "}
          <span className="text-amber-300 font-semibold">{c.responsable || "—"}</span>
        </div>

        <div className="text-white text-sm mb-2">
          {t.parent}{" "}
          <span className="text-amber-300 font-semibold">
            {c.superviseur ? `${c.superviseur.prenom} ${c.superviseur.nom}` : "—"}
          </span>
        </div>

        <div className="relative mb-2">
          <span className="text-sm cursor-pointer" onClick={() => setOpenPhoneMenu(!openPhoneMenu)}>
            📞{" "}
            <span className="text-orange-400 underline">{c.telephone || "—"}</span>
          </span>
          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute z-[9999] mt-2 bg-white rounded-lg shadow-xl border w-56"
            >
              <a href={`tel:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">{t.appeler}</a>
              <a href={`sms:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">{t.sms}</a>
              <a href={`https://wa.me/${phoneClean}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.appelWhatsApp}</a>
              <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">{t.whatsApp}</a>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="text-white text-sm">
            👥 {c.membre_count} {c.membre_count > 1 ? t.membrePlur : t.membreSing}
          </div>
          <div className="flex gap-3 items-center">
            {canEdit && (
              <button onClick={() => onEdit(c)} className="text-blue-300 underline text-sm">
                {t.modifier}
              </button>
            )}
            <button
              onClick={() => router.push(`${window.location.origin}/cellule/membres-cellule?celluleId=${c.id}`)}
              className="text-orange-400 underline text-sm"
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
export default function ListCellules() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <ListCellulesContent />
    </ProtectedRoute>
  );
}

function ListCellulesContent() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];

  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [selectedCellule, setSelectedCellule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCellule, setFilterCellule] = useState("");

  useEffect(() => { fetchCellules(); }, []);

  const fetchCellules = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, roles, eglise_id")
      .eq("id", user.id)
      .single();
    if (!profile) return;

    setUserRole(profile.role);

    let query = supabase
      .from("cellules")
      .select(`*, superviseur:superviseur_id ( nom, prenom )`)
      .eq("eglise_id", profile.eglise_id)
      .order("cellule_full");

    if (profile.role === "ResponsableCellule") {
      const { data: directes } = await supabase
        .from("cellules").select("id")
        .eq("responsable_id", profile.id).eq("eglise_id", profile.eglise_id);
      const directIds = (directes || []).map(c => c.id);

      const { data: filles } = await supabase
        .from("cellules").select("id")
        .in("cellule_mere_id", directIds.length ? directIds : ["00000000-0000-0000-0000-000000000000"]);
      const fillesIds = (filles || []).map(c => c.id);

      const allIds = [...new Set([...directIds, ...fillesIds])];
      query = query.in("id", allIds.length ? allIds : ["00000000-0000-0000-0000-000000000000"]);
    }

    const { data: cellsData } = await query;

    const withCount = await Promise.all(
      (cellsData || []).map(async (c) => {
        const { count } = await supabase
          .from("membres_complets").select("id", { count: "exact", head: true })
          .eq("cellule_id", c.id).eq("statut_suivis", 3).neq("etat_contact", "supprime");
        return { ...c, membre_count: count || 0 };
      })
    );

    setCellules(withCount);
    setLoading(false);
  };

  const handleEdit = useCallback((cellule) => {
    setSelectedCellule(cellule);
    setShowEditModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedCellule(null);
  }, []);

  const handleUpdated = useCallback((updatedCellule) => {
    setCellules((prev) =>
      prev.map((c) =>
        c.id === updatedCellule.id
          ? {
              ...c,
              cellule:          updatedCellule.cellule          ?? c.cellule,
              ville:            updatedCellule.ville            ?? c.ville,
              responsable:      updatedCellule.responsable      ?? c.responsable,
              responsable_id:   updatedCellule.responsable_id   ?? c.responsable_id,
              telephone:        updatedCellule.telephone        ?? c.telephone,
              cellule_full:     updatedCellule.cellule_full     ?? c.cellule_full,
              cellule_mere_id:  updatedCellule.cellule_mere_id  ?? c.cellule_mere_id,
            }
          : c
      )
    );

    setSelectedCellule((prev) =>
      prev?.id === updatedCellule.id
        ? { ...prev, ...updatedCellule }
        : prev
    );
  }, []);

  const canEdit = ["Administrateur", "SuperviseurCellule"].includes(userRole);

  const cellulesFiltrees = cellules.filter((c) => {
    const matchSearch = c.cellule_full?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterCellule ? c.cellule_full === filterCellule : true;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return <p className="text-center mt-10 text-white">{t.chargement}</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        {t.pageTitle} <span className="text-emerald-300">{t.pageTitleAccent}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center mx-auto">
        <p className="italic text-base text-white/90">
          <span className="text-blue-300 font-semibold">{t.introAccent}</span>
          {t.intro}{" "}
          <span className="text-blue-300 font-semibold">{t.introAccent2}</span>.
        </p>
      </div>

      {/* Recherche */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder={t.chercher}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-md text-black"
        />
      </div>

      {/* Filtre */}
      <div className="max-w-6xl mx-auto mb-4 flex justify-center gap-4">
        <select
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
          className="px-3 py-2 rounded-md text-black"
        >
          <option value="">{t.toutes}</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.cellule_full}>{c.cellule_full}</option>
          ))}
        </select>

        <span className="text-white font-semibold">
          {t.total} {cellulesFiltrees.length}
        </span>
      </div>

      {/* Bouton ajout */}
      {userRole === "SuperviseurCellule" && (
        <div className="max-w-6xl mx-auto flex justify-end mb-3">
          <button
            onClick={() => router.push("/admin/create-cellule")}
            className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
          >
            {t.btnAjouterCellule}
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="max-w-6xl mx-auto space-y-2">

        {/* Header Desktop */}
        <div className="hidden sm:flex text-sm font-semibold text-white border-b pb-2">
          <div className="flex-[2]">{t.colVille}</div>
          <div className="flex-[2]">{t.colCellule}</div>
          <div className="flex-[2]">{t.colResponsable}</div>
          <div className="flex-[2]">{t.colParent}</div>
          <div className="flex-[2] text-center">{t.colTelephone}</div>
          <div className="flex-[1] text-center">{t.colCount}</div>
          <div className="flex-[1] text-center">{t.colAction}</div>
        </div>

        {cellulesFiltrees.length === 0 ? (
          <p className="text-white text-center mt-6">{t.aucuneCellule}</p>
        ) : (
          cellulesFiltrees.map((c) => (
            <CelluleRow
              key={c.id}
              c={c}
              router={router}
              canEdit={canEdit}
              onEdit={handleEdit}
              t={t}
            />
          ))
        )}
      </div>

      {showEditModal && selectedCellule && (
        <EditCelluleModal
          key={selectedCellule.id}
          cellule={selectedCellule}
          onClose={handleCloseModal}
          onUpdated={handleUpdated}
        />
      )}

      <Footer />
    </div>
  );
}
