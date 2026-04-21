"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import Papa from "papaparse";

export default function ImportMembresCSV({ user }) {
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const requiredFields = ["nom", "prenom", "sexe", "age", "date_venu"];

  const parseDate = (value) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{2}-\d{2}-\d{2}$/.test(value)) {
      const [dd, mm, yy] = value.split("-");
      return `20${yy}-${mm}-${dd}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split("/");
      return `${yyyy}-${mm}-${dd}`;
    }
    return null;
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "nom *", "prenom *", "civilite *", "age *", "date_venu *",
      "telephone", "ville",
      "bapteme_eau", "bapteme_esprit",
      "serviteur",
      "infos_supplementaires",
    ];

    const example = [
      "Dupont", "Marie", "Femme", "18-25 ans", "2026-01-15",
      "59700000", "Curepipe",
      "Oui", "Non",
      "Oui",
      "Info supplementaire ici",
    ];

    const notes = [
      "IMPORTANT: Effacez toutes les lignes commencant par # avant d'importer le fichier.",
      "Les colonnes avec * sont obligatoires.",
      "civilite: Homme | Femme",
      "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
      "date_venu: format YYYY-MM-DD ou JJ-MM-AA ou JJ-MM-AAAA",
      "bapteme_eau / bapteme_esprit: Oui | Non (ou vide)",
      "serviteur: Oui | Non",
    ];

    const csvContent = [
      headers.join(","),
      example.join(","),
      "",
      ...notes.map((n) => `# ${n}`),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_import_membres.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const validData = [];
        const errorList = [];

        rows.forEach((row, index) => {
          if (Object.values(row)[0]?.toString().trim().startsWith("#")) return;

          const normalized = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.replace(" *", "").trim();
            const value = row[key]?.toString().trim();
            if (cleanKey === "civilite") {
              normalized["sexe"] = value;
            } else {
              normalized[cleanKey] = value;
            }
          });

          let rowErrors = [];

          requiredFields.forEach((field) => {
            if (!normalized[field]) {
              rowErrors.push(`Ligne ${index + 1}: ${field} manquant`);
            }
          });

          if (normalized.sexe && !["Homme", "Femme"].includes(normalized.sexe)) {
            rowErrors.push(`Ligne ${index + 1}: civilite invalide (Homme ou Femme)`);
          }

          const validAges = [
            "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
            "41-55 ans", "56-69 ans", "70 ans et plus",
          ];
          if (normalized.age && !validAges.includes(normalized.age)) {
            rowErrors.push(`Ligne ${index + 1}: age invalide`);
          }

          const dateVenu = parseDate(normalized.date_venu);
          if (normalized.date_venu && !dateVenu) {
            rowErrors.push(`Ligne ${index + 1}: date_venu invalide`);
          }

          if (normalized.bapteme_eau && !["Oui", "Non"].includes(normalized.bapteme_eau)) {
            rowErrors.push(`Ligne ${index + 1}: bapteme_eau invalide (Oui ou Non)`);
          }

          if (normalized.bapteme_esprit && !["Oui", "Non"].includes(normalized.bapteme_esprit)) {
            rowErrors.push(`Ligne ${index + 1}: bapteme_esprit invalide (Oui ou Non)`);
          }

          if (normalized.serviteur && !["Oui", "Non"].includes(normalized.serviteur)) {
            rowErrors.push(`Ligne ${index + 1}: serviteur invalide (Oui ou Non)`);
          }

          if (rowErrors.length === 0) {
            validData.push({
              nom: normalized.nom,
              prenom: normalized.prenom,
              sexe: normalized.sexe,
              age: normalized.age,
              date_venu: dateVenu,
              telephone: normalized.telephone || null,
              ville: normalized.ville || null,
              bapteme_eau: normalized.bapteme_eau || null,
              bapteme_esprit: normalized.bapteme_esprit || null,
              star: normalized.serviteur === "Oui",
              infos_supplementaires: normalized.infos_supplementaires || null,
              cellule_id: user.cellule_id,
              eglise_id: user.eglise_id,
              branche_id: user.branche_id,
              statut_suivis: "3",
              etat_contact: "existant",
            });
          } else {
            errorList.push(...rowErrors);
          }
        });

        setData(validData);
        setErrors(errorList);
      },
    });
  };

  const handleImport = async () => {
    setLoading(true);
    const { error } = await supabase.from("membres_complets").insert(data);
    setLoading(false);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      setSuccess(true);
      setData([]);
      setErrors([]);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 space-y-5">

      {/* Template */}
      <div className="bg-white/10 border border-blue-300/40 rounded-xl p-4">
        <p className="font-semibold text-blue-300 mb-1">Avant d'importer</p>
        <p className="text-sm text-white/80 mb-1">
          1. Telecharge le template et remplis-le avec tes donnees.
        </p>
        <p className="text-sm text-orange-300 font-semibold mb-3">
          2. Efface toutes les lignes commencant par # avant d'importer.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition"
        >
          Telecharger le template CSV
        </button>
      </div>

      {/* Upload */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        <p className="font-semibold text-white mb-2">Importer un fichier CSV</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="text-white/80 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30"
        />
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-500/20 border border-red-400/40 text-red-200 p-4 rounded-xl">
          <p className="font-semibold mb-1">{errors.length} erreur(s) detectee(s) :</p>
          {errors.slice(0, 10).map((err, i) => (
            <p key={i} className="text-sm">{err}</p>
          ))}
          {errors.length > 10 && (
            <p className="text-sm mt-1 italic">...et {errors.length - 10} autres erreurs</p>
          )}
        </div>
      )}

      {/* Apercu */}
      {data.length > 0 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="font-semibold text-emerald-300 mb-2">
            {data.length} ligne(s) prete(s) a etre importee(s)
          </p>
          <div className="max-h-40 overflow-auto space-y-1">
            {data.slice(0, 5).map((row, i) => (
              <div key={i} className="text-white/80 text-sm bg-white/5 rounded px-3 py-1">
                {row.nom} {row.prenom} — {row.age} — {row.date_venu}
                {row.star ? " ★" : ""}
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-white/40 italic text-sm">...et {data.length - 5} autres</p>
            )}
          </div>
        </div>
      )}

      {/* Bouton import */}
      <button
        onClick={handleImport}
        disabled={data.length === 0 || loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold py-3 rounded-xl shadow transition"
      >
        {loading ? "Import en cours..." : "Importer"}
      </button>

      {success && (
        <p className="text-emerald-300 font-semibold text-center">
          Import reussi !
        </p>
      )}
    </div>
  );
}
