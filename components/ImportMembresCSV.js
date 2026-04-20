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

  // 📥 Téléchargement du template CSV
  const handleDownloadTemplate = () => {
    const headers = [
      "nom *",
      "prenom *",
      "sexe *",
      "age *",
      "date_venu *",
      "telephone",
      "ville",
      "is_whatsapp",
      "bapteme_eau",
      "bapteme_esprit",
      "infos_supplementaires",
    ];

    const example = [
      "Dupont",
      "Marie",
      "Femme",
      "18-25 ans",
      "2024-01-15",
      "59700000",
      "Curepipe",
      "true",
      "2020-06-01",
      "",
      "Sœur de Jean Dupont",
    ];

    const notes = [
      "⚠️ Les colonnes avec * sont obligatoires",
      "",
      "sexe: Homme | Femme",
      "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
      "date_venu: format YYYY-MM-DD",
      "is_whatsapp: true | false",
      "bapteme_eau / bapteme_esprit: date format YYYY-MM-DD ou vide",
    ];

    // Ligne d'en-tête + ligne exemple + lignes de notes en commentaire
    const csvContent = [
      headers.join(","),
      example.join(","),
      "",
      ...notes.map((n) => `# ${n}`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
          if (Object.values(row)[0]?.startsWith("#")) return;

          let rowErrors = [];

          // Normalise les noms de colonnes (enlève le " *")
          const normalized = {};
          Object.keys(row).forEach((key) => {
            normalized[key.replace(" *", "").trim()] = row[key];
          });

          requiredFields.forEach((field) => {
            if (!normalized[field]) {
              rowErrors.push(`Ligne ${index + 1}: ${field} manquant`);
            }
          });

          if (normalized.sexe && !["Homme", "Femme"].includes(normalized.sexe)) {
            rowErrors.push(`Ligne ${index + 1}: sexe invalide`);
          }

          const validAges = [
            "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
            "41-55 ans", "56-69 ans", "70 ans et plus",
          ];

          if (normalized.age && !validAges.includes(normalized.age)) {
            rowErrors.push(`Ligne ${index + 1}: âge invalide`);
          }

          if (rowErrors.length === 0) {
            validData.push({
              nom: normalized.nom,
              prenom: normalized.prenom,
              sexe: normalized.sexe,
              age: normalized.age,
              date_venu: normalized.date_venu,
              telephone: normalized.telephone || null,
              ville: normalized.ville || null,
              is_whatsapp: normalized.is_whatsapp === "true",
              bapteme_eau: normalized.bapteme_eau || null,
              bapteme_esprit: normalized.bapteme_esprit || null,
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

      {/* 📥 Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-blue-800 mb-1">
          📄 Avant d'importer
        </p>
        <p className="text-sm text-blue-700 mb-3">
          Télécharge le template CSV pour voir les colonnes attendues et un
          exemple de données.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
        >
          ⬇️ Télécharger le template CSV
        </button>
      </div>

      {/* 📤 Upload */}
      <div>
        <p className="font-semibold mb-2">📤 Importer un fichier CSV</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      {/* ❌ Erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-600 p-3 rounded">
          <p className="font-semibold mb-1">
            ⚠️ {errors.length} erreur(s) détectée(s) :
          </p>
          {errors.slice(0, 10).map((err, i) => (
            <p key={i} className="text-sm">{err}</p>
          ))}
          {errors.length > 10 && (
            <p className="text-sm mt-1 italic">
              ...et {errors.length - 10} autres erreurs
            </p>
          )}
        </div>
      )}

      {/* ✅ Aperçu */}
      {data.length > 0 && (
        <div>
          <p className="font-semibold">
            ✅ {data.length} ligne(s) prête(s) à être importée(s)
          </p>
          <div className="max-h-40 overflow-auto border mt-2 p-2 text-sm rounded">
            {data.slice(0, 5).map((row, i) => (
              <div key={i} className="py-0.5">
                {row.nom} {row.prenom} — {row.age} — {row.date_venu}
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-gray-400 italic">
                ...et {data.length - 5} autres
              </p>
            )}
          </div>
        </div>
      )}

      {/* 🚀 Bouton import */}
      <button
        onClick={handleImport}
        disabled={data.length === 0 || loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-700"
      >
        {loading ? "Import en cours..." : "🚀 Importer"}
      </button>

      {success && (
        <p className="text-green-600 font-semibold">Import réussi ✅</p>
      )}
    </div>
  );
}
