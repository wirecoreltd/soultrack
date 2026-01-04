"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";
import MemberDetailsPopup from "../components/MemberDetailsPopup";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [view, setView] = useState("card");
  const [editingMember, setEditingMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

        if (!userEmail) throw new Error("Utilisateur non connecté");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("email", userEmail)
          .single();

        if (profileError) throw profileError;

        setPrenom(profileData?.prenom || "cher membre");
        const responsableId = profileData.id;

        let membresData = [];

        if (userRole.includes("Administrateur")) {
          const { data, error } = await supabase
            .from("v_membres_full")
            .select("*")
            .or("cellule_nom.not.is.null,suivi_cellule_nom.not.is.null");

          if (error) throw error;
          membresData = data;
        } else if (userRole.includes("ResponsableCellule")) {
          const { data, error } = await supabase
            .from("v_membres_full")
            .select("*")
            .or(
              `responsable_id.eq.${responsableId},suivi_responsable_id.eq.${responsableId}`
            );

          if (error) throw error;
          membresData = data;
        }

        // 🔒 AFFICHER UNIQUEMENT LES MEMBRES AVEC CELLULE
        membresData = (membresData || []).filter(
          (m) => m.cellule_nom || m.suivi_cellule_nom
        );

        setMembres(membresData);
      } catch (err) {
        console.error("❌ Erreur:", err.message || err);
        setMessage("Erreur lors de la récupération des membres.");
        setMembres([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCellules = async () => {
      const { data, error } = await supabase
        .from("cellules")
        .select("cellule_full");

      if (!error) setCellules(data || []);
    };

    fetchMembres();
    fetchCellules();
  }, []);

  const getCellule = (m) => m.cellule_nom || m.suivi_cellule_nom || "—";

  const getBorderColor = (m) => {
    if (m.statut === "actif") return "#34A853";
    if (m.statut === "inactif") return "#FFA500";
    return "#ccc";
  };

  const handleUpdateMember = (updated) => {
    setMembres((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const membresFiltres = membres.filter((m) => {
    if (!selectedCellule) return true;
    return (
      m.cellule_nom === selectedCellule ||
      m.suivi_cellule_nom === selectedCellule
    );
  });

  if (loading)
    return <p className="text-center mt-10 text-white">Chargement...</p>;
  if (message)
    return <p className="text-center mt-10 text-white">{message}</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="text-white hover:text-gray-200 transition"
        >
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} />

      <h1 className="text-3xl font-bold text-white mb-4">
        👥 Membres de ma/mes cellule(s)
      </h1>

      {/* FILTRE CELLULE */}
      <div className="mb-4 w-full max-w-6xl flex justify-end">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm"
        >
          <option value="">Toutes les cellules</option>
          {cellules.map((c) => (
            <option key={c.cellule_full} value={c.cellule_full}>
              {c.cellule_full}
            </option>
          ))}
        </select>
      </div>

      {/* SWITCH VIEW */}
      <button
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="text-white underline mb-6"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </button>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {membresFiltres.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-xl shadow-md border-l-4"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <h2 className="font-bold text-center">
                {m.prenom} {m.nom}
              </h2>
              <p className="text-sm text-center">📞 {m.telephone || "—"}</p>
              <p className="text-sm text-center">
                📌 Cellule : {getCellule(m)}
              </p>

              <button
                onClick={() =>
                  setSelectedMembre(selectedMembre === m.id ? null : m.id)
                }
                className="text-orange-500 text-sm block mx-auto mt-2"
              >
                {selectedMembre === m.id ? "Fermer détails" : "Détails"}
              </button>

              {selectedMembre === m.id && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Ville :</strong> {m.ville || "—"}</p>
                  <p><strong>WhatsApp :</strong> {m.is_whatsapp ? "Oui" : "Non"}</p>
                  <p><strong>Besoin :</strong> {m.besoin || "—"}</p>
                  <button
                    onClick={() => setEditingMember(m)}
                    className="text-orange-500 underline text-sm w-full"
                  >
                    ✏️ Modifier
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VUE TABLE */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="w-full bg-white text-sm rounded-lg shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">Téléphone</th>
                <th className="px-3 py-2">Cellule</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {membresFiltres.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="px-3 py-2">
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-3 py-2">{m.telephone || "—"}</td>
                  <td className="px-3 py-2">{getCellule(m)}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setEditingMember(m)}
                      className="text-blue-600 underline"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingMember && (
        <EditMemberCellulePopup
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onUpdateMember={handleUpdateMember}
        />
      )}

      {detailsMember && (
        <MemberDetailsPopup
          member={detailsMember}
          onClose={() => setDetailsMember(null)}
        />
      )}
    </div>
  );
}
