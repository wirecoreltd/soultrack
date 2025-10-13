//pages/suivis-membres.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);

  // --- récupérer les suivis existants ---
  const fetchSuivis = async () => {
    const { data, error } = await supabase
      .from("suivis_membres")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors du chargement des suivis:", error.message);
      return;
    }
    setSuivis(data || []);
  };

  // --- écouter les changements en temps réel ---
  useEffect(() => {
    fetchSuivis();

    const channel = supabase
      .channel("realtime_suivis_membres")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suivis_membres" },
        (payload) => {
          console.log("🟢 Realtime event:", payload);
          setSuivis((prev) => {
            if (payload.eventType === "INSERT") {
              return [payload.new, ...prev];
            } else if (payload.eventType === "UPDATE") {
              return prev.map((s) =>
                s.id === payload.new.id ? payload.new : s
              );
            } else if (payload.eventType === "DELETE") {
              return prev.filter((s) => s.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div
      className="min-h-screen p-6 flex flex-col items-center"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <h1 className="text-4xl sm:text-5xl font-handwriting text-white mb-4 text-center">
        Suivis des Membres
      </h1>

      {suivis.length === 0 ? (
        <p className="text-white text-lg italic">
          Aucun suivi pour le moment...
        </p>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suivis.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-md p-4 border-t-4 border-blue-500 flex flex-col justify-between"
              style={{ minHeight: "200px" }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                {s.prenom} {s.nom}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                📱 {s.telephone || "—"}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                🙏 Besoin : {s.besoin || "—"}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                🏠 Cellule : {s.cellule_nom || "—"}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                👤 Responsable : {s.responsable || "—"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ⏰ Ajouté le{" "}
                {new Date(s.created_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

