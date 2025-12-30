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

  useEffect(() => {
    fetchSuivis();
    fetchConseillers();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("suivis_des_evangelises")
        .select("*, cellules:cellule_id (id, cellule_full)")
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

      {/* Toggle Vue */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-6">
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
                  onClick={() => setDetailsSuivi(m)}
                  className="text-orange-500 underline text-sm block mx-auto mt-3"
                >
                  Détails
                </button>

                <button
                  onClick={() => setEditingContact(m)}
                  className="text-blue-600 text-sm block mx-auto mt-2"
                >
                  ✏️ Modifier
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== VUE TABLE (SANS TABLE) ===================== */}
      {view === "table" && (
        <div className="w-full max-w-6xl mx-auto">
          {/* En-tête */}
          <div
            className="grid grid-cols-4 gap-3 px-4 py-3
                       bg-white/20 backdrop-blur
                       rounded-t-xl
                       text-sm font-semibold uppercase"
            style={{ color: "#2E3192" }}
          >
            <div>Nom</div>
            <div>Téléphone</div>
            <div>Attribué à</div>
            <div>Actions</div>
          </div>

          {/* Lignes */}
          <div className="flex flex-col gap-2 mt-2">
            {suivis.map((m) => {
              const conseiller = conseillers.find(
                (c) => c.id === m.conseiller_id
              );

              return (
                <div
                  key={m.id}
                  className="grid grid-cols-4 gap-3 px-4 py-3 items-center
                             bg-white/10 backdrop-blur
                             rounded-xl border border-white/20
                             hover:bg-white/20 transition"
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
                      onClick={() => setDetailsSuivi(m)}
                      className="text-orange-400 underline text-sm"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => setEditingContact(m)}
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

      {/* ===================== POPUP DETAILS ===================== */}
      {detailsSuivi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/40 backdrop-blur-sm"
          onClick={() => setDetailsSuivi(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl
                       w-[90%] max-w-xl p-6
                       animate-[zoomIn_0.4s_ease-out]"
          >
            <DetailsEvangePopup
              member={detailsSuivi}
              onClose={() => setDetailsSuivi(null)}
            />
          </div>
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
