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
    const { data } = await supabase
      .from("suivis_des_evangelises")
      .select("*, cellules:cellule_id (id, cellule_full)")
      .order("date_suivi", { ascending: false });

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

    setUpdating((p) => ({ ...p, [id]: true }));

    const { data } = await supabase
      .from("suivis_des_evangelises")
      .update({ commentaire_evangelises: newComment })
      .eq("id", id)
      .select()
      .single();

    setSuivis((p) => p.map((s) => (s.id === id ? data : s)));
    setUpdating((p) => ({ ...p, [id]: false }));
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
      <button
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="text-white underline mb-6"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </button>

      {/* ===================== VUE CARTE ===================== */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((m) => {
            const conseiller = conseillers.find(
              (c) => c.id === m.conseiller_id || c.id === m.responsable_cellule
            );
            const ouvert = detailsSuivi?.id === m.id;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-lg p-4 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="font-bold text-center">
                  {m.prenom} {m.nom}
                </h2>
                <p className="text-sm text-center">📱 {m.telephone || "—"}</p>
                <p className="text-sm text-center">
                  🏠 {m.cellules?.cellule_full || "—"}
                </p>
                <p className="text-sm text-center">
                  👤 {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}
                </p>

                <button
                  onClick={() => setDetailsSuivi(ouvert ? null : m)}
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {ouvert ? "Fermer détails" : "Détails"}
                </button>

                {/* DÉTAILS – CARRÉ GRANDISSANT */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    ouvert ? "max-h-[800px] mt-3" : "max-h-0"
                  }`}
                >
                  {ouvert && (
                    <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2">
                      <p>🏙️ Ville : {m.ville || "—"}</p>
                      <p>⚥ Sexe : {m.sexe || "—"}</p>
                      <p>🙏 Prière salut : {m.priere_salut ? "Oui" : "Non"}</p>
                      <p>☀️ Type : {m.type_conversion || "—"}</p>
                      <p>❓ Besoin : {formatBesoin(m.besoin)}</p>

                      <textarea
                        rows={2}
                        className="w-full border rounded px-2 py-1"
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
                        className="w-full bg-green-600 text-white rounded py-1"
                      >
                        Mettre à jour
                      </button>

                      <button
                        onClick={() => setEditingContact(m)}
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

      {/* ===================== VUE TABLE (SANS <table>) ===================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl space-y-2">
          <div className="grid grid-cols-4 px-4 py-3 bg-white/20 backdrop-blur rounded-xl font-semibold">
            <div>Nom</div>
            <div>Téléphone</div>
            <div>Attribué à</div>
            <div>Actions</div>
          </div>

          {suivis.map((m) => {
            const conseiller = conseillers.find(
              (c) => c.id === m.conseiller_id
            );
            const ouvert = detailsSuivi?.id === m.id;

            return (
              <div key={m.id}>
                <div className="grid grid-cols-4 px-4 py-3 bg-white/10 rounded-xl">
                  <div>{m.prenom} {m.nom}</div>
                  <div>{m.telephone || "—"}</div>
                  <div>
                    {m.cellules
                      ? `🏠 ${m.cellules.cellule_full}`
                      : conseiller
                      ? `👤 ${conseiller.prenom} ${conseiller.nom}`
                      : "—"}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDetailsSuivi(ouvert ? null : m)}
                      className="text-orange-400 underline text-sm"
                    >
                      {ouvert ? "Fermer" : "Détails"}
                    </button>
                    <button
                      onClick={() => setEditingContact(m)}
                      className="text-blue-400 underline text-sm"
                    >
                      Modifier
                    </button>
                  </div>
                </div>

                {/* DÉTAILS */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    ouvert ? "max-h-[500px] mt-2" : "max-h-0"
                  }`}
                >
                  {ouvert && (
                    <div className="bg-white rounded-xl p-4 text-sm grid grid-cols-2 gap-3">
                      <p>🏙️ {m.ville || "—"}</p>
                      <p>⚥ {m.sexe || "—"}</p>
                      <p>🙏 {m.priere_salut ? "Oui" : "Non"}</p>
                      <p>☀️ {m.type_conversion || "—"}</p>
                      <p className="col-span-2">
                        ❓ {formatBesoin(m.besoin)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== POPUP MODIFIER ===================== */}
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
