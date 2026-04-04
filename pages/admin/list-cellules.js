"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import EditCelluleModal from "../../components/EditCelluleModal";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";

/* =========================
   Ligne Cellule (RESPONSIVE)
========================= */
function CelluleRow({ c, router }) {
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

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <div
        className="hidden sm:flex flex-row items-center px-2 py-2 rounded-lg gap-2 bg-white/15 border-l-4"
        style={{ borderLeftColor: "#F59E0B" }}
      >
        <div className="flex-[2] text-white text-sm">{c.ville}</div>
        <div className="flex-[2] text-white font-semibold text-sm">
          {c.cellule_full}
        </div>
        <div className="flex-[2] text-white text-sm">{c.responsable}</div>

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
              className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border z-50 w-56"
            >
              <a href={`tel:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
              <a href={`sms:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
              <a href={`https://wa.me/${c.telephone?.replace(/\D/g, "")}?call`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">📱 Appel WhatsApp</a>
              <a href={`https://wa.me/${c.telephone?.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">💬 WhatsApp</a>
            </div>
          )}
        </div>

        {/* Count */}
        <div className="flex-[1] flex justify-center text-white text-sm">
          {c.membre_count}
        </div>

        {/* Action */}
        <div className="flex-[1] flex justify-center">
          <span
            className="text-orange-400 underline cursor-pointer text-sm"
            onClick={() => router.push(`/admin/cellules/${c.id}/membres`)}
          >
            Détails
          </span>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div
        <div className="sm:hidden bg-white/10 backdrop-blur-md rounded-xl p-4 border-l-4 mb-2 relative overflow-visible">
        style={{ borderLeftColor: "#F59E0B" }}
      >
        {/* Nom cellule */}
        <div className="text-white font-semibold text-lg">
          {c.cellule_full}
        </div>

        {/* Ville */}
       <div className="text-white text-sm mb-2 mt-3">
           📍 Ville : <span className="font-semibold">{c.ville}</span>
         </div>

        {/* Responsable */}
       <div className="text-white text-sm mb-2">
           👤 Responsable :{" "}
           <span className="text-amber-300 font-semibold">
             {c.responsable || "—"}
           </span>
         </div>

        {/* Téléphone */}
        <span className="text-sm cursor-pointer" onClick={() => setOpenPhoneMenu(!openPhoneMenu)}>
           📞{" "}
           <span className="text-orange-400 underline">
             {c.telephone || "—"}
           </span>
         </span>

          {openPhoneMenu && (
            <div
              ref={phoneMenuRef}
              className="absolute z-[9999] mt-2 bg-white rounded-lg shadow-xl border w-56"
            >
              <a href={`tel:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">📞 Appeler</a>
              <a href={`sms:${c.telephone}`} className="block px-4 py-2 hover:bg-gray-100">✉️ SMS</a>
              <a href={`https://wa.me/${c.telephone?.replace(/\D/g, "")}?call`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">📱 Appel WhatsApp</a>
              <a href={`https://wa.me/${c.telephone?.replace(/\D/g, "")}`} target="_blank" className="block px-4 py-2 hover:bg-gray-100">💬 WhatsApp</a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-white text-sm">
            👥 {c.membre_count} membre{c.membre_count > 1 ? "s" : ""}
          </div>

          <button
            onClick={() => router.push(`/admin/cellules/${c.id}/membres`)}
            className="text-orange-400 underline text-sm"
          >
            Voir détails →
          </button>
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
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [selectedCellule, setSelectedCellule] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCellule, setFilterCellule] = useState("");

  useEffect(() => {
    fetchCellules();
  }, []);

  const fetchCellules = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    setUserRole(profile.role);

    let query = supabase
      .from("cellules")
      .select("*")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id)
      .order("cellule_full");

    if (profile.role === "ResponsableCellule") {
      query = query.eq("responsable_id", profile.id);
    }

    const { data: cellsData } = await query;

    const withCount = await Promise.all(
      (cellsData || []).map(async (c) => {
        const { count } = await supabase
          .from("membres_complets")
          .select("id", { count: "exact", head: true })
          .eq("cellule_id", c.id)
          .eq("statut_suivis", 3);

        return { ...c, membre_count: count || 0 };
      })
    );

    setCellules(withCount);
    setLoading(false);
  };

  const cellulesFiltrees = cellules.filter((c) => {
    const matchSearch = c.cellule_full?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterCellule ? c.cellule_full === filterCellule : true;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return <p className="text-center mt-10 text-white">Chargement...</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-4xl text-white text-center mb-4">
        Liste des cellules
      </h1>

      {/* Recherche */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Chercher..."
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
          <option value="">Toutes</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.cellule_full}>
              {c.cellule_full}
            </option>
          ))}
        </select>

        <span className="text-white font-semibold">
          Total : {cellulesFiltrees.length}
        </span>
      </div>

      {/* Bouton */}
      <div className="max-w-6xl mx-auto flex justify-end mb-3">
        <button
          onClick={() => router.push("/admin/create-cellule")}
          className="text-white px-4 py-2"
        >
          ➕ Ajouter
        </button>
      </div>

      {/* Tableau */}
      <div className="max-w-6xl mx-auto space-y-2">

        {/* Header Desktop */}
        <div className="hidden sm:flex text-sm font-semibold text-white border-b pb-2">
          <div className="flex-[2]">Ville</div>
          <div className="flex-[2]">Cellule</div>
          <div className="flex-[2]">Responsable</div>
          <div className="flex-[2] text-center">Téléphone</div>
          <div className="flex-[1] text-center">Count</div>
          <div className="flex-[1] text-center">Action</div>
        </div>

        {cellulesFiltrees.length === 0 ? (
          <p className="text-white text-center mt-6">Aucune cellule</p>
        ) : (
          cellulesFiltrees.map((c) => (
            <CelluleRow key={c.id} c={c} router={router} />
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
