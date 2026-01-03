"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");

  const [detailsSuivi, setDetailsSuivi] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchSuivis();
    fetchConseillers();
  }, []);

  /* ================= FETCH ================= */

  const fetchSuivis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .select(`
          *,
          cellules:cellule_id (id, cellule_full),
          evangelises:evangelise_id (*)
        `)
        .order("date_suivi", { ascending: false });

      if (error) throw error;
      setSuivis(data || []);
    } catch (err) {
      console.error("fetchSuivis:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConseillers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .eq("role", "Conseiller");

      if (error) throw error;
      setConseillers(data || []);
    } catch (err) {
      console.error("fetchConseillers:", err);
    }
  };

  /* ================= HELPERS ================= */

  const getBorderColor = (m) => {
    if (m.status_suivis_evangelises === "En cours") return "#FFA500";
    if (m.status_suivis_evangelises === "Integrer") return "#34A853";
    if (m.status_suivis_evangelises === "Venu à l’église") return "#3B82F6";
    return "#ccc";
  };

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const updateSuivi = async (id) => {
    const newComment = commentChanges[id];
    if (!newComment) return;

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .update({ commentaire_evangelises: newComment })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setSuivis((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
    } catch (err) {
      console.error("updateSuivi:", err);
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

  /* ================= RENDER ================= */

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

      {/* TOGGLE */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-sm font-semibold underline text-white"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ===================== VUE CARTE ===================== */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((m) => {
            const conseiller = conseillers.find(
              (c) => c.id === m.conseiller_id || c.id === m.responsable_cellule
            );

            const ouvert = detailsSuivi === m.id;

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
                  👤 Conseiller :{" "}
                  {conseiller
                    ? `${conseiller.prenom} ${conseiller.nom}`
                    : "—"}
                </p>
                <p className="text-sm text-center">
                  💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}
                </p>

                <button
                  onClick={() => setDetailsSuivi(ouvert ? null : m.id)}
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {ouvert ? "Fermer détails" : "Détails"}
                </button>

                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    ouvert ? "max-h-[1000px] mt-3" : "max-h-0"
                  }`}
                >
                  {ouvert && (
                    <div className="text-sm space-y-2">
                      <p>🏙️ Ville : {m.ville || "—"}</p>
                      <p>⚥ Sexe : {m.sexe || "—"}</p>
                      <p>🙏 Prière du salut : {m.priere_salut ? "Oui" : "Non"}</p>
                      <p>☀️ Type : {m.type_conversion || "—"}</p>
                      <p>❓ Besoin : {formatBesoin(m.besoin)}</p>
                      <p>
                        📝 Infos supplémentaires :{" "}
                        {m.infos_supplementaires || "—"}
                      </p>

                      <textarea
                        rows={2}
                        className="w-full border rounded px-2 py-1 mt-2"
                        placeholder="Ajouter un commentaire..."
                        value={
                          commentChanges[m.id] ??
                          m.commentaire_evangelises ??
                          ""
                        }
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
                        onClick={() => {
                          if (!m.evangelises) {
                            alert("❌ Aucun évangélisé lié");
                            return;
                          }
                          setEditingContact(m.evangelises);
                        }}
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

      {/* ===================== VUE TABLE ===================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl mx-auto">
          <div
            className="grid grid-cols-4 gap-3 px-4 py-3 text-sm font-semibold uppercase
                       bg-white/20 backdrop-blur rounded-t-xl"
            style={{ color: "#2E3192" }}
          >
            <div>Nom</div>
            <div>Téléphone</div>
            <div>Attribué à</div>
            <div>Actions</div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {suivis.map((m) => {
              const conseiller = conseillers.find(
                (c) => c.id === m.conseiller_id
              );

              return (
                <div
                  key={m.id}
                  className="grid grid-cols-4 gap-3 px-4 py-3 items-center
                             bg-white/10 backdrop-blur rounded-xl
                             border border-white/20 hover:bg-white/20 transition"
                >
                  <div>{m.prenom} {m.nom}</div>
                  <div>{m.telephone || "—"}</div>

                  <div className="whitespace-nowrap">
                    {m.cellules
                      ? `🏠 ${m.cellules.cellule_full}`
                      : conseiller
                      ? `👤 ${conseiller.prenom} ${conseiller.nom}`
                      : "—"}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        setDetailsSuivi(detailsSuivi === m.id ? null : m.id)
                      }
                      className="text-orange-400 underline text-sm"
                    >
                      {detailsSuivi === m.id
                        ? "Fermer détails"
                        : "Détails"}
                    </button>

                    <button
                      onClick={() => {
                        if (!m.evangelises) {
                          alert("❌ Aucun évangélisé lié");
                          return;
                        }
                        setEditingContact(m.evangelises);
                      }}
                      className="text-blue-400 underline text-sm"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== POPUP MODIFIER ===================== */}
      {editingContact && (
        <EditEvangelisePopup
          member={editingContact}
          onClose={() => {
            setEditingContact(null);
            setDetailsSuivi(null);
          }}
          onUpdateMember={() => {
            setEditingContact(null);
            setDetailsSuivi(null);
            fetchSuivis();
          }}
        />
      )}
    </div>
  );
}
