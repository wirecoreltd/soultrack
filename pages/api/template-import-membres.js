import ExcelJS from "exceljs";

// ─── Constantes (mêmes valeurs que dans ImportMembresCSV.js) ──────────────
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
  "Couple / Mariage", "Vie spirituelle", "Deuil / Perte",
  "Immigration / Documents", "Legal / Protection", "Besoins essentiels",
];

const MINISTERES_EN = [
  "Intercession", "Praise", "Technical", "Communication",
  "Children", "Teens", "Youth", "Finance", "Cleaning",
  "Counselor", "Compassion", "Visitation", "Shepherd", "Moderation",
];

const BESOIN_EN = [
  "Finances", "Physical health", "Depression / Mental health",
  "Work / Studies", "Family / Children", "Marriage / Relationships",
  "Relationships / Conflicts", "Addictions / Dependencies",
  "Spiritual life", "Miracle", "Deliverance", "Grief / Loss",
  "Housing / Safety", "Immigration / Documentation",
  "Justice / Protection", "Community / Isolation", "Basic Needs",
];

// Position (0-based) de chaque champ dans templateHeaders (identique FR/EN)
const FIELD_INDEX = {
  nom: 0, prenom: 1, sexe: 2, age: 3, date_venu: 4, serviteur: 5,
  statut: 6, venu: 7, priere_salut: 8, type_conversion: 9,
  telephone: 10, ville: 11, is_whatsapp: 12,
  bapteme_eau: 13, bapteme_esprit: 14,
  ministere_1: 15, ministere_2: 16, ministere_3: 17, ministere_4: 18, ministere_5: 19,
  besoin_1: 20, besoin_2: 21, besoin_3: 22, besoin_4: 23, besoin_5: 24, besoin_6: 25,
  infos_supplementaires: 26,
};

const MINISTERE_SLOTS = ["ministere_1", "ministere_2", "ministere_3", "ministere_4", "ministere_5"];
const BESOIN_SLOTS = ["besoin_1", "besoin_2", "besoin_3", "besoin_4", "besoin_5", "besoin_6"];

const colLetter = (n) => {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

export default async function handler(req, res) {
  try {
    const isEn = req.query.lang === "en";

    const headers = isEn
      ? [
          "last_name *", "first_name *", "gender *", "age *", "date_joined *", "servant *",
          "status *", "how_came *", "salvation_prayer *", "conversion_type *",
          "phone", "city", "is_whatsapp",
          "water_baptism", "spirit_baptism",
          "ministry_1", "ministry_2", "ministry_3", "ministry_4", "ministry_5",
          "need_1", "need_2", "need_3", "need_4", "need_5", "need_6",
          "additional_info",
        ]
      : [
          "nom *", "prenom *", "sexe *", "age *", "date_venu *", "serviteur *",
          "statut *", "venu *", "priere_salut *", "type_conversion *",
          "telephone", "ville", "is_whatsapp",
          "bapteme_eau", "bapteme_esprit",
          "ministere_1", "ministere_2", "ministere_3", "ministere_4", "ministere_5",
          "besoin_1", "besoin_2", "besoin_3", "besoin_4", "besoin_5", "besoin_6",
          "infos_supplementaires",
        ];

    const example = isEn
      ? ["Dupont", "Mary", "Female", "18-25 yrs", "2026-01-15", "Yes",
         "new", "invited", "Yes", "New convert",
         "+1 212 555 0147", "New York", "Yes", "Yes", "No",
         "Praise", "Intercession", "", "", "",
         "Finances", "Physical health", "", "", "", "",
         "Additional info here"]
      : ["Dupont", "Marie", "Femme", "18-25 ans", "2026-01-15", "Oui",
         "nouveau", "invité", "Oui", "Nouveau converti",
         "+336 12 34 56 78", "Paris", "Oui", "Oui", "Non",
         "Louange", "Intercession", "", "", "",
         "Finances", "Santé", "", "", "", "",
         "Info supplementaire ici"];

    const notes = isEn
      ? [
          "IMPORTANT: Delete all lines starting with # before importing the file.",
          "Columns with * are required.",
          "gender, age, status, how_came, conversion_type, yes/no, ministry and need columns have a dropdown: click the cell then the small arrow.",
          "date_joined: format YYYY-MM-DD or DD-MM-YY or DD-MM-YYYY",
          "ministry_1 to ministry_5: one value per column. REQUIRED (at least one) if servant = Yes.",
          "need_1 to need_6: one value per column (optional).",
          "More than 5 ministries/6 needs, or a custom one? Edit the member's profile in the app after import.",
        ]
      : [
          "IMPORTANT: Effacez toutes les lignes commencant par # avant d'importer le fichier.",
          "Les colonnes avec * sont obligatoires.",
          "Les colonnes sexe, age, statut, venu, type_conversion, oui/non, ministeres et besoins ont un menu deroulant : cliquez sur la cellule puis sur la petite fleche.",
          "date_venu: format YYYY-MM-DD ou JJ-MM-AA ou JJ-MM-AAAA",
          "ministere_1 a ministere_5: une valeur par colonne. OBLIGATOIRE (au moins une) si serviteur = Oui.",
          "besoin_1 a besoin_6: une valeur par colonne (facultatif).",
          "Plus de 5 ministeres/6 besoins, ou un personnalise ? Modifiez la fiche du membre dans l'application apres l'import.",
        ];

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet(isEn ? "Template" : "Modele");

    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };
    ws.addRow(example);
    notes.forEach((note) => ws.addRow([`# ${note}`]));
    ws.columns.forEach((col) => { col.width = 24; });
    ws.views = [{ state: "frozen", ySplit: 1 }];

    // ── Feuille cachée pour les listes des menus déroulants ──
    const wsListes = workbook.addWorksheet("Listes");
    wsListes.state = "hidden";

    const lists = {
      sexe: isEn ? ["Male", "Female"] : ["Homme", "Femme"],
      age: isEn
        ? ["12-17 yrs","18-25 yrs","26-30 yrs","31-40 yrs","41-55 yrs","56-69 yrs","70 yrs and over"]
        : ["12-17 ans","18-25 ans","26-30 ans","31-40 ans","41-55 ans","56-69 ans","70 ans et plus"],
      bool: isEn ? ["Yes", "No"] : ["Oui", "Non"],
      statut: isEn
        ? ["wants to join the church","already has a church","new","visitor"]
        : ["veut rejoindre l'église","a déjà son église","nouveau","visiteur"],
      venu: isEn
        ? ["invited","social media","evangelization","other"]
        : ["invité","réseaux","evangélisation","autre"],
      conversion: isEn ? ["New convert","Reconciliation"] : ["Nouveau converti","Réconciliation"],
      ministere: isEn ? MINISTERES_EN : MINISTERES_VALIDES,
      besoin: isEn ? BESOIN_EN : BESOIN_FR,
    };

    const listKeys = Object.keys(lists);
    listKeys.forEach((key, colIdx) => {
      lists[key].forEach((val, rowIdx) => {
        wsListes.getCell(rowIdx + 1, colIdx + 1).value = val;
      });
    });

    const rangeFor = (key) => {
      const colIdx = listKeys.indexOf(key) + 1;
      const letter = colLetter(colIdx);
      return `Listes!$${letter}$1:$${letter}$${lists[key].length}`;
    };

    const applyList = (colNumber, listKey) => {
      const formula = rangeFor(listKey);
      for (let row = 2; row <= 200; row++) {
        ws.getCell(row, colNumber).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [formula],
          showErrorMessage: true,
          errorStyle: "warning",
          error: isEn ? "Please pick a value from the list." : "Merci de choisir une valeur dans la liste.",
        };
      }
    };

    applyList(FIELD_INDEX.sexe + 1, "sexe");
    applyList(FIELD_INDEX.age + 1, "age");
    applyList(FIELD_INDEX.serviteur + 1, "bool");
    applyList(FIELD_INDEX.statut + 1, "statut");
    applyList(FIELD_INDEX.venu + 1, "venu");
    applyList(FIELD_INDEX.priere_salut + 1, "bool");
    applyList(FIELD_INDEX.type_conversion + 1, "conversion");
    applyList(FIELD_INDEX.is_whatsapp + 1, "bool");
    applyList(FIELD_INDEX.bapteme_eau + 1, "bool");
    applyList(FIELD_INDEX.bapteme_esprit + 1, "bool");
    MINISTERE_SLOTS.forEach((slot) => applyList(FIELD_INDEX[slot] + 1, "ministere"));
    BESOIN_SLOTS.forEach((slot) => applyList(FIELD_INDEX[slot] + 1, "besoin"));

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = isEn ? "template_import_members.xlsx" : "template_import_membres.xlsx";

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error("Erreur génération template:", err);
    res.status(500).json({ error: "Impossible de générer le template." });
  }
}
