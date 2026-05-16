// utils/generateMembrePDF.js
// Grille 2 colonnes avec mesure exacte des hauteurs avant dessin — zéro espace mort

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

// ─── Mesure exacte d'un bloc de rows (sans dessiner) ──────────────────────────

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

// ─── Dessin d'un bloc de rows à position fixe ─────────────────────────────────

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

  rrect(doc, ML, y, COL_W, totalH, 2.5, C.gray50);
  sd(doc, C.gray100); doc.setLineWidth(0.2);
  doc.roundedRect(ML, y, COL_W, totalH, 2.5, 2.5, "S");

  rrect(doc, ML, y, COL_W, HDR_H, 2.5, C.navy);
  frect(doc, ML, y + HDR_H / 2, COL_W, HDR_H / 2, C.navy);

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.white);
  doc.text(da(leftTitle).toUpperCase(), ML + PAD_H, y + 5.5);

  drawRows(doc, leftRows, ML + PAD_H, y + HDR_H + PAD_T, COL_W - PAD_H * 2);

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

  // Rubrique : filet avec label centré en médaillon
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
  // HEADER
  // ══════════════════════════════════════════════════════════════════
  frect(doc, 0, 0, PW, 26, C.navy);
  frect(doc, 0, 20, PW, 6, C.navyMid);
  frect(doc, 0, 26, PW, 1.5, C.orange);

  const drawLogo = (d) => {
    rrect(d, ML, 4, 14, 14, 2, [95, 100, 195]);
    st(d, C.white);
    d.setFontSize(14); d.setFont("helvetica", "bold");
    d.text("+", ML + 7, 13.5, { align: "center" });
  };
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, 4, 14, 14); }
    catch { drawLogo(doc); }
  } else {
    drawLogo(doc);
  }

  st(doc, C.white);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(safe(churchName) || "Eglise", ML + 18, 11);
  st(doc, [180, 185, 230]);
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text("FICHE CONFIDENTIELLE", ML + 18, 17);

  st(doc, [180, 185, 230]);
  doc.setFontSize(6.5);
  doc.text("Genere le", PW - MR, 10, { align: "right" });
  st(doc, C.white);
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
  doc.text(formatDate(new Date().toISOString()), PW - MR, 16.5, { align: "right" });

  y = 34;

  // ══════════════════════════════════════════════════════════════════
  // HERO
  // ══════════════════════════════════════════════════════════════════
  const etat      = da((membre.etat_contact || "")).toLowerCase().trim();
  const etatLabel = etat === "nouveau"  ? "Nouveau"
                  : etat === "existant" ? "Existant"
                  : etat === "inactif"  ? "Inactif"
                  : safe(membre.etat_contact) || "Inconnu";
  const etatClr = etat === "nouveau"  ? C.orange  : etat === "existant" ? C.green  : C.gray400;
  const etatBg  = etat === "nouveau"  ? C.orangeLight : etat === "existant" ? C.greenLight : C.gray100;

  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  const bw = doc.getTextWidth(etatLabel) + 12;
  rrect(doc, PW / 2 - bw / 2, y, bw, 6.5, 3, etatBg);
  st(doc, etatClr);
  doc.text(etatLabel, PW / 2, y + 4.8, { align: "center" });
  if (membre.star === true && etat === "existant") {
    st(doc, C.amber); doc.setFontSize(10);
    doc.text("*", PW / 2 + bw / 2 + 3, y + 5);
  }
  y += 11;

  st(doc, C.navy);
  doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`.trim() || "-", PW / 2, y, { align: "center" });
  y += 8;

  if (membre.telephone) {
    st(doc, C.orange); doc.setFontSize(9.5); doc.setFont("helvetica", "normal");
    doc.text(`Tel. : ${da(String(membre.telephone))}`, PW / 2, y, { align: "center" });
    y += 5;
  }

  frect(doc, PW / 2 - 25, y, 50, 0.8, C.orange);
  y += 8;

  // ══════════════════════════════════════════════════════════════════
  // GRILLES — mesure avant dessin, aucun gap
  // ══════════════════════════════════════════════════════════════════
  const statutLabel = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };

  need(40);
  y = draw2ColBlock(doc,
    "Identite", [
      ["Civilite",  safe(membre.sexe)],
      ["Age",       safe(membre.age)],
      ["Ville",     safe(membre.ville)],
      ["WhatsApp",  membre.is_whatsapp ? "Oui" : "Non"],
      ["Ajoute le", formatDate(membre.date_venu)],
    ],
    "Suivi pastoral", [
      ["Statut",      safe(statutLabel[membre.statut_suivis] || membre.suivi_statut)],
      ["Envoi suivi", formatDate(membre.date_envoi_suivi)],
      ["Cellule",     safe(celluleName)],
      ["Famille",     safe(familleName)],
      ["Conseiller",  safe(conseillerName)],
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
      ["Comment venu", safe(membre.venu)],
      ["Raison",       safe(membre.statut_initial)],
      ["Formation",    safe(membre.Formation)],
      ["Infos supp.",  safe(membre.infos_supplementaires)],
    ],
    y, ML, CW
  );

  // ══════════════════════════════════════════════════════════════════
  // SOIN PASTORAL — Besoins (tags compacts, pas de fond de bloc)
  // ══════════════════════════════════════════════════════════════════
  rubrique("Soin pastoral — Besoins");

  const besoins = parseBesoins(membre.besoin);
  if (besoins.length > 0) {
    const TAG_H = 6.5;
    let tx = ML;
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    for (const b of besoins) {
      const resolu = (b.statut || "").toLowerCase().includes("resolu");
      const label  = resolu ? `${da(b.label)} - Resolu` : da(b.label);
      const tw2    = doc.getTextWidth(label) + 10;
      if (tx + tw2 > PW - MR) { tx = ML; y += TAG_H + 2; need(TAG_H + 2); }
      need(TAG_H + 2);
      rrect(doc, tx, y, tw2, TAG_H, 3, resolu ? C.greenLight : C.orangeLight);
      sd(doc, resolu ? C.green : C.orange); doc.setLineWidth(0.3);
      doc.roundedRect(tx, y, tw2, TAG_H, 3, 3, "S");
      st(doc, resolu ? C.greenDark : C.orange);
      doc.text(label, tx + tw2 / 2, y + 4.8, { align: "center" });
      tx += tw2 + 3;
    }
    y += TAG_H + 4;
  } else {
    need(6);
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray400);
    doc.text("Aucun besoin enregistre.", ML, y);
    y += 6;
  }

  // Commentaire suivi (simple, sans fond de bloc)
  if (membre.commentaire_suivis) {
    const cL = doc.splitTextToSize(`"${da(membre.commentaire_suivis)}"`, CW);
    need(cL.length * 4.5 + 4);
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray600);
    doc.text(cL, ML, y);
    y += cL.length * 4.5 + 4;
  }

  // ══════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS — tout en texte, sans fond de bloc
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

      // ── Pré-calcul hauteur exacte ──────────────────────────────────
      doc.setFontSize(8.5);
      let bH = 8; // titre ligne (date — type)

      if (besoinsArr.length > 0) {
        const bt = besoinsArr.map(b => `${da(b.label)} (${da(b.statut)})`).join(", ");
        bH += doc.splitTextToSize(bt, CW - 6).length * 4.2 + 3;
      }
      if (s.commentaire) {
        bH += doc.splitTextToSize(`"${da(s.commentaire)}"`, CW).length * 4.5 + 3;
      }
      if (filledQ.length > 0) {
        for (const q of filledQ) {
          bH += 5; // label question
          bH += doc.splitTextToSize(safe(s[q.key]), CW - 4).length * 4.5 + 2;
        }
      }
      if (authorName) bH += 5;
      bH += 3; // petit espace bas avant séparateur

      need(bH + 4);

      const blockY = y;

      // ── Ligne de titre : date — type + badge statut ────────────────
      doc.setFontSize(9.5); doc.setFont("helvetica", "bold"); st(doc, C.gray700);
      doc.text(`${formatDate(s.date_action)}  —  ${safe(s.action_type)}`, ML, y);

      // Badge statut (léger, en texte coloré à droite)
      const sLabel = resolu ? "Resolu" : statut;
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      st(doc, resolu ? C.greenDark : C.navyMid);
      doc.text(sLabel, PW - MR, y, { align: "right" });

      y += 6;

      // ── Besoins ────────────────────────────────────────────────────
      if (besoinsArr.length > 0) {
        const bt = besoinsArr.map(b => `${da(b.label)} (${da(b.statut)})`).join(", ");
        doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.gray500);
        const bpw = doc.getTextWidth("Besoin : ");
        doc.text("Besoin : ", ML, y);
        doc.setFont("helvetica", "normal"); st(doc, C.gray700);
        const btL = doc.splitTextToSize(bt, CW - bpw);
        doc.text(btL, ML + bpw, y);
        y += btL.length * 4.2 + 3;
      }

      // ── Commentaire ────────────────────────────────────────────────
      if (s.commentaire) {
        const cl = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW);
        doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray700);
        doc.text(cl, ML, y);
        y += cl.length * 4.5 + 3;
      }

      // ── Questions / Réponses — texte seul, sans fond ni bordure ───
      if (filledQ.length > 0) {
        for (const q of filledQ) {
          // Label question : semi-bold navy
          doc.setFontSize(8); doc.setFont("helvetica", "bold"); st(doc, C.navyMid);
          doc.text(`${q.label} :`, ML, y);
          y += 5;
          // Réponse : normal gris700, légèrement indenté
          const vL = doc.splitTextToSize(safe(s[q.key]), CW - 4);
          doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); st(doc, C.gray700);
          doc.text(vL, ML + 3, y);
          y += vL.length * 4.5 + 2;
        }
      }

      // ── Auteur ─────────────────────────────────────────────────────
      if (authorName) {
        doc.setFontSize(7); doc.setFont("helvetica", "italic"); st(doc, C.gray400);
        doc.text(`Redige par ${authorName}`, ML, y);
        y += 5;
      }

      // ── Séparateur léger entre suivis ──────────────────────────────
      y += 2;
      hline(doc, ML, PW - MR, y, C.gray100, 0.2);
      y += 4;
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
