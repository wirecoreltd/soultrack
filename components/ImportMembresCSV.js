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
          let rowErrors = [];

          // 🔒 champs obligatoires
          requiredFields.forEach((field) => {
            if (!row[field]) {
              rowErrors.push(`Ligne ${index + 1}: ${field} manquant`);
            }
          });

          // 🎯 validation sexe
          if (row.sexe && !["Homme", "Femme"].includes(row.sexe)) {
            rowErrors.push(`Ligne ${index + 1}: sexe invalide`);
          }

          // 🎯 validation age
          const validAges = [
            "12-17 ans","18-25 ans","26-30 ans","31-40 ans",
            "41-55 ans","56-69 ans","70 ans et plus"
          ];

          if (row.age && !validAges.includes(row.age)) {
            rowErrors.push(`Ligne ${index + 1}: âge invalide`);
          }

          if (rowErrors.length === 0) {
            validData.push({
              nom: row.nom,
              prenom: row.prenom,
              sexe: row.sexe,
              age: row.age,
              date_venu: row.date_venu,

              telephone: row.telephone || null,
              ville: row.ville || null,
              is_whatsapp: row.is_whatsapp === "true",

              bapteme_eau: row.bapteme_eau || null,
              bapteme_esprit: row.bapteme_esprit || null,

              infos_supplementaires: row.infos_supplementaires || null,

              // 🔥 IMPORTANT (auto)
              cellule_id: user.cellule_id,
              eglise_id: user.eglise_id,
              branche_id: user.branche_id,
              etat_contact: "existant"
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

    const { error } = await supabase
      .from("membres_complets")
      .insert(data);

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
    <div className="bg-white p-6 rounded-xl shadow">

      <input type="file" accept=".csv" onChange={handleFileChange} />

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-600 p-3 mt-3 rounded">
          {errors.slice(0, 10).map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">
            {data.length} lignes prêtes à être importées
          </p>

          <div className="max-h-40 overflow-auto border mt-2 p-2 text-sm">
            {data.slice(0, 5).map((row, i) => (
              <div key={i}>
                {row.nom} {row.prenom} - {row.age}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={data.length === 0 || loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Import..." : "Importer"}
      </button>

      {success && (
        <p className="text-green-600 mt-3">
          Import réussi ✅
        </p>
      )}
    </div>
  );
}
