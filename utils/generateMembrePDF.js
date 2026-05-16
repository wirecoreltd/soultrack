// utils/generateMembrePDF.js
// Fiche pastorale confidentielle — design epure, fluide, sans emoji

import jsPDF from "jspdf";

// ─── Nettoyage texte ──────────────────────────────────────────────────────────

function da(str) {
  if (!str) return "";
  return String(str)
    .replace(/[àâä]/g, "a").replace(/[ÀÂÄÁ]/g, "A")
    .replace(/[éèêë]/g, "e").replace(/[ÉÈÊË]/g, "E")
    .replace(/[îï]/g,   "i").replace(/[ÎÏ]/g,   "I")
    .replace(/[ôö]/g,   "o").replace(/[ÔÖÓ]/g,  "O")
    .replace(/[ùûü]/g,  "u").replace(/[ÙÛÜ]/g,  "U")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/ñ/g, "n").replace(/Ñ/g, "N")
    .replace(/—/g, "-").replace(/['']/g, "'").replace(/[""«»]/g, '"')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .trim();
}

function safe(val) {
  if (val === null || val === undefined || val === "") return "-";
  return da(String(val));
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return da(dateStr);
    const M = ["Janv","Fevr","Mars","Avr","Mai","Juin","Juil","Aout","Sept","Oct","Nov","Dec"];
    return `${String(d.getDate()).padStart(2,"0")} ${M[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return da(String(dateStr)); }
}

function parseBesoins(val) {
  if (!val) return [];
  try {
    const p = typeof val === "string" ? JSON.parse(val) : val;
    if (!Array.isArray(p)) return [];
    return p.map(b =>
      typeof b === "object" && b !== null
        ? { label: da(String(b.label || b)), statut: da(String(b.statut || "En suivi")) }
        : { label: da(String(b)), statut: "En suivi" }
    );
  } catch { return []; }
}

function parseHistoriqueBesoin(val) {
  if (!val) return [];
  try {
    const p = typeof val === "string" ? JSON.parse(val) : val;
    if (!Array.isArray(p)) return [];
    if (p.length > 0 && typeof p[0] === "object" && p[0].label)
      return p.map(b => ({ label: da(b.label), statut: da(b.statut || "En suivi") }));
    return p.map(b => ({ label: da(String(b)), statut: "En suivi" }));
  } catch { return []; }
}

function formatMinistere(mj, autre) {
  try {
    let list = Array.isArray(mj) ? mj : JSON.parse(mj || "[]");
    list = list.filter(m => m.toLowerCase() !== "autre");
    if (autre?.trim()) list.push(autre.trim());
    return da(list.join(", ")) || "-";
  } catch { return safe(mj); }
}

// ─── Questions d'entretien ────────────────────────────────────────────────────

const IQ = [
  { key: "etat_general",       label: "Etat general" },
  { key: "vie_spirituelle",    label: "Vie spirituelle" },
  { key: "intention_priere",   label: "Intention de priere" },
  { key: "combats_luttes",     label: "Combats et luttes" },
  { key: "blocages",           label: "Blocages" },
  { key: "vie_personnelle",    label: "Vie personnelle" },
  { key: "besoins_avancement", label: "Besoins et avancement" },
  { key: "talents",            label: "Talents" },
  { key: "domaine_service",    label: "Domaine de service" },
];

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  navy:       [46,  49,  146],
  navyMid:    [79,  84,  201],
  navyLight:  [235, 238, 255],
  white:      [255, 255, 255],
  gray50:     [248, 250, 252],
  gray100:    [226, 232, 240],
  gray200:    [203, 213, 225],
  gray400:    [148, 163, 184],
  gray500:    [100, 116, 139],
  gray600:    [71,  85,  105],
  gray700:    [51,  65,  85],
  green:      [22,  163, 74],
  greenLight: [220, 252, 231],
  greenDark:  [15,  118, 55],
  orange:     [234, 88,  12],
  orangeLight:[255, 237, 213],
  blue:       [37,  99,  235],
  blueLight:  [219, 234, 254],
  amber:      [180, 90,  0],
};

// ─── Primitives ───────────────────────────────────────────────────────────────

const sf = (doc, rgb) => doc.setFillColor(...rgb);
const sd = (doc, rgb) => doc.setDrawColor(...rgb);
const st = (doc, rgb) => doc.setTextColor(...rgb);

function frect(doc, x, y, w, h, rgb) {
  sf(doc, rgb); doc.rect(x, y, w, h, "F");
}
function rrect(doc, x, y, w, h, r, rgb) {
  sf(doc, rgb); doc.roundedRect(x, y, w, h, r, r, "F");
}
function srect(doc, x, y, w, h, r, rgb, lw) {
  sd(doc, rgb); doc.setLineWidth(lw || 0.3); doc.roundedRect(x, y, w, h, r, r, "S");
}
function hline(doc, x1, x2, y, rgb, lw) {
  sd(doc, rgb); doc.setLineWidth(lw || 0.3); doc.line(x1, y, x2, y);
}

// ─── Hauteur d'un bloc de lignes kv ──────────────────────────────────────────

function kvBlockH(doc, rows, colW, rowGap) {
  let h = 0;
  for (const [, v] of rows) {
    const lines = doc.splitTextToSize(String(v ?? "-"), colW * 0.52);
    h += rowGap + (lines.length > 1 ? (lines.length - 1) * 4.5 : 0);
  }
  return h;
}

// ─── Ligne clé / valeur — valeur alignée à droite ────────────────────────────

function kvRow(doc, key, value, x, y, colW) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  st(doc, C.gray500);
  doc.text(key, x, y);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  st(doc, C.gray700);
  const lines = doc.splitTextToSize(value, colW * 0.52);
  lines.forEach((ln, i) => doc.text(ln, x + colW, y + i * 4.5, { align: "right" }));
  return lines.length > 1 ? (lines.length - 1) * 4.5 : 0;
}

// ─── Barre de section navy ────────────────────────────────────────────────────

function sectionBar(doc, label, x, y, w) {
  rrect(doc, x, y, w, 7.5, 2, C.navy);
  st(doc, C.white);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text(label, x + 4, y + 5.2);
  return y + 10;
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
  const PW  = 210;
  const PH  = 297;
  const ML  = 14;
  const MR  = 14;
  const CW  = PW - ML - MR; // 182 mm
  const BOT = 18;            // marge basse réservée footer

  let y = 0;

  const need = (h) => {
    if (y + h > PH - BOT) { doc.addPage(); y = 16; }
  };

  // ══════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════
  frect(doc, 0, 0, PW, 28, C.navy);
  frect(doc, 0, 22, PW, 6, C.navyMid);

  // Logo
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, 4, 16, 16); }
    catch { _logoBox(doc, ML); }
  } else {
    _logoBox(doc, ML);
  }

  function _logoBox(d, x) {
    rrect(d, x, 4, 16, 16, 2, [95, 100, 195]);
    st(d, C.white); d.setFontSize(13); d.setFont("helvetica", "bold");
    d.text("+", x + 8, 14.5, { align: "center" });
  }

  st(doc, C.white);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(da(churchName), ML + 20, 12);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  st(doc, [180, 185, 230]);
  doc.text("FICHE CONFIDENTIELLE", ML + 20, 18);

  st(doc, [180, 185, 230]); doc.setFontSize(7);
  doc.text("Genere le", PW - MR, 10, { align: "right" });
  st(doc, C.white); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
  doc.text(formatDate(new Date().toISOString()), PW - MR, 16.5, { align: "right" });

  y = 34;

  // ══════════════════════════════════════════════════════════════════
  // BANDEAU IDENTITE (badge + nom + tel)
  // ══════════════════════════════════════════════════════════════════
  const etat      = (membre.etat_contact || "").toLowerCase().trim();
  const etatLabel = etat === "nouveau"  ? "Nouveau"
                  : etat === "existant" ? "Existant"
                  : etat === "inactif"  ? "Inactif"
                  : safe(membre.etat_contact);
  const etatClr = etat === "nouveau"  ? C.orange
                : etat === "existant" ? C.green
                : C.gray400;
  const etatBg  = etat === "nouveau"  ? C.orangeLight
                : etat === "existant" ? C.greenLight
                : C.gray100;

  // Badge statut
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  const bw = doc.getTextWidth(etatLabel) + 10;
  rrect(doc, PW / 2 - bw / 2, y, bw, 6.5, 3, etatBg);
  st(doc, etatClr);
  doc.text(etatLabel, PW / 2, y + 4.8, { align: "center" });

  // Etoile serviteur
  if (membre.star === true && etat === "existant") {
    st(doc, C.amber); doc.setFontSize(10);
    doc.text("*", PW / 2 + bw / 2 + 3, y + 5);
  }
  y += 9;

  // Nom
  st(doc, C.navy); doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`, PW / 2, y, { align: "center" });
  y += 7;

  // Telephone
  if (membre.telephone) {
    st(doc, C.orange); doc.setFontSize(9.5); doc.setFont("helvetica", "normal");
    doc.text(`Tel. : ${da(String(membre.telephone))}`, PW / 2, y, { align: "center" });
    y += 6;
  }

  // Filet separateur
  hline(doc, ML + 18, PW - MR - 18, y + 1, C.orange, 0.5);
  y += 6;

  // ══════════════════════════════════════════════════════════════════
  // SECTIONS 2 COLONNES
  // ══════════════════════════════════════════════════════════════════
  const COL_W  = CW / 2 - 3;
  const COL2_X = ML + COL_W + 6;
  const ROW_H  = 6;

  function twoCol(lTitle, lRows, rTitle, rRows) {
    const lH = 10 + kvBlockH(doc, lRows, COL_W, ROW_H);
    const rH = 10 + kvBlockH(doc, rRows, COL_W, ROW_H);
    need(Math.max(lH, rH) + 3);

    const startY = y;

    let yL = sectionBar(doc, lTitle, ML, startY, COL_W);
    for (const [k, v] of lRows) yL += ROW_H + kvRow(doc, k, v, ML, yL, COL_W);

    let yR = sectionBar(doc, rTitle, COL2_X, startY, COL_W);
    for (const [k, v] of rRows) yR += ROW_H + kvRow(doc, k, v, COL2_X, yR, COL_W);

    // Pas de y += 4 additionnel — gap minimal de 3 mm
    y = Math.max(yL, yR) + 3;
  }

  const statutLabel = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };

  twoCol(
    "IDENTITE",
    [
      ["Civilite",      safe(membre.sexe)],
      ["Tranche d'age", safe(membre.age)],
      ["Ville",         safe(membre.ville)],
      ["WhatsApp",      membre.is_whatsapp ? "Oui" : "Non"],
      ["Ajoute le",     formatDate(membre.date_venu)],
    ],
    "SUIVI",
    [
      ["Statut",      safe(statutLabel[membre.statut_suivis] || membre.suivi_statut)],
      ["Envoi suivi", formatDate(membre.date_envoi_suivi)],
      ["Cellule",     safe(celluleName)],
      ["Famille",     safe(familleName)],
      ["Conseiller",  safe(conseillerName)],
    ]
  );

  twoCol(
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
  need(16);
  y = sectionBar(doc, "SOIN PASTORAL  —  BESOINS", ML, y, CW);

  const besoins = parseBesoins(membre.besoin);

  if (besoins.length > 0) {
    let bx  = ML;
    const TH = 6.5;

    for (const b of besoins) {
      const resolu = (b.statut || "").toLowerCase().includes("resolu") ||
                     (b.statut || "").toLowerCase().includes("résolu");
      const label  = resolu ? `v ${b.label}  Resolu` : b.label;

      doc.setFontSize(7.5); doc.setFont("helvetica", resolu ? "bolditalic" : "bold");
      const tw = Math.max(doc.getTextWidth(label) + 10, 20);

      if (bx + tw > PW - MR) { bx = ML; y += TH + 3; need(TH + 6); }

      rrect(doc, bx, y - 1, tw, TH, 2.5, resolu ? C.greenLight  : C.orangeLight);
      srect(doc, bx, y - 1, tw, TH, 2.5, resolu ? C.green       : C.orange, 0.4);
      st(doc,                                      resolu ? C.greenDark    : C.orange);
      doc.text(label, bx + 5, y + 4);
      bx += tw + 3;
    }
    y += TH + 2;
  } else {
    st(doc, C.gray400); doc.setFontSize(8); doc.setFont("helvetica", "italic");
    doc.text("Aucun besoin enregistre", ML, y + 4);
    y += 8;
  }

  // Commentaire de suivi
  if (membre.commentaire_suivis) {
    need(8);
    hline(doc, ML, PW - MR, y, C.gray200, 0.25);
    y += 4;
    st(doc, C.gray500); doc.setFontSize(7.5); doc.setFont("helvetica", "italic");
    const cL = doc.splitTextToSize(`Commentaire : ${da(membre.commentaire_suivis)}`, CW);
    need(cL.length * 4.5 + 3);
    doc.text(cL, ML, y);
    y += cL.length * 4.5 + 1;
  }

  // ══════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS
  // ══════════════════════════════════════════════════════════════════
  if (suivis.length > 0) {
    y += 4;
    need(14);
    y = sectionBar(doc, "HISTORIQUE DES SUIVIS", ML, y, CW);

    for (const s of suivis) {
      const besoinsArr = parseHistoriqueBesoin(s.besoin);
      const statut     = da(s.statut || "En suivi");
      const resolu     = statut.toLowerCase().includes("resolu") ||
                         statut.toLowerCase().includes("résolu");
      const accentClr  = resolu ? C.green : C.navyMid;

      const authorName = s.profiles
        ? da(`${s.profiles.prenom || ""} ${s.profiles.nom || ""}`.trim())
        : "";

      // Questions renseignées
      const filledQ = IQ.filter(q =>
        s[q.key] !== null && s[q.key] !== undefined && String(s[q.key]).trim() !== ""
      );

      // ── Pré-calcul hauteur carte ──────────────────────────────────
      let cardH = 14; // en-tête + filet

      if (besoinsArr.length > 0) {
        const bT = "Besoin : " + besoinsArr.map(b => `${b.label} (${b.statut})`).join(", ");
        cardH += doc.splitTextToSize(bT, CW - 14).length * 4.5 + 2;
      }

      if (s.commentaire) {
        cardH += doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 14).length * 4.5 + 3;
      }

      if (filledQ.length > 0) {
        cardH += 8; // barre titre questions
        for (const q of filledQ) {
          cardH += 4.5; // label
          cardH += doc.splitTextToSize(safe(s[q.key]), CW - 22).length * 4 + 3;
        }
        cardH += 1;
      }

      if (authorName) cardH += 6;
      cardH += 4;

      need(cardH + 4);
      const cardY = y;

      // ── Fond carte ────────────────────────────────────────────────
      rrect(doc, ML, cardY, CW, cardH, 2.5, C.white);
      srect(doc, ML, cardY, CW, cardH, 2.5, C.gray100, 0.4);
      // Accent gauche
      rrect(doc, ML, cardY, 3, cardH, 1.5, accentClr);

      // ── Header carte ──────────────────────────────────────────────
      st(doc, C.gray700); doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text(
        `${formatDate(s.date_action)}  —  ${safe(s.action_type)}`,
        ML + 7, cardY + 8.5
      );

      // Badge statut
      const sbLabel = resolu ? "Resolu" : statut;
      doc.setFontSize(7); doc.setFont("helvetica", "bold");
      const sbW = doc.getTextWidth(sbLabel) + 8;
      rrect(doc, PW - MR - sbW, cardY + 3.5, sbW, 6, 2.5,
            resolu ? C.greenLight : C.blueLight);
      st(doc, resolu ? C.greenDark : C.blue);
      doc.text(sbLabel, PW - MR - sbW / 2, cardY + 7.8, { align: "center" });

      // Filet sous header
      let cy = cardY + 12;
      hline(doc, ML + 4, PW - MR - 4, cy, C.gray200, 0.25);
      cy += 3;

      // ── Besoins du suivi ──────────────────────────────────────────
      if (besoinsArr.length > 0) {
        const bT  = "Besoin : " + besoinsArr.map(b => `${b.label} (${b.statut})`).join(", ");
        const bLn = doc.splitTextToSize(bT, CW - 14);
        st(doc, C.gray400); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
        doc.text(bLn, ML + 7, cy);
        cy += bLn.length * 4.5 + 2;
      }

      // ── Commentaire ───────────────────────────────────────────────
      if (s.commentaire) {
        const cLn = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 14);
        st(doc, C.gray600); doc.setFontSize(8.5); doc.setFont("helvetica", "italic");
        doc.text(cLn, ML + 7, cy);
        cy += cLn.length * 4.5 + 3;
      }

      // ── Questions d'entretien (1 colonne, compact, avec filets) ───
      if (filledQ.length > 0) {
        // Barre titre
        rrect(doc, ML + 4, cy, CW - 8, 6.5, 1.5, C.navyLight);
        st(doc, C.navy); doc.setFontSize(7); doc.setFont("helvetica", "bold");
        doc.text("QUESTIONS D'ENTRETIEN", ML + 8, cy + 4.5);
        cy += 8.5;

        for (let i = 0; i < filledQ.length; i++) {
          const q = filledQ[i];

          // Label
          st(doc, C.navyMid); doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
          doc.text(q.label, ML + 8, cy);
          cy += 4.5;

          // Réponse
          const vLn = doc.splitTextToSize(safe(s[q.key]), CW - 20);
          st(doc, C.gray700); doc.setFontSize(8); doc.setFont("helvetica", "italic");
          doc.text(vLn, ML + 10, cy);
          cy += vLn.length * 4;

          // Filet entre questions (sauf la dernière)
          if (i < filledQ.length - 1) {
            cy += 2;
            hline(doc, ML + 8, PW - MR - 8, cy, C.gray100, 0.2);
            cy += 2;
          } else {
            cy += 3;
          }
        }
      }

      // ── Auteur ────────────────────────────────────────────────────
      if (authorName) {
        st(doc, C.gray400); doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text(`Redige par : ${authorName}`, ML + 7, cy + 3);
        cy += 6;
      }

      y = cardY + cardH + 4;
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════════
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    hline(doc, ML, PW - MR, PH - 12, C.gray200, 0.3);
    st(doc, C.gray400); doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("Document confidentiel  —  Usage pastoral uniquement", ML, PH - 7);
    doc.text(`Page ${p} / ${total}`, PW - MR, PH - 7, { align: "right" });
  }

  // ══════════════════════════════════════════════════════════════════
  // SAUVEGARDE
  // ══════════════════════════════════════════════════════════════════
  const prenom = (membre.prenom || "").toLowerCase().replace(/\s+/g, "_");
  const nom    = (membre.nom    || "").toLowerCase().replace(/\s+/g, "_");
  const date   = new Date().toISOString().split("T")[0];
  doc.save(`fiche_${prenom}_${nom}_${date}.pdf`);
}
