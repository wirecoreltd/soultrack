"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SuiviDetailsEvanPopup from "../components/SuiviDetailsEvanPopup";
import EditEvangelisePopup from "../components/EditEvangelisePopup";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  const [detailsSuiviId, setDetailsSuiviId] = useState(null); // Carte
  const [detailsSuivi, setDetailsSuivi] = useState(null); // Table
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchConseillers();
    fetchSuivis();
  }, []);

  const fetchConseillers = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, prenom")
        .eq("role", "Conseiller");
      setConseillers(data || []);
    } catch (err) {
      console.error("Erreur fetch conseillers:", err);
    }
  };

  const fetchSuivis = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("suivis_des_evangelises")
        .select("*, cellules:cellule_id(id, cellule_full, responsable)")
        .order("date_suivi", { ascending: false });
      setSuivis(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getConseillerName = (responsableId) => {
    const c = conseillers.find((c) => c.id === responsableId);
    return c ? c.prenom : "—";
  };

  const updateSuivi = async (id) => {
    const newComment = commentChanges[id];
    if (!newComment) return;
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const { data } = await supabase
        .from("suivis_des_evangelises")
        .update({ commentaire_evangelises: newComment })
        .eq("id", id)
        .select()
        .single();
      setSuivis((prev) => prev.map((s) => (s.id === id ? data : s)));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-[#2E3192] to-[#92EFFD]">
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white">← Retour</button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} />
      <h1 className="text-3xl font-bold text-white mb-6">📋 Suivis des Évangélisés</h1>

      <button
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="text-white underline mb-4"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </button>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-lg p-4 border-l-4 transition-all"
              style={{ borderLeftColor: "#34A853" }}
            >
              <h2 className="font-bold text-center">{m.prenom} {m.nom}</h2>
              <p className="text-sm text-center">📱 {m.telephone || "—"}</p>
              <p className="text-sm text-center">🏠 Cellule : {m.cellules?.cellule_full || "—"}</p>
              <p className="text-sm text-center">👤 Conseiller : {getConseillerName(m.cellules?.responsable)}</p>

              <button
                onClick={() => setDetailsSuiviId(detailsSuiviId === m.id ? null : m.id)}
                className="text-orange-500 underline text-sm block mx-auto mt-2"
              >
                {detailsSuiviId === m.id ? "Fermer détails" : "Détails"}
              </button>

              {detailsSuiviId === m.id && (
                <div className="text-sm space-y-2 mt-3">
                  <p>🏙️ Ville : {m.ville || "—"}</p>
                  <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                  <textarea
                    rows={2}
                    className="w-full border rounded px-2 py-1 mt-2"
                    value={commentChanges[m.id] ?? m.commentaire_evangelises ?? ""}
                    onChange={(e) => setCommentChanges({ ...commentChanges, [m.id]: e.target.value })}
                  />
                  <button
                    onClick={() => updateSuivi(m.id)}
                    className="w-full bg-green-600 text-white rounded py-1 mt-2"
                  >
                    Mettre à jour
                  </button>
                  <button
                    onClick={() => setEditingContact(m)}
                    className="text-blue-600 text-sm text-center mt-3 w-full"
                  >
                    ✏️ Modifier le contact
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
          <table className="w-full text-sm text-left border-separate border-spacing-0 table-auto">
            <thead className="text-sm uppercase bg-gray-200">
              <tr>
                <th className="px-1 py-1 text-left">Nom complet</th>
                <th className="px-1 py-1 text-left">Téléphone</th>
                <th className="px-1 py-1 text-left">Cellule</th>
                <th className="px-1 py-1 text-left">Conseiller</th>
                <th className="px-1 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((m) => (
                <tr key={m.id} className="border-b border-gray-300">
                  <td className="px-1 py-1">{m.prenom} {m.nom}</td>
                  <td className="px-1 py-1">{m.telephone || "—"}</td>
                  <td className="px-1 py-1">{m.cellules?.cellule_full || "—"}</td>
                  <td className="px-1 py-1">{getConseillerName(m.cellules?.responsable)}</td>
                  <td className="px-1 py-1">
                    <button
                      onClick={() => setDetailsSuivi(detailsSuivi?.id === m.id ? null : m)}
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsSuivi?.id === m.id ? "Fermer détails" : "Détails"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailsSuivi && (
        <SuiviDetailsEvanPopup
          member={detailsSuivi}
          onClose={() => setDetailsSuivi(null)}
          onEdit={(m) => {
            setDetailsSuivi(null);
            setEditingContact(m);
          }}
        />
      )}

      {editingContact && (
        <EditEvangelisePopup
          member={editingContact}
          onClose={() => setEditingContact(null)}
          onUpdateMember={() => {
            setEditingContact(null);
            fetchSuivis();
          }}
        />
      )}
    </div>
  );
}
