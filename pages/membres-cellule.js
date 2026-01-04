// pages/membres-cellule.js
"use client";

import { useState } from "react";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberPopup from "../components/EditMemberPopup";
import MemberDetailsPopup from "../components/MemberDetailsPopup";
import { useMembers } from "../context/MembersContext";

export default function MembresCellule() {
  const { members, updateMember } = useMembers(); // source globale
  const [filterCellule, setFilterCellule] = useState("");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [view, setView] = useState("card");

  // Membres filtrés par cellule et seulement ceux avec une cellule assignée
  const filteredMembres = members.filter(
    (m) => m.cellule_id && (!filterCellule || m.cellule_id === filterCellule)
  );

  const getCelluleName = (m) => m.cellule_full || "—";

  const getBorderColor = (m) => {
    const status = m.statut || "";
    if (status === "actif") return "#34A853";
    if (status === "inactif") return "#FFA500";
    return "#ccc";
  };

  const handleUpdateMember = (updated) => {
    updateMember(updated); // met à jour le contexte global
    setEditMember(null);
  };

  // Collecte unique des cellules pour le filtre
  const cellulesOptions = Array.from(
    new Map(
      members
        .filter((m) => m.cellule_id && m.cellule_full)
        .map((m) => [m.cellule_id, m.cellule_full])
    ).values()
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white hover:text-gray-200 transition">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-6" />

      <h1 className="text-3xl font-bold text-white mb-4">👥 Membres de mes cellules</h1>

      {/* Filtre par cellule */}
      <div className="mb-4 w-full max-w-6xl">
        <select
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
          className="px-3 py-2 rounded-lg w-full max-w-xs"
        >
          <option value="">Toutes les cellules</option>
          {cellulesOptions.map((c, idx) => (
            <option key={idx} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Toggle Carte/Table */}
      <div className="mb-4 w-full max-w-6xl flex justify-end">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {filteredMembres.length === 0 && (
            <p className="text-white text-center col-span-3">Aucun membre trouvé</p>
          )}

          {filteredMembres.map((m) => {
            const isOpen = selectedMembre === m.id;
            const besoins = (() => {
              if (!m.besoin) return "—";
              if (Array.isArray(m.besoin)) return m.besoin.join(", ");
              try {
                const arr = JSON.parse(m.besoin);
                return Array.isArray(arr) ? arr.join(", ") : m.besoin;
              } catch {
                return m.besoin;
              }
            })();

            return (
              <div
                key={m.id}
                className="bg-white p-4 rounded-xl shadow-md border-l-4 w-full transition hover:shadow-lg"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="font-bold text-black text-base text-center mb-1">{m.prenom} {m.nom}</h2>
                <p className="text-sm text-gray-700 text-center mb-1">📞 {m.telephone || "—"}</p>
                <p className="text-sm text-gray-700 text-center mb-2">📌 Cellule : {getCelluleName(m)}</p>

                <button
                  onClick={() => setSelectedMembre(isOpen ? null : m.id)}
                  className="text-orange-500 text-sm block mx-auto mb-2"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-black text-sm mt-2 w-full space-y-1">
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>⚥ Sexe : {m.sexe || "—"}</p>
                    <p>❓ Besoin : {besoins}</p>
                    <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                    <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                    <p>🧩 Raison de la venue : {m.statut_initial || "—"}</p>
                    <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>

                    <button
                      onClick={() => setEditMember(m)}
                      className="text-blue-600 text-sm mt-2 w-full"
                    >
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VUE TABLE */}
      {view === "table" && (
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
              {filteredMembres.length === 0 && (
                <tr><td colSpan={4} className="text-white text-center">Aucun membre trouvé</td></tr>
              )}
              {filteredMembres.map((m) => (
                <tr key={m.id} className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: getBorderColor(m) }}>{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{getCelluleName(m)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedMembre(m.id)}
                        className="text-orange-500 underline text-sm"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => setEditMember(m)}
                        className="text-blue-600 underline text-sm"
                      >
                        Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={handleUpdateMember}
        />
      )}

      {/* POPUP DETAILS */}
      {selectedMembre && (
        <MemberDetailsPopup
          member={members.find(m => m.id === selectedMembre)}
          onClose={() => setSelectedMembre(null)}
        />
      )}
    </div>
  );
}
