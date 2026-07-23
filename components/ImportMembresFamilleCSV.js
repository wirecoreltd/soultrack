"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { checkLimiteAtteinte } from "../lib/checkLimite";
import Papa from "papaparse";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    beforeImport: "Avant d'importer",
    step1: "1. Telecharge le template et remplis-le avec tes donnees.",
    step2: "2. Efface toutes les lignes commencant par # avant d'importer.",
    downloadTemplate: "Telecharger le template CSV",
    importFile: "Importer un fichier CSV",
    checkingDuplicates: "Verification des doublons en cours...",
    resumeFile: "Resume du fichier",
    readyToImport: "pret(s) a importer",
    duplicatesDetected: "doublon(s) detecte(s)",
    errors: "erreur(s)",
    errorsDetected: "erreur(s) detectee(s) :",
    andMore: "...et",
    otherErrors: "autres erreurs",
    duplicatesByPhone: "doublon(s) detecte(s) par telephone :",
    chooseAction: "Choisis l'action a effectuer pour chaque doublon.",
    alreadyInBase: "Deja dans la base :",
    update: "Mettre a jour",
    addAnyway: "Ajouter quand meme",
    updateInfo: "Les donnees existantes seront ecrasees par celles du CSV.",
    addInfo: "Une nouvelle entree sera creee meme si le numero existe deja.",
    uncheckAll: "Tout decocher (MAJ)",
    updateAll: "Tout mettre a jour",
    uncheckAllAdd: "Tout decocher (Ajout)",
    addAllAnyway: "Tout ajouter quand meme",
    previewTitle: "Apercu des lignes a importer",
    andOthers: "autres",
    importing: "Import en cours...",
    importBtn: "Importer",
    member: "membre(s)",
    successTitle: "Import reussi !",
    successMsg: "membre(s) ajoute(s) ou mis a jour avec succes.",
    upgradeplan: "Upgradez votre plan.",
    limitReached: "Limite atteinte",
    limitExceeded: "Cet import dépasserait la limite : vous avez",
    membersAndWant: "membres et voulez en importer",
    errorInsert: "Erreur insert: ",
    errorInsertDup: "Erreur insert doublon: ",
    errorUpdate: "Erreur update",
  },
  en: {
    beforeImport: "Before importing",
    step1: "1. Download the template and fill it with your data.",
    step2: "2. Delete all lines starting with # before importing.",
    downloadTemplate: "Download CSV template",
    importFile: "Import a CSV file",
    checkingDuplicates: "Checking for duplicates...",
    resumeFile: "File summary",
    readyToImport: "ready to import",
    duplicatesDetected: "duplicate(s) detected",
    errors: "error(s)",
    errorsDetected: "error(s) detected:",
    andMore: "...and",
    otherErrors: "more errors",
    duplicatesByPhone: "duplicate(s) detected by phone number:",
    chooseAction: "Choose what to do for each duplicate.",
    alreadyInBase: "Already in database:",
    update: "Update",
    addAnyway: "Add anyway",
    updateInfo: "Existing data will be overwritten with CSV data.",
    addInfo: "A new entry will be created even if the number already exists.",
    uncheckAll: "Uncheck all (Update)",
    updateAll: "Update all",
    uncheckAllAdd: "Uncheck all (Add)",
    addAllAnyway: "Add all anyway",
    previewTitle: "Preview of rows to import",
    andOthers: "others",
    importing: "Importing...",
    importBtn: "Import",
    member: "member(s)",
    successTitle: "Import successful!",
    successMsg: "member(s) added or updated successfully.",
    upgradeplan: "Upgrade your plan.",
    limitReached: "Limit reached",
    limitExceeded: "This import would exceed the limit: you have",
    membersAndWant: "members and want to import",
    errorInsert: "Insert error: ",
    errorInsertDup: "Duplicate insert error: ",
    errorUpdate: "Update error",
  },
};

// ─── Valeurs DB (toujours en français) ───
const BESOIN_FR = [
  "Finances", "Santé", "Travail / Études", "Famille / Enfants",
  "Miracle", "Délivrance", "Relations / Conflits",
  "Addictions / Dépendances", "Guidance spirituelle",
  "Logement / Sécurité", "Communauté / Isolement", "Dépression / Santé mentale",
];

// Template examples per language
const templateExamples = {
  fr: [
    "Dupont", "Marie", "Femme", "18-25 ans", "2026-01-15",
    "+336 12 34 56 78", "Paris", "Oui", "Non", "Oui",
    "Finances;Santé",
    "Info supplementaire ici",
  ],
  en: [
    "Smith", "John", "Homme", "18-25 ans", "2026-01-15",
    "+1 212 555 0147", "New York", "Oui", "Non", "Oui",
    "Finances;Santé",
    "Additional info here",
  ],
};

// Template notes per language
const templateNotes = {
  fr: [
    "IMPORTANT: Effacez toutes les lignes commencant par # avant d'importer le fichier.",
    "Les colonnes avec * sont obligatoires.",
    "civilite: Homme | Femme",
    "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
    "Le préfixe téléphonique du pays doit être placé avant le numéro de téléphone",
    "date_venu: format YYYY-MM-DD ou JJ-MM-AA ou JJ-MM-AAAA",
    "bapteme_eau / bapteme_esprit: Oui | Non (ou vide)",
    "serviteur: Oui | Non",
    "besoin: valeurs séparées par ; (ex: Finances;Santé;Travail / Études) — valeurs possibles : Finances | Santé | Travail / Études | Famille / Enfants | Miracle | Délivrance | Relations / Conflits | Addictions / Dépendances | Guidance spirituelle | Logement / Sécurité | Communauté / Isolement | Dépression / Santé mentale",
  ],
  en: [
    "IMPORTANT: Delete all lines starting with # before importing the file.",
    "Columns marked with * are required.",
    "civilite: Homme | Femme",
    "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
    "The country phone prefix must be placed before the phone number",
    "date_venu: format YYYY-MM-DD or DD-MM-YY or DD-MM-YYYY",
    "bapteme_eau / bapteme_esprit: Oui | Non (or leave empty)",
    "serviteur: Oui | Non",
    "besoin: values separated by ; (e.g.: Finances;Santé;Travail / Études) — possible values: Finances | Santé | Travail / Études | Famille / Enfants | Miracle | Délivrance | Relations / Conflits | Addictions / Dépendances | Guidance spirituelle | Logement / Sécurité | Communauté / Isolement | Dépression / Santé mentale",
  ],
};

export default function ImportMembresFamilleCSV({ user }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [depsToUpdate, setDepsToUpdate] = useState({});
  const [depsToAdd, setDepsToAdd] = useState({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [importCount, setImportCount] = useState(0);

  const requiredFields = ["nom", "prenom", "civilite", "age", "date_venu"];

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
      "nom *", "prenom *", "civilite *", "age *", "date_venu *",
      "telephone", "ville",
      "bapteme_eau", "bapteme_esprit",
      "serviteur",
      "besoin",
      "infos_supplementaires",
    ];
    const example = templateExamples[lang] ?? templateExamples.fr;
    const notes = templateNotes[lang] ?? templateNotes.fr;
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
    link.download = "template_import_membres_famille.csv";
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
            const value = row[key]?.toString().trim();
            if (cleanKey === "civilite") normalized["sexe"] = value;
            else normalized[cleanKey] = value;
          });

          let rowErrors = [];

          requiredFields.forEach((field) => {
            const checkField = field === "civilite" ? "sexe" : field;
            if (!normalized[checkField])
              rowErrors.push(`Ligne ${index + 1}: ${field} manquant`);
          });

          if (normalized.sexe && !["Homme", "Femme"].includes(normalized.sexe))
            rowErrors.push(`Ligne ${index + 1}: civilite invalide (Homme ou Femme)`);

          const validAges = [
            "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
            "41-55 ans", "56-69 ans", "70 ans et plus",
          ];
          if (normalized.age && !validAges.includes(normalized.age))
            rowErrors.push(`Ligne ${index + 1}: age invalide`);

          const dateVenu = parseDate(normalized.date_venu);
          if (normalized.date_venu && !dateVenu)
            rowErrors.push(`Ligne ${index + 1}: date_venu invalide`);

          if (normalized.bapteme_eau && !["Oui", "Non"].includes(normalized.bapteme_eau))
            rowErrors.push(`Ligne ${index + 1}: bapteme_eau invalide (Oui ou Non)`);

          if (normalized.bapteme_esprit && !["Oui", "Non"].includes(normalized.bapteme_esprit))
            rowErrors.push(`Ligne ${index + 1}: bapteme_esprit invalide (Oui ou Non)`);

          if (normalized.serviteur && !["Oui", "Non"].includes(normalized.serviteur))
            rowErrors.push(`Ligne ${index + 1}: serviteur invalide (Oui ou Non)`);

          // ── Besoins : valider chaque valeur ──
          const besoin = normalized.besoin
            ? normalized.besoin.split(";").map((b) => b.trim()).filter(Boolean)
            : [];
          const invalidBesoin = besoin.filter((b) => !BESOIN_FR.includes(b));
          if (invalidBesoin.length > 0) {
            rowErrors.push(`Ligne ${index + 1}: besoin invalide : ${invalidBesoin.join(", ")}`);
          }

          if (rowErrors.length === 0) {
            validData.push({
              nom: capitalize(normalized.nom),
              prenom: capitalize(normalized.prenom),
              sexe: normalized.sexe,
              age: normalized.age,
              date_venu: dateVenu,
              telephone: cleanPhone(normalized.telephone) || null,
              ville: capitalize(normalized.ville) || null,
              bapteme_eau: normalized.bapteme_eau || null,
              bapteme_esprit: normalized.bapteme_esprit || null,
              star: normalized.serviteur === "Oui",
              besoin: besoin.length > 0 ? besoin : null,
              infos_supplementaires: normalized.infos_supplementaires || null,
              eglise_id: user.eglise_id,
              famille_id: user.famille_id,
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
            .eq("famille_id", user.famille_id)
            .in("telephone", phones);

          (existing || []).forEach((e) => {
            existingByPhone[e.telephone] = e;
          });
        }

        setChecking(false);

        const dupList = [];
        const finalData = [];

        validData.forEach((row) => {
          if (!row.telephone) { finalData.push(row); return; }
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

    const { atteinte, count, limite } = await checkLimiteAtteinte(user.eglise_id);
    if (atteinte) {
      alert(`❌ ${t.limitReached} : ${count}/${limite} ${t.member}. ${t.upgradeplan}`);
      setLoading(false);
      return;
    }

    if (limite !== null && count + totalToImport > limite) {
      alert(`❌ ${t.limitExceeded} ${count}/${limite} ${t.membersAndWant} ${totalToImport}.`);
      setLoading(false);
      return;
    }

    if (data.length > 0) {
      const { error } = await supabase.from("membres_complets").insert(data);
      if (error) { alert(t.errorInsert + error.message); setLoading(false); return; }
    }

    const dupsToInsert = duplicates.filter((d) => depsToAdd[d.telephone]);
    if (dupsToInsert.length > 0) {
      const { error } = await supabase
        .from("membres_complets")
        .insert(dupsToInsert.map((d) => d.rowData));
      if (error) { alert(t.errorInsertDup + error.message); setLoading(false); return; }
    }

    const dupsToUpdate = duplicates.filter((d) => depsToUpdate[d.telephone]);
    if (dupsToUpdate.length > 0) {
      const updateResults = await Promise.all(
        dupsToUpdate.map(({ existingId, rowData }) =>
          supabase.from("membres_complets").update({
            nom: rowData.nom, prenom: rowData.prenom, sexe: rowData.sexe,
            age: rowData.age, date_venu: rowData.date_venu,
            telephone: rowData.telephone, ville: rowData.ville,
            bapteme_eau: rowData.bapteme_eau, bapteme_esprit: rowData.bapteme_esprit,
            star: rowData.star, besoin: rowData.besoin,
            infos_supplementaires: rowData.infos_supplementaires,
          }).eq("id", existingId)
        )
      );
      const failed = updateResults.find((r) => r.error);
      if (failed) { alert(t.errorUpdate + ": " + failed.error.message); setLoading(false); return; }
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
        <p className="font-semibold text-white">{t.beforeImport}</p>
        <p className="text-sm text-white mb-1">{t.step1}</p>
        <p className="text-sm text-orange-400 font-semibold mb-3">{t.step2}</p>
        <button
          onClick={handleDownloadTemplate}
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition"
        >
          {t.downloadTemplate}
        </button>
      </div>

      {/* Upload */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        <p className="font-semibold text-white mb-2">{t.importFile}</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="text-white/80 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30"
        />
        {checking && <p className="text-blue-300 text-sm mt-2 animate-pulse">{t.checkingDuplicates}</p>}
      </div>

      {/* Resume */}
      {(data.length > 0 || duplicates.length > 0 || errors.length > 0) && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-white mb-1">{t.resumeFile}</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-emerald-300">{data.length}</p>
              <p className="text-xs text-white/70 mt-1">{t.readyToImport}</p>
            </div>
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-orange-300">{duplicates.length}</p>
              <p className="text-xs text-white/70 mt-1">{t.duplicatesDetected}</p>
            </div>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-red-300">{errors.length}</p>
              <p className="text-xs text-white/70 mt-1">{t.errors}</p>
            </div>
          </div>
        </div>
      )}

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-500/20 border border-red-400/40 text-red-200 p-4 rounded-xl">
          <p className="font-semibold mb-1">{errors.length} {t.errorsDetected}</p>
          {errors.slice(0, 10).map((err, i) => <p key={i} className="text-sm">{err}</p>)}
          {errors.length > 10 && <p className="text-sm mt-1 italic">{t.andMore} {errors.length - 10} {t.otherErrors}</p>}
        </div>
      )}

      {/* Doublons */}
      {duplicates.length > 0 && (
        <div className="bg-orange-500/20 border border-orange-400/40 p-4 rounded-xl space-y-3">
          <p className="font-semibold text-orange-200">{duplicates.length} {t.duplicatesByPhone}</p>
          <p className="text-xs text-white/50 italic">{t.chooseAction}</p>

          {duplicates.map((d, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
              <div>
                <p className="text-white font-semibold text-sm">{d.csv}<span className="text-white/50 font-normal"> · {d.telephone}</span></p>
                <p className="text-orange-200/80 text-xs mt-0.5">{t.alreadyInBase} <span className="text-white font-semibold">{d.existing}</span></p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <label className={`flex items-center gap-2 cursor-pointer text-sm px-3 py-1.5 rounded-lg border transition ${depsToUpdate[d.telephone] ? "bg-blue-400/20 border-blue-300/50 text-blue-200" : "bg-white/5 border-white/10 text-white/60"}`}>
                  <input type="checkbox" checked={!!depsToUpdate[d.telephone]}
                    onChange={(e) => { setDepsToUpdate((prev) => ({ ...prev, [d.telephone]: e.target.checked })); if (e.target.checked) setDepsToAdd((prev) => ({ ...prev, [d.telephone]: false })); }}
                    className="accent-blue-400 w-4 h-4" />
                  {t.update}
                </label>
                <label className={`flex items-center gap-2 cursor-pointer text-sm px-3 py-1.5 rounded-lg border transition ${depsToAdd[d.telephone] ? "bg-emerald-400/20 border-emerald-300/50 text-emerald-200" : "bg-white/5 border-white/10 text-white/60"}`}>
                  <input type="checkbox" checked={!!depsToAdd[d.telephone]}
                    onChange={(e) => { setDepsToAdd((prev) => ({ ...prev, [d.telephone]: e.target.checked })); if (e.target.checked) setDepsToUpdate((prev) => ({ ...prev, [d.telephone]: false })); }}
                    className="accent-emerald-400 w-4 h-4" />
                  {t.addAnyway}
                </label>
              </div>
              {depsToUpdate[d.telephone] && <p className="text-blue-300 text-xs">{t.updateInfo}</p>}
              {depsToAdd[d.telephone] && <p className="text-emerald-300 text-xs">{t.addInfo}</p>}
            </div>
          ))}

          <div className="flex gap-4 pt-1 flex-wrap">
            <button onClick={() => { const allChecked = duplicates.every((d) => depsToUpdate[d.telephone]); const next = {}; if (!allChecked) duplicates.forEach((d) => (next[d.telephone] = true)); setDepsToUpdate(next); setDepsToAdd({}); }} className="text-xs text-blue-300 underline">
              {duplicates.every((d) => depsToUpdate[d.telephone]) ? t.uncheckAll : t.updateAll}
            </button>
            <button onClick={() => { const allChecked = duplicates.every((d) => depsToAdd[d.telephone]); const next = {}; if (!allChecked) duplicates.forEach((d) => (next[d.telephone] = true)); setDepsToAdd(next); setDepsToUpdate({}); }} className="text-xs text-emerald-300 underline">
              {duplicates.every((d) => depsToAdd[d.telephone]) ? t.uncheckAllAdd : t.addAllAnyway}
            </button>
          </div>
        </div>
      )}

      {/* Apercu */}
      {data.length > 0 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="font-semibold text-emerald-300 mb-2">{t.previewTitle}</p>
          <div className="max-h-40 overflow-auto space-y-1">
            {data.slice(0, 5).map((row, i) => (
              <div key={i} className="text-white/80 text-sm bg-white/5 rounded px-3 py-1">
                {row.prenom} {row.nom} — {row.age} — {row.date_venu}{row.star ? " ★" : ""}
              </div>
            ))}
            {data.length > 5 && <p className="text-white/40 italic text-sm">...{t.andMore} {data.length - 5} {t.andOthers}</p>}
          </div>
        </div>
      )}

      {/* Bouton import */}
      <button
        onClick={handleImport}
        disabled={totalToImport === 0 || loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold py-3 rounded-xl shadow transition"
      >
        {loading ? t.importing : `${t.importBtn}${totalToImport > 0 ? ` ${totalToImport} ${t.member}` : ""}`}
      </button>

      {/* Succes */}
      {success && (
        <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-4 text-center">
          <p className="text-emerald-300 font-bold text-lg">{t.successTitle}</p>
          <p className="text-white/70 text-sm mt-1">{importCount} {t.successMsg}</p>
        </div>
      )}
    </div>
  );
}
