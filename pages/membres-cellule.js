// pages/membres-cellule.js

"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [view, setView] = useState("card");

  useEffect(() => {
    fetchMembres();
  }, []);

  const fetchMembres = async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");
      if (!userEmail) throw new Error("Utilisateur non connecté");

      // Récupérer info profil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, prenom, role")
        .eq("email", userEmail)
        .single();
      if (profileError) throw profileError;

      let membresData = [];

      if (userRole.includes("ResponsableCellule")) {
        // Récupérer les cellules du responsable
        const { data: cellulesData, error: cellulesError } = await supabase
          .from("cellules")
          .select("id, cellule")
          .eq("responsable_id", profileData.id);
        if (cellulesError) throw cellulesError;

        const celluleIds = cellulesData.map(c => c.id);
        const celluleNoms = cellulesData.map(c => c.cellule);

        if (celluleIds.length === 0 && celluleNoms.length === 0) {
          setMembres([]);
          setLoading(false);
          return;
        }

        // Construire les conditions OR pour les membres liés à ces cellules
        const orConditions = [
          ...celluleIds.map(id => `cellule_id.eq.${id}`),
          ...celluleNoms.map(nom => `suivi_cellule_nom.eq.${nom}`)
        ].join(",");

        // Récupérer uniquement les membres ayant une cellule
        const { data, error } = await supabase
          .from("v_membres_full")
          .select("*")
          .or(orConditions)
          .not("cellule_id", "is", null)
          .not("suivi_cellule_nom", "is", null);

        if (error) throw error;

        membresData = (data || []).map(m => ({
          ...m,
          cellule_affichee: m.cellule_nom || m.suivi_cellule_nom || "—"
        }));
      }

      setMembres(membresData);
    } catch (err) {
      console.error("❌ Erreur :", err);
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) => setDetailsOpen(prev => (prev === id ? null : id));

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-r from-blue-700 to-cyan-400">
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white hover:text-gray-200 transition">← Retour</button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📋 Membres de ma cellule</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">Liste des membres associés à votre(s) cellule(s)</p>
      </div>

      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline hover:text-gray-200">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {loading ? (
        <p className="text-white">Chargement...</p>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {membres.length === 0 ? (
            <p className="text-white">Aucun membre à afficher.</p>
          ) : (
            membres.map(m => (
              <div key={m.id} className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl overflow-hidden">
                <div className="p-4 flex flex-col items-center">
                  <h2 className="font-bold text-black text-base text-center mb-1">{m.prenom} {m.nom}</h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">📌 Cellule : {m.cellule_affichee}</p>
                  <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-1">
                    {detailsOpen === m.id ? "Fermer détails" : "Détails"}
                  </button>
                </div>

                {detailsOpen === m.id && (
                  <div className="p-4 text-sm">
                    <p>Ville : {m.ville || "—"}</p>
                    <p>Infos supplémentaires : {m.infos_supplementaires || "—"}</p>
                    <button
                      onClick={() => setEditMember(m)}
                      className="mt-2 text-blue-600 underline"
                    >
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="w-full max-w-6xl overflow-x-auto flex justify-center">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Cellule</th>
                <th className="px-4 py-2 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {membres.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-2 text-white text-center">Aucun membre</td></tr>
              ) : membres.map(m => (
                <tr key={m.id} className="hover:bg-white/10 transition duration-150">
                  <td className="px-4 py-2">{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.cellule_affichee}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => setEditMember(m)}
                      className="text-blue-600 underline text-sm"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => toggleDetails(m.id)}
                      className="text-orange-500 underline text-sm"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editMember && (
        <EditMemberCellulePopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => {
            setMembres(prev => prev.map(m => (m.id === updated.id ? updated : m)));
            setEditMember(null);
          }}
        />
      )}
    </div>
  );
}
