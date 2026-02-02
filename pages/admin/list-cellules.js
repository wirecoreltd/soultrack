"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import EditCelluleModal from "../../components/EditCelluleModal";
import HeaderPages from "../../components/HeaderPages";

export default function ListCellules() {
  const router = useRouter();

  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedCellule, setSelectedCellule] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCellule, setFilterCellule] = useState("");
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);

  // Ref global pour fermer le popup téléphone au clic dehors
  const phoneMenuRefs = useRef({});

  useEffect(() => {
    fetchCellules();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(phoneMenuRefs.current).some(ref => ref?.contains(event.target))) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchCellules = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      const role = profile.role?.trim();
      setUserRole(role);

      let query = supabase
        .from("cellules")
        .select("id, cellule, ville, responsable, telephone, responsable_id")
        .order("ville", { ascending: true });

      if (role === "ResponsableCellule") {
        query = query.eq("responsable_id", profile.id);
      }

      const { data } = await query;
      if (!data) throw new Error("Erreur récupération cellules");

      // Compte membres
      const cellulesWithCount = await Promise.all(
        data.map(async (c) => {
          const { count } = await supabase
            .from("membres_complets")
            .select("id", { count: "exact", head: true })
            .eq("cellule_id", c.id)
            .eq("statut_suivis", 3);
          return { ...c, membre_count: count || 0 };
        })
      );

      setCellules(cellulesWithCount);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la récupération des cellules.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdated = (updated) => {
    setCellules((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const filteredMembres = cellules.filter(c => 
    c.cellule.toLowerCase().includes(search.toLowerCase()) &&
    (filterCellule ? c.id === filterCellule : true)
  );

  if (loading)
    return <p className="text-center mt-10 text-lg text-white">Chargement...</p>;
  if (message)
    return <p className="text-center mt-10 text-red-600">{message}</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-4xl text-white text-center mb-4">Liste de Cellules</h1>

      {/* Barre de recherche */}
      <div className="w-full max-w-4xl flex justify-center mb-2">
        <input
          type="text"
          placeholder="Recherche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-2/3 px-3 py-1 rounded-md border text-black focus:outline-none"
        />
      </div>

      {/* Filtre */}
      <div className="w-full max-w-6xl flex justify-center items-center mb-4 gap-2 flex-wrap">
        <select
          value={filterCellule}
          onChange={e => setFilterCellule(e.target.value)}
          className="px-3 py-1 rounded-md border text-black text-sm"
        >
          <option value="">-- Toutes les cellules --</option>
          {cellules.map(c => (
            <option key={c.id} value={c.id}>{c.cellule}</option>
          ))}
        </select>
        <span className="text-white text-sm ml-2">{filteredMembres.length} membres</span>
      </div>

      {/* Tableau */}
      <div className="w-full max-w-6xl mx-auto overflow-x-auto py-2">
        <div className="min-w-[700px] space-y-2">

          {/* Header */}
          <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
            <div className="flex-[2]">Zone / Ville</div>
            <div className="flex-[2]">Cellule</div>
            <div className="flex-[2]">Responsable</div>
            <div className="flex-[2] flex justify-center">Téléphone</div>
            <div className="flex-[1] flex justify-center">Count</div>
            <div className="flex-[1] flex justify-center">Détails</div>
          </div>

          {/* Lignes */}
          {filteredMembres.length === 0 ? (
            <div className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 transition duration-150 gap-2 border-l-4" style={{ borderLeftColor: "#06B6D4" }}>
              <div className="flex-[2] text-white">—</div>
              <div className="flex-[2] text-white">—</div>
              <div className="flex-[2] text-white font-medium">—</div>
              <div className="flex-[2] flex justify-center items-center text-white">—</div>
              <div className="flex-[1] flex justify-center items-center text-white">0</div>
              <div className="flex-[1] flex justify-center items-center text-orange-500">—</div>
            </div>
          ) : (
            filteredMembres.map((c, index) => (
              <div
                key={c.id}
                className={`flex flex-row items-center px-2 py-2 rounded-lg ${
                  index % 2 === 0 ? "bg-white/10" : "bg-white/20"
                } transition duration-150 gap-2 border-l-4`}
                style={{ borderLeftColor: index % 2 === 0 ? "#06B6D4" : "#F59E0B" }}
              >
                <div className="flex-[2] text-white">{c.ville}</div>
                <div className="flex-[2] text-white">{c.cellule}</div>
                <div className="flex-[2] text-white font-medium">{c.responsable}</div>

                {/* Téléphone */}
                <div className="flex-[2] flex flex-col justify-center items-center relative">
                  <p
                    className="text-center text-orange-500 underline cursor-pointer"
                    onClick={() => setOpenPhoneMenuId(c.id)}
                  >
                    {c.telephone || "—"}
                  </p>
                  {openPhoneMenuId === c.id && (
                    <div
                      ref={(el) => phoneMenuRefs.current[c.id] = el}
                      className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={c.telephone ? `tel:${c.telephone}` : "#"}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        📞 Appeler
                      </a>
                      <a
                        href={c.telephone ? `sms:${c.telephone}` : "#"}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        ✉️ SMS
                      </a>
                      <a
                        href={c.telephone ? `https://wa.me/${c.telephone.replace(/\D/g,"")}?call` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        📱 Appel WhatsApp
                      </a>
                      <a
                        href={c.telephone ? `https://wa.me/${c.telephone.replace(/\D/g,"")}` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        💬 Message WhatsApp
                      </a>
                    </div>
                  )}
                </div>

                {/* Count */}
                <div className="flex-[1] flex justify-center items-center text-white font-semibold">
                  {c.membre_count}
                </div>

                {/* Détails */}
                <div className="flex-[1] flex justify-center items-center text-orange-500 font-semibold cursor-pointer"
                  onClick={() => setSelectedCellule(c)}
                >
                  Détails
                </div>
              </div>
            ))
          )}

          {/* ✏️ MODAL */}
          {selectedCellule && (
            <EditCelluleModal
              cellule={selectedCellule}
              onClose={() => setSelectedCellule(null)}
              onUpdated={handleUpdated}
            />
          )}

        </div>
      </div>
    </div>
  );
}
