"use client";

// components/ExportMembrePDF.jsx
// Usage dans ListMembers ou SuiviPopup :
//   <ExportMembrePDF membre={m} suivis={suivis} celluleName="..." familleName="..." conseillerName="..." />
//
// Installation requise : npm install jspdf

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { generateMembrePDF } from "../utils/generateMembrePDF";

export default function ExportMembrePDF({
  membre,
  suivis = [],
  churchName = "Église",
  logoBase64 = null,   // optionnel — string base64 PNG du logo de l'église
  celluleName = null,
  familleName = null,
  conseillerName = null,
  className = "",      // classes Tailwind supplémentaires
  compact = false,     // true = icône seule (pour les cartes), false = icône + texte
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (e) => {
  e.stopPropagation();
  setLoading(true);

  try {
    // 🔥 Charger les vrais suivis
    const { data: suivisData, error } = await supabase
      .from("suivis")
      .select(`
        *,
        profiles (
          prenom,
          nom
        )
      `)
      .eq("membre_id", membre.id)
      .order("date_action", { ascending: false });

    if (error) throw error;

    await generateMembrePDF(membre, suivisData || [], {
      churchName,
      logoBase64,
      celluleName,
      familleName,
      conseillerName,
    });

  } catch (err) {
    console.error("Erreur export PDF :", err);
    alert("Impossible de générer le PDF.");
  } finally {
    setLoading(false);
  }
};

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      title="Exporter la fiche en PDF"
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        compact
          ? "w-8 h-8 text-base bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300"
          : "px-3 py-1.5 text-xs bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300 text-red-600",
        className,
      ].join(" ")}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {!compact && <span>Génération...</span>}
        </>
      ) : (
        <>
          <img src ="/pdf.png" alt="PDF" width={15} height={15}/>         
        </>
      )}
    </button>
  );
}
