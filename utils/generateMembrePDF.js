// utils/generateMembrePDF.js

import jsPDF from "jspdf";

// ─── Nettoyage ────────────────────────────────────────────────────────────────

function da(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/[àâä]/g, "a").replace(/[ÀÂÄÁ]/g, "A")
    .replace(/[éèêë]/g, "e").replace(/[ÉÈÊË]/g, "E")
    .replace(/[îï]/g,   "i").replace(/[ÎÏ]/g,   "I")
    .replace(/[ôö]/g,   "o").replace(/[ÔÖÓ]/g,  "O")
    .replace(/[ùûü]/g,  "u").replace(/[ÙÛÜ]/g,  "U")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/ñ/g, "n").replace(/Ñ/g, "N")
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/[\u{E000}-\u{F8FF}]/gu, "")
    .replace(/[^\x00-\xFF]/g, "")
    .trim();
}

function safe(val) {
  if (val === null || val === undefined || String(val).trim() === "") return "-";
  return da(String(val));
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return safe(dateStr);
    const M = ["Janv","Fevr","Mars","Avr","Mai","Juin","Juil","Aout","Sept","Oct","Nov","Dec"];
    return `${String(d.getDate()).padStart(2,"0")} ${M[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return safe(String(dateStr)); }
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
      return p.map(b => ({ label: da(b.label || ""), statut: da(b.statut || "En suivi") }));
    return p.map(b => ({ label: da(String(b)), statut: "En suivi" }));
  } catch { return []; }
}

function formatMinistere(mj, autre) {
  try {
    let list = Array.isArray(mj) ? mj : JSON.parse(mj || "[]");
    list = list.filter(m => String(m).toLowerCase() !== "autre");
    if (autre && String(autre).trim()) list.push(String(autre).trim());
    return da(list.join(", ")) || "-";
  } catch { return safe(mj); }
}

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

const sf = (doc, rgb) => doc.setFillColor(...rgb);
const sd = (doc, rgb) => doc.setDrawColor(...rgb);
const st = (doc, rgb) => doc.setTextColor(...rgb);

function frect(doc, x, y, w, h, rgb)      { sf(doc, rgb); doc.rect(x, y, w, h, "F"); }
function rrect(doc, x, y, w, h, r, rgb)   { sf(doc, rgb); doc.roundedRect(x, y, w, h, r, r, "F"); }
function hline(doc, x1, x2, yy, rgb, lw)  { sd(doc, rgb); doc.setLineWidth(lw || 0.3); doc.line(x1, yy, x2, yy); }

// ─── Mesure exacte d'un bloc de rows ──────────────────────────────────────────

function measureRows(doc, rows, colW, fs = 8.5, lh = 5) {
  doc.setFontSize(fs);
  let h = 0;
  for (const [lbl, val] of rows) {
    const prefix = `${da(lbl)} : `;
    const pw     = doc.getTextWidth(prefix);
    const lines  = doc.splitTextToSize(da(val) || "-", colW - pw);
    h += lh * lines.length;
  }
  return h;
}

// ─── Dessin d'un bloc de rows ─────────────────────────────────────────────────

function drawRows(doc, rows, x, startY, colW, fs = 8.5, lh = 5) {
  let cy = startY;
  doc.setFontSize(fs);
  for (const [lbl, val] of rows) {
    const prefix = `${da(lbl)} : `;
    doc.setFont("helvetica", "normal"); st(doc, C.gray500);
    const pw = doc.getTextWidth(prefix);
    doc.text(prefix, x, cy);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(da(val) || "-", colW - pw);
    doc.text(lines, x + pw, cy);
    cy += lh * lines.length;
  }
  return cy;
}

// ─── Bloc grille 2 colonnes ───────────────────────────────────────────────────

function draw2ColBlock(doc, leftTitle, leftRows, rightTitle, rightRows, y, ML, CW) {
  const PAD_H  = 5;
  const PAD_T  = 6;
  const PAD_B  = 5;
  const HDR_H  = 7.5;
  const GAP    = 3;
  const COL_W  = (CW - GAP) / 2;
  const X2     = ML + COL_W + GAP;

  const hL  = measureRows(doc, leftRows,  COL_W - PAD_H * 2);
  const hR  = measureRows(doc, rightRows, COL_W - PAD_H * 2);
  const bodyH  = Math.max(hL, hR) + PAD_T + PAD_B;
  const totalH = HDR_H + bodyH;

  // Col gauche
  rrect(doc, ML, y, COL_W, totalH, 2.5, C.gray50);
  sd(doc, C.gray100); doc.setLineWidth(0.2);
  doc.roundedRect(ML, y, COL_W, totalH, 2.5, 2.5, "S");
  rrect(doc, ML, y, COL_W, HDR_H, 2.5, C.navy);
  frect(doc, ML, y + HDR_H / 2, COL_W, HDR_H / 2, C.navy);
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.white);
  doc.text(da(leftTitle).toUpperCase(), ML + PAD_H, y + 5.5);
  drawRows(doc, leftRows, ML + PAD_H, y + HDR_H + PAD_T, COL_W - PAD_H * 2);

  // Col droite
  rrect(doc, X2, y, COL_W, totalH, 2.5, C.gray50);
  sd(doc, C.gray100); doc.setLineWidth(0.2);
  doc.roundedRect(X2, y, COL_W, totalH, 2.5, 2.5, "S");
  rrect(doc, X2, y, COL_W, HDR_H, 2.5, C.navyMid);
  frect(doc, X2, y + HDR_H / 2, COL_W, HDR_H / 2, C.navyMid);
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.white);
  doc.text(da(rightTitle).toUpperCase(), X2 + PAD_H, y + 5.5);
  drawRows(doc, rightRows, X2 + PAD_H, y + HDR_H + PAD_T, COL_W - PAD_H * 2);

  return y + totalH + 3;
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function generateMembrePDF(membre, suivis = [], options = {}) {
  const {
    churchName     = "Eglise",
    logoBase64     = null,
    celluleName    = null,
    familleName    = null,
    conseillerName = null,
    eglise         = null,
  } = options;

  if (!membre) return;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW  = 210;
  const PH  = 297;
  const ML  = 14;
  const MR  = 14;
  const CW  = PW - ML - MR;
  const BOT = 18;

  let y = 0;

  const need = (h) => {
    if (y + h > PH - BOT) { doc.addPage(); y = 16; }
  };

  const rubrique = (title) => {
    need(12);
    y += 5;
    hline(doc, ML, PW - MR, y, C.gray200, 0.3);
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    const tw = doc.getTextWidth(da(title).toUpperCase()) + 10;
    rrect(doc, PW / 2 - tw / 2, y - 3, tw, 6, 3, C.navy);
    st(doc, C.white);
    doc.text(da(title).toUpperCase(), PW / 2, y + 0.8, { align: "center" });
    y += 7;
  };

  // ══════════════════════════════════════════════════════════════════
  // HEADER — tout centré verticalement dans la bande navy (30mm)
  // ══════════════════════════════════════════════════════════════════
  const HDR_H = 30;
  frect(doc, 0, 0, PW, HDR_H, C.navy);
  // Bande accent bas du header
  frect(doc, 0, HDR_H - 5, PW, 5, C.navyMid);

  // Centre vertical de la zone principale (hors bande accent) = (HDR_H - 5) / 2 = 12.5
  const hdrMid = (HDR_H - 5) / 2; // 12.5mm

  // Logo — centré verticalement (16mm de haut → top = hdrMid - 8)
  const logoSize = 16;
  const logoY    = hdrMid - logoSize / 2; // 4.5
  const drawLogo = (d) => {
    rrect(d, ML, logoY, logoSize, logoSize, 2, [95, 100, 195]);
    st(d, C.white);
    d.setFontSize(14); d.setFont("helvetica", "bold");
    d.text("+", ML + logoSize / 2, logoY + logoSize / 2 + 2.5, { align: "center" });
  };
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, logoY, logoSize, logoSize); }
    catch { drawLogo(doc); }
  } else {
    drawLogo(doc);
  }

  // Texte église — bloc centré verticalement à droite du logo
  // Nom église : ligne principale → à hdrMid - 3 (légèrement au-dessus du centre)
  // Sous-titre  : hdrMid + 2.5
  // Ville/pays  : hdrMid + 7
  const txtX = ML + logoSize + 4;

  const egliseNom = eglise ? safe(eglise.nom) : safe(churchName);
  st(doc, C.white);
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(egliseNom || "Eglise", txtX, hdrMid - 2);

  if (eglise) {
    const parts = [eglise.denomination, eglise.branche].filter(v => v && String(v).trim() && String(v).trim() !== "");
    const sousTitre = da(parts.join("  •  "));
    if (sousTitre) {
      st(doc, [180, 185, 230]);
      doc.setFontSize(7); doc.setFont("helvetica", "normal");
      doc.text(sousTitre, txtX, hdrMid + 3.5);
    }
    const lieu = [eglise.ville, eglise.pays].filter(v => v && String(v).trim()).map(v => da(String(v))).join(", ");
    if (lieu) {
      st(doc, [155, 160, 210]);
      doc.setFontSize(6.5);
      doc.text(lieu, txtX, hdrMid + 8);
    }
  } else {
    // Pas d'objet eglise → on affiche churchName comme sous-titre
    st(doc, [180, 185, 230]);
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text(safe(churchName), txtX, hdrMid + 3.5);
  }

  // Colonne droite : "Genere le" + date + "FICHE CONFIDENTIELLE"
  // Centré verticalement : date au milieu, label au-dessus, badge en dessous
  st(doc, [180, 185, 230]);
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text("Genere le", PW - MR, hdrMid - 3.5, { align: "right" });

  st(doc, C.white);
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
  doc.text(formatDate(new Date().toISOString()), PW - MR, hdrMid + 2, { align: "right" });

  st(doc, [155, 160, 210]);
  doc.setFontSize(6); doc.setFont("helvetica", "normal");
  doc.text("FICHE CONFIDENTIELLE", PW - MR, hdrMid + 7, { align: "right" });

  y = HDR_H + 8;

  // ══════════════════════════════════════════════════════════════════
  // HERO — nom du membre
  // ══════════════════════════════════════════════════════════════════
  st(doc, C.navy);
  doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`.trim() || "-", PW / 2, y, { align: "center" });
  y += 10;

  // ══════════════════════════════════════════════════════════════════
  // GRILLES
  // ══════════════════════════════════════════════════════════════════
  const etat      = da((membre.etat_contact || "")).toLowerCase().trim();
  const etatLabel = etat === "nouveau"  ? "Nouveau"
                  : etat === "existant" ? "Existant"
                  : etat === "inactif"  ? "Inactif"
                  : safe(membre.etat_contact) || "-";

  need(40);
  y = draw2ColBlock(doc,
    "Identite", [
      ["Etat",      etatLabel],
      ["Tel.",      membre.telephone ? da(String(membre.telephone)) : "-"],
      ["Civilite",  safe(membre.sexe)],
      ["Age",       safe(membre.age)],
      ["Ville",     safe(membre.ville)],
      ["WhatsApp",  membre.is_whatsapp ? "Oui" : "Non"],
      ["Date de sa venu", formatDate(membre.date_venu)],
    ],
    // ← "Followed by" remplace "Suivi pastoral", sans Statut ni Envoi suivi
    "Followed by", [
      ["Cellule",    safe(celluleName)],
      ["Famille",    safe(familleName)],
      ["Conseiller", safe(conseillerName)],
    ],
    y, ML, CW
  );

  need(40);
  y = draw2ColBlock(doc,
    "Vie spirituelle", [
      ["Bapteme eau",  safe(membre.bapteme_eau)],
      ["Bapteme feu",  safe(membre.bapteme_esprit)],
      ["Priere salut", safe(membre.priere_salut)],
      ["Conversion",   safe(membre.type_conversion)],
      ["Ministere",    formatMinistere(membre.Ministere, membre.Autre_Ministere)],
    ],
    "Parcours", [
      ["Comment venu",      safe(membre.venu)],
      ["Raison de sa venu", safe(membre.statut_initial)],
      ["Formation",         safe(membre.Formation)],
      ["Infos supp.",       safe(membre.infos_supplementaires)],
    ],
    y, ML, CW
  );

  // ══════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS
  // (section "Soin pastoral — Besoins" supprimée)
  // ══════════════════════════════════════════════════════════════════
  if (Array.isArray(suivis) && suivis.length > 0) {
    rubrique("Historique des suivis");

    for (let idx = 0; idx < suivis.length; idx++) {
      const s = suivis[idx];
      if (!s) continue;

      const besoinsArr = parseHistoriqueBesoin(s.besoin);
      const statut     = da(s.statut || "En suivi");
      const resolu     = statut.toLowerCase().includes("resolu");
      const authorRaw  = s.profiles
        ? `${s.profiles.prenom || ""} ${s.profiles.nom || ""}`.trim()
        : "";
      const authorName = da(authorRaw);
      const filledQ    = IQ.filter(q => {
        const v = s[q.key];
        return v !== null && v !== undefined && String(v).trim() !== "";
      });

      // Date — type + statut
      need(8);
      doc.setFontSize(9.5); doc.setFont("helvetica", "bold"); st(doc, C.gray700);
      doc.text(`${formatDate(s.date_action)}  —  ${safe(s.action_type)}`, ML, y);
      const sLabel = resolu ? "Resolu" : statut;
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      st(doc, resolu ? C.greenDark : C.navyMid);
      doc.text(sLabel, PW - MR, y, { align: "right" });
      y += 6;

      // Besoins — tags colorés inline
      if (besoinsArr.length > 0) {
        const TAG_H  = 5.5;
        const TAG_PH = 4;
        const TAG_PV = 1.2;
        const GAP    = 2.5;
        doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.gray500);
        const labelW = doc.getTextWidth("Besoin : ");
        doc.text("Besoin : ", ML, y + TAG_H - TAG_PV - 0.5);
        let tx = ML + labelW;
        for (const b of besoinsArr) {
          const isResolu = (b.statut || "").toLowerCase().includes("resolu");
          const tagLabel = isResolu ? `${da(b.label)} - Resolu` : da(b.label);
          doc.setFontSize(7); doc.setFont("helvetica", "bold");
          const tw2 = doc.getTextWidth(tagLabel) + TAG_PH * 2;
          if (tx + tw2 > PW - MR) { tx = ML + labelW; y += TAG_H + GAP; need(TAG_H + GAP); }
          // fond + bordure
          rrect(doc, tx, y, tw2, TAG_H, 2.5, isResolu ? C.greenLight : C.orangeLight);
          sd(doc, isResolu ? C.green : C.orange); doc.setLineWidth(0.25);
          doc.roundedRect(tx, y, tw2, TAG_H, 2.5, 2.5, "S");
          // texte centré dans le tag
          st(doc, isResolu ? C.greenDark : C.orange);
          doc.text(tagLabel, tx + tw2 / 2, y + TAG_H - TAG_PV, { align: "center" });
          tx += tw2 + GAP;
        }
        y += TAG_H + 4;
      }

      // Commentaire
      if (s.commentaire) {
        const cl = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW);
        need(cl.length * 4.5 + 2);
        // Fond léger + bordure gauche
        const commentH = cl.length * 4.5 + 3;
        frect(doc, ML, y - 1, CW, commentH, [248, 250, 252]);
        frect(doc, ML, y - 1, 1.5, commentH, C.navyMid);
        doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray700);
        doc.text(cl, ML + 4, y + 2.5);
        y += commentH + 2;
      }

      // Questions / Réponses
      for (const q of filledQ) {
        need(5);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); st(doc, C.navyMid);
        doc.text(`${q.label} :`, ML, y);
        y += 5;
        const vL = doc.splitTextToSize(safe(s[q.key]), CW - 4);
        need(vL.length * 4.5 + 1);
        doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); st(doc, C.gray700);
        doc.text(vL, ML + 3, y);
        y += vL.length * 4.5 + 2;
      }

      // Auteur
      if (authorName) {
        need(6);
        doc.setFontSize(7); doc.setFont("helvetica", "italic"); st(doc, C.gray400);
        doc.text(`Redige par ${authorName}`, ML, y);
        y += 5;
      }

      // Séparateur entre suivis
      if (idx < suivis.length - 1) {
        y += 2;
        hline(doc, ML, PW - MR, y, C.gray200, 0.25);
        y += 5;
      } else {
        y += 3;
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // FOOTER navy sur chaque page
  // ══════════════════════════════════════════════════════════════════
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    frect(doc, 0, PH - 13, PW, 13, C.navy);
    st(doc, [180, 185, 230]);
    doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
    doc.text("Document confidentiel  -  Usage pastoral uniquement", ML, PH - 5.5);
    st(doc, C.white);
    doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text(`Page ${p} / ${total}`, PW - MR, PH - 5.5, { align: "right" });
  }

  // ══════════════════════════════════════════════════════════════════
  // SAUVEGARDE
  // ══════════════════════════════════════════════════════════════════
  const prenomFile = da(membre.prenom || "").toLowerCase().replace(/\s+/g, "_") || "inconnu";
  const nomFile    = da(membre.nom    || "").toLowerCase().replace(/\s+/g, "_") || "membre";
  const dateFile   = new Date().toISOString().split("T")[0];
  doc.save(`fiche_${prenomFile}_${nomFile}_${dateFile}.pdf`);
}
