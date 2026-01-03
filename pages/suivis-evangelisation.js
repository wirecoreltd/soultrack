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
  const [commentChanges, setCommentChanges] = useState({});

  useEffect(() => {
    fetchSuivis();
    fetchConseillers();
  }, []);

  /* ================= FETCH ================= */
  const fetchSuivis = async () => {
    const { data } = await supabase
      .from("suivis_des_evangelises")
      .select(`*, evangelises (*)`)
      .order("id", { ascending: false });

    setSuivis(data || []);
    setLoading(false);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("role", "Conseiller");

    setConseillers(data || []);
  };

  /* ================= HELPERS ================= */
  const getBorderColor = (m) => {
    if (m.status_suivis_evangelises === "En cours") return "#FFA500";
    if (m.status_suivis_evangelises === "Integrer") return "#34A853";
    if (m.status_suivis_evangelises === "Venu à l’église") return "#3B82F6";
    return "#ccc";
  };

  const handleCommentChange = (id, value) =>
    setCommentChanges((p) => ({ ...p, [id]: value }));

  const updateSuivi = async (id) => {
    const newComment = commentChanges[id];
    if (!newComment) return;

    await supabase
      .from("suivis_des_evangelises")
      .update({ commentaire_evangelises: newComment })
      .eq("id", id);

    fetchSuivis();
  };

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  /* ================= VIEW SWITCH ================= */
  const switchView = () => {
    setView(view === "card" ? "table" : "card");
    setDetailsSuivi(null);
    setEditingContact(null);
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-r from-blue-800 to-cyan-400">
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

      {/* TOGGLE */}
      <button
        onClick={switchView}
        className="text-white underline mb-6"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </button>

      {/* ===================== VUE CARTE ===================== */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((m) => {
            const ouvert = detailsSuivi?.id === m.id;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-lg p-4 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="font-bold text-center">
                  {m.evangelises?.prenom} {m.evangelises?.nom}
                </h2>

                <p className="text-sm text-center">
                  📱 {m.evangelises?.telephone || "—"}
                </p>

                <button
                  onClick={() => setDetailsSuivi(ouvert ? null : m)}
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {ouvert ? "Fermer détails" : "Détails"}
                </button>

                {/* CARRÉ GRANDISSANT */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    ouvert ? "max-h-[800px] mt-3" : "max-h-0"
                  }`}
                >
                  {ouvert && (
                    <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2">
                      <p>🏙️ Ville : {m.evangelises?.ville || "—"}</p>
                      <p>⚥ Sexe : {m.evangelises?.sexe || "—"}</p>
                      <p>🙏 Salut : {m.evangelises?.priere_salut ? "Oui" : "Non"}</p>
                      <p>☀️ Type : {m.evangelises?.type_conversion || "—"}</p>
                      <p>❓ Besoin : {formatBesoin(m.evangelises?.besoin)}</p>

                      <textarea
                        rows={2}
                        className="w-full border rounded px-2 py-1"
                        value={commentChanges[m.id] ?? m.commentaire_evangelises ?? ""}
                        onChange={(e) =>
                          handleCommentChange(m.id, e.target.value)
                        }
                      />

                      <button
                        onClick={() => updateSuivi(m.id)}
                        className="w-full bg-green-600 text-white rounded py-1"
                      >
                        Mettre à jour
                      </button>

                      <button
                        onClick={() =>
                          m.evangelises?.id &&
                          setEditingContact(m.evangelises)
                        }
                        className="text-blue-600 text-sm underline w-full"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== VUE TABLE ===================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="w-full bg-white/80 rounded-lg">
            <tbody>
              {suivis.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    {m.evangelises?.prenom} {m.evangelises?.nom}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailsSuivi(m)}
                      className="text-orange-600 underline"
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

      {/* ================= POPUPS (TABLE UNIQUEMENT) ================= */}
      {view === "table" && detailsSuivi && (
        <DetailsEvangePopup
          member={detailsSuivi}
          onClose={() => setDetailsSuivi(null)}
          onEdit={(s) => {
            setDetailsSuivi(null);
            s.evangelises?.id && setEditingContact(s.evangelises);
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
