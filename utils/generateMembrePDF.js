// utils/generateMembrePDF.js

import jsPDF from "jspdf";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function da(str) {
  if (!str) return "";
  return String(str)
    .replace(/[àâä]/g, "a").replace(/[ÀÂÄÁ]/g, "A")
    .replace(/[éèêë]/g, "e").replace(/[ÉÈÊË]/g, "E")
    .replace(/[îï]/g, "i").replace(/[ÎÏ]/g, "I")
    .replace(/[ôö]/g, "o").replace(/[ÔÖÓ]/g, "O")
    .replace(/[ùûü]/g, "u").replace(/[ÙÛÜ]/g, "U")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/ñ/g, "n").replace(/Ñ/g, "N")
    .replace(/—/g, "-").replace(/['']/g, "'").replace(/[""]/g, '"')
    // Supprimer les emojis (jsPDF ne les supporte pas)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .trim();
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
    if (!Array.isArray(parsed)) return [];
    // Support ancien format (strings) et nouveau format (objets {label, statut})
    return parsed.map((b) => {
      if (typeof b === "object" && b !== null) {
        return { label: da(String(b.label || b)), statut: da(String(b.statut || "En suivi")) };
      }
      return { label: da(String(b)), statut: "En suivi" };
    });
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
  navyXLight:  [235, 238, 255],
  white:       [255, 255, 255],
  gray50:      [248, 250, 252],
  gray100:     [226, 232, 240],
  gray200:     [203, 213, 225],
  gray400:     [148, 163, 184],
  gray500:     [100, 116, 139],
  gray600:     [71,  85,  105],
  gray700:     [51,  65,  85],
  green:       [22,  163, 74],
  greenLight:  [220, 252, 231],
  greenDark:   [15,  118, 55],
  orange:      [249, 115, 22],
  orangeLight: [255, 237, 213],
  blue:        [37,  99,  235],
  blueLight:   [219, 234, 254],
  amber:       [217, 119, 6],
  amberLight:  [254, 243, 199],
};

// ─── Primitives ───────────────────────────────────────────────────────────────
const setFill      = (doc, rgb) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
const setDraw      = (doc, rgb) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
const setTextColor = (doc, rgb) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

function fillRect(doc, x, y, w, h, rgb) {
  setFill(doc, rgb); doc.rect(x, y, w, h, "F");
}
function fillRoundedRect(doc, x, y, w, h, r, rgb) {
  setFill(doc, rgb); doc.roundedRect(x, y, w, h, r, r, "F");
}
function strokeRoundedRect(doc, x, y, w, h, r, rgb, lw = 0.3) {
  setDraw(doc, rgb); doc.setLineWidth(lw); doc.roundedRect(x, y, w, h, r, r, "S");
}

// Header de section : barre navy avec texte blanc, retourne y après
function sectionHeader(doc, label, x, y, w) {
  fillRoundedRect(doc, x, y, w, 8, 2, C.navy);
  setTextColor(doc, C.white);
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
  doc.text(label, x + 4, y + 5.5);
  return y + 11;
}

// Ligne clé/valeur, retourne l'extra-hauteur si wrap
function kvRow(doc, key, value, x, y, totalWidth) {
  const kw = totalWidth * 0.48;
  const vw = totalWidth * 0.50;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  setTextColor(doc, C.gray500);
  doc.text(key, x, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  setTextColor(doc, C.gray700);
  const lines = doc.splitTextToSize(value, vw);
  doc.text(lines, x + kw, y);
  return lines.length > 1 ? (lines.length - 1) * 4.5 : 0;
}

function kvBlockHeight(doc, rows, colWidth, rowH) {
  let h = 0;
  rows.forEach(([, v]) => {
    const lines = doc.splitTextToSize(String(v ?? "-"), colWidth * 0.50);
    h += rowH + (lines.length > 1 ? (lines.length - 1) * 4.5 : 0);
  });
  return h;
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function generateMembrePDF(membre, suivis = [], options = {}) {
  const {
    churchName     = "Eglise",
    logoBase64     = null,
    celluleName    = null,
    familleName    = null,
    conseillerName = null,
  } = options;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = 210, PH = 297, ML = 14, MR = 14;
  const CW = PW - ML - MR; // 182mm
  let y = 0;

  const ensureSpace = (needed) => {
    if (y + needed > PH - 14) { doc.addPage(); y = 16; }
  };

  // ════════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════════
  fillRect(doc, 0, 0, PW, 30, C.navy);
  fillRect(doc, 0, 24, PW, 6, C.navyLight);

  // Logo
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, 5, 18, 18); }
    catch { _drawLogoPlaceholder(doc, ML); }
  } else {
    _drawLogoPlaceholder(doc, ML);
  }

  function _drawLogoPlaceholder(d, x) {
    fillRoundedRect(d, x, 5, 18, 18, 3, [100, 105, 200]);
    setTextColor(d, C.white); d.setFontSize(14); d.setFont("helvetica", "bold");
    d.text("+", x + 9, 16, { align: "center" });
  }

  setTextColor(doc, C.white);
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text(da(churchName), ML + 22, 13);
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  setTextColor(doc, [180, 185, 230]);
  doc.text("FICHE CONFIDENTIELLE", ML + 22, 19);

  setTextColor(doc, [180, 185, 230]); doc.setFontSize(7);
  doc.text("Genere le", PW - MR, 11, { align: "right" });
  setTextColor(doc, C.white); doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(formatDateFr(new Date().toISOString()), PW - MR, 17, { align: "right" });

  y = 36;

  // ════════════════════════════════════════════════════════════════
  // BADGE + NOM + TEL
  // ════════════════════════════════════════════════════════════════
  const etat      = (membre.etat_contact || "").toLowerCase().trim();
  const etatLabel = etat === "nouveau" ? "Nouveau" : etat === "existant" ? "Existant" : etat === "inactif" ? "Inactif" : safe(membre.etat_contact);
  const etatColor = etat === "nouveau" ? C.orange : etat === "existant" ? C.green : C.gray400;
  const etatBg    = etat === "nouveau" ? C.orangeLight : etat === "existant" ? C.greenLight : C.gray100;

  // Badge statut
  const badgeW = doc.getTextWidth(etatLabel) + 10;
  const badgeX = PW / 2 - badgeW / 2;
  fillRoundedRect(doc, badgeX, y, badgeW, 7, 3, etatBg);
  setTextColor(doc, etatColor); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text(etatLabel, PW / 2, y + 5, { align: "center" });

  // Etoile si star
  if (membre.star === true && etat === "existant") {
    setTextColor(doc, C.amber); doc.setFontSize(11);
    doc.text("*", badgeX + badgeW + 3, y + 5.5);
  }
  y += 10;

  // Nom
  setTextColor(doc, C.navy); doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`, PW / 2, y, { align: "center" });
  y += 8;

  // Téléphone
  if (membre.telephone) {
    setTextColor(doc, C.orange); doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Tel : ${da(String(membre.telephone))}`, PW / 2, y, { align: "center" });
    y += 7;
  }

  // Séparateur orange
  setDraw(doc, C.orange); doc.setLineWidth(0.6);
  doc.line(ML + 20, y, PW - MR - 20, y);
  y += 7;

  // ════════════════════════════════════════════════════════════════
  // Sections 2 colonnes
  // ════════════════════════════════════════════════════════════════
  const COL_W  = CW / 2 - 3;
  const COL2_X = ML + COL_W + 6;
  const ROW_H  = 6;

  function renderTwoColSection(leftHeader, leftRows, rightHeader, rightRows) {
    const lH = 11 + kvBlockHeight(doc, leftRows,  COL_W, ROW_H);
    const rH = 11 + kvBlockHeight(doc, rightRows, COL_W, ROW_H);
    ensureSpace(Math.max(lH, rH) + 5);

    let yL = sectionHeader(doc, leftHeader,  ML,      y, COL_W);
    leftRows.forEach(([k, v]) => { yL += ROW_H + kvRow(doc, k, v, ML, yL, COL_W); });

    let yR = sectionHeader(doc, rightHeader, COL2_X,  y, COL_W);
    rightRows.forEach(([k, v]) => { yR += ROW_H + kvRow(doc, k, v, COL2_X, yR, COL_W); });

    y = Math.max(yL, yR) + 5;
  }

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

  // ════════════════════════════════════════════════════════════════
  // SOIN PASTORAL — BESOINS
  // ════════════════════════════════════════════════════════════════
  ensureSpace(18);
  y = sectionHeader(doc, "SOIN PASTORAL  -  BESOINS", ML, y, CW);

  const besoins = parseBesoins(membre.besoin);
  if (besoins.length > 0) {
    let bx = ML;
    const tagH = 7;
    besoins.forEach((b) => {
      const resolu = (b.statut || "").toLowerCase().includes("resolu") ||
                     (b.statut || "").toLowerCase().includes("résolu");
      const tagLabel = resolu ? `v ${b.label} - Resolu` : b.label;
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      const bw = Math.max(doc.getTextWidth(tagLabel) + 10, 22);
      if (bx + bw > PW - MR) { bx = ML; y += tagH + 3; ensureSpace(12); }

      const tagBg  = resolu ? C.greenLight  : C.orangeLight;
      const tagStroke = resolu ? C.green    : C.orange;
      const tagTx  = resolu ? C.greenDark   : C.orange;

      fillRoundedRect(doc, bx, y - 1, bw, tagH, 3, tagBg);
      strokeRoundedRect(doc, bx, y - 1, bw, tagH, 3, tagStroke, 0.4);
      setTextColor(doc, tagTx);
      doc.text(tagLabel, bx + 5, y + 4);
      bx += bw + 4;
    });
    y += tagH + 4;
  } else {
    setTextColor(doc, C.gray400); doc.setFontSize(8); doc.setFont("helvetica", "italic");
    doc.text("Aucun besoin enregistre", ML, y + 3);
    y += 9;
  }

  if (membre.commentaire_suivis) {
    ensureSpace(10);
    // Séparateur
    setDraw(doc, C.gray200); doc.setLineWidth(0.3);
    doc.line(ML, y, PW - MR, y);
    y += 4;
    setTextColor(doc, C.gray500); doc.setFontSize(8); doc.setFont("helvetica", "italic");
    const cLines = doc.splitTextToSize(`Commentaire suivi : ${da(membre.commentaire_suivis)}`, CW);
    doc.text(cLines, ML, y);
    y += cLines.length * 4.5 + 3;
  }

  y += 4;

  // ════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS
  // ════════════════════════════════════════════════════════════════
  if (suivis.length > 0) {
    ensureSpace(15);
    y = sectionHeader(doc, "HISTORIQUE DES SUIVIS", ML, y, CW);
    y += 1;

    suivis.forEach((s) => {
      const besoinsArr  = parseHistoriqueBesoin(s.besoin);
      const statut      = da(s.statut || "En suivi");
      const resolu      = statut.toLowerCase().includes("resolu") || statut.toLowerCase().includes("résolu");
      const accentColor = resolu ? C.green : C.navyLight;
      const halfI       = (CW - 16) / 2;

      const interviewRows = INTERVIEW_QUESTIONS.filter(
        (q) => s[q.key] !== null && s[q.key] !== undefined && String(s[q.key]).trim() !== ""
      );
      const hasInterview = interviewRows.length > 0;

      const authorName = s.profiles
        ? da(`${s.profiles.prenom || ""} ${s.profiles.nom || ""}`.trim())
        : "";

      // ── Mesures ──────────────────────────────────────────────────
      const bLineText = besoinsArr.length > 0
        ? "Besoin : " + besoinsArr.map((b) => `${b.label} (${b.statut})`).join(", ")
        : null;
      const bLinesArr = bLineText ? doc.splitTextToSize(bLineText, CW - 14) : [];
      const cLinesArr = s.commentaire
        ? doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 16)
        : [];

      // Paires questions
      const pairsData = [];
      if (hasInterview) {
        for (let i = 0; i < interviewRows.length; i += 2) {
          const lq = interviewRows[i];
          const rq = interviewRows[i + 1];
          const ll = doc.splitTextToSize(safe(s[lq.key]), halfI - 8);
          const rl = rq ? doc.splitTextToSize(safe(s[rq.key]), halfI - 8) : [];
          const lh = Math.max(14, 10 + ll.length * 4.5);
          const rh = Math.max(14, 10 + rl.length * 4.5);
          pairsData.push({ lq, rq, ll, rl, boxH: Math.max(lh, rh) });
        }
      }

      // Hauteur totale de la carte
      let cardH = 14; // en-tête
      if (bLinesArr.length > 0)  cardH += bLinesArr.length * 4.5 + 3;
      if (cLinesArr.length > 0)  cardH += cLinesArr.length * 4.5 + 4;
      if (hasInterview) {
        cardH += 10; // barre titre
        pairsData.forEach((p) => { cardH += p.boxH + 3; });
        cardH += 2;
      }
      if (authorName) cardH += 7;
      cardH += 5; // marge basse

      ensureSpace(cardH + 5);
      const cardY = y;

      // ── Fond de carte ─────────────────────────────────────────────
      // Bordure extérieure légère
      fillRoundedRect(doc, ML, cardY, CW, cardH, 3, C.white);
      strokeRoundedRect(doc, ML, cardY, CW, cardH, 3, C.gray200, 0.5);
      // Barre accent gauche arrondie
      fillRoundedRect(doc, ML, cardY, 3, cardH, 1.5, accentColor);

      // ── En-tête carte ─────────────────────────────────────────────
      setTextColor(doc, C.gray700); doc.setFontSize(9.5); doc.setFont("helvetica", "bold");
      doc.text(
        `${formatDateFr(s.date_action)}  \u2014  ${safe(s.action_type)}`,
        ML + 7, cardY + 9
      );

      // Badge statut
      const sbLabel = resolu ? "Resolu" : statut;
      const sbw     = doc.getTextWidth(sbLabel) + 10;
      const sbBg    = resolu ? C.greenLight : C.blueLight;
      const sbTx    = resolu ? C.greenDark  : C.blue;
      fillRoundedRect(doc, PW - MR - sbw, cardY + 3, sbw, 7, 3, sbBg);
      setTextColor(doc, sbTx); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      doc.text(sbLabel, PW - MR - sbw + 5, cardY + 8);

      let cy = cardY + 13;

      // Besoins
      if (bLinesArr.length > 0) {
        setTextColor(doc, C.gray400); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
        doc.text(bLinesArr, ML + 7, cy);
        cy += bLinesArr.length * 4.5 + 3;
      }

      // Commentaire
      if (cLinesArr.length > 0) {
        setTextColor(doc, C.gray600); doc.setFontSize(8.5); doc.setFont("helvetica", "italic");
        doc.text(cLinesArr, ML + 7, cy);
        cy += cLinesArr.length * 4.5 + 4;
      }

      // Questions d'entretien
      if (hasInterview) {
        // Barre titre questions
        fillRoundedRect(doc, ML + 4, cy, CW - 8, 8, 2, C.navyXLight);
        setTextColor(doc, C.navy); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
        doc.text("QUESTIONS D'ENTRETIEN", ML + 8, cy + 5.5);
        cy += 11;

        pairsData.forEach(({ lq, rq, ll, rl, boxH }) => {
          const gap = 4;
          const lx  = ML + 4;
          const rx  = ML + 4 + halfI + gap;

          // Cellule gauche
          fillRoundedRect(doc, lx, cy, halfI, boxH, 2, C.gray50);
          strokeRoundedRect(doc, lx, cy, halfI, boxH, 2, C.gray100, 0.3);
          setTextColor(doc, C.navyLight); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
          doc.text(lq.label, lx + 4, cy + 5);
          setTextColor(doc, C.gray700); doc.setFontSize(8); doc.setFont("helvetica", "italic");
          doc.text(ll, lx + 4, cy + 10);

          // Cellule droite
          if (rq) {
            fillRoundedRect(doc, rx, cy, halfI, boxH, 2, C.gray50);
            strokeRoundedRect(doc, rx, cy, halfI, boxH, 2, C.gray100, 0.3);
            setTextColor(doc, C.navyLight); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
            doc.text(rq.label, rx + 4, cy + 5);
            setTextColor(doc, C.gray700); doc.setFontSize(8); doc.setFont("helvetica", "italic");
            doc.text(rl, rx + 4, cy + 10);
          }

          cy += boxH + 3;
        });
        cy += 2;
      }

      // Auteur
      if (authorName) {
        setTextColor(doc, C.gray400); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
        doc.text(`Redige par : ${authorName}`, ML + 7, cy + 3);
      }

      y = cardY + cardH + 5;
    });
  }

  // ════════════════════════════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setDraw(doc, C.gray200); doc.setLineWidth(0.3);
    doc.line(ML, PH - 12, PW - MR, PH - 12);
    setTextColor(doc, C.gray400); doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("Document confidentiel  -  Usage pastoral uniquement", ML, PH - 7);
    doc.text(`Page ${p} / ${totalPages}`, PW - MR, PH - 7, { align: "right" });
  }

  // Sauvegarde
  const prenom = (membre.prenom || "").toLowerCase().replace(/\s+/g, "_");
  const nom    = (membre.nom    || "").toLowerCase().replace(/\s+/g, "_");
  const date   = new Date().toISOString().split("T")[0];
  doc.save(`fiche_${prenom}_${nom}_${date}.pdf`);
}
