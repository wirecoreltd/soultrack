// utils/generateMembrePDF.js

import jsPDF from "jspdf";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function sectionHeader(doc, label, x, y, w) {
  fillRect(doc, x, y, w, 7, C.navy);
  setTextColor(doc, C.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(label, x + 3, y + 4.8);
  return y + 9;
}

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

// Calcule la hauteur qu'occupera un bloc de lignes kv (sans le header)
function kvBlockHeight(doc, rows, colWidth, rowH) {
  let h = 0;
  rows.forEach(([, v]) => {
    const lines = doc.splitTextToSize(String(v ?? "-"), colWidth * 0.52);
    h += rowH + (lines.length > 1 ? (lines.length - 1) * 4.5 : 0);
  });
  return h;
}

// ─── Export principal ─────────────────────────────────────────────────────────

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
  const CW = PW - ML - MR;

  let y = 0;

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

  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, 4, 18, 18); }
    catch {
      fillRoundedRect(doc, ML, 4, 18, 18, 3, [100, 105, 200]);
      setTextColor(doc, C.white); doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text("+", ML + 9, 15.5, { align: "center" });
    }
  } else {
    fillRoundedRect(doc, ML, 4, 18, 18, 3, [100, 105, 200]);
    setTextColor(doc, C.white); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("+", ML + 9, 15.5, { align: "center" });
  }

  setTextColor(doc, C.white);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(churchName, ML + 22, 11);
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  setTextColor(doc, [180, 185, 230]);
  doc.text("FICHE CONFIDENTIELLE", ML + 22, 17);

  setTextColor(doc, [180, 185, 230]);
  doc.setFontSize(7);
  doc.text("Genere le", PW - MR, 10, { align: "right" });
  setTextColor(doc, C.white);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
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
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text(etatLabel, PW / 2, y + 4.8, { align: "center" });

  if (membre.star === true && etat === "existant") {
    setTextColor(doc, C.amber); doc.setFontSize(11);
    doc.text("*", PW / 2 + badgeW / 2 + 3, y + 5.5);
  }
  y += 11;

  setTextColor(doc, C.navy);
  doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`, PW / 2, y, { align: "center" });
  y += 7;

  if (membre.telephone) {
    setTextColor(doc, C.orange);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Tel : ${membre.telephone}`, PW / 2, y, { align: "center" });
    y += 6;
  }

  setDraw(doc, C.orange);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ══════════════════════════════════════════════════════════════════
  // Helper : section 2 colonnes avec calcul fluide de hauteur
  // ══════════════════════════════════════════════════════════════════
  const COL_W  = CW / 2 - 3;
  const COL2_X = ML + COL_W + 6;
  const ROW_H  = 5.5;

  function renderTwoColSection(leftHeader, leftRows, rightHeader, rightRows) {
    // 9mm = header (7mm) + gap (2mm) avant la 1re ligne
    const leftH  = 9 + kvBlockHeight(doc, leftRows,  COL_W, ROW_H);
    const rightH = 9 + kvBlockHeight(doc, rightRows, COL_W, ROW_H);
    const blockH = Math.max(leftH, rightH);

    ensureSpace(blockH + 4);

    let yL = sectionHeader(doc, leftHeader, ML, y, COL_W);
    leftRows.forEach(([k, v]) => { yL += ROW_H + kvRow(doc, k, v, ML, yL, COL_W); });

    let yR = sectionHeader(doc, rightHeader, COL2_X, y, COL_W);
    rightRows.forEach(([k, v]) => { yR += ROW_H + kvRow(doc, k, v, COL2_X, yR, COL_W); });

    y = Math.max(yL, yR) + 4;
  }

  // ══════════════════════════════════════════════════════════════════
  // IDENTITE + SUIVI
  // ══════════════════════════════════════════════════════════════════
  const statutSuiviLabels = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };

  renderTwoColSection(
    "IDENTITE",
    [
      ["Civilite",      safe(membre.sexe)],
      ["Tranche d'age", safe(membre.age)],
      ["Ville",         safe(membre.ville)],
      ["WhatsApp",      membre.is_whatsapp ? "Oui" : "Non"],
      ["Ajoute le",     formatDateFr(membre.date_venu)],
    ],
    "SUIVI",
    [
      ["Statut",           safe(statutSuiviLabels[membre.statut_suivis] || membre.suivi_statut)],
      ["Date envoi suivi", formatDateFr(membre.date_envoi_suivi)],
      ["Cellule",          safe(celluleName)],
      ["Famille",          safe(familleName)],
      ["Conseiller",       safe(conseillerName)],
    ]
  );

  // ══════════════════════════════════════════════════════════════════
  // VIE SPIRITUELLE + PARCOURS
  // ══════════════════════════════════════════════════════════════════
  renderTwoColSection(
    "VIE SPIRITUELLE",
    [
      ["Bapteme eau",  safe(membre.bapteme_eau)],
      ["Bapteme feu",  safe(membre.bapteme_esprit)],
      ["Priere salut", safe(membre.priere_salut)],
      ["Conversion",   safe(membre.type_conversion)],
      ["Ministere",    formatMinistere(membre.Ministere, membre.Autre_Ministere)],
    ],
    "PARCOURS",
    [
      ["Comment venu", safe(membre.venu)],
      ["Raison",       safe(membre.statut_initial)],
      ["Formation",    safe(membre.Formation)],
      ["Infos supp.",  safe(membre.infos_supplementaires)],
    ]
  );

  // ══════════════════════════════════════════════════════════════════
  // SOIN PASTORAL — BESOINS
  // ══════════════════════════════════════════════════════════════════
  ensureSpace(16);
  y = sectionHeader(doc, "SOIN PASTORAL - BESOINS", ML, y, CW);

  const besoins = parseBesoins(membre.besoin);
  if (besoins.length > 0) {
    let bx = ML;
    besoins.forEach((b) => {
      const bLabel = String(b);
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      const bw = Math.max(doc.getTextWidth(bLabel) + 8, 20);
      if (bx + bw > PW - MR) { bx = ML; y += 8; ensureSpace(10); }
      fillRoundedRect(doc, bx, y - 4, bw, 6.5, 2, C.orangeLight);
      strokeRoundedRect(doc, bx, y - 4, bw, 6.5, 2, C.orange);
      setTextColor(doc, C.orange);
      doc.text(bLabel, bx + 4, y + 0.5);
      bx += bw + 3;
    });
    y += 8;
  } else {
    setTextColor(doc, C.gray400);
    doc.setFontSize(8); doc.setFont("helvetica", "italic");
    doc.text("Aucun besoin enregistre", ML, y);
    y += 6;
  }

  if (membre.commentaire_suivis) {
    ensureSpace(10);
    setTextColor(doc, C.gray600);
    doc.setFontSize(8); doc.setFont("helvetica", "italic");
    const lines = doc.splitTextToSize(`Commentaire : ${da(membre.commentaire_suivis)}`, CW);
    doc.text(lines, ML, y);
    y += lines.length * 4.5 + 2;
  }

  y += 3;

  // ══════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS
  // ══════════════════════════════════════════════════════════════════
  if (suivis.length > 0) {
    ensureSpace(14);
    y = sectionHeader(doc, "HISTORIQUE DES SUIVIS", ML, y, CW);

    suivis.forEach((s) => {
      const besoinsArr  = parseHistoriqueBesoin(s.besoin);
      const statut      = s.statut || "En suivi";
      const accentColor = statut === "Resolu" ? C.green : C.navyLight;

      const interviewRows = INTERVIEW_QUESTIONS.filter(
        (q) => s[q.key] !== null && s[q.key] !== undefined && String(s[q.key]).trim() !== ""
      );
      const hasInterview = interviewRows.length > 0;
      const halfI = (CW - 14) / 2;

      // ── Calcul précis de cardH ──────────────────────────────────
      let cardH = 13; // en-tête date+statut

      if (besoinsArr.length > 0) {
        const bLine  = "Besoin : " + besoinsArr.map((b) => `${b.label} (${b.statut})`).join(", ");
        const bLines = doc.splitTextToSize(bLine, CW - 12);
        cardH += bLines.length * 4.5 + 3;
      }

      if (s.commentaire) {
        const clines = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 14);
        cardH += clines.length * 4.5 + 3;
      }

      if (hasInterview) {
        cardH += 9; // titre "QUESTIONS D'ENTRETIEN"
        for (let i = 0; i < interviewRows.length; i += 2) {
          const leftQ  = interviewRows[i];
          const rightQ = interviewRows[i + 1];
          const lLines = doc.splitTextToSize(safe(s[leftQ.key]), halfI - 6);
          const rLines = rightQ ? doc.splitTextToSize(safe(s[rightQ.key]), halfI - 6) : [];
          const lH = Math.max(13, 9 + lLines.length * 4);
          const rH = Math.max(13, 9 + rLines.length * 4);
          cardH += Math.max(lH, rH) + 2;
        }
      }

      const authorName = s.profiles
        ? `${s.profiles.prenom || ""} ${s.profiles.nom || ""}`.trim()
        : "";
      if (authorName) cardH += 5;
      cardH += 4; // marge basse

      ensureSpace(cardH + 4);

      // ── Rendu de la carte ───────────────────────────────────────
      fillRoundedRect(doc, ML, y, CW, cardH, 3, C.gray50);
      strokeRoundedRect(doc, ML, y, CW, cardH, 3, C.gray100);
      setFill(doc, accentColor);
      doc.rect(ML, y, 2, cardH, "F");

      setTextColor(doc, C.gray700);
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text(`${formatDateFr(s.date_action)}  -  ${safe(s.action_type)}`, ML + 5, y + 7);

      const sbw  = doc.getTextWidth(statut) + 8;
      const sbBg = statut === "Resolu" ? C.greenLight : C.blueLight;
      const sbTx = statut === "Resolu" ? C.green : C.blue;
      fillRoundedRect(doc, PW - MR - sbw, y + 2, sbw, 6, 2, sbBg);
      setTextColor(doc, sbTx);
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      doc.text(statut, PW - MR - sbw + 4, y + 6.5);

      let cy = y + 12;

      if (besoinsArr.length > 0) {
        setTextColor(doc, C.gray400);
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
        const bLine  = "Besoin : " + besoinsArr.map((b) => `${b.label} (${b.statut})`).join(", ");
        const bLines = doc.splitTextToSize(bLine, CW - 12);
        doc.text(bLines, ML + 5, cy);
        cy += bLines.length * 4.5 + 3;
      }

      if (s.commentaire) {
        setTextColor(doc, C.gray600);
        doc.setFontSize(8); doc.setFont("helvetica", "italic");
        const clines = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 14);
        doc.text(clines, ML + 5, cy);
        cy += clines.length * 4.5 + 3;
      }

      if (hasInterview) {
        fillRoundedRect(doc, ML + 4, cy - 1, CW - 8, 7, 2, [235, 238, 255]);
        setTextColor(doc, C.navy);
        doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
        doc.text("QUESTIONS D'ENTRETIEN", ML + 7, cy + 4);
        cy += 9;

        for (let i = 0; i < interviewRows.length; i += 2) {
          const leftQ  = interviewRows[i];
          const rightQ = interviewRows[i + 1];
          const lLines = doc.splitTextToSize(safe(s[leftQ.key]), halfI - 6);
          const rLines = rightQ ? doc.splitTextToSize(safe(s[rightQ.key]), halfI - 6) : [];
          const lH   = Math.max(13, 9 + lLines.length * 4);
          const rH   = Math.max(13, 9 + rLines.length * 4);
          const boxH = Math.max(lH, rH);

          fillRoundedRect(doc, ML + 4, cy, halfI, boxH, 2, C.white);
          strokeRoundedRect(doc, ML + 4, cy, halfI, boxH, 2, C.gray100);
          setTextColor(doc, C.navyLight);
          doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
          doc.text(leftQ.label, ML + 7, cy + 4);
          setTextColor(doc, C.gray700);
          doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
          doc.text(lLines, ML + 7, cy + 9);

          if (rightQ) {
            const rx = ML + 6 + halfI;
            fillRoundedRect(doc, rx, cy, halfI, boxH, 2, C.white);
            strokeRoundedRect(doc, rx, cy, halfI, boxH, 2, C.gray100);
            setTextColor(doc, C.navyLight);
            doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
            doc.text(rightQ.label, rx + 3, cy + 4);
            setTextColor(doc, C.gray700);
            doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
            doc.text(rLines, rx + 3, cy + 9);
          }

          cy += boxH + 2;
        }
      }

      if (authorName) {
        setTextColor(doc, C.gray400);
        doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text(`Redige par : ${authorName}`, ML + 5, y + cardH - 3);
      }

      y += cardH + 4;
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
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("Document confidentiel - Usage pastoral uniquement", ML, PH - 4);
    doc.text(`Page ${p} / ${totalPages}`, PW - MR, PH - 4, { align: "right" });
  }

  // ─── Sauvegarde ───────────────────────────────────────────────────
  const prenom = (membre.prenom || "").toLowerCase().replace(/\s+/g, "_");
  const nom    = (membre.nom    || "").toLowerCase().replace(/\s+/g, "_");
  const date   = new Date().toISOString().split("T")[0];
  doc.save(`fiche_${prenom}_${nom}_${date}.pdf`);
}
