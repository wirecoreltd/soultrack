"use client";

import { useEffect, useState } from "react";
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
        .select(`id, cellule, ville, responsable, telephone, responsable_id`)
        .order("ville", { ascending: true });

      if (role === "ResponsableCellule") {
        query = query.eq("responsable_id", profile.id);
      }

      const { data } = await query;
      setCellules(data || []);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la récupération des cellules.");
    } finally {
      setLoading(false);
    }
  };

  const canCreateResponsable =
    userRole === "Administrateur" || userRole === "SuperviseurCellule";

  const canCreateCellule =
    userRole === "Administrateur" ||
    userRole === "SuperviseurCellule" ||
    userRole === "ResponsableCellule";

  const handleUpdated = (updated) => {
    setCellules((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  if (loading)
    return <p className="text-center mt-10 text-lg text-white">Chargement...</p>;
  if (message)
    return <p className="text-center mt-10 text-red-600">{message}</p>;

  return (
    <div className="min-h-screen p-6 bg-[#333699]">

      <HeaderPages />

      <h1 className="text-4xl text-white text-center mb-4">Liste de Cellules</h1>

      {/* 🔘 BOUTONS */}
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

      {/* 📋 Table Visuelle */}
<div className="w-full max-w-5xl mx-auto overflow-x-auto py-2">
  <div className="min-w-[700px] space-y-2">

    {/* Header */}
    <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
      <div className="flex-[2]">Zone / Ville</div>
      <div className="flex-[2]">Nom de la cellule</div>
      <div className="flex-[2]">Responsable</div>
      <div className="flex-[2]">Téléphone</div>
      <div className="flex-[1] flex justify-center items-center">Actions</div>
    </div>

    {/* Lignes */}
    {(cellules.length === 0 ? [{ville: "—", cellule: "—", responsable: "—", telephone: "—"}] : cellules).map((c, index) => (
      <div
        key={index}
        className={`flex flex-row items-center px-2 py-2 rounded-lg ${
          index % 2 === 0 ? "bg-white/10" : "bg-white/20"
        } transition duration-150 gap-2 border-l-4`}
        style={{ borderLeftColor: index % 2 === 0 ? "#06B6D4" : "#F59E0B" }}
      >
        <div className="flex-[2] text-white">{c.ville}</div>
        <div className="flex-[2] text-white font-semibold">{c.cellule}</div>
        <div className="flex-[2] text-white font-medium">{c.responsable}</div>
        <div className="flex-[2] text-white">{c.telephone}</div>
        <div className="flex-[1] flex justify-center items-center">
          <button
            onClick={() => c.id && setSelectedCellule(c)}
            className="text-blue-600 hover:text-blue-800 text-xl"
            title="Modifier"
          >
            ✏️
          </button>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ✏️ MODAL */}
      {selectedCellule && (
        <EditCelluleModal
          cellule={selectedCellule}
          onClose={() => setSelectedCellule(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
