//pages/suivis-membres.js//
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});
  const [commentaire, setCommentaire] = useState({});
  const [viewList, setViewList] = useState("principale");

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    try {
      const { data, error } = await supabase
        .from("suivis_membres")
        .select(`
          id,
          statut_suivi,
          commentaire,
          membre_id (
            id,
            nom,
            prenom,
            statut,
            besoin,
            infos_supplementaires,
            cellule_id,
            comment
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuivis(data || []);
    } catch (err) {
      console.error("Erreur fetchSuivis:", err.message);
      setSuivis([]);
    }
  };

  const handleStatusUpdate = async (suiviId) => {
    const newStatus = selectedStatus[suiviId];
    const newComment = commentaire[suiviId] || "";
    if (!newStatus) return;

    try {
      await supabase
        .from("suivis_membres")
        .update({ statut_suivi: newStatus, commentaire: newComment })
        .eq("id", suiviId);

      // Mise à jour locale immédiate sans recharger
      setSuivis((prev) =>
        prev.map((s) =>
          s.id === suiviId ? { ...s, statut_suivi: newStatus, commentaire: newComment } : s
        )
      );

      // Supprime automatiquement de la liste principale si Refus ou Intégré
      if (newStatus === "Refus" || newStatus === "Intégré") {
        setSuivis((prev) => prev.filter((s) => s.id !== suiviId));
      }

      // Reset les inputs
      setSelectedStatus((prev) => ({ ...prev, [suiviId]: "" }));
      setCommentaire((prev) => ({ ...prev, [suiviId]: "" }));
      setDetailsOpen((prev) => ({ ...prev, [suiviId]: false }));
    } catch (err) {
      console.error("Erreur update statut:", err.message);
    }
  };

  const filteredSuivis = suivis.filter((s) => {
    if (viewList === "principale") return s.statut_suivi !== "Refus" && s.statut_suivi !== "Intégré";
    if (viewList === "refus") return s.statut_suivi === "Refus";
    if (viewList === "integre") return s.statut_suivi === "Intégré";
    return true;
  });

  const otherViews = [];
  if (viewList === "principale") otherViews.push("Refus", "Intégré");
  if (viewList === "refus") otherViews.push("Principale", "Intégré");
  if (viewList === "integre") otherViews.push("Principale", "Refus");

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-indigo-600 to-blue-400">
      <h1 className="text-4xl text-white font-handwriting mb-4">Suivis Membres 📋</h1>

      <div className="mb-4 flex gap-4">
        {otherViews.map((v) => (
          <p
            key={v}
            className="text-orange-500 cursor-pointer"
            onClick={() => setViewList(v.toLowerCase().replace("é", "e"))}
          >
            {v}
          </p>
        ))}
      </div>

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Nom</th>
              <th className="py-2 px-4">Prénom</th>
              <th className="py-2 px-4">Statut</th>
              <th className="py-2 px-4">Statut Suivis</th>
              <th className="py-2 px-4">Détails</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuivis.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-gray-600">
                  Aucun contact trouvé.
                </td>
              </tr>
            ) : (
              filteredSuivis.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2 px-4">{s.membre_id.nom || "—"}</td>
                  <td className="py-2 px-4">{s.membre_id.prenom || "—"}</td>
                  <td className="py-2 px-4">{s.membre_id.statut || "—"}</td>
                  <td className="py-2 px-4">{s.statut_suivi || "—"}</td>
                  <td className="py-2 px-4">
                    <p
                      className="text-blue-500 underline cursor-pointer"
                      onClick={() =>
                        setDetailsOpen((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                      }
                    >
                      {detailsOpen[s.id] ? "Fermer détails" : "Détails"}
                    </p>
                    {detailsOpen[s.id] && (
                      <div className="mt-2 text-sm text-left text-gray-700 space-y-1">
                        <p><strong>Besoin:</strong> {s.membre_id.besoin || "—"}</p>
                        <p><strong>Infos supplémentaires:</strong> {s.membre_id.infos_supplementaires || "—"}</p>
                        <p><strong>Comment est-il venu ?</strong> {s.membre_id.comment || "—"}</p>
                        <p><strong>Cellule:</strong> {s.membre_id.cellule_id || "—"}</p>

                        <textarea
                          placeholder="Ajouter un commentaire"
                          value={commentaire[s.id] || ""}
                          onChange={(e) =>
                            setCommentaire((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                        />

                        <select
                          value={selectedStatus[s.id] || ""}
                          onChange={(e) =>
                            setSelectedStatus((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                        >
                          <option value="">-- Statut Suivis --</option>
                          <option value="En cours">En cours</option>
                          <option value="Intégré">Intégré</option>
                          <option value="Refus">Refus</option>
                        </select>

                        <button
                          onClick={() => handleStatusUpdate(s.id)}
                          className="mt-1 py-2 bg-orange-500 text-white rounded-xl font-semibold"
                        >
                          Valider
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
