// utils/generateMembrePDF.js
// Génère une fiche PDF pour un membre
// Dépendances : npm install jspdf 

import jsPDF from "jspdf";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Remplace les caractères accentués par leurs équivalents ASCII.
 * jsPDF avec les polices built-in (helvetica) utilise l'encodage WinAnsi/Latin-1.
 * Les caractères hors de cette plage s'affichent en caractères bizarres.
 * On normalise donc tout le texte avant de l'envoyer à doc.text().
 */
function da(str) {
  if (!str) return "";
  return String(str)
    .replace(/[àâä]/g, "a")
    .replace(/[ÀÂÄÁ]/g, "A")
    .replace(/[éèêë]/g, "e")
    .replace(/[ÉÈÊË]/g, "E")
    .replace(/[îï]/g, "i")
    .replace(/[ÎÏ]/g, "I")
    .replace(/[ôö]/g, "o")
    .replace(/[ÔÖÓ]/g, "O")
    .replace(/[ùûü]/g, "u")
    .replace(/[ÙÛÜ]/g, "U")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .replace(/—/g, "-")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"');
}

function safe(val) {
  if (val === null || val === undefined || val === "") return "-";
  return da(String(val));
}

function formatDateFr(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return da(dateStr);
    const months = ["Janv","Fevr","Mars","Avr","Mai","Juin","Juil","Aout","Sept","Oct","Nov","Dec"];
    return `${d.getDate().toString().padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return da(String(dateStr)); }
}

function parseBesoins(val) {
  if (!val) return [];
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed.map((b) => da(String(b))) : [];
  } catch { return []; }
}

function parseHistoriqueBesoin(besoinJson) {
  if (!besoinJson) return [];
  try {
    const parsed = typeof besoinJson === "string" ? JSON.parse(besoinJson) : besoinJson;
    if (!Array.isArray(parsed)) return [];
    if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].label) {
      return parsed.map((b) => ({ label: da(b.label), statut: da(b.statut || "En suivi") }));
    }
    return parsed.map((b) => ({ label: da(String(b)), statut: "En suivi" }));
  } catch { return []; }
}

function formatMinistere(mj, autre) {
  try {
    let list = Array.isArray(mj) ? mj : JSON.parse(mj || "[]");
    list = list.filter((m) => m.toLowerCase() !== "autre");
    if (autre?.trim()) list.push(autre.trim());
    return da(list.join(", ")) || "-";
  } catch { return safe(mj); }
}

const INTERVIEW_QUESTIONS = [
  { key: "etat_general",       label: "Etat general" },
  { key: "vie_spirituelle",    label: "Vie spirituelle" },
  { key: "intention_priere",   label: "Intention de priere" },
  { key: "combats_luttes",     label: "Combats & luttes" },
  { key: "blocages",           label: "Blocages" },
  { key: "vie_personnelle",    label: "Vie personnelle" },
  { key: "besoins_avancement", label: "Besoins / Avancement" },
  { key: "talents",            label: "Talents" },
  { key: "domaine_service",    label: "Domaine de service" },
];

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const C = {
  navy:        [46,  49,  146],
  navyLight:   [79,  84,  201],
  white:       [255, 255, 255],
  gray50:      [248, 250, 252],
  gray100:     [226, 232, 240],
  gray400:     [148, 163, 184],
  gray600:     [71,  85,  105],
  gray700:     [51,  65,  85],
  green:       [22,  163, 74],
  greenLight:  [220, 252, 231],
  orange:      [249, 115, 22],
  orangeLight: [255, 237, 213],
  blue:        [37,  99,  235],
  blueLight:   [219, 234, 254],
  amber:       [217, 119, 6],
};

// ─── Primitives ───────────────────────────────────────────────────────────────

const setFill      = (doc, rgb) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
const setDraw      = (doc, rgb) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
const setTextColor = (doc, rgb) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

function fillRect(doc, x, y, w, h, rgb) {
  setFill(doc, rgb);
  doc.rect(x, y, w, h, "F");
}

function fillRoundedRect(doc, x, y, w, h, r, rgb) {
  setFill(doc, rgb);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

function strokeRoundedRect(doc, x, y, w, h, r, rgb, lw = 0.3) {
  setDraw(doc, rgb);
  doc.setLineWidth(lw);
  doc.roundedRect(x, y, w, h, r, r, "S");
}

// Dessine un en-tête de section avec bande navy
function sectionHeader(doc, label, x, y, w) {
  fillRect(doc, x, y, w, 7, C.navy);
  setTextColor(doc, C.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(label, x + 3, y + 4.8);
  return y + 9; // retourne le y après le header
}

// Ligne clé / valeur dans deux colonnes
// Retourne la hauteur supplémentaire si le texte wraps
function kvRow(doc, key, value, x, y, totalWidth) {
  const keyWidth   = totalWidth * 0.45;
  const valueWidth = totalWidth * 0.52;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor(doc, C.gray600);
  doc.text(key, x, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setTextColor(doc, C.gray700);
  const lines = doc.splitTextToSize(value, valueWidth);
  doc.text(lines, x + keyWidth, y);

  return lines.length > 1 ? (lines.length - 1) * 4.5 : 0;
}

// ─── Export principal ─────────────────────────────────────────────────────────

/**
 * @param {object} membre   — ligne de la vue membres_complets
 * @param {Array}  suivis   — tableau de lignes suivi (avec .profiles)
 * @param {object} options  — { churchName, logoBase64, celluleName, familleName, conseillerName }
 */
export async function generateMembrePDF(membre, suivis = [], options = {}) {
  const {
    churchName    = "Eglise",
    logoBase64    = null,
    celluleName   = null,
    familleName   = null,
    conseillerName= null,
  } = options;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = 210;
  const PH = 297;
  const ML = 12;
  const MR = 12;
  const CW = PW - ML - MR;  // 186 mm

  let y = 0;

  // Helper : saut de page si besoin
  const ensureSpace = (needed) => {
    if (y + needed > PH - 15) {
      doc.addPage();
      y = 15;
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════
  fillRect(doc, 0, 0, PW, 28, C.navy);
  fillRect(doc, 0, 22, PW, 6, C.navyLight);

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", ML, 4, 18, 18);
    } catch {
      fillRoundedRect(doc, ML, 4, 18, 18, 3, [100, 105, 200]);
      setTextColor(doc, C.white);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("+", ML + 9, 15.5, { align: "center" });
    }
  } else {
    fillRoundedRect(doc, ML, 4, 18, 18, 3, [100, 105, 200]);
    setTextColor(doc, C.white);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("+", ML + 9, 15.5, { align: "center" });
  }

  // Nom de l'église
  setTextColor(doc, C.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(churchName, ML + 22, 11);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  setTextColor(doc, [180, 185, 230]);
  doc.text("FICHE CONFIDENTIELLE", ML + 22, 17);

  // Date de génération
  setTextColor(doc, [180, 185, 230]);
  doc.setFontSize(7);
  doc.text("Genere le", PW - MR, 10, { align: "right" });
  setTextColor(doc, C.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(formatDateFr(new Date().toISOString()), PW - MR, 16, { align: "right" });

  y = 33;

  // ══════════════════════════════════════════════════════════════════
  // BADGE ETAT + NOM
  // ══════════════════════════════════════════════════════════════════
  const etat      = (membre.etat_contact || "").toLowerCase().trim();
  const etatLabel = etat === "nouveau" ? "Nouveau" : etat === "existant" ? "Existant" : etat === "inactif" ? "Inactif" : safe(membre.etat_contact);
  const etatColor = etat === "nouveau" ? C.orange : etat === "existant" ? C.green : C.gray400;
  const etatBg    = etat === "nouveau" ? C.orangeLight : etat === "existant" ? C.greenLight : C.gray100;

  const badgeW = 30;
  fillRoundedRect(doc, PW / 2 - badgeW / 2, y, badgeW, 7, 3, etatBg);
  setTextColor(doc, etatColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(etatLabel, PW / 2, y + 4.8, { align: "center" });

  if (membre.star === true && etat === "existant") {
    setTextColor(doc, C.amber);
    doc.setFontSize(11);
    doc.text("*", PW / 2 + badgeW / 2 + 3, y + 5.5);
  }

  y += 11;

  // Nom complet
  setTextColor(doc, C.navy);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`, PW / 2, y, { align: "center" });
  y += 7;

  // Téléphone
  if (membre.telephone) {
    setTextColor(doc, C.orange);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Tel : ${membre.telephone}`, PW / 2, y, { align: "center" });
    y += 6;
  }

  // Séparateur
  setDraw(doc, C.orange);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PW - MR, y);
  y += 6;

  // ══════════════════════════════════════════════════════════════════
  // IDENTITE + SUIVI  (2 colonnes, curseurs indépendants)
  // ══════════════════════════════════════════════════════════════════
  const COL_W   = CW / 2 - 3;   // largeur d'une colonne (~90mm)
  const COL2_X  = ML + COL_W + 6;
  const ROW_H   = 5.5;

  ensureSpace(50);
  const section1Y = y;

  // — Colonne gauche : IDENTITE —
  let yL = sectionHeader(doc, "IDENTITE", ML, section1Y, COL_W);
  const identiteRows = [
    ["Civilite",       safe(membre.sexe)],
    ["Tranche d'age",  safe(membre.age)],
    ["Ville",          safe(membre.ville)],
    ["WhatsApp",       membre.is_whatsapp ? "Oui" : "Non"],
    ["Ajoute le",      formatDateFr(membre.date_venu)],
  ];
  identiteRows.forEach(([k, v]) => {
    const extra = kvRow(doc, k, v, ML, yL, COL_W);
    yL += ROW_H + extra;
  });

  // — Colonne droite : SUIVI —
  const statutSuiviLabels = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };
  let yR = sectionHeader(doc, "SUIVI", COL2_X, section1Y, COL_W);
  const suiviRows = [
    ["Statut",           safe(statutSuiviLabels[membre.statut_suivis] || membre.suivi_statut)],
    ["Date envoi suivi", formatDateFr(membre.date_envoi_suivi)],
    ["Cellule",          safe(celluleName)],
    ["Famille",          safe(familleName)],
    ["Conseiller",       safe(conseillerName)],
  ];
  suiviRows.forEach(([k, v]) => {
    const extra = kvRow(doc, k, v, COL2_X, yR, COL_W);
    yR += ROW_H + extra;
  });

  y = Math.max(yL, yR) + 5;

  // ══════════════════════════════════════════════════════════════════
  // VIE SPIRITUELLE + PARCOURS
  // ══════════════════════════════════════════════════════════════════
  ensureSpace(50);
  const section2Y = y;

  let yL2 = sectionHeader(doc, "VIE SPIRITUELLE", ML, section2Y, COL_W);
  const spiriRows = [
    ["Bapteme eau",  safe(membre.bapteme_eau)],
    ["Bapteme feu",  safe(membre.bapteme_esprit)],
    ["Priere salut", safe(membre.priere_salut)],
    ["Conversion",   safe(membre.type_conversion)],
    ["Ministere",    formatMinistere(membre.Ministere, membre.Autre_Ministere)],
  ];
  spiriRows.forEach(([k, v]) => {
    const extra = kvRow(doc, k, v, ML, yL2, COL_W);
    yL2 += ROW_H + extra;
  });

  let yR2 = sectionHeader(doc, "PARCOURS", COL2_X, section2Y, COL_W);
  const parcoursRows = [
    ["Comment venu", safe(membre.venu)],
    ["Raison",       safe(membre.statut_initial)],
    ["Formation",    safe(membre.Formation)],
    ["Infos supp.",  safe(membre.infos_supplementaires)],
  ];
  parcoursRows.forEach(([k, v]) => {
    const extra = kvRow(doc, k, v, COL2_X, yR2, COL_W);
    yR2 += ROW_H + extra;
  });

  y = Math.max(yL2, yR2) + 5;

  // ══════════════════════════════════════════════════════════════════
  // SOIN PASTORAL — BESOINS
  // ══════════════════════════════════════════════════════════════════
  ensureSpace(22);
  y = sectionHeader(doc, "SOIN PASTORAL - BESOINS", ML, y, CW);

  const besoins = parseBesoins(membre.besoin);
  if (besoins.length > 0) {
    let bx = ML;
    besoins.forEach((b) => {
      const bLabel = String(b);
      const bw = Math.max(doc.getTextWidth(bLabel) + 8, 20);
      if (bx + bw > PW - MR) { bx = ML; y += 8; ensureSpace(10); }
      fillRoundedRect(doc, bx, y - 4, bw, 6.5, 2, C.orangeLight);
      strokeRoundedRect(doc, bx, y - 4, bw, 6.5, 2, C.orange);
      setTextColor(doc, C.orange);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(bLabel, bx + 4, y + 0.5);
      bx += bw + 3;
    });
    y += 9;
  } else {
    setTextColor(doc, C.gray400);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Aucun besoin enregistre", ML, y);
    y += 7;
  }

  if (membre.commentaire_suivis) {
    ensureSpace(12);
    setTextColor(doc, C.gray600);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const lines = doc.splitTextToSize(`Commentaire : ${membre.commentaire_suivis}`, CW);
    doc.text(lines, ML, y);
    y += lines.length * 4.5 + 3;
  }

  y += 3;

  // ══════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS
  // ══════════════════════════════════════════════════════════════════
  if (suivis.length > 0) {
    ensureSpace(15);
    y = sectionHeader(doc, "HISTORIQUE DES SUIVIS", ML, y, CW);

    suivis.forEach((s, idx) => {
      const besoinsArr  = parseHistoriqueBesoin(s.besoin);
      const statut      = s.statut || "En suivi";
      const statutColor = statut === "Resolu" ? C.green : C.blue;
      const accentColor = statut === "Resolu" ? C.green : C.navyLight;

      // Questions d'entretien présentes
      const interviewRows = INTERVIEW_QUESTIONS.filter(
  (q) =>
    s[q.key] !== null &&
    s[q.key] !== undefined &&
    String(s[q.key]).trim() !== ""
);
      const hasInterview  = interviewRows.length > 0;

      // Calcul précis de la hauteur de la carte
      let cardH = 14; // date + statut + marge basse

      if (besoinsArr.length > 0) {
        cardH += 7;
      }

      if (s.commentaire) {
        const clines = doc.splitTextToSize(`"${s.commentaire}"`, CW - 14);
        cardH += clines.length * 4.5 + 4;
      }

      if (hasInterview) {
        cardH += 8; // titre "QUESTIONS D'ENTRETIEN"
        interviewRows.forEach((q) => {
  const lines = doc.splitTextToSize(
    safe(s[q.key]),
    (CW - 14) / 2 - 6
  );

  cardH += Math.max(12, 8 + lines.length * 4) / 2;
});

cardH += 12; // chaque paire de questions = 14mm
      }

      const authorName = s.profiles
        ? `${s.profiles.prenom || ""} ${s.profiles.nom || ""}`.trim()
        : "";
      if (authorName) cardH += 6;

      ensureSpace(cardH + 5);

      // Fond de la carte
      fillRoundedRect(doc, ML, y, CW, cardH, 3, C.gray50);
      strokeRoundedRect(doc, ML, y, CW, cardH, 3, C.gray100);

      // Barre accent gauche
      setFill(doc, accentColor);
      doc.rect(ML, y, 2, cardH, "F");

      // Date & type d'action
      setTextColor(doc, C.gray700);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${formatDateFr(s.date_action)}  -  ${safe(s.action_type)}`, ML + 5, y + 7);

      // Badge statut
      const sbw = doc.getTextWidth(statut) + 8;
      const sbBg   = statut === "Resolu" ? C.greenLight : C.blueLight;
      const sbText = statut === "Resolu" ? C.green : C.blue;
      fillRoundedRect(doc, PW - MR - sbw, y + 2, sbw, 6, 2, sbBg);
      setTextColor(doc, sbText);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(statut, PW - MR - sbw + 4, y + 6.5);

      let cy = y + 12;

      // Besoins du suivi
      if (besoinsArr.length > 0) {
        setTextColor(doc, C.gray400);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        const bLine = "Besoin : " + besoinsArr.map((b) => `${b.label} (${b.statut})`).join(", ");
        const bLines = doc.splitTextToSize(bLine, CW - 12);
        doc.text(bLines, ML + 5, cy);
        cy += bLines.length * 4.5 + 2;
      }

      // Commentaire
      if (s.commentaire) {
        setTextColor(doc, C.gray600);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        const clines = doc.splitTextToSize(`"${s.commentaire}"`, CW - 14);
        doc.text(clines, ML + 5, cy);
        cy += clines.length * 4.5 + 3;
      }

      // Questions d'entretien
      if (hasInterview) {
        fillRoundedRect(doc, ML + 4, cy - 1, CW - 8, 7, 2, [235, 238, 255]);
        setTextColor(doc, C.navy);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.text("QUESTIONS D'ENTRETIEN", ML + 7, cy + 4);
        cy += 10;

        const halfI = (CW - 14) / 2;

        for (let i = 0; i < interviewRows.length; i += 2) {
  const leftQ = interviewRows[i];
  const rightQ = interviewRows[i + 1];

  const leftValue = safe(s[leftQ.key]);
  const rightValue = rightQ ? safe(s[rightQ.key]) : "";

  const leftLines = doc.splitTextToSize(leftValue, halfI - 6);
  const rightLines = rightQ
    ? doc.splitTextToSize(rightValue, halfI - 6)
    : [];

  const leftHeight = Math.max(12, 8 + leftLines.length * 4);
  const rightHeight = Math.max(12, 8 + rightLines.length * 4);

  const boxHeight = Math.max(leftHeight, rightHeight);

  // LEFT
  fillRoundedRect(doc, ML + 4, cy, halfI, boxHeight, 2, C.white);
  strokeRoundedRect(doc, ML + 4, cy, halfI, boxHeight, 2, C.gray100);

  setTextColor(doc, C.navyLight);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text(leftQ.label, ML + 7, cy + 4);

  setTextColor(doc, C.gray700);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(leftLines, ML + 7, cy + 9);

  // RIGHT
  if (rightQ) {
    const rx = ML + 6 + halfI;

    fillRoundedRect(doc, rx, cy, halfI, boxHeight, 2, C.white);
    strokeRoundedRect(doc, rx, cy, halfI, boxHeight, 2, C.gray100);

    setTextColor(doc, C.navyLight);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(rightQ.label, rx + 3, cy + 4);

    setTextColor(doc, C.gray700);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(rightLines, rx + 3, cy + 9);
  }

  cy += boxHeight + 2;
} {
          //const leftQ  = interviewRows[i];
          //const rightQ = interviewRows[i + 1];

          // Cellule gauche
          fillRoundedRect(doc, ML + 4, cy, halfI, 12, 2, C.white);
          strokeRoundedRect(doc, ML + 4, cy, halfI, 12, 2, C.gray100);
          setTextColor(doc, C.navyLight);
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "bold");
          doc.text(leftQ.label, ML + 7, cy + 4);
          setTextColor(doc, C.gray700);
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          const lVal   = doc.splitTextToSize(safe(s[leftQ.key]), halfI - 6);
          doc.text(lVal, ML + 7, cy + 9);

          // Cellule droite
          if (rightQ) {
            const rx = ML + 6 + halfI;
            fillRoundedRect(doc, rx, cy, halfI, 12, 2, C.white);
            strokeRoundedRect(doc, rx, cy, halfI, 12, 2, C.gray100);
            setTextColor(doc, C.navyLight);
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "bold");
            doc.text(rightQ.label, rx + 3, cy + 4);
            setTextColor(doc, C.gray700);
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "normal");
            const rVal = doc.splitTextToSize(safe(s[rightQ.key]), halfI - 6);
            doc.text(rVal, rx + 3, cy + 9);
          }

          cy += 14;
        }
      }

      // Auteur
      if (authorName) {
        setTextColor(doc, C.gray400);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(`Redige par : ${authorName}`, ML + 5, y + cardH - 3);
      }

      y += cardH + 5;
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // FOOTER sur toutes les pages
  // ══════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    fillRect(doc, 0, PH - 10, PW, 10, C.gray50);
    setDraw(doc, C.gray100);
    doc.setLineWidth(0.3);
    doc.line(0, PH - 10, PW, PH - 10);
    setTextColor(doc, C.gray400);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Document confidentiel - Usage pastoral uniquement", ML, PH - 4);
    doc.text(`Page ${p} / ${totalPages}`, PW - MR, PH - 4, { align: "right" });
  }

  // ─── Sauvegarde ───────────────────────────────────────────────────
  const prenom = (membre.prenom || "").toLowerCase().replace(/\s+/g, "_");
  const nom    = (membre.nom    || "").toLowerCase().replace(/\s+/g, "_");
  const date   = new Date().toISOString().split("T")[0];
  doc.save(`fiche_${prenom}_${nom}_${date}.pdf`);
}
