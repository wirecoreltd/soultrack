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
  const [view, setView] = useState("card");

  const [detailsSuivi, setDetailsSuivi] = useState(null);
  const [editingEvangelise, setEditingEvangelise] = useState(null);

  useEffect(() => {
    fetchSuivis();
    fetchConseillers();
  }, []);

  /* ================= FETCH ================= */

  const fetchSuivis = async () => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select(`
        *,
        evangelises (*),
        cellules (cellule_full)
      `)
      .order("id", { ascending: false });

    if (!error) setSuivis(data || []);
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

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  const openEditFromSuivi = (suivi) => {
    if (!suivi.evangelises?.id) {
      alert("❌ Aucun évangélisé lié à ce suivi");
      return;
    }
    setEditingEvangelise(suivi.evangelises);
  };

  /* ================= RENDER ================= */

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => history.back()} className="text-white">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <div className="text-center mb-6">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-white mt-4">
          📋 Suivis des Évangélisés
        </h1>
      </div>

      {/* TOGGLE */}
      <div className="text-center mb-6">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white underline"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* ===================== VUE CARTE ===================== */}
{view === "card" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

          <p className="text-sm text-center">
            🏠 {m.cellules?.cellule_full || "—"}
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
                <p>🏙️ Ville : {m.evangelises?.ville || "—"}</p>
                <p>⚥ Sexe : {m.evangelises?.sexe || "—"}</p>
                <p>🙏 Prière salut : {m.evangelises?.priere_salut ? "Oui" : "Non"}</p>
                <p>☀️ Type : {m.evangelises?.type_conversion || "—"}</p>
                <p>❓ Besoin : {formatBesoin(m.evangelises?.besoin)}</p>

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
                  onClick={() => {
                    if (m.evangelises?.id) {
                      setEditingContact(m.evangelises);
                    }
                  }}
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
        <div className="overflow-x-auto bg-white/20 rounded-xl p-4">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="text-white uppercase">
              <tr>
                <th className="p-2 text-left">Nom</th>
                <th className="p-2 text-left">Téléphone</th>
                <th className="p-2 text-left">Cellule</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {suivis.map((s) => (
                <tr key={s.id} className="bg-white/80 rounded">
                  <td className="p-2">
                    {s.evangelises?.prenom} {s.evangelises?.nom}
                  </td>
                  <td className="p-2">
                    {s.evangelises?.telephone || "—"}
                  </td>
                  <td className="p-2">
                    {s.cellules?.cellule_full || "—"}
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => setDetailsSuivi(s)}
                      className="text-orange-600 underline"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => openEditFromSuivi(s)}
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

      {/* ===================== POPUP DETAILS ===================== */}
      {detailsSuivi && (
        <DetailsEvangePopup
          member={detailsSuivi.evangelises}
          onClose={() => setDetailsSuivi(null)}
          onEdit={() => {
            openEditFromSuivi(detailsSuivi);
            setDetailsSuivi(null);
          }}
        />
      )}

      {/* ===================== POPUP MODIFIER ===================== */}
      {editingEvangelise && (
        <EditEvangelisePopup
          member={editingEvangelise}
          onClose={() => setEditingEvangelise(null)}
          onUpdateMember={(updated) => {
            setEditingEvangelise(null);
            setSuivis((prev) =>
              prev.map((s) =>
                s.evangelise_id === updated.id
                  ? { ...s, evangelises: updated }
                  : s
              )
            );
          }}
        />
      )}
    </div>
  );
}
