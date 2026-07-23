"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { checkLimiteAtteinte } from "../lib/checkLimite";
import Papa from "papaparse";
import { useLang } from "../hooks/useLang";

// ─── Constantes ───────────────────────────────────────────────────────────────
const MINISTERES_VALIDES = [
  "Intercession", "Louange", "Technique", "Communication",
  "Les Enfants", "Les ados", "Les jeunes", "Finance",
  "Nettoyage", "Conseiller", "Compassion", "Visite",
  "Berger", "Modération",
];

const BESOIN_FR = [
  "Finances", "Santé", "Travail / Études", "Famille / Enfants",
  "Miracle", "Délivrance", "Relations / Conflits",
  "Addictions / Dépendances", "Guidance spirituelle",
  "Logement / Sécurité", "Communauté / Isolement", "Dépression / Santé mentale",
];

const SEXE_EN_TO_FR     = { "Male": "Homme", "Female": "Femme" };
const BOOL_EN_TO_FR     = { "Yes": "Oui", "No": "Non" };
const AGE_EN_TO_FR      = {
  "12-17 yrs": "12-17 ans", "18-25 yrs": "18-25 ans",
  "26-30 yrs": "26-30 ans", "31-40 yrs": "31-40 ans",
  "41-55 yrs": "41-55 ans", "56-69 yrs": "56-69 ans",
  "70 yrs and over": "70 ans et plus",
};
const VENU_EN_TO_FR     = {
  "invited": "invité", "social media": "réseaux",
  "evangelization": "evangélisation", "other": "autre",
};
const STATUT_EN_TO_FR   = {
  "wants to join the church": "veut rejoindre l'église",
  "already has a church": "a déjà son église",
  "new": "nouveau", "visitor": "visiteur",
};
const CONV_EN_TO_FR     = {
  "New convert": "Nouveau converti", "Reconciliation": "Réconciliation",
};
const BESOIN_EN_TO_FR   = {
  "Finances": "Finances", "Health": "Santé",
  "Work / Studies": "Travail / Études", "Family / Children": "Famille / Enfants",
  "Miracle": "Miracle", "Deliverance": "Délivrance",
  "Relationships / Conflicts": "Relations / Conflits",
  "Addictions / Dependencies": "Addictions / Dépendances",
  "Spiritual guidance": "Guidance spirituelle",
  "Housing / Safety": "Logement / Sécurité",
  "Community / Isolation": "Communauté / Isolement",
  "Depression / Mental health": "Dépression / Santé mentale",
};
const MINISTERES_EN_TO_FR = {
  "Intercession": "Intercession", "Praise": "Louange",
  "Technical": "Technique", "Communication": "Communication",
  "Children": "Les Enfants", "Teens": "Les ados", "Youth": "Les jeunes",
  "Finance": "Finance", "Cleaning": "Nettoyage", "Counselor": "Conseiller",
  "Compassion": "Compassion", "Visitation": "Visite",
  "Shepherd": "Berger", "Moderation": "Modération",
};
const EN_HEADER_MAP = {
  "last_name": "nom", "first_name": "prenom",
  "gender": "sexe", "date_joined": "date_venu",
  "servant": "serviteur", "status": "statut",
  "how_came": "venu", "salvation_prayer": "priere_salut",
  "conversion_type": "type_conversion",
  "phone": "telephone", "city": "ville",
  "water_baptism": "bapteme_eau", "spirit_baptism": "bapteme_esprit",
  "needs": "besoin", "additional_info": "infos_supplementaires",
  "ministry": "ministere",
};

const norm = (value, enToFrMap, validFrValues) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (validFrValues.includes(trimmed)) return trimmed;
  return enToFrMap[trimmed] ?? trimmed;
};

// ─── Traductions UI ───────────────────────────────────────────────────────────
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
    limitReached: "Limite atteinte",
    limitExceeded: "Cet import dépasserait la limite : vous avez",
    membersAndWant: "membres et voulez en importer",
    upgradeplan: "Upgradez votre plan.",
    errorInsert: "Erreur insert: ",
    errorInsertDup: "Erreur insert doublon: ",
    errorUpdate: "Erreur update",
    templateHeaders: [
      "nom *", "prenom *", "sexe *", "age *", "date_venu *", "serviteur *",
      "statut *", "venu *", "priere_salut *", "type_conversion *",
      "telephone", "ville", "is_whatsapp",
      "bapteme_eau", "bapteme_esprit",
      "ministere",
      "besoin",
      "infos_supplementaires",
    ],
    templateExample: [
      "Dupont", "Marie", "Femme", "18-25 ans", "2026-01-15", "Oui",
      "nouveau", "invité", "Oui", "Nouveau converti",
      "+336 12 34 56 78", "Paris", "Oui",
      "Oui", "Non",
      "Louange|Intercession",
      "Finances;Santé",
      "Info supplementaire ici",
    ],
    templateNotes: [
      "IMPORTANT: Effacez toutes les lignes commencant par # avant d'importer le fichier.",
      "Les colonnes avec * sont obligatoires.",
      "sexe: Homme | Femme",
      "age: 12-17 ans | 18-25 ans | 26-30 ans | 31-40 ans | 41-55 ans | 56-69 ans | 70 ans et plus",
      "Le préfixe téléphonique du pays doit être placé avant le numéro de téléphone",
      "date_venu: format YYYY-MM-DD ou JJ-MM-AA ou JJ-MM-AAAA",
      "serviteur: Oui | Non",
      "statut: veut rejoindre l'église | a déjà son église | nouveau | visiteur",
      "venu: invité | réseaux | evangélisation | autre",
      "priere_salut: Oui | Non",
      "type_conversion: Nouveau converti | Réconciliation (optionnel- uniquement si priere_salut = Oui)",
      "is_whatsapp: Oui | Non (ou vide)",
      "bapteme_eau / bapteme_esprit: Oui | Non (ou vide)",
      "ministere: OBLIGATOIRE si serviteur = Oui — valeurs séparées par | : Intercession | Louange | Technique | Communication | Les Enfants | Les ados | Les jeunes | Finance | Nettoyage | Conseiller | Compassion | Visite | Berger | Modération",
      "besoin: valeurs séparées par ; (ex: Finances;Santé;Travail / Études) — valeurs possibles : Finances | Santé | Travail / Études | Famille / Enfants | Miracle | Délivrance | Relations / Conflits | Addictions / Dépendances | Guidance spirituelle | Logement / Sécurité | Communauté / Isolement | Dépression / Santé mentale",
    ],
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
    limitReached: "Limit reached",
    limitExceeded: "This import would exceed the limit: you have",
    membersAndWant: "members and want to import",
    upgradeplan: "Upgrade your plan.",
    errorInsert: "Insert error: ",
    errorInsertDup: "Duplicate insert error: ",
    errorUpdate: "Update error",
    templateHeaders: [
      "last_name *", "first_name *", "gender *", "age *", "date_joined *", "servant *",
      "status *", "how_came *", "salvation_prayer *", "conversion_type *",
      "phone", "city", "is_whatsapp",
      "water_baptism", "spirit_baptism",
      "ministry",
      "needs",
      "additional_info",
    ],
    templateExample: [
      "Dupont", "Mary", "Female", "18-25 yrs", "2026-01-15", "Yes",
      "new", "invited", "Yes", "New convert",
      "+1 212 555 0147", "New York", "Yes",
      "Yes", "No",
      "Praise|Intercession",
      "Finances;Health",
      "Additional info here",
    ],
    templateNotes: [
      "IMPORTANT: Delete all lines starting with # before importing the file.",
      "Columns with * are required.",
      "gender: Male | Female",
      "age: 12-17 yrs | 18-25 yrs | 26-30 yrs | 31-40 yrs | 41-55 yrs | 56-69 yrs | 70 yrs and over",
      "The country phone prefix must be placed before the phone number",
      "date_joined: format YYYY-MM-DD or DD-MM-YY or DD-MM-YYYY",
      "servant: Yes | No",
      "status: wants to join the church | already has a church | new | visitor",
      "how_came: invited | social media | evangelization | other",
      "salvation_prayer: Yes | No",
      "conversion_type: New convert | Reconciliation (optiona- only if salvation_prayer = Yes)",
      "is_whatsapp: Yes | No (or empty)",
      "water_baptism / spirit_baptism: Yes | No (or empty)",
      "ministry: REQUIRED if servant = Yes — values separated by | : Intercession | Praise | Technical | Communication | Children | Teens | Youth | Finance | Cleaning | Counselor | Compassion | Visitation | Shepherd | Moderation",
      "needs: values separated by ; (e.g.: Finances;Health;Work / Studies) — possible values: Finances | Health | Work / Studies | Family / Children | Miracle | Deliverance | Relationships / Conflicts | Addictions / Dependencies | Spiritual guidance | Housing / Safety | Community / Isolation | Depression / Mental health",
    ],
  },
};

export default function ImportMembresCSV({ user }) {
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

  const requiredFields = [
    "nom", "prenom", "sexe", "age", "date_venu", "serviteur",
    "statut", "venu", "priere_salut",
  ];

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
    const csvContent = [
      t.templateHeaders.join(","),
      t.templateExample.join(","),
      "",
      ...t.templateNotes.map((n) => `# ${n}`),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = lang === "en" ? "template_import_members.csv" : "template_import_membres.csv";
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

          // ── Normaliser les clés : enlever " *", mapper EN → FR ──
          const normalized = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.replace(" *", "").trim();
            const mappedKey = EN_HEADER_MAP[cleanKey] ?? cleanKey;
            normalized[mappedKey] = row[key]?.toString().trim() || "";
          });

          // ── Normaliser les valeurs EN → FR ──
          normalized.sexe           = norm(normalized.sexe, SEXE_EN_TO_FR, ["Homme", "Femme"]);
          normalized.age            = norm(normalized.age, AGE_EN_TO_FR, ["12-17 ans","18-25 ans","26-30 ans","31-40 ans","41-55 ans","56-69 ans","70 ans et plus"]);
          normalized.serviteur      = norm(normalized.serviteur, BOOL_EN_TO_FR, ["Oui", "Non"]);
          normalized.is_whatsapp    = norm(normalized.is_whatsapp, BOOL_EN_TO_FR, ["Oui", "Non"]);
          normalized.priere_salut   = norm(normalized.priere_salut, BOOL_EN_TO_FR, ["Oui", "Non"]);
          normalized.bapteme_eau    = norm(normalized.bapteme_eau, BOOL_EN_TO_FR, ["Oui", "Non"]);
          normalized.bapteme_esprit = norm(normalized.bapteme_esprit, BOOL_EN_TO_FR, ["Oui", "Non"]);
          normalized.statut         = norm(normalized.statut, STATUT_EN_TO_FR, ["veut rejoindre l'église","a déjà son église","nouveau","visiteur"]);
          normalized.venu           = norm(normalized.venu, VENU_EN_TO_FR, ["invité","réseaux","evangélisation","autre"]);
          normalized.type_conversion = norm(normalized.type_conversion, CONV_EN_TO_FR, ["Nouveau converti","Réconciliation"]);

          // Besoins EN → FR
          if (normalized.besoin) {
            normalized.besoin = normalized.besoin
              .split(";").map((b) => BESOIN_EN_TO_FR[b.trim()] ?? b.trim()).join(";");
          }

          let rowErrors = [];

          // ── Champs obligatoires ──
          requiredFields.forEach((field) => {
            if (!normalized[field])
              rowErrors.push(`Ligne ${index + 1}: ${field} manquant`);
          });

          if (normalized.priere_salut === "Oui" && !normalized.type_conversion) {
            rowErrors.push(`Ligne ${index + 1}: type_conversion manquant (requis si priere_salut = Oui)`);
          }

          // ── Validations des valeurs ──
          if (normalized.sexe && !["Homme", "Femme"].includes(normalized.sexe))
            rowErrors.push(`Ligne ${index + 1}: sexe invalide (Homme ou Femme)`);

          const validAges = ["12-17 ans","18-25 ans","26-30 ans","31-40 ans","41-55 ans","56-69 ans","70 ans et plus"];
          if (normalized.age && !validAges.includes(normalized.age))
            rowErrors.push(`Ligne ${index + 1}: age invalide`);

          const dateVenu = parseDate(normalized.date_venu);
          if (normalized.date_venu && !dateVenu)
            rowErrors.push(`Ligne ${index + 1}: date_venu invalide`);

          if (normalized.serviteur && !["Oui", "Non"].includes(normalized.serviteur))
            rowErrors.push(`Ligne ${index + 1}: serviteur invalide (Oui ou Non)`);

          const validStatuts = ["veut rejoindre l'église","a déjà son église","nouveau","visiteur"];
          if (normalized.statut && !validStatuts.includes(normalized.statut))
            rowErrors.push(`Ligne ${index + 1}: statut invalide`);

          const validVenu = ["invité","réseaux","evangélisation","autre"];
          if (normalized.venu && !validVenu.includes(normalized.venu))
            rowErrors.push(`Ligne ${index + 1}: venu invalide (invité | réseaux | evangélisation | autre)`);

          if (normalized.priere_salut && !["Oui", "Non"].includes(normalized.priere_salut))
            rowErrors.push(`Ligne ${index + 1}: priere_salut invalide (Oui ou Non)`);

          if (normalized.is_whatsapp && !["Oui", "Non", ""].includes(normalized.is_whatsapp))
            rowErrors.push(`Ligne ${index + 1}: is_whatsapp invalide (Oui ou Non)`);

          if (normalized.bapteme_eau && !["Oui", "Non", ""].includes(normalized.bapteme_eau))
            rowErrors.push(`Ligne ${index + 1}: bapteme_eau invalide (Oui ou Non)`);

          if (normalized.bapteme_esprit && !["Oui", "Non", ""].includes(normalized.bapteme_esprit))
            rowErrors.push(`Ligne ${index + 1}: bapteme_esprit invalide (Oui ou Non)`);

          const validConversions = ["Nouveau converti", "Réconciliation"];
          if (normalized.type_conversion && !validConversions.includes(normalized.type_conversion))
            rowErrors.push(`Ligne ${index + 1}: type_conversion invalide (Nouveau converti | Réconciliation)`);

          // ── Ministère : normaliser EN → FR, obligatoire si serviteur = Oui ──
          const ministeresRaw = normalized.ministere
            ? normalized.ministere.split("|").map((m) => m.trim()).filter(Boolean)
            : [];
          const ministeres = ministeresRaw.map((m) => MINISTERES_EN_TO_FR[m] ?? m);

          if (normalized.serviteur === "Oui" && ministeres.length === 0) {
            rowErrors.push(`Ligne ${index + 1}: ministere obligatoire si serviteur = Oui`);
          }
          const invalidMin = ministeres.filter((m) => !MINISTERES_VALIDES.includes(m));
          if (invalidMin.length > 0) {
            rowErrors.push(`Ligne ${index + 1}: ministere invalide : ${invalidMin.join(", ")}`);
          }

          // ── Besoins : normaliser + valider chaque valeur ──
          const besoin = normalized.besoin
            ? normalized.besoin.split(";").map((b) => b.trim()).filter(Boolean)
            : [];
          const invalidBesoin = besoin.filter((b) => !BESOIN_FR.includes(b));
          if (invalidBesoin.length > 0) {
            rowErrors.push(`Ligne ${index + 1}: besoin invalide : ${invalidBesoin.join(", ")}`);
          }

          if (rowErrors.length === 0) {
            validData.push({
              nom:                   capitalize(normalized.nom),
              prenom:                capitalize(normalized.prenom),
              sexe:                  normalized.sexe,
              age:                   normalized.age,
              date_venu:             dateVenu,
              star:                  normalized.serviteur === "Oui",
              statut:                normalized.statut,
              venu:                  normalized.venu,
              priere_salut:          normalized.priere_salut,
              telephone:             cleanPhone(normalized.telephone) || null,
              ville:                 capitalize(normalized.ville) || null,
              is_whatsapp:           normalized.is_whatsapp === "Oui",
              bapteme_eau:           normalized.bapteme_eau || null,
              bapteme_esprit:        normalized.bapteme_esprit || null,
              Ministere:             ministeres.length > 0 ? JSON.stringify(ministeres) : null,
              besoin:                besoin.length > 0 ? besoin : null,
              type_conversion:       normalized.type_conversion || null,
              infos_supplementaires: normalized.infos_supplementaires || null,
              eglise_id:             user.eglise_id,
              statut_suivis:         3,
              etat_contact:          "existant",
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
            age: rowData.age, date_venu: rowData.date_venu, star: rowData.star,
            statut: rowData.statut, venu: rowData.venu, priere_salut: rowData.priere_salut,
            telephone: rowData.telephone, ville: rowData.ville, is_whatsapp: rowData.is_whatsapp,
            bapteme_eau: rowData.bapteme_eau, bapteme_esprit: rowData.bapteme_esprit,
            Ministere: rowData.Ministere,
            besoin: rowData.besoin, type_conversion: rowData.type_conversion,
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
        {checking && (
          <p className="text-blue-300 text-sm mt-2 animate-pulse">{t.checkingDuplicates}</p>
        )}
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
          {errors.slice(0, 10).map((err, i) => (
            <p key={i} className="text-sm">{err}</p>
          ))}
          {errors.length > 10 && (
            <p className="text-sm mt-1 italic">{t.andMore} {errors.length - 10} {t.otherErrors}</p>
          )}
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
                <p className="text-white font-semibold text-sm">
                  {d.csv}<span className="text-white/50 font-normal"> · {d.telephone}</span>
                </p>
                <p className="text-orange-200/80 text-xs mt-0.5">
                  {t.alreadyInBase} <span className="text-white font-semibold">{d.existing}</span>
                </p>
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
            <button
              onClick={() => { const allChecked = duplicates.every((d) => depsToUpdate[d.telephone]); const next = {}; if (!allChecked) duplicates.forEach((d) => (next[d.telephone] = true)); setDepsToUpdate(next); setDepsToAdd({}); }}
              className="text-xs text-blue-300 underline"
            >
              {duplicates.every((d) => depsToUpdate[d.telephone]) ? t.uncheckAll : t.updateAll}
            </button>
            <button
              onClick={() => { const allChecked = duplicates.every((d) => depsToAdd[d.telephone]); const next = {}; if (!allChecked) duplicates.forEach((d) => (next[d.telephone] = true)); setDepsToAdd(next); setDepsToUpdate({}); }}
              className="text-xs text-emerald-300 underline"
            >
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
                {row.prenom} {row.nom} — {row.sexe} — {row.age} — {row.date_venu}
                {row.star ? " ★" : ""}
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-white/40 italic text-sm">...{t.andMore} {data.length - 5} {t.andOthers}</p>
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
