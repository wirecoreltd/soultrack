// pages/membres-cellule.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [view, setView] = useState("card");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);
  const [editMember, setEditMember] = useState(null);
  const [viewDetailsMember, setViewDetailsMember] = useState(null); // popup lecture seule table

  useEffect(() => {
    fetchMembres();
  }, []);

  const fetchMembres = async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");
      if (!userEmail) throw new Error("Utilisateur non connecté");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, prenom, role")
        .eq("email", userEmail)
        .single();
      if (profileError) throw profileError;

      setPrenom(profileData.prenom || "cher membre");
      setRole(profileData.role);

      let membresQuery = supabase.from("v_membres_full").select("*");

      if (userRole.includes("ResponsableCellule")) {
        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id, cellule")
          .eq("responsable_id", profileData.id);

        const celluleIds = cellulesData.map(c => c.id);
        const celluleNoms = cellulesData.map(c => c.cellule);

        if (celluleIds.length > 0 || celluleNoms.length > 0) {
          const orConditions = [
            ...celluleIds.map(id => `cellule_id.eq.${id}`),
            ...celluleNoms.map(nom => `suivi_cellule_nom.eq.${nom}`)
          ].join(",");
          membresQuery = membresQuery.or(orConditions);
        } else {
          setMembres([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await membresQuery;
      if (error) throw error;

      setMembres(data || []);
    } catch (err) {
      console.error("❌ Erreur :", err);
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) => setDetailsOpen(prev => (prev === id ? null : id));

  const handleUpdateMember = (updatedMember) => {
    setMembres(prev =>
      prev.map(m => (m.id === updatedMember.id ? updatedMember : m))
    );
  };

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
              <div key={m.id} className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 overflow-hidden">
                <div className="p-4 flex flex-col items-center">
                  <h2 className="font-bold text-black text-base text-center mb-1">{m.prenom} {m.nom}</h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">📌 Cellule : {m.cellule_nom || m.suivi_cellule_nom || "—"}</p>
                  <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm mt-1">{detailsOpen === m.id ? "Fermer détails" : "Détails"}</button>
                </div>

                {detailsOpen === m.id && (
                  <div className="p-4 text-sm flex flex-col gap-1">
                    <p>Ville : {m.ville || "—"}</p>
                    <p>Infos supplémentaires : {m.infos_supplementaires || "—"}</p>
                    <button
                      className="mt-2 bg-orange-500 text-white rounded-xl py-2 px-4 text-sm hover:bg-orange-600"
                      onClick={() => setEditMember(m)}
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
                  <td className="px-4 py-2">{m.cellule_nom || m.suivi_cellule_nom || "—"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => setViewDetailsMember(m)}
                      className="text-orange-500 underline text-sm"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => setEditMember(m)}
                      className="text-green-500 underline text-sm"
                    >
                      ✏️ Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editMember && (
        <EditMemberCellulePopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={handleUpdateMember}
        />
      )}

      {/* POPUP DETAILS TABLE */}
      {viewDetailsMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-xl relative overflow-y-auto max-h-[95vh]">
            <button
              onClick={() => setViewDetailsMember(null)}
              className="absolute top-3 right-3 text-red-500 font-bold text-xl hover:text-red-700"
              aria-label="Fermer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-center mb-4">{viewDetailsMember.prenom} {viewDetailsMember.nom}</h2>
            <p>📞 Téléphone : {viewDetailsMember.telephone || "—"}</p>
            <p>📌 Cellule : {viewDetailsMember.cellule_nom || viewDetailsMember.suivi_cellule_nom || "—"}</p>
            <p>Ville : {viewDetailsMember.ville || "—"}</p>
            <p>Infos supplémentaires : {viewDetailsMember.infos_supplementaires || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
