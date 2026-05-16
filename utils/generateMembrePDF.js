// utils/generateMembrePDF.js
// Layout flux vertical — aucune grille, aucun espace blanc mort

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
  navyLight:  [230, 231, 248],
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

// ─── Helpers dessin ───────────────────────────────────────────────────────────

const sf = (doc, rgb) => doc.setFillColor(...rgb);
const sd = (doc, rgb) => doc.setDrawColor(...rgb);
const st = (doc, rgb) => doc.setTextColor(...rgb);

function frect(doc, x, y, w, h, rgb) { sf(doc, rgb); doc.rect(x, y, w, h, "F"); }
function rrect(doc, x, y, w, h, r, rgb) { sf(doc, rgb); doc.roundedRect(x, y, w, h, r, r, "F"); }
function hline(doc, x1, x2, yy, rgb, lw) {
  sd(doc, rgb); doc.setLineWidth(lw || 0.3); doc.line(x1, yy, x2, yy);
}

// ─── Export ───────────────────────────────────────────────────────────────────

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
  const CW  = PW - ML - MR;   // 182 mm
  const BOT = 18;
  const LH  = 5;               // line height de base

  let y = 0;

  // ── Utilitaires de rendu ──────────────────────────────────────────────────

  /** Saute de page si la hauteur h ne rentre plus */
  const need = (h) => {
    if (y + h > PH - BOT) { doc.addPage(); y = 16; }
  };

  /**
   * Puce "Label : valeur" sur une ligne (ou plusieurs si wrap).
   * Retourne true. y est avancé.
   */
  const pill = (label, value, indent = 0) => {
    const lbl = da(label);
    const val = da(value) || "-";
    const prefix = `${lbl} : `;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal"); st(doc, C.gray500);
    const pw = doc.getTextWidth(prefix);
    const maxVal = CW - indent - pw;
    const lines = doc.splitTextToSize(val, maxVal);
    need(LH * lines.length + 1);
    doc.text(prefix, ML + indent, y);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    doc.text(lines, ML + indent + pw, y);
    y += LH * lines.length;
  };

  /**
   * Groupe de puces avec titre de section sur fond léger.
   * rows = [[label, value], ...]
   */
  const sectionBox = (title, rows) => {
    // Calcul hauteur réelle du bloc
    let blockH = 8; // titre
    doc.setFontSize(8.5);
    for (const [lbl, val] of rows) {
      const prefix = `${da(lbl)} : `;
      const pw = doc.getTextWidth(prefix);
      const lines = doc.splitTextToSize(da(val) || "-", CW - 4 - pw);
      blockH += LH * lines.length;
    }
    blockH += 3; // padding bas

    need(blockH);

    // Fond du bloc
    rrect(doc, ML, y, CW, blockH, 2, C.gray50);
    // Barre gauche accent
    frect(doc, ML, y, 2.5, blockH, C.navyMid);

    // Titre
    doc.setFontSize(7); doc.setFont("helvetica", "bold");
    st(doc, C.navyMid);
    doc.text(da(title).toUpperCase(), ML + 6, y + 5.5);
    y += 8;

    // Lignes
    for (const [lbl, val] of rows) {
      pill(lbl, val, 4);
    }

    y += 3; // padding bas
  };

  /**
   * Titre de rubrique pleine largeur.
   */
  const rubrique = (title) => {
    need(10);
    y += 4;
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    st(doc, C.navy);
    doc.text(da(title).toUpperCase(), ML, y);
    y += 2;
    hline(doc, ML, PW - MR, y, C.navy, 0.4);
    y += 5;
  };

  // ══════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════
  frect(doc, 0, 0, PW, 26, C.navy);
  frect(doc, 0, 20, PW, 6, C.navyMid);

  const drawLogo = (d) => {
    rrect(d, ML, 4, 14, 14, 2, [95, 100, 195]);
    st(d, C.white);
    d.setFontSize(13); d.setFont("helvetica", "bold");
    d.text("+", ML + 7, 13.5, { align: "center" });
  };
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, 4, 14, 14); }
    catch { drawLogo(doc); }
  } else {
    drawLogo(doc);
  }

  st(doc, C.white);
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(safe(churchName) || "Eglise", ML + 18, 11);
  st(doc, [180, 185, 230]);
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text("FICHE CONFIDENTIELLE", ML + 18, 17);

  st(doc, [180, 185, 230]);
  doc.setFontSize(6.5);
  doc.text("Genere le", PW - MR, 9, { align: "right" });
  st(doc, C.white);
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text(formatDate(new Date().toISOString()), PW - MR, 15, { align: "right" });

  y = 34;

  // ══════════════════════════════════════════════════════════════════
  // BADGE + NOM + TEL
  // ══════════════════════════════════════════════════════════════════
  const etat      = da((membre.etat_contact || "")).toLowerCase().trim();
  const etatLabel = etat === "nouveau"  ? "Nouveau"
                  : etat === "existant" ? "Existant"
                  : etat === "inactif"  ? "Inactif"
                  : safe(membre.etat_contact) || "Inconnu";
  const etatClr = etat === "nouveau"  ? C.orange
                : etat === "existant" ? C.green
                : C.gray400;
  const etatBg  = etat === "nouveau"  ? C.orangeLight
                : etat === "existant" ? C.greenLight
                : C.gray100;

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
  const bw = doc.getTextWidth(etatLabel) + 10;
  rrect(doc, PW / 2 - bw / 2, y, bw, 6, 3, etatBg);
  st(doc, etatClr);
  doc.text(etatLabel, PW / 2, y + 4.3, { align: "center" });

  if (membre.star === true && etat === "existant") {
    st(doc, C.amber); doc.setFontSize(10);
    doc.text("*", PW / 2 + bw / 2 + 3, y + 5);
  }
  y += 10;

  st(doc, C.navy);
  doc.setFontSize(19); doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`.trim() || "-", PW / 2, y, { align: "center" });
  y += 8;

  if (membre.telephone) {
    st(doc, C.orange); doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Tel. : ${da(String(membre.telephone))}`, PW / 2, y, { align: "center" });
    y += 5;
  }

  hline(doc, ML + 20, PW - MR - 20, y, C.orange, 0.5);
  y += 8;

  // ══════════════════════════════════════════════════════════════════
  // INFORMATIONS — blocs section compacts
  // ══════════════════════════════════════════════════════════════════
  const statutLabel = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };

  sectionBox("Identite", [
    ["Civilite",  safe(membre.sexe)],
    ["Age",       safe(membre.age)],
    ["Ville",     safe(membre.ville)],
    ["WhatsApp",  membre.is_whatsapp ? "Oui" : "Non"],
    ["Ajoute le", formatDate(membre.date_venu)],
  ]);
  y += 2;

  sectionBox("Suivi pastoral", [
    ["Statut",      safe(statutLabel[membre.statut_suivis] || membre.suivi_statut)],
    ["Envoi suivi", formatDate(membre.date_envoi_suivi)],
    ["Cellule",     safe(celluleName)],
    ["Famille",     safe(familleName)],
    ["Conseiller",  safe(conseillerName)],
  ]);
  y += 2;

  sectionBox("Vie spirituelle", [
    ["Bapteme eau",  safe(membre.bapteme_eau)],
    ["Bapteme feu",  safe(membre.bapteme_esprit)],
    ["Priere salut", safe(membre.priere_salut)],
    ["Conversion",   safe(membre.type_conversion)],
    ["Ministere",    formatMinistere(membre.Ministere, membre.Autre_Ministere)],
  ]);
  y += 2;

  sectionBox("Parcours", [
    ["Comment venu", safe(membre.venu)],
    ["Raison",       safe(membre.statut_initial)],
    ["Formation",    safe(membre.Formation)],
    ["Infos supp.",  safe(membre.infos_supplementaires)],
  ]);
  y += 2;

  // ══════════════════════════════════════════════════════════════════
  // SOIN PASTORAL
  // ══════════════════════════════════════════════════════════════════
  rubrique("Soin pastoral");

  const besoins = parseBesoins(membre.besoin);
  if (besoins.length > 0) {
    const besoinsStr = besoins.map(b => {
      const r = (b.statut || "").toLowerCase().includes("resolu");
      return `${da(b.label)}${r ? " [resolu]" : ""}`;
    }).join(", ");
    pill("Besoins", besoinsStr);
    y += 1;
  } else {
    need(6);
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray400);
    doc.text("Aucun besoin enregistre.", ML, y);
    y += 5;
  }

  if (membre.commentaire_suivis) {
    const cL = doc.splitTextToSize(`"${da(membre.commentaire_suivis)}"`, CW);
    need(cL.length * 4.5 + 4);
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray600);
    doc.text(cL, ML, y);
    y += cL.length * 4.5 + 3;
  }

  // ══════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS
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

      // ── Pré-calcul hauteur réelle du bloc ──────────────────────────
      doc.setFontSize(8.5);
      let bH = 9; // entete
      if (besoinsArr.length > 0) {
        const bt = besoinsArr.map(b => `${da(b.label)} (${da(b.statut)})`).join(", ");
        bH += doc.splitTextToSize(`Besoin : ${bt}`, CW - 8).length * 4.2 + 2;
      }
      if (s.commentaire) {
        bH += doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 8).length * 4.5 + 3;
      }
      for (const q of filledQ) {
        const vL = doc.splitTextToSize(safe(s[q.key]), CW - 14);
        bH += 4.5 + vL.length * 4.5 + 2;
      }
      if (authorName) bH += 5;
      bH += 4; // padding bas

      need(bH);

      const accentClr = resolu ? C.green : C.navyMid;
      const blockY    = y;

      // Fond léger
      rrect(doc, ML, blockY, CW, bH, 2, C.gray50);
      // Barre accent
      frect(doc, ML, blockY, 2.5, bH, accentClr);

      const X = ML + 7;

      // Entête : date — type + statut
      y = blockY + 6;
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); st(doc, C.gray700);
      doc.text(`${formatDate(s.date_action)}  -  ${safe(s.action_type)}`, X, y);

      doc.setFontSize(7); doc.setFont("helvetica", "bold");
      st(doc, resolu ? C.greenDark : C.blue);
      rrect(doc, PW - MR - 22, blockY + 2, 22, 6, 3,
            resolu ? C.greenLight : C.blueLight);
      doc.text(resolu ? "Resolu" : statut, PW - MR - 11, blockY + 6.3, { align: "center" });

      y += 5;

      // Besoins
      if (besoinsArr.length > 0) {
        const bt  = besoinsArr.map(b => `${da(b.label)} (${da(b.statut)})`).join(", ");
        const btL = doc.splitTextToSize(`Besoin : ${bt}`, CW - 8);
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); st(doc, C.gray400);
        doc.text(btL, X, y);
        y += btL.length * 4.2 + 2;
      }

      // Commentaire
      if (s.commentaire) {
        const cl = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 8);
        doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray600);
        doc.text(cl, X, y);
        y += cl.length * 4.5 + 3;
      }

      // Questions
      for (const q of filledQ) {
        doc.setFontSize(7); doc.setFont("helvetica", "bold"); st(doc, C.navyMid);
        doc.text(`${q.label} :`, X, y);
        y += 4.5;
        const vL = doc.splitTextToSize(safe(s[q.key]), CW - 14);
        doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); st(doc, C.gray700);
        doc.text(vL, X + 4, y);
        y += vL.length * 4.5 + 2;
      }

      // Auteur
      if (authorName) {
        doc.setFontSize(7); doc.setFont("helvetica", "italic"); st(doc, C.gray400);
        doc.text(`Redige par ${authorName}`, X, y);
        y += 5;
      }

      y = blockY + bH + 3; // toujours après le bloc complet
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
    doc.text("Document confidentiel  -  Usage pastoral uniquement", ML, PH - 7);
    doc.text(`Page ${p} / ${total}`, PW - MR, PH - 7, { align: "right" });
  }

  // ══════════════════════════════════════════════════════════════════
  // SAUVEGARDE
  // ══════════════════════════════════════════════════════════════════
  const prenomFile = da(membre.prenom || "").toLowerCase().replace(/\s+/g, "_") || "inconnu";
  const nomFile    = da(membre.nom    || "").toLowerCase().replace(/\s+/g, "_") || "membre";
  const dateFile   = new Date().toISOString().split("T")[0];
  doc.save(`fiche_${prenomFile}_${nomFile}_${dateFile}.pdf`);
}
