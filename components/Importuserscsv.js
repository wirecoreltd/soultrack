"use client";

import { useState, useMemo } from "react";
import Papa from "papaparse";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";
import { useFeature } from "../components/FeaturesContext";

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

// ─── Roles & ministères (valeurs DB = toujours en français) ───
// feature: null = toujours disponible
const ALL_ROLES = [
  { key: "Administrateur",            feature: null },
  { key: "ResponsableIntegration",    feature: null },
  { key: "ResponsableEvangelisation", feature: null },
  { key: "ResponsableCellule",        feature: "cellules" },
  { key: "SuperviseurCellule",        feature: "cellules" },
  { key: "ResponsableFamilles",       feature: "familles" },
  { key: "SuperviseurFamilles",       feature: "familles" },
  { key: "Conseiller",                feature: "conseiller" },
];

const MINISTERES_VALIDES = [
  "Intercession", "Louange", "Technique", "Communication",
  "Les Enfants", "Les ados", "Les jeunes", "Finance",
  "Nettoyage", "Conseiller", "Compassion", "Visite",
  "Berger", "Modération",
];

const AGE_OPTIONS_FR = [
  "12-17 ans", "18-25 ans", "26-30 ans", "31-40 ans",
  "41-55 ans", "56-69 ans", "70 ans et plus",
];

const AGE_OPTIONS_EN = [
  "12-17 yrs", "18-25 yrs", "26-30 yrs", "31-40 yrs",
  "41-55 yrs", "56-69 yrs", "70 yrs and over",
];

// ─── Mappings EN → FR pour les valeurs stockées en DB ───
const AGE_EN_TO_FR = {
  "12-17 yrs":       "12-17 ans",
  "18-25 yrs":       "18-25 ans",
  "26-30 yrs":       "26-30 ans",
  "31-40 yrs":       "31-40 ans",
  "41-55 yrs":       "41-55 ans",
  "56-69 yrs":       "56-69 ans",
  "70 yrs and over": "70 ans et plus",
};

const SEXE_EN_TO_FR = {
  "Male":   "Homme",
  "Female": "Femme",
};

const BOOL_EN_TO_FR = {
  "Yes": "Oui",
  "No":  "Non",
};

const STATUT_EN_TO_FR = {
  "wants to join the church": "veut rejoindre l'église",
  "already has a church":     "a déjà son église",
  "new":                      "nouveau",
  "visitor":                  "visiteur",
};

const VENU_EN_TO_FR = {
  "invited":        "invité",
  "social media":   "réseaux",
  "evangelization": "evangélisation",
  "other":          "autre",
};

const CONVERSION_EN_TO_FR = {
  "New convert":    "Nouveau converti",
  "Reconciliation": "Réconciliation",
};

const MINISTERES_EN_TO_FR = {
  "Intercession": "Intercession",
  "Praise":       "Louange",
  "Technical":    "Technique",
  "Communication":"Communication",
  "Children":     "Les Enfants",
  "Teens":        "Les ados",
  "Youth":        "Les jeunes",
  "Finance":      "Finance",
  "Cleaning":     "Nettoyage",
  "Counselor":    "Conseiller",
  "Compassion":   "Compassion",
  "Visitation":   "Visite",
  "Shepherd":     "Berger",
  "Moderation":   "Modération",
};

// Normalise une valeur : accepte FR ou EN, retourne toujours la valeur FR (DB)
const normalizeValue = (value, enToFrMap, validFrValues) => {
  if (!value) return "";
  const trimmed = value.trim();
  // Déjà en FR ?
  if (validFrValues.includes(trimmed)) return trimmed;
  // Traduction EN → FR ?
  return enToFrMap[trimmed] ?? trimmed; // retourne tel quel si inconnu (sera rejeté par validation)
};

// ─── Config template par langue (fonction pour injecter les rôles filtrés) ───
const getTemplateConfig = (lang, rolesValides) => ({
  fr: {
    filename: "template_import_utilisateurs.csv",
    headers: [
      "prenom *", "nom *", "sexe *", "age *", "date_venu *",
      "telephone", "is_whatsapp", "ville",
      "statut", "venu", "priere_salut", "type_conversion",
      "email *", "password *", "roles *", "ministeres *",
      "cellule_nom", "cellule_zone",
    ],
    example: [
      "Jean", "Dupont", "Homme", "26-30 ans", "2026-01-15",
      "+33698765412", "Oui", "Paris",
      "veut rejoindre l'église", "invité", "Oui", "Nouveau converti",
      "jean.dupont@email.com", "MotDePasse123",
      rolesValides.includes("ResponsableCellule") ? "ResponsableCellule" : rolesValides[0] ?? "Administrateur",
      "Louange|Intercession",
      rolesValides.includes("ResponsableCellule") ? "Ma Cellule" : "",
      rolesValides.includes("ResponsableCellule") ? "Rose-Hill" : "",
    ],
    notes: [
      "IMPORTANT: Effacez toutes les lignes commençant par # avant d'importer.",
      "Les colonnes avec * sont obligatoires.",
      "sexe: Homme | Femme",
      "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
      "Le préfixe téléphonique du pays doit être placé avant le numéro de téléphone",      
      "date_venu: format YYYY-MM-DD ou JJ-MM-AAAA",
      "is_whatsapp: Oui | Non (ou vide = Non)",
      "statut: veut rejoindre l'église | a déjà son église | nouveau | visiteur",
      "venu: invité | réseaux | evangélisation | autre",
      "priere_salut: Oui | Non",
      "type_conversion: Nouveau converti | Réconciliation (requis si priere_salut = Oui)",
      `roles: ${rolesValides.join(" | ")} — séparer plusieurs rôles par |`,
      `ministeres: ${MINISTERES_VALIDES.join(" | ")} — séparer par | — OBLIGATOIRE`,
      ...(rolesValides.includes("ResponsableCellule") ? ["cellule_nom / cellule_zone: obligatoires si role = ResponsableCellule"] : []),
      "cellule_mere_id: UUID de la cellule mère (optionnel)",
    ],
  },
  en: {
    filename: "template_import_users.csv",
    headers: [
      "first_name *", "last_name *", "gender *", "age *", "date_joined *",
      "phone", "is_whatsapp", "city",
      "status", "how_came", "salvation_prayer", "conversion_type",
      "email *", "password *", "roles *", "ministries *",
      "cell_name", "cell_area",
    ],
    example: [
      "John", "Smith", "Male", "26-30 yrs", "2026-01-15",
      "+12025550101", "Yes", "New York",
      "wants to join the church", "invited", "Yes", "New convert",
      "john.smith@email.com", "Password123",
      rolesValides.includes("ResponsableCellule") ? "ResponsableCellule" : rolesValides[0] ?? "Administrateur",
      "Praise|Intercession",
      rolesValides.includes("ResponsableCellule") ? "My Cell" : "",
      rolesValides.includes("ResponsableCellule") ? "Brooklyn" : "",
    ],
    notes: [
      "IMPORTANT: Delete all lines starting with # before importing.",
      "Columns with * are required.",
      "gender: Male | Female",
      "age: 12-17 yrs | 18-25 yrs | 26-30 yrs | 31-40 yrs | 41-55 yrs | 56-69 yrs | 70 yrs and over",
      "The country phone prefix must be placed before the phone number",
      "date_joined: format YYYY-MM-DD or DD-MM-YYYY",
      "is_whatsapp: Yes | No (or empty = No)",
      "status: wants to join the church | already has a church | new | visitor",
      "how_came: invited | social media | evangelization | other",
      "salvation_prayer: Yes | No",
      "conversion_type: New convert | Reconciliation (required if salvation_prayer = Yes)",
      `roles: ${rolesValides.join(" | ")} — separate multiple roles with |`,
    `ministries: ${Object.values(MINISTERES_EN_TO_FR).map(fr => Object.keys(MINISTERES_EN_TO_FR).find(en => MINISTERES_EN_TO_FR[en] === fr)).join(" | ")} — separate with | — REQUIRED`,
      ...(rolesValides.includes("ResponsableCellule") ? ["cell_name / cell_area: required if role = ResponsableCellule"] : []),
      "cellule_mere_id: UUID of the parent cell group (optional)",
    ],
  },
})[lang] ?? getTemplateConfig("fr", rolesValides);

// Mapping des headers EN → clés internes FR
const EN_HEADER_MAP = {
  "first_name": "prenom",
  "last_name":  "nom",
  "gender":     "sexe",
  "date_joined":"date_venu",
  "phone":      "telephone",
  "city":       "ville",
  "status":     "statut",
  "how_came":   "venu",
  "salvation_prayer": "priere_salut",
  "conversion_type":  "type_conversion",
  "ministries": "ministeres",
  "cell_name":  "cellule_nom",
  "cell_area":  "cellule_zone",
};

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

  const cellulesActive   = useFeature("cellules");
  const famillesActive   = useFeature("familles");
  const conseillerActive = useFeature("conseiller");

  // Rôles filtrés selon les features actives de l'église
  const ROLES_VALIDES = useMemo(() => {
    const featureMap = { cellules: cellulesActive, familles: famillesActive, conseiller: conseillerActive };
    return ALL_ROLES
      .filter(r => !r.feature || featureMap[r.feature])
      .map(r => r.key);
  }, [cellulesActive, famillesActive, conseillerActive]);

  const [data, setData]                 = useState([]);
  const [errors, setErrors]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [progress, setProgress]         = useState("");
  const [success, setSuccess]           = useState(false);
  const [importCount, setImportCount]   = useState(0);
  const [importErrors, setImportErrors] = useState([]);

  // ── Téléchargement du template selon la langue ──
  const handleDownloadTemplate = () => {
    const cfg = getTemplateConfig(lang, ROLES_VALIDES);

    const csvContent = [
      cfg.headers.join(","),
      cfg.example.join(","),
      "",
      ...cfg.notes.map((n) => `# ${n}`),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cfg.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Parse + validation (accepte FR et EN) ──
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
          const lineNum = index + 2;

          // Skip lignes commentaires
          if (Object.values(row)[0]?.toString().trim().startsWith("#")) return;

          // ── Normaliser les clés ──
          // 1) Enlever " *"
          // 2) Mapper les headers EN → FR si nécessaire
          const r = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.replace(" *", "").trim();
            const mappedKey = EN_HEADER_MAP[cleanKey] ?? cleanKey;
            r[mappedKey] = row[key]?.toString().trim() || "";
          });

          const errs = [];

          // ── Champs obligatoires ──
          ["prenom", "nom", "sexe", "age", "date_venu", "email", "password", "roles"].forEach((f) => {
            if (!r[f]) errs.push(`${f} missing`);
          });

          // ── Normaliser les valeurs EN → FR ──
          const sexeNorm = normalizeValue(r.sexe, SEXE_EN_TO_FR, ["Homme", "Femme"]);
          const ageNorm  = normalizeValue(r.age,  AGE_EN_TO_FR,  AGE_OPTIONS_FR);
          const isWhatsappRaw = normalizeValue(r.is_whatsapp, BOOL_EN_TO_FR, ["Oui", "Non"]);
          const priereSalutNorm = normalizeValue(r.priere_salut, BOOL_EN_TO_FR, ["Oui", "Non"]);
          const statutNorm = normalizeValue(r.statut, STATUT_EN_TO_FR,
            ["veut rejoindre l'église", "a déjà son église", "nouveau", "visiteur"]);
          const venuNorm = normalizeValue(r.venu, VENU_EN_TO_FR,
            ["invité", "réseaux", "evangélisation", "autre"]);
          const conversionNorm = normalizeValue(r.type_conversion, CONVERSION_EN_TO_FR,
            ["Nouveau converti", "Réconciliation"]);

          // ── Validations ──
          if (r.sexe && !["Homme", "Femme"].includes(sexeNorm))
            errs.push(`gender invalid (${lang === "en" ? "Male or Female" : "Homme ou Femme"})`);

          if (r.age && !AGE_OPTIONS_FR.includes(ageNorm))
            errs.push("age invalid");

          const dateVenu = parseDate(r.date_venu);
          if (r.date_venu && !dateVenu)
            errs.push("date invalid");

          // Rôles (identiques FR/EN)
          const roles = r.roles
            ? r.roles.split("|").map((x) => x.trim()).filter(Boolean)
            : [];
          const invalidRoles = roles.filter((ro) => !ROLES_VALIDES.includes(ro));
          if (invalidRoles.length > 0)
            errs.push(`invalid role(s): ${invalidRoles.join(", ")}`);
          if (roles.length === 0)
            errs.push("at least one role is required");

          // Cellule obligatoire si ResponsableCellule
          if (roles.includes("ResponsableCellule")) {
            if (!r.cellule_nom?.trim()) errs.push("cell name required for ResponsableCellule");
            if (!r.cellule_zone?.trim()) errs.push("cell area required for ResponsableCellule");
          }

          // Ministères — normaliser EN → FR si besoin
          const ministeresRaw = r.ministeres
            ? r.ministeres.split("|").map((x) => x.trim()).filter(Boolean)
            : [];
          const ministeres = ministeresRaw.map((m) =>
            MINISTERES_EN_TO_FR[m] ?? m  // traduit si EN, sinon conserve (sera validé après)
          );
          const invalidMin = ministeres.filter((m) => !MINISTERES_VALIDES.includes(m));
          if (invalidMin.length > 0)
            errs.push(`invalid ministr(ies): ${invalidMin.join(", ")}`);

          if (ministeres.length === 0)
          errs.push(lang === "en" ? "at least one ministry is required" : "au moins un ministère est requis");

          if (r.priere_salut && !["Oui", "Non"].includes(priereSalutNorm))
            errs.push(`salvation_prayer invalid (${lang === "en" ? "Yes or No" : "Oui ou Non"})`);

          if (priereSalutNorm === "Oui" && !conversionNorm)
            errs.push("conversion_type required when salvation_prayer = Yes");

          if (errs.length > 0) {
            errs.forEach((err) => errorList.push(t.errorRow(lineNum, err)));
            return;
          }

          // ── Ligne valide — toutes les valeurs sont désormais en FR (DB) ──
          validData.push({
            prenom:          capitalize(r.prenom),
            nom:             capitalize(r.nom),
            sexe:            sexeNorm,
            age:             ageNorm,
            date_venu:       dateVenu,
            telephone:       r.telephone || null,
            is_whatsapp:     isWhatsappRaw === "Oui",
            ville:           capitalize(r.ville) || null,
            statut:          statutNorm || null,
            venu:            venuNorm || null,
            priere_salut:    priereSalutNorm || null,
            type_conversion: conversionNorm || null,
            email:           r.email.toLowerCase().trim(),
            password:        r.password,
            roles,
            ministeresSelected: ministeres,
            cellule_nom:     r.cellule_nom?.trim() || "",
            cellule_zone:    r.cellule_zone?.trim() || "",
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

    setProgress(t.progressMsg(1, data.length));

      const res = await fetch("/api/create-users-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ users: data }),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        rowErrors.push(result?.error ?? "Unknown error");
      } else {
        successCount = result.success;
        rowErrors.push(...(result.errors || []));
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
