"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import EditCelluleModal from "../../components/EditCelluleModal";
import HeaderPages from "../../components/HeaderPages";

// Sous-composant pour chaque ligne
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
    <div
      className={`flex flex-row items-center px-2 py-1 rounded-lg transition duration-150 gap-2 border-l-4 ${
        c.index % 2 === 0 ? "bg-white/10" : "bg-white/20"
      }`}
      style={{ borderLeftColor: c.index % 2 === 0 ? "#06B6D4" : "#F59E0B" }}
    >
      <div className="flex-[2] text-white text-sm">{c.ville}</div>
      <div className="flex-[2] text-white font-semibold text-sm">{c.cellule}</div>
      <div className="flex-[2] text-white font-medium text-sm">{c.responsable}</div>

      {/* Téléphone */}
      <div className="flex-[2] flex flex-col justify-center items-center relative text-sm">
        <p
          className="text-center text-sm text-orange-500 font-semibold underline cursor-pointer"
          onClick={() => setOpenPhoneMenu(!openPhoneMenu)}
        >
          {c.telephone || "—"}
        </p>
        {openPhoneMenu && (
          <div
            ref={phoneMenuRef}
            className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <a href={c.telephone ? `tel:${c.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
            <a href={c.telephone ? `sms:${c.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
            <a href={c.telephone ? `https://wa.me/${c.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
            <a href={c.telephone ? `https://wa.me/${c.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
          </div>
        )}
      </div>

      {/* Membres */}
      <div className="flex-[1] flex justify-center items-center text-sm text-white">
        {c.membre_count}
      </div>

      {/* Voir les membres */}
      <div className="flex-[1] flex justify-center items-center">
        {c.id && (
          <p
            className="text-sm underline text-orange-500"
            onClick={() => router.push(`/admin/cellules/${c.id}/membres`)}
          >
            Détails
          </p>
        )}
      </div>
    </div>
  );
}

export default function ListCellules() {
  const router = useRouter();
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedCellule, setSelectedCellule] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchCellules();
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

      if (role === "ResponsableCellule") query = query.eq("responsable_id", profile.id);

      const { data } = await query;

      const cellulesWithCount = await Promise.all(
        data.map(async (c, index) => {
          const { count } = await supabase
            .from("membres_complets")
            .select("id", { count: "exact", head: true })
            .eq("cellule_id", c.id)
            .eq("statut_suivis", 3);

          return { ...c, membre_count: count || 0, index };
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

  const canCreateResponsable = userRole === "Administrateur" || userRole === "SuperviseurCellule";
  const canCreateCellule = userRole === "Administrateur" || userRole === "SuperviseurCellule" || userRole === "ResponsableCellule";

  const handleUpdated = (updated) => {
    setCellules(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  if (loading) return <p className="text-center mt-10 text-lg text-white">Chargement...</p>;
  if (message) return <p className="text-center mt-10 text-red-600">{message}</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-4xl text-white text-center mb-4">Liste de Cellules</h1>

      {userRole && (
        <div className="max-w-5xl mx-auto mb-4 flex justify-end gap-4">
          {canCreateResponsable && (
            <button
              onClick={() => router.push("/admin/create-internal-user")}
              className="text-white font-semibold px-4 py-2 rounded shadow text-sm hover:shadow-lg transition"
            >
              ➕ Créer un responsable
            </button>
          )}
          {canCreateCellule && (
            <button
              onClick={() => router.push("/admin/create-cellule")}
              className="text-white font-semibold px-4 py-2 rounded shadow text-sm hover:shadow-lg transition"
            >
              ➕ Créer une cellule
            </button>
          )}
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto overflow-x-auto py-2">
        <div className="min-w-[700px] space-y-1">
          {/* Header */}
          <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
            <div className="flex-[2]">Zone / Ville</div>
            <div className="flex-[2]">Nom de la cellule</div>
            <div className="flex-[2]">Responsable</div>
            <div className="flex-[2]">Téléphone</div>
            <div className="flex-[1] flex justify-center items-center">Count</div>
            <div className="flex-[1] flex justify-center items-center">Actions</div>
          </div>

          {/* Lignes */}
          {cellules.length === 0 ? (
            <p className="text-white text-center mt-4">Aucune cellule</p>
          ) : (
            cellules.map(c => <CelluleRow key={c.id} c={c} router={router} />)
          )}

          {/* Modal */}
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
