"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import Papa from "papaparse";

export default function ImportMembresCSV({ user }) {
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [depsToUpdate, setDepsToUpdate] = useState({});
  const [depsToAdd, setDepsToAdd] = useState({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [importCount, setImportCount] = useState(0);

  const requiredFields = ["nom", "prenom", "sexe", "age", "date_venu", "serviteur"];

  const capitalize = (str) =>
    str ? str.trim().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const cleanPhone = (phone) =>
    phone ? phone.replace(/[\s\-\.]/g, "").trim() : null;

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
      "nom *", "prenom *", "sexe *", "age *", "date_venu *", "serviteur *",
      "telephone", "ville",
      "bapteme_eau", "bapteme_esprit",
      "infos_supplementaires",
    ];
    const example = [
      "Dupont", "Marie", "Femme", "18-25 ans", "2026-01-15", "Oui",
      "59700000", "Curepipe",
      "Oui", "Non",
      "Info supplementaire ici",
    ];
    const notes = [
      "IMPORTANT: Effacez toutes les lignes commencant par # avant d'importer le fichier.",
      "Les colonnes avec * sont obligatoires.",
      "sexe: Homme | Femme",
      "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
      "date_venu: format YYYY-MM-DD ou JJ-MM-AA ou JJ-MM-AAAA",
      "serviteur: Oui | Non",
      "bapteme_eau / bapteme_esprit: Oui | Non (ou vide)",
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

    setSuccess(false);
    setDuplicates([]);
    setDepsToUpdate({});
    setDepsToAdd({});
    setData([]);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const validData = [];
        const errorList = [];

        rows.forEach((row, index) => {
          if (Object.values(row)[0]?.toString().trim().startsWith("#")) return;

          const normalized = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.replace(" *", "").trim();
            normalized[cleanKey] = row[key]?.toString().trim();
          });

          let rowErrors = [];

          requiredFields.forEach((field) => {
            if (!normalized[field])
              rowErrors.push(`Ligne ${index + 1}: ${field} manquant`);
          });

          if (normalized.sexe && !["Homme", "Femme"].includes(normalized.sexe))
            rowErrors.push(`Ligne ${index + 1}: sexe invalide (Homme ou Femme)`);

          const validAges = [
            "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
            "41-55 ans", "56-69 ans", "70 ans et plus",
          ];
          if (normalized.age && !validAges.includes(normalized.age))
            rowErrors.push(`Ligne ${index + 1}: age invalide`);

          const dateVenu = parseDate(normalized.date_venu);
          if (normalized.date_venu && !dateVenu)
            rowErrors.push(`Ligne ${index + 1}: date_venu invalide`);

          if (normalized.serviteur && !["Oui", "Non"].includes(normalized.serviteur))
            rowErrors.push(`Ligne ${index + 1}: serviteur invalide (Oui ou Non)`);

          if (normalized.bapteme_eau && !["Oui", "Non"].includes(normalized.bapteme_eau))
            rowErrors.push(`Ligne ${index + 1}: bapteme_eau invalide (Oui ou Non)`);

          if (normalized.bapteme_esprit && !["Oui", "Non"].includes(normalized.bapteme_esprit))
            rowErrors.push(`Ligne ${index + 1}: bapteme_esprit invalide (Oui ou Non)`);

          if (rowErrors.length === 0) {
            validData.push({
              // Obligatoires
              nom: capitalize(normalized.nom),
              prenom: capitalize(normalized.prenom),
              sexe: normalized.sexe,
              age: normalized.age,
              date_venu: dateVenu,
              star: normalized.serviteur === "Oui",
              // Optionnels
              telephone: cleanPhone(normalized.telephone) || null,
              ville: capitalize(normalized.ville) || null,
              bapteme_eau: normalized.bapteme_eau || null,
              bapteme_esprit: normalized.bapteme_esprit || null,
              infos_supplementaires: normalized.infos_supplementaires || null,
              // Automatiques
              eglise_id: user.eglise_id,
              statut_suivis: 3,
              etat_contact: "existant",
            });
          } else {
            errorList.push(...rowErrors);
          }
        });

        setErrors(errorList);

        if (validData.length === 0) {
          setData([]);
          return;
        }

        setChecking(true);

        const phones = validData.map((r) => r.telephone).filter(Boolean);
        let existingByPhone = {};

        if (phones.length > 0) {
          const { data: existing } = await supabase
            .from("membres_complets")
            .select("id, nom, prenom, telephone")
            .eq("eglise_id", user.eglise_id)
            .in("telephone", phones);

          (existing || []).forEach((e) => {
            existingByPhone[e.telephone] = e;
          });
        }

        setChecking(false);

        const dupList = [];
        const finalData = [];

        validData.forEach((row) => {
          if (!row.telephone) {
            finalData.push(row);
            return;
          }
          const match = existingByPhone[row.telephone];
          if (match) {
            dupList.push({
              csv: `${row.prenom} ${row.nom}`,
              telephone: row.telephone,
              existing: `${match.prenom} ${match.nom}`,
              existingId: match.id,
              rowData: row,
            });
          } else {
            finalData.push(row);
          }
        });

        setDuplicates(dupList);
        setDepsToUpdate({});
        setDepsToAdd({});
        setData(finalData);
      },
    });
  };

  const handleImport = async () => {
    setLoading(true);

    if (data.length > 0) {
      const { error } = await supabase.from("membres_complets").insert(data);
      if (error) {
        alert("Erreur insert: " + error.message);
        setLoading(false);
        return;
      }
    }

    const dupsToInsert = duplicates.filter((d) => depsToAdd[d.telephone]);
    if (dupsToInsert.length > 0) {
      const { error } = await supabase
        .from("membres_complets")
        .insert(dupsToInsert.map((d) => d.rowData));
      if (error) {
        alert("Erreur insert doublon: " + error.message);
        setLoading(false);
        return;
      }
    }

    const dupsToUpdate = duplicates.filter((d) => depsToUpdate[d.telephone]);
    for (const dup of dupsToUpdate) {
      const { existingId, rowData } = dup;
      const { error } = await supabase
        .from("membres_complets")
        .update({
          nom: rowData.nom,
          prenom: rowData.prenom,
          sexe: rowData.sexe,
          age: rowData.age,
          date_venu: rowData.date_venu,
          star: rowData.star,
          telephone: rowData.telephone,
          ville: rowData.ville,
          bapteme_eau: rowData.bapteme_eau,
          bapteme_esprit: rowData.bapteme_esprit,
          infos_supplementaires: rowData.infos_supplementaires,
        })
        .eq("id", existingId);

      if (error) {
        alert(`Erreur update ${dup.csv}: ` + error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setImportCount(data.length + dupsToInsert.length + dupsToUpdate.length);
    setSuccess(true);
    setData([]);
    setErrors([]);
    setDuplicates([]);
    setDepsToUpdate({});
    setDepsToAdd({});
  };

  const totalToImport =
    data.length +
    Object.values(depsToUpdate).filter(Boolean).length +
    Object.values(depsToAdd).filter(Boolean).length;

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 space-y-5">

      {/* Template */}
      <div className="bg-white/10 border border-blue-300/40 rounded-xl p-4">
        <p className="font-semibold text-white">Avant d'importer</p>
        <p className="text-sm text-white mb-1">
          1. Telecharge le template et remplis-le avec tes donnees.
        </p>
        <p className="text-sm text-orange-400 font-semibold mb-3">
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
        {checking && (
          <p className="text-blue-300 text-sm mt-2 animate-pulse">
            Verification des doublons en cours...
          </p>
        )}
      </div>

      {/* Resume */}
      {(data.length > 0 || duplicates.length > 0 || errors.length > 0) && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-white mb-1">Resume du fichier</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-emerald-300">{data.length}</p>
              <p className="text-xs text-white/70 mt-1">pret(s) a importer</p>
            </div>
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-orange-300">{duplicates.length}</p>
              <p className="text-xs text-white/70 mt-1">doublon(s) detecte(s)</p>
            </div>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-red-300">{errors.length}</p>
              <p className="text-xs text-white/70 mt-1">erreur(s)</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Doublons */}
      {duplicates.length > 0 && (
        <div className="bg-orange-500/20 border border-orange-400/40 p-4 rounded-xl space-y-3">
          <p className="font-semibold text-orange-200">
            {duplicates.length} doublon(s) detecte(s) par telephone :
          </p>
          <p className="text-xs text-white/50 italic">
            Choisis l'action a effectuer pour chaque doublon.
          </p>

          {duplicates.map((d, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
              <div>
                <p className="text-white font-semibold text-sm">
                  {d.csv}
                  <span className="text-white/50 font-normal"> · {d.telephone}</span>
                </p>
                <p className="text-orange-200/80 text-xs mt-0.5">
                  Deja dans la base :
                  <span className="text-white font-semibold"> {d.existing}</span>
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <label className={`flex items-center gap-2 cursor-pointer text-sm px-3 py-1.5 rounded-lg border transition ${
                  depsToUpdate[d.telephone]
                    ? "bg-blue-400/20 border-blue-300/50 text-blue-200"
                    : "bg-white/5 border-white/10 text-white/60"
                }`}>
                  <input
                    type="checkbox"
                    checked={!!depsToUpdate[d.telephone]}
                    onChange={(e) => {
                      setDepsToUpdate((prev) => ({ ...prev, [d.telephone]: e.target.checked }));
                      if (e.target.checked)
                        setDepsToAdd((prev) => ({ ...prev, [d.telephone]: false }));
                    }}
                    className="accent-blue-400 w-4 h-4"
                  />
                  Mettre a jour
                </label>

                <label className={`flex items-center gap-2 cursor-pointer text-sm px-3 py-1.5 rounded-lg border transition ${
                  depsToAdd[d.telephone]
                    ? "bg-emerald-400/20 border-emerald-300/50 text-emerald-200"
                    : "bg-white/5 border-white/10 text-white/60"
                }`}>
                  <input
                    type="checkbox"
                    checked={!!depsToAdd[d.telephone]}
                    onChange={(e) => {
                      setDepsToAdd((prev) => ({ ...prev, [d.telephone]: e.target.checked }));
                      if (e.target.checked)
                        setDepsToUpdate((prev) => ({ ...prev, [d.telephone]: false }));
                    }}
                    className="accent-emerald-400 w-4 h-4"
                  />
                  Ajouter quand meme
                </label>
              </div>

              {depsToUpdate[d.telephone] && (
                <p className="text-blue-300 text-xs">Les donnees existantes seront ecrasees par celles du CSV.</p>
              )}
              {depsToAdd[d.telephone] && (
                <p className="text-emerald-300 text-xs">Une nouvelle entree sera creee meme si le numero existe deja.</p>
              )}
            </div>
          ))}

          <div className="flex gap-4 pt-1 flex-wrap">
            <button
              onClick={() => {
                const allChecked = duplicates.every((d) => depsToUpdate[d.telephone]);
                const next = {};
                if (!allChecked) duplicates.forEach((d) => (next[d.telephone] = true));
                setDepsToUpdate(next);
                setDepsToAdd({});
              }}
              className="text-xs text-blue-300 underline"
            >
              {duplicates.every((d) => depsToUpdate[d.telephone]) ? "Tout decocher (MAJ)" : "Tout mettre a jour"}
            </button>

            <button
              onClick={() => {
                const allChecked = duplicates.every((d) => depsToAdd[d.telephone]);
                const next = {};
                if (!allChecked) duplicates.forEach((d) => (next[d.telephone] = true));
                setDepsToAdd(next);
                setDepsToUpdate({});
              }}
              className="text-xs text-emerald-300 underline"
            >
              {duplicates.every((d) => depsToAdd[d.telephone]) ? "Tout decocher (Ajout)" : "Tout ajouter quand meme"}
            </button>
          </div>
        </div>
      )}

      {/* Apercu */}
      {data.length > 0 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="font-semibold text-emerald-300 mb-2">Apercu des lignes a importer</p>
          <div className="max-h-40 overflow-auto space-y-1">
            {data.slice(0, 5).map((row, i) => (
              <div key={i} className="text-white/80 text-sm bg-white/5 rounded px-3 py-1">
                {row.prenom} {row.nom} — {row.sexe} — {row.age} — {row.date_venu}
                {row.star ? " ⭐" : ""}
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
        disabled={totalToImport === 0 || loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold py-3 rounded-xl shadow transition"
      >
        {loading ? "Import en cours..." : `Importer ${totalToImport > 0 ? totalToImport + " membre(s)" : ""}`}
      </button>

      {/* Succes */}
      {success && (
        <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-4 text-center">
          <p className="text-emerald-300 font-bold text-lg">Import reussi !</p>
          <p className="text-white/70 text-sm mt-1">
            {importCount} membre(s) ajoute(s) ou mis a jour avec succes.
          </p>
        </div>
      )}
    </div>
  );
}
