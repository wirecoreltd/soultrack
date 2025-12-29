"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  const [detailsSuivi, setDetailsSuivi] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [checkedContacts, setCheckedContacts] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchSuivis();
    fetchConseillers();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("suivis_des_evangelises")
        .select("*, cellules:cellule_id (id, cellule_full, responsable)")
        .order("date_suivi", { ascending: false });
      setSuivis(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConseillers = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");
      setConseillers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getBorderColor = (m) => {
    if (m.status_suivis_evangelises === "En cours") return "#FFA500";
    if (m.status_suivis_evangelises === "Integrer") return "#34A853";
    if (m.status_suivis_evangelises === "Venu à l’église") return "#3B82F6";
    return "#ccc";
  };

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

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

  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} />
      <h1 className="text-3xl font-bold text-white mb-6">
        📋 Suivis des Évangélisés
      </h1>

      {/* Toggle Vue Carte / Table */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-sm font-semibold underline text-white"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((m) => {
            const conseiller = conseillers.find(
              (c) => c.id === m.responsable_cellule
            );
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-lg p-4 border-l-4 transition-all"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="font-bold text-center">
                  {m.prenom} {m.nom}
                </h2>
                <p className="text-sm text-center">📱 {m.telephone || "—"}</p>
                <p className="text-sm text-center">
                  🏠 Cellule : {m.cellules?.cellule_full || "—"}
                </p>
                <p className="text-sm text-center">
                  👤 Conseiller : {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}
                </p>


                <button
                  onClick={() =>
                    setDetailsSuivi(detailsSuivi === m.id ? null : m.id)
                  }
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {detailsSuivi === m.id ? "Fermer détails" : "Détails"}
                </button>

                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    detailsSuivi === m.id ? "max-h-[1000px] mt-3" : "max-h-0"
                  }`}
                >
                  {detailsSuivi === m.id && (
                    <div className="text-sm space-y-2">
                      <p>🏙️ Ville : {m.ville || "—"}</p>
                      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>⚥ Sexe : {m.sexe || "—"}</p>
                      <p>🙏 Prière du salut : {m.priere_salut ? "Oui" : "Non"}</p>
                      <p>☀️ Type : {m.type_conversion || "—"}</p>
                      <p>❓ Besoin : {formatBesoin(m.besoin)}</p>
                      <p>📝 Infos supplémentaires : {m.infos_supplementaires || "—"}</p>

                      <textarea
                        rows={2}
                        className="w-full border rounded px-2 py-1 mt-2"
                        placeholder="Ajouter un commentaire..."
                        value={commentChanges[m.id] ?? m.commentaire_evangelises ?? ""}
                        onChange={(e) =>
                          handleCommentChange(m.id, e.target.value)
                        }
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
              </div>
            );
          })}
        </div>
      )}

      {/* VUE TABLE */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left border-separate border-spacing-0 table-auto bg-white rounded-lg">
            <thead className="text-sm uppercase">
              <tr className="bg-gray-200">
                <th className="px-1 py-1 rounded-tl-lg text-left" style={{ color: "#2E3192" }}>
                  Nom complet
                </th>
                <th className="px-1 py-1 text-left" style={{ color: "#2E3192" }}>Téléphone</th>
                <th className="px-1 py-1 text-left" style={{ color: "#2E3192" }}>Cellule</th>
                <th className="px-1 py-1 text-left" style={{ color: "#2E3192" }}>Conseiller</th>
                <th className="px-1 py-1 rounded-tr-lg text-left" style={{ color: "#2E3192" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((m) => {
                const conseiller = conseillers.find(
                  (c) => c.id === m.responsable_cellule
                );
                return (
                  <tr key={m.id} className="border-b border-gray-300">
                    <td className="px-1 py-1">{m.prenom} {m.nom}</td>
                    <td className="px-1 py-1">{m.telephone || "—"}</td>
                    <td className="px-1 py-1">{m.cellules?.cellule_full || "—"}</td>
                    <td className="px-1 py-1">
                      {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}
                    </td>
                    <td className="px-1 py-1 flex items-center gap-2">
                      <button
                        onClick={() => setDetailsSuivi(m)}
                        className="text-orange-500 underline text-sm"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => setEditingContact(m)}
                        className="text-blue-600 underline text-sm"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP DÉTAILS (VUE TABLE) */}
      {detailsSuivi && typeof detailsSuivi === "object" && (
        <DetailsEvangePopup
          member={detailsSuivi}
          onClose={() => setDetailsSuivi(null)}
          onEdit={(m) => {
            setDetailsSuivi(null);
            setEditingContact(m);
          }}
        />
      )}

      {/* POPUP MODIFIER */}
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
