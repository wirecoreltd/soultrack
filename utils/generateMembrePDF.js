// utils/generateMembrePDF.js
// Génère une fiche PDF pour un membre — usage : import { generateMembrePDF } from "@/utils/generateMembrePDF"
// Dépendances : npm install jspdf

import jsPDF from "jspdf";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safe(val) {
  if (val === null || val === undefined || val === "") return "—";
  return String(val);
}

function formatDateFr(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const months = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
    return `${d.getDate().toString().padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return dateStr; }
}

function parseBesoins(val) {
  if (!val) return [];
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function parseHistoriqueBesoin(besoinJson) {
  if (!besoinJson) return [];
  try {
    const parsed = JSON.parse(besoinJson);
    if (!Array.isArray(parsed)) return [];
    if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].label) return parsed;
    return parsed.map((b) => ({ label: b, statut: "En suivi" }));
  } catch { return []; }
}

const INTERVIEW_QUESTIONS = [
  { key: "etat_general",      label: "État général" },
  { key: "vie_spirituelle",   label: "Vie spirituelle" },
  { key: "intention_priere",  label: "Intention de prière" },
  { key: "combats_luttes",    label: "Combats & luttes" },
  { key: "blocages",          label: "Blocages" },
  { key: "vie_personnelle",   label: "Vie personnelle" },
  { key: "besoins_avancement",label: "Besoins / Avancement" },
  { key: "talents",           label: "Talents" },
  { key: "domaine_service",   label: "Domaine de service" },
];

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const C = {
  navy:        [46, 49, 146],   // #2E3192
  navyLight:   [79, 84, 201],   // #4f54c9
  white:       [255, 255, 255],
  gray50:      [248, 250, 252],
  gray100:     [226, 232, 240],
  gray400:     [148, 163, 184],
  gray600:     [71, 85, 105],
  gray700:     [51, 65, 85],
  green:       [22, 163, 74],
  greenLight:  [220, 252, 231],
  orange:      [249, 115, 22],
  orangeLight: [255, 237, 213],
  blue:        [37, 99, 235],
  blueLight:   [219, 234, 254],
  red:         [220, 38, 38],
  amber:       [217, 119, 6],
  teal:        [15, 118, 110],
};

// ─── Drawing primitives ───────────────────────────────────────────────────────

function setFill(doc, rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setDraw(doc, rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
function setTextColor(doc, rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }

function rect(doc, x, y, w, h, rgb, style = "F") {
  setFill(doc, rgb);
  doc.rect(x, y, w, h, style);
}

function roundedRect(doc, x, y, w, h, r, rgb, style = "F") {
  setFill(doc, rgb);
  doc.roundedRect(x, y, w, h, r, r, style);
}

function text(doc, str, x, y, opts = {}) {
  doc.text(str, x, y, opts);
}

function sectionHeader(doc, label, x, y, w) {
  rect(doc, x, y, w, 7, C.navy);
  setTextColor(doc, C.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  text(doc, label, x + 3, y + 4.8);
}

function kv(doc, key, value, x, y, colWidth = 55) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setTextColor(doc, C.gray600);
  text(doc, key, x, y);
  setTextColor(doc, C.gray700);
  doc.setFont("helvetica", "bold");
  const maxW = colWidth - 2;
  const lines = doc.splitTextToSize(value, maxW);
  text(doc, lines[0] || "", x + colWidth - 30, y, { align: "right" });
  return (lines.length - 1) * 4.5; // extra height if wrapped
}

// ─── Main export function ─────────────────────────────────────────────────────

/**
 * @param {object} membre   — row from membres_complets
 * @param {Array}  suivis   — array of suivi rows (with .profiles join)
 * @param {object} options  — { churchName, logoBase64, celluleName, familleName, conseillerName }
 */
export async function generateMembrePDF(membre, suivis = [], options = {}) {
  const {
    churchName = "Église",
    logoBase64 = null,
    celluleName = null,
    familleName = null,
    conseillerName = null,
  } = options;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = 210; // page width
  const PH = 297; // page height
  const ML = 12;  // margin left
  const MR = 12;  // margin right
  const CW = PW - ML - MR; // content width

  let y = 0; // current Y cursor

  // ── PAGE BREAK HELPER ──────────────────────────────────────────────────────
  const ensureSpace = (needed) => {
    if (y + needed > PH - 15) {
      doc.addPage();
      y = 15;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════════════════════
  // Gradient-like header (two rects)
  rect(doc, 0, 0, PW, 28, C.navy);
  rect(doc, 0, 22, PW, 6, C.navyLight);

  // Logo placeholder or actual logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", ML, 4, 18, 18);
    } catch {
      // fallback to placeholder
      roundedRect(doc, ML, 4, 18, 18, 3, [100, 105, 200]);
      setTextColor(doc, C.white);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      text(doc, "✛", ML + 9, 15, { align: "center" });
    }
  } else {
    roundedRect(doc, ML, 4, 18, 18, 3, [100, 105, 200]);
    setTextColor(doc, C.white);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    text(doc, "+", ML + 9, 15.5, { align: "center" });
  }

  // Church name
  setTextColor(doc, C.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  text(doc, churchName, ML + 22, 11);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  setTextColor(doc, [180, 185, 230]);
  text(doc, "FICHE CONFIDENTIELLE", ML + 22, 16);

  // Date
  setTextColor(doc, [180, 185, 230]);
  doc.setFontSize(7);
  text(doc, "Généré le", PW - MR, 10, { align: "right" });
  setTextColor(doc, C.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  text(doc, formatDateFr(new Date().toISOString()), PW - MR, 16, { align: "right" });

  y = 33;

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMBER NAME & CONTACT
  // ═══════════════════════════════════════════════════════════════════════════
  const etat = (membre.etat_contact || "").toLowerCase().trim();
  const etatLabel = etat === "nouveau" ? "Nouveau" : etat === "existant" ? "Existant" : etat === "inactif" ? "Inactif" : safe(membre.etat_contact);
  const etatColor = etat === "nouveau" ? C.orange : etat === "existant" ? C.green : C.gray400;
  const etatBg   = etat === "nouveau" ? C.orangeLight : etat === "existant" ? C.greenLight : C.gray100;

  // Badge état contact
  roundedRect(doc, PW / 2 - 15, y, 30, 7, 3, etatBg);
  setTextColor(doc, etatColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  text(doc, etatLabel, PW / 2, y + 4.8, { align: "center" });

  // Star
  if (membre.star === true && etat === "existant") {
    setTextColor(doc, C.amber);
    doc.setFontSize(11);
    text(doc, "★", PW / 2 + 18, y + 5.5);
  }

  y += 10;

  // Name
  setTextColor(doc, C.navy);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  text(doc, `${safe(membre.prenom)} ${safe(membre.nom)}`, PW / 2, y, { align: "center" });
  y += 7;

  // Phone
  if (membre.telephone) {
    setTextColor(doc, C.orange);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    text(doc, `📞 ${membre.telephone}`, PW / 2, y, { align: "center" });
    y += 5;
  }

  // Separator line
  setDraw(doc, C.orange);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTITÉ + SUIVI (2 colonnes)
  // ═══════════════════════════════════════════════════════════════════════════
  const halfW = CW / 2 - 2;
  const col2X = ML + halfW + 4;

  // — Identité —
  sectionHeader(doc, "👤  IDENTITÉ", ML, y, halfW);
  y += 9;
  const identiteRows = [
    ["Civilité",       safe(membre.sexe)],
    ["Tranche d'âge",  safe(membre.age)],
    ["Ville",          safe(membre.ville)],
    ["WhatsApp",       membre.is_whatsapp ? "Oui" : "Non"],
    ["Ajouté le",      formatDateFr(membre.date_venu)],
  ];
  const suiY = y;
  identiteRows.forEach(([k, v]) => {
    kv(doc, k, v, ML, y, halfW);
    y += 5.5;
  });

  // — Suivi —
  const statutSuiviLabels = { 1:"En Attente", 2:"En Suivis", 3:"Intégré", 4:"Refus" };
  sectionHeader(doc, "📋  SUIVI", col2X, suiY - 9, halfW);
  let y2 = suiY;
  const suiviRows = [
    ["Statut",         safe(statutSuiviLabels[membre.statut_suivis] || membre.suivi_statut)],
    ["Date envoi suivi", formatDateFr(membre.date_envoi_suivi)],
    ["Cellule",        safe(celluleName)],
    ["Famille",        safe(familleName)],
    ["Conseiller",     safe(conseillerName)],
  ];
  suiviRows.forEach(([k, v]) => {
    kv(doc, k, v, col2X, y2, halfW);
    y2 += 5.5;
  });

  y = Math.max(y, y2) + 4;

  // ═══════════════════════════════════════════════════════════════════════════
  // VIE SPIRITUELLE + PARCOURS (2 colonnes)
  // ═══════════════════════════════════════════════════════════════════════════
  ensureSpace(45);
  sectionHeader(doc, "🕊  VIE SPIRITUELLE", ML, y, halfW);
  sectionHeader(doc, "🌱  PARCOURS", col2X, y, halfW);
  y += 9;
  const spiriY = y;

  const formatMinistere = (mj, autre) => {
    try {
      let list = Array.isArray(mj) ? mj : JSON.parse(mj || "[]");
      list = list.filter((m) => m.toLowerCase() !== "autre");
      if (autre?.trim()) list.push(autre.trim());
      return list.join(", ") || "—";
    } catch { return safe(mj); }
  };

  const spiriRows = [
    ["Baptême eau",  safe(membre.bapteme_eau)],
    ["Baptême feu",  safe(membre.bapteme_esprit)],
    ["Prière salut", safe(membre.priere_salut)],
    ["Conversion",   safe(membre.type_conversion)],
    ["Ministère",    formatMinistere(membre.Ministere, membre.Autre_Ministere)],
  ];
  spiriRows.forEach(([k, v]) => {
    kv(doc, k, v, ML, y, halfW);
    y += 5.5;
  });

  let yp = spiriY;
  const parcoursRows = [
    ["Comment venu",  safe(membre.venu)],
    ["Raison",        safe(membre.statut_initial)],
    ["Formation",     safe(membre.Formation)],
    ["Infos supp.",   safe(membre.infos_supplementaires)],
  ];
  parcoursRows.forEach(([k, v]) => {
    kv(doc, k, v, col2X, yp, halfW);
    yp += 5.5;
  });

  y = Math.max(y, yp) + 4;

  // ═══════════════════════════════════════════════════════════════════════════
  // SOIN PASTORAL — BESOINS
  // ═══════════════════════════════════════════════════════════════════════════
  ensureSpace(20);
  sectionHeader(doc, "❤️  SOIN PASTORAL — BESOINS", ML, y, CW);
  y += 9;

  const besoins = parseBesoins(membre.besoin);
  if (besoins.length > 0) {
    let bx = ML;
    besoins.forEach((b) => {
      const bw = doc.getTextWidth(b) + 6;
      roundedRect(doc, bx, y - 4, bw, 6.5, 2, C.orangeLight);
      setDraw(doc, C.orange);
      doc.setLineWidth(0.3);
      doc.roundedRect(bx, y - 4, bw, 6.5, 2, 2, "S");
      setTextColor(doc, C.orange);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      text(doc, b, bx + 3, y + 0.5);
      bx += bw + 3;
      if (bx > PW - MR - 20) { bx = ML; y += 8; }
    });
    y += 7;
  } else {
    setTextColor(doc, C.gray400);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    text(doc, "Aucun besoin enregistré", ML, y);
    y += 6;
  }

  if (membre.commentaire_suivis) {
    setTextColor(doc, C.gray600);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const lines = doc.splitTextToSize(`Commentaire suivi : ${membre.commentaire_suivis}`, CW);
    text(doc, lines, ML, y);
    y += lines.length * 4.5 + 2;
  }

  y += 2;

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS
  // ═══════════════════════════════════════════════════════════════════════════
  if (suivis.length > 0) {
    ensureSpace(20);
    sectionHeader(doc, "📅  HISTORIQUE DES SUIVIS", ML, y, CW);
    y += 10;

    suivis.forEach((s) => {
      const besoinsArr = parseHistoriqueBesoin(s.besoin);
      const statut = s.statut || "En suivi";
      const statutColor = statut === "Résolu" ? C.green : C.blue;
      const hasInterview = INTERVIEW_QUESTIONS.some((q) => s[q.key]);

      // Estimate height needed
      const interviewRows = hasInterview ? INTERVIEW_QUESTIONS.filter((q) => s[q.key]) : [];
      const interviewHeight = hasInterview ? 8 + interviewRows.length * 12 : 0;
      const cardH = 22 + (besoinsArr.length > 0 ? 6 : 0) + (s.commentaire ? 6 : 0) + interviewHeight;
      ensureSpace(cardH + 4);

      // Card background
      roundedRect(doc, ML, y, CW, cardH, 3, C.gray50);
      setDraw(doc, C.gray100);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW, cardH, 3, 3, "S");

      // Left accent bar
      rect(doc, ML, y, 2, cardH, statutColor.map ? statutColor : C.blue);

      // Date & type
      setTextColor(doc, C.gray700);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      text(doc, `📅 ${formatDateFr(s.date_action)} — ${safe(s.action_type)}`, ML + 5, y + 6);

      // Statut badge
      const sbw = doc.getTextWidth(statut) + 6;
      const sbColor = statut === "Résolu" ? C.greenLight : C.blueLight;
      const sbText  = statut === "Résolu" ? C.green : C.blue;
      roundedRect(doc, PW - MR - sbw, y + 1.5, sbw, 6, 2, sbColor);
      setTextColor(doc, sbText);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      text(doc, statut, PW - MR - sbw + 3, y + 6);

      let cy = y + 11;

      // Besoins
      if (besoinsArr.length > 0) {
        setTextColor(doc, C.gray400);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        text(doc, "Besoin : " + besoinsArr.map((b) => `${b.label} (${b.statut})`).join(", "), ML + 5, cy);
        cy += 5.5;
      }

      // Commentaire
      if (s.commentaire) {
        setTextColor(doc, C.gray600);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        const clines = doc.splitTextToSize(`"${s.commentaire}"`, CW - 10);
        text(doc, clines, ML + 5, cy);
        cy += clines.length * 4.5 + 2;
      }

      // Interview data
      if (hasInterview) {
        cy += 2;
        // Interview header
        roundedRect(doc, ML + 4, cy - 2, CW - 8, 6, 2, [240, 244, 255]);
        setTextColor(doc, C.navy);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        text(doc, "◆ QUESTIONS D'ENTRETIEN", ML + 7, cy + 2);
        cy += 7;

        const halfI = (CW - 12) / 2;
        const iRows = interviewRows;
        for (let i = 0; i < iRows.length; i += 2) {
          const left  = iRows[i];
          const right = iRows[i + 1];

          // left cell
          roundedRect(doc, ML + 4, cy - 1, halfI, 10, 2, C.gray50);
          setTextColor(doc, C.navyLight);
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "italic");
          text(doc, left.label, ML + 6, cy + 2);
          setTextColor(doc, C.gray700);
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          const llines = doc.splitTextToSize(safe(s[left.key]), halfI - 4);
          text(doc, llines[0] || "", ML + 6, cy + 7);

          // right cell
          if (right) {
            roundedRect(doc, ML + 6 + halfI, cy - 1, halfI, 10, 2, C.gray50);
            setTextColor(doc, C.navyLight);
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "italic");
            text(doc, right.label, ML + 8 + halfI, cy + 2);
            setTextColor(doc, C.gray700);
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "normal");
            const rlines = doc.splitTextToSize(safe(s[right.key]), halfI - 4);
            text(doc, rlines[0] || "", ML + 8 + halfI, cy + 7);
          }

          cy += 12;
        }
      }

      // Author
      const authorName = s.profiles ? `${s.profiles.prenom || ""} ${s.profiles.nom || ""}`.trim() : "";
      if (authorName) {
        setTextColor(doc, C.gray400);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        text(doc, `👤 ${authorName}`, ML + 5, y + cardH - 3);
      }

      y += cardH + 4;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    rect(doc, 0, PH - 10, PW, 10, C.gray50);
    setDraw(doc, C.gray100);
    doc.setLineWidth(0.3);
    doc.line(0, PH - 10, PW, PH - 10);
    setTextColor(doc, C.gray400);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    text(doc, "Document confidentiel — Usage pastoral uniquement", ML, PH - 4);
    text(doc, `Page ${p} / ${totalPages}`, PW - MR, PH - 4, { align: "right" });
  }

  // ─── Save ──────────────────────────────────────────────────────────────────
  const filename = `fiche_${(membre.prenom || "").toLowerCase()}_${(membre.nom || "").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
