"use client";

import { useState } from "react";
import Papa from "papaparse";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    beforeImport: "Avant d'importer",
    step1: "1. Télécharge le template et remplis-le avec tes données.",
    step2: "2. Efface toutes les lignes commençant par # avant d'importer.",
    downloadTemplate: "Télécharger le template CSV",
    importFile: "Importer un fichier CSV",
    checkingDuplicates: "Vérification en cours...",
    resumeFile: "Résumé du fichier",
    readyToImport: "prêt(s) à importer",
    errorsDetected: "erreur(s) détectée(s)",
    errors: "erreur(s)",
    andMore: "...et",
    otherErrors: "autres erreurs",
    previewTitle: "Aperçu des lignes à importer",
    andOthers: "autres",
    importing: "Import en cours...",
    importBtn: "Importer",
    user: "utilisateur(s)",
    successTitle: "Import réussi !",
    successMsg: "utilisateur(s) créé(s) avec succès.",
    errorRow: (i, msg) => `Ligne ${i} — ${msg}`,
    warningDupEmail: (email) => `Email déjà utilisé : ${email}`,
    progressMsg: (i, total) => `Création ${i}/${total}...`,
    errSession: "Session expirée. Veuillez vous reconnecter.",
  },
  en: {
    beforeImport: "Before importing",
    step1: "1. Download the template and fill it with your data.",
    step2: "2. Delete all lines starting with # before importing.",
    downloadTemplate: "Download CSV template",
    importFile: "Import a CSV file",
    checkingDuplicates: "Checking...",
    resumeFile: "File summary",
    readyToImport: "ready to import",
    errorsDetected: "error(s) detected",
    errors: "error(s)",
    andMore: "...and",
    otherErrors: "more errors",
    previewTitle: "Preview of rows to import",
    andOthers: "others",
    importing: "Importing...",
    importBtn: "Import",
    user: "user(s)",
    successTitle: "Import successful!",
    successMsg: "user(s) created successfully.",
    errorRow: (i, msg) => `Row ${i} — ${msg}`,
    warningDupEmail: (email) => `Email already used: ${email}`,
    progressMsg: (i, total) => `Creating ${i}/${total}...`,
    errSession: "Session expired. Please log in again.",
  },
};

const ROLES_VALIDES = [
  "Administrateur",
  "ResponsableIntegration",
  "ResponsableEvangelisation",
  "ResponsableCellule",
  "SuperviseurCellule",
  "ResponsableFamilles",
  "SuperviseurFamilles",
  "Conseiller",
];

const MINISTERES_VALIDES = [
  "Intercession", "Louange", "Technique", "Communication",
  "Les Enfants", "Les ados", "Les jeunes", "Finance",
  "Nettoyage", "Conseiller", "Compassion", "Visite",
  "Berger", "Modération",
];

const AGE_OPTIONS = [
  "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
  "41-55 ans", "56-69 ans", "70 ans et plus",
];

const capitalize = (str) =>
  str ? str.trim().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

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

export default function ImportUsersCSV() {
  const { lang } = useLang();
  const t = translations[lang];

  const [data, setData]           = useState([]);
  const [errors, setErrors]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState("");
  const [success, setSuccess]     = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [importErrors, setImportErrors] = useState([]);

  // ── Template CSV ──
  const handleDownloadTemplate = () => {
    const headers = [
      // Infos membre
      "prenom *", "nom *", "sexe *", "age *", "date_venu *",
      "telephone", "is_whatsapp", "ville",
      "statut", "venu", "priere_salut", "type_conversion",
      // Compte
      "email *", "password *",
      // Rôles (séparés par |)
      "roles *",
      // Ministères (séparés par |)
      "ministeres",
      // Cellule (si ResponsableCellule)
      "cellule_nom", "cellule_zone", "cellule_mere_id",
    ];

    const example = [
      "Jean", "Dupont", "Homme", "26-30 ans", "2026-01-15",
      "59700000", "Oui", "Curepipe",
      "veut rejoindre l'église", "invité", "Oui", "Nouveau converti",
      "jean.dupont@email.com", "MotDePasse123",
      "ResponsableCellule",
      "Louange|Intercession",
      "Ma Cellule", "Rose-Hill", "",
    ];

    const notes = [
      "IMPORTANT: Effacez toutes les lignes commençant par # avant d'importer.",
      "Les colonnes avec * sont obligatoires.",
      "sexe: Homme | Femme",
      "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
      "date_venu: format YYYY-MM-DD ou JJ-MM-AAAA",
      "is_whatsapp: Oui | Non (ou vide = Non)",
      "statut: veut rejoindre l'église | a déjà son église | nouveau | visiteur",
      "venu: invité | réseaux | evangélisation | autre",
      "priere_salut: Oui | Non",
      "type_conversion: Nouveau converti | Réconciliation (requis si priere_salut = Oui)",
      `roles: ${ROLES_VALIDES.join(" | ")} — séparer plusieurs rôles par |`,
      `ministeres: ${MINISTERES_VALIDES.join(" | ")} — séparer par |`,
      "cellule_nom / cellule_zone: obligatoires si role = ResponsableCellule",
      "cellule_mere_id: UUID de la cellule mère (optionnel)",
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
    link.download = "template_import_utilisateurs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Parse + validation ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSuccess(false);
    setData([]);
    setErrors([]);
    setImportErrors([]);
    setProgress("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const validData = [];
        const errorList = [];

        rows.forEach((row, index) => {
          const lineNum = index + 2; // +2 car ligne 1 = headers

          // Skip lignes commentaires
          if (Object.values(row)[0]?.toString().trim().startsWith("#")) return;

          // Normaliser les clés (enlever " *")
          const r = {};
          Object.keys(row).forEach((key) => {
            r[key.replace(" *", "").trim()] = row[key]?.toString().trim() || "";
          });

          const errs = [];

          // ── Champs obligatoires ──
          ["prenom", "nom", "sexe", "age", "date_venu", "email", "password", "roles"].forEach((f) => {
            if (!r[f]) errs.push(`${f} manquant`);
          });

          // ── Validations ──
          if (r.sexe && !["Homme", "Femme"].includes(r.sexe))
            errs.push("sexe invalide (Homme ou Femme)");

          if (r.age && !AGE_OPTIONS.includes(r.age))
            errs.push("age invalide");

          const dateVenu = parseDate(r.date_venu);
          if (r.date_venu && !dateVenu)
            errs.push("date_venu invalide");

          // Rôles
          const roles = r.roles
            ? r.roles.split("|").map((x) => x.trim()).filter(Boolean)
            : [];
          const invalidRoles = roles.filter((ro) => !ROLES_VALIDES.includes(ro));
          if (invalidRoles.length > 0)
            errs.push(`rôle(s) invalide(s) : ${invalidRoles.join(", ")}`);
          if (roles.length === 0)
            errs.push("au moins un rôle est requis");

          // Cellule obligatoire si ResponsableCellule
          if (roles.includes("ResponsableCellule")) {
            if (!r.cellule_nom?.trim()) errs.push("cellule_nom obligatoire pour ResponsableCellule");
            if (!r.cellule_zone?.trim()) errs.push("cellule_zone obligatoire pour ResponsableCellule");
          }

          // Ministères (optionnel, juste valider si présents)
          const ministeres = r.ministeres
            ? r.ministeres.split("|").map((x) => x.trim()).filter(Boolean)
            : [];
          const invalidMin = ministeres.filter((m) => !MINISTERES_VALIDES.includes(m));
          if (invalidMin.length > 0)
            errs.push(`ministère(s) invalide(s) : ${invalidMin.join(", ")}`);

          if (r.priere_salut && !["Oui", "Non"].includes(r.priere_salut))
            errs.push("priere_salut invalide (Oui ou Non)");

          if (r.priere_salut === "Oui" && !r.type_conversion)
            errs.push("type_conversion requis si priere_salut = Oui");

          if (errs.length > 0) {
            errs.forEach((err) => errorList.push(t.errorRow(lineNum, err)));
            return;
          }

          // ── Ligne valide ──
          validData.push({
            prenom: capitalize(r.prenom),
            nom: capitalize(r.nom),
            sexe: r.sexe,
            age: r.age,
            date_venu: dateVenu,
            telephone: r.telephone || null,
            is_whatsapp: r.is_whatsapp === "Oui",
            ville: capitalize(r.ville) || null,
            statut: r.statut || null,
            venu: r.venu || null,
            priere_salut: r.priere_salut || null,
            type_conversion: r.type_conversion || null,
            email: r.email.toLowerCase().trim(),
            password: r.password,
            roles,
            ministeresSelected: ministeres,
            cellule_nom: r.cellule_nom?.trim() || "",
            cellule_zone: r.cellule_zone?.trim() || "",
            cellule_mere_id: r.cellule_mere_id?.trim() || "",
          });
        });

        setErrors(errorList);
        setData(validData);
      },
    });
  };

  // ── Import ligne par ligne via /api/create-user ──
  const handleImport = async () => {
    setLoading(true);
    setImportErrors([]);
    setSuccess(false);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      setImportErrors([t.errSession]);
      setLoading(false);
      return;
    }

    let successCount = 0;
    const rowErrors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      setProgress(t.progressMsg(i + 1, data.length));

      try {
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...row,
            member_id: "add-serviteur", // toujours nouveau serviteur via import
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          rowErrors.push(t.errorRow(i + 2, result?.error ?? "Erreur inconnue"));
        } else {
          successCount++;
        }
      } catch (err) {
        rowErrors.push(t.errorRow(i + 2, err.message));
      }
    }

    setLoading(false);
    setProgress("");
    setImportCount(successCount);
    setImportErrors(rowErrors);

    if (successCount > 0) {
      setSuccess(true);
      setData([]);
    }
  };

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
      </div>

      {/* Résumé */}
      {(data.length > 0 || errors.length > 0) && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-white mb-1">{t.resumeFile}</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-emerald-300">{data.length}</p>
              <p className="text-xs text-white/70 mt-1">{t.readyToImport}</p>
            </div>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg py-3">
              <p className="text-2xl font-bold text-red-300">{errors.length}</p>
              <p className="text-xs text-white/70 mt-1">{t.errors}</p>
            </div>
          </div>
        </div>
      )}

      {/* Erreurs de parsing */}
      {errors.length > 0 && (
        <div className="bg-red-500/20 border border-red-400/40 text-red-200 p-4 rounded-xl">
          <p className="font-semibold mb-1">{errors.length} {t.errorsDetected}</p>
          {errors.slice(0, 10).map((err, i) => (
            <p key={i} className="text-sm">{err}</p>
          ))}
          {errors.length > 10 && (
            <p className="text-sm mt-1 italic">{t.andMore} {errors.length - 10} {t.otherErrors}</p>
          )}
        </div>
      )}

      {/* Aperçu */}
      {data.length > 0 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="font-semibold text-emerald-300 mb-2">{t.previewTitle}</p>
          <div className="max-h-40 overflow-auto space-y-1">
            {data.slice(0, 5).map((row, i) => (
              <div key={i} className="text-white/80 text-sm bg-white/5 rounded px-3 py-1">
                {row.prenom} {row.nom} — {row.email} — {row.roles.join(", ")}
                {row.cellule_nom ? ` — 📍 ${row.cellule_zone} / ${row.cellule_nom}` : ""}
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-white/40 italic text-sm">
                {t.andMore} {data.length - 5} {t.andOthers}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progression */}
      {progress && (
        <p className="text-blue-300 text-sm animate-pulse text-center">{progress}</p>
      )}

      {/* Bouton import */}
      <button
        onClick={handleImport}
        disabled={data.length === 0 || loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold py-3 rounded-xl shadow transition"
      >
        {loading ? t.importing : `${t.importBtn}${data.length > 0 ? ` ${data.length} ${t.user}` : ""}`}
      </button>

      {/* Erreurs d'import (API) */}
      {importErrors.length > 0 && (
        <div className="bg-red-500/20 border border-red-400/40 text-red-200 p-4 rounded-xl">
          <p className="font-semibold mb-1">{importErrors.length} {t.errorsDetected}</p>
          {importErrors.slice(0, 10).map((err, i) => (
            <p key={i} className="text-sm">{err}</p>
          ))}
          {importErrors.length > 10 && (
            <p className="text-sm mt-1 italic">{t.andMore} {importErrors.length - 10} {t.otherErrors}</p>
          )}
        </div>
      )}

      {/* Succès */}
      {success && (
        <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-4 text-center">
          <p className="text-emerald-300 font-bold text-lg">{t.successTitle}</p>
          <p className="text-white/70 text-sm mt-1">
            {importCount} {t.successMsg}
          </p>
        </div>
      )}
    </div>
  );
}
