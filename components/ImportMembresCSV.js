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

  // Convertit DD-MM-YY, DD-MM-YYYY, DD/MM/YYYY → YYYY-MM-DD
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
      "nom *", "prenom *", "sexe *", "age *", "date_venu *",
      "telephone", "ville",
      "bapteme_eau", "bapteme_esprit",
      "serviteur",
      "infos_supplementaires",
    ];

    const example = [
      "Dupont", "Marie", "Femme", "18-25 ans", "2026-01-15",
      "59700000", "Curepipe",
      "Oui", "Non",
      "False",
      "Info supplementaire ici",
    ];

    // Pas d'accents, pas d'emojis dans les notes
    const notes = [
      "IMPORTANT: Effacez toutes les lignes commencant par # avant d'importer le fichier.",
      "Les colonnes avec * sont obligatoires.",
      "sexe: Homme | Femme",
      "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
      "date_venu: format YYYY-MM-DD ou JJ-MM-AA ou JJ-MM-AAAA",
      "bapteme_eau / bapteme_esprit: Oui | Non (ou vide)",
      "serviteur: True | False",
    ];

    const csvContent = [
      headers.join(","),
      example.join(","),
      "",
      ...notes.map((n) => `# ${n}`),
    ].join("\n");

    // UTF-8 BOM pour éviter les problèmes d'encodage
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
          // Ignore les lignes de notes (commençant par #)
          if (Object.values(row)[0]?.toString().trim().startsWith("#")) return;

          // Normalise les noms de colonnes (enlève le " *")
          const normalized = {};
          Object.keys(row).forEach((key) => {
            normalized[key.replace(" *", "").trim()] = row[key]?.toString().trim();
          });

          let rowErrors = [];

          // Champs obligatoires
          requiredFields.forEach((field) => {
            if (!normalized[field]) {
              rowErrors.push(`Ligne ${index + 1}: ${field} manquant`);
            }
          });

          // Validation sexe
          if (normalized.sexe && !["Homme", "Femme"].includes(normalized.sexe)) {
            rowErrors.push(`Ligne ${index + 1}: sexe invalide (Homme ou Femme)`);
          }

          // Validation age
          const validAges = [
            "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
            "41-55 ans", "56-69 ans", "70 ans et plus",
          ];
          if (normalized.age && !validAges.includes(normalized.age)) {
            rowErrors.push(`Ligne ${index + 1}: age invalide`);
          }

          // Validation et conversion date_venu
          const dateVenu = parseDate(normalized.date_venu);
          if (normalized.date_venu && !dateVenu) {
            rowErrors.push(`Ligne ${index + 1}: date_venu invalide (format attendu: YYYY-MM-DD ou JJ-MM-AA)`);
          }

          // Validation bapteme_eau
          if (normalized.bapteme_eau && !["Oui", "Non"].includes(normalized.bapteme_eau)) {
            rowErrors.push(`Ligne ${index + 1}: bapteme_eau invalide (Oui ou Non)`);
          }

          // Validation bapteme_esprit
          if (normalized.bapteme_esprit && !["Oui", "Non"].includes(normalized.bapteme_esprit)) {
            rowErrors.push(`Ligne ${index + 1}: bapteme_esprit invalide (Oui ou Non)`);
          }

          // Validation serviteur
          if (normalized.serviteur && !["True", "False"].includes(normalized.serviteur)) {
            rowErrors.push(`Ligne ${index + 1}: serviteur invalide (True ou False)`);
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
              star: normalized.serviteur === "True",
              infos_supplementaires: normalized.infos_supplementaires || null,
              cellule_id: user.cellule_id,
              eglise_id: user.eglise_id,
              branche_id: user.branche_id,
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
    <div className="bg-white p-6 rounded-xl shadow space-y-4">

      {/* Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-blue-800 mb-1">Avant d'importer</p>
        <p className="text-sm text-blue-700 mb-1">
          1. Telecharge le template et remplis-le avec tes donnees.
        </p>
        <p className="text-sm text-red-600 font-semibold mb-3">
          2. Efface toutes les lignes commencant par # avant d'importer.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
        >
          Telecharger le template CSV
        </button>
      </div>

      {/* Upload */}
      <div>
        <p className="font-semibold mb-2">Importer un fichier CSV</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-600 p-3 rounded">
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
        <div>
          <p className="font-semibold">{data.length} ligne(s) prete(s) a etre importee(s)</p>
          <div className="max-h-40 overflow-auto border mt-2 p-2 text-sm rounded">
            {data.slice(0, 5).map((row, i) => (
              <div key={i} className="py-0.5">
                {row.nom} {row.prenom} — {row.age} — {row.date_venu}
                {row.star ? " [Serviteur]" : ""}
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-gray-400 italic">...et {data.length - 5} autres</p>
            )}
          </div>
        </div>
      )}

      {/* Bouton import */}
      <button
        onClick={handleImport}
        disabled={data.length === 0 || loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-700"
      >
        {loading ? "Import en cours..." : "Importer"}
      </button>

      {success && (
        <p className="text-green-600 font-semibold">Import reussi</p>
      )}
    </div>
  );
}
