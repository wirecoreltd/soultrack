// utils/generateMembrePDF.js
// Design : document pastoral fluide — style Word, pas de grilles

import jsPDF from "jspdf";

// ─── Nettoyage ────────────────────────────────────────────────────────────────

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

// ─── Couleurs ─────────────────────────────────────────────────────────────────

const C = {
  navy:       [46,  49,  146],
  navyMid:    [79,  84,  201],
  navyLight:  [235, 238, 255],
  white:      [255, 255, 255],
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
const frect  = (doc, x, y, w, h, rgb)           => { sf(doc,rgb); doc.rect(x,y,w,h,"F"); };
const rrect  = (doc, x, y, w, h, r, rgb)        => { sf(doc,rgb); doc.roundedRect(x,y,w,h,r,r,"F"); };
const hline  = (doc, x1, x2, y, rgb, lw)        => { sd(doc,rgb); doc.setLineWidth(lw||0.3); doc.line(x1,y,x2,y); };

// ─── Export ───────────────────────────────────────────────────────────────────

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
  const ML  = 16;   // marge gauche
  const MR  = 16;   // marge droite
  const CW  = PW - ML - MR; // 178 mm — largeur texte
  const BOT = 16;

  let y = 0;

  const need = (h) => {
    if (y + h > PH - BOT) { doc.addPage(); y = 16; }
  };

  // Écrit une ligne de texte simple et avance y
  const writeLine = (text, fontSize, fontStyle, color, x, align, maxW) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle || "normal");
    st(doc, color);
    if (maxW) {
      const lines = doc.splitTextToSize(text, maxW);
      doc.text(lines, x, y, align ? { align } : undefined);
      y += lines.length * (fontSize * 0.45);
    } else {
      doc.text(text, x, y, align ? { align } : undefined);
      y += fontSize * 0.45;
    }
  };

  // Écrit "Libelle : valeur" sur la même ligne
  // label en gris, valeur en gras dark
  const infoLine = (label, value, indent) => {
    const x = ML + (indent || 0);
    const avail = CW - (indent || 0);
    const fullText = `${label} : ${value}`;
    // Mesure label seul pour savoir où commence la valeur
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    st(doc, C.gray500);
    const lw = doc.getTextWidth(`${label} : `);

    // Afficher label
    doc.text(`${label} : `, x, y);

    // Afficher valeur (bold, dark)
    doc.setFont("helvetica", "bold");
    st(doc, C.gray700);
    const valLines = doc.splitTextToSize(value, avail - lw);
    doc.text(valLines, x + lw, y);

    y += 5 + (valLines.length > 1 ? (valLines.length - 1) * 4 : 0);
  };

  // Titre de rubrique : texte gras navy, filet dessous
  const rubrique = (title) => {
    need(12);
    y += 2;
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    st(doc, C.navy);
    doc.text(title.toUpperCase(), ML, y);
    y += 2;
    hline(doc, ML, PW - MR, y, C.navy, 0.4);
    y += 4;
  };

  // ══════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════
  frect(doc, 0, 0, PW, 28, C.navy);
  frect(doc, 0, 22, PW, 6, C.navyMid);

  // Logo
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, 4, 16, 16); }
    catch { _logoBox(doc); }
  } else { _logoBox(doc); }

  function _logoBox(d) {
    rrect(d, ML, 4, 16, 16, 2, [95, 100, 195]);
    st(d, C.white); d.setFontSize(13); d.setFont("helvetica", "bold");
    d.text("+", ML + 8, 14.5, { align: "center" });
  }

  st(doc, C.white);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(da(churchName), ML + 20, 12);
  st(doc, [180, 185, 230]);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("FICHE CONFIDENTIELLE", ML + 20, 18);

  st(doc, [180, 185, 230]); doc.setFontSize(7);
  doc.text("Genere le", PW - MR, 10, { align: "right" });
  st(doc, C.white); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
  doc.text(formatDate(new Date().toISOString()), PW - MR, 16.5, { align: "right" });

  y = 36;

  // ══════════════════════════════════════════════════════════════════
  // NOM + STATUT
  // ══════════════════════════════════════════════════════════════════

  const etat      = (membre.etat_contact || "").toLowerCase().trim();
  const etatLabel = etat === "nouveau" ? "Nouveau" : etat === "existant" ? "Existant" : etat === "inactif" ? "Inactif" : safe(membre.etat_contact);
  const etatClr   = etat === "nouveau" ? C.orange : etat === "existant" ? C.green : C.gray400;
  const etatBg    = etat === "nouveau" ? C.orangeLight : etat === "existant" ? C.greenLight : C.gray100;

  // Badge
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  const bw = doc.getTextWidth(etatLabel) + 10;
  rrect(doc, PW / 2 - bw / 2, y, bw, 6.5, 3, etatBg);
  st(doc, etatClr);
  doc.text(etatLabel, PW / 2, y + 4.8, { align: "center" });
  if (membre.star === true && etat === "existant") {
    st(doc, C.amber); doc.setFontSize(10);
    doc.text("*", PW / 2 + bw / 2 + 3, y + 5);
  }
  y += 10;

  // Nom centré, grand
  st(doc, C.navy); doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.text(`${safe(membre.prenom)} ${safe(membre.nom)}`, PW / 2, y, { align: "center" });
  y += 9;

  // Téléphone centré
  if (membre.telephone) {
    st(doc, C.orange); doc.setFontSize(9.5); doc.setFont("helvetica", "normal");
    doc.text(`Tel. : ${da(String(membre.telephone))}`, PW / 2, y, { align: "center" });
    y += 6;
  }

  // Filet orange
  hline(doc, ML + 15, PW - MR - 15, y, C.orange, 0.5);
  y += 6;

  // ══════════════════════════════════════════════════════════════════
  // INFORMATIONS GENERALES — style texte fluide, 2 colonnes légères
  // ══════════════════════════════════════════════════════════════════
  // Ici on fait 2 mini-blocs côte à côte SANS bordure, juste du texte

  const statutLabel = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };

  // Données col gauche
  const leftData = [
    ["Civilite",      safe(membre.sexe)],
    ["Age",           safe(membre.age)],
    ["Ville",         safe(membre.ville)],
    ["WhatsApp",      membre.is_whatsapp ? "Oui" : "Non"],
    ["Ajoute le",     formatDate(membre.date_venu)],
  ];

  // Données col droite
  const rightData = [
    ["Statut suivi",  safe(statutLabel[membre.statut_suivis] || membre.suivi_statut)],
    ["Envoi suivi",   formatDate(membre.date_envoi_suivi)],
    ["Cellule",       safe(celluleName)],
    ["Famille",       safe(familleName)],
    ["Conseiller",    safe(conseillerName)],
  ];

  // Calcul hauteur du bloc 2 col
  const COL_W = CW / 2 - 4;
  const COL2X = ML + COL_W + 8;

  need(leftData.length * 5 + 12);
  const infoY = y;

  // Titre gauche
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
  st(doc, C.navyMid);
  doc.text("Identite", ML, y);
  hline(doc, ML, ML + COL_W, y + 1.5, C.navyMid, 0.25);

  // Titre droite
  doc.text("Suivi pastoral", COL2X, y);
  hline(doc, COL2X, COL2X + COL_W, y + 1.5, C.navyMid, 0.25);
  y += 5;

  // Lignes gauche
  let yL = y;
  for (const [k, v] of leftData) {
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    st(doc, C.gray500);
    doc.text(`${k} : `, ML, yL);
    const lw2 = doc.getTextWidth(`${k} : `);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(v, COL_W - lw2);
    doc.text(lines, ML + lw2, yL);
    yL += 5 + (lines.length > 1 ? (lines.length - 1) * 4 : 0);
  }

  // Lignes droite
  let yR = y;
  for (const [k, v] of rightData) {
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    st(doc, C.gray500);
    doc.text(`${k} : `, COL2X, yR);
    const lw2 = doc.getTextWidth(`${k} : `);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(v, COL_W - lw2);
    doc.text(lines, COL2X + lw2, yR);
    yR += 5 + (lines.length > 1 ? (lines.length - 1) * 4 : 0);
  }

  y = Math.max(yL, yR) + 3;

  // ── Vie spirituelle + Parcours ────────────────────────────────────
  const leftData2 = [
    ["Bapteme eau",  safe(membre.bapteme_eau)],
    ["Bapteme feu",  safe(membre.bapteme_esprit)],
    ["Priere salut", safe(membre.priere_salut)],
    ["Conversion",   safe(membre.type_conversion)],
    ["Ministere",    formatMinistere(membre.Ministere, membre.Autre_Ministere)],
  ];
  const rightData2 = [
    ["Comment venu", safe(membre.venu)],
    ["Raison",       safe(membre.statut_initial)],
    ["Formation",    safe(membre.Formation)],
    ["Infos supp.",  safe(membre.infos_supplementaires)],
  ];

  need(Math.max(leftData2.length, rightData2.length) * 5 + 12);

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
  st(doc, C.navyMid);
  doc.text("Vie spirituelle", ML, y);
  hline(doc, ML, ML + COL_W, y + 1.5, C.navyMid, 0.25);
  doc.text("Parcours", COL2X, y);
  hline(doc, COL2X, COL2X + COL_W, y + 1.5, C.navyMid, 0.25);
  y += 5;

  yL = y;
  for (const [k, v] of leftData2) {
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    st(doc, C.gray500);
    doc.text(`${k} : `, ML, yL);
    const lw2 = doc.getTextWidth(`${k} : `);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(v, COL_W - lw2);
    doc.text(lines, ML + lw2, yL);
    yL += 5 + (lines.length > 1 ? (lines.length - 1) * 4 : 0);
  }

  yR = y;
  for (const [k, v] of rightData2) {
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    st(doc, C.gray500);
    doc.text(`${k} : `, COL2X, yR);
    const lw2 = doc.getTextWidth(`${k} : `);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(v, COL_W - lw2);
    doc.text(lines, COL2X + lw2, yR);
    yR += 5 + (lines.length > 1 ? (lines.length - 1) * 4 : 0);
  }

  y = Math.max(yL, yR) + 3;

  // Filet séparateur entre info générales et soin pastoral
  hline(doc, ML, PW - MR, y, C.gray100, 0.4);
  y += 4;

  // ══════════════════════════════════════════════════════════════════
  // SOIN PASTORAL — BESOINS
  // ══════════════════════════════════════════════════════════════════
  need(14);

  // Titre de section — style Word : texte bold + filet navy
  rubrique("Soin pastoral");

  // Besoins : tags inline
  const besoins = parseBesoins(membre.besoin);
  if (besoins.length > 0) {
    // Afficher les besoins comme une phrase fluide :
    // "Besoins identifies : Finances (en suivi), Sante (en suivi), Travail (resolu)"
    const besoinsTexte = besoins
      .map(b => {
        const resolu = b.statut.toLowerCase().includes("resolu");
        return `${b.label}${resolu ? " [resolu]" : ""}`;
      })
      .join(", ");

    infoLine("Besoins identifies", besoinsTexte);
  } else {
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic");
    st(doc, C.gray400);
    doc.text("Aucun besoin enregistre.", ML, y);
    y += 5;
  }

  if (membre.commentaire_suivis) {
    need(8);
    y += 1;
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic");
    st(doc, C.gray600);
    const cLines = doc.splitTextToSize(`"${da(membre.commentaire_suivis)}"`, CW);
    doc.text(cLines, ML, y);
    y += cLines.length * 4.5 + 2;
  }

  // ══════════════════════════════════════════════════════════════════
  // HISTORIQUE DES SUIVIS — un par un, style compte-rendu
  // ══════════════════════════════════════════════════════════════════
  if (suivis.length > 0) {
    rubrique("Historique des suivis");

    for (let idx = 0; idx < suivis.length; idx++) {
      const s          = suivis[idx];
      const besoinsArr = parseHistoriqueBesoin(s.besoin);
      const statut     = da(s.statut || "En suivi");
      const resolu     = statut.toLowerCase().includes("resolu") ||
                         statut.toLowerCase().includes("résolu");
      const authorName = s.profiles
        ? da(`${s.profiles.prenom || ""} ${s.profiles.nom || ""}`.trim())
        : "";

      const filledQ = IQ.filter(q =>
        s[q.key] !== null && s[q.key] !== undefined && String(s[q.key]).trim() !== ""
      );

      // ── Pré-calcul hauteur ────────────────────────────────────────
      let blockH = 10; // en-tête date + type

      if (besoinsArr.length > 0) blockH += 5;
      if (s.commentaire) {
        blockH += doc.setFontSize(9) || 0;
        const cl = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 6);
        blockH += cl.length * 4.5 + 3;
      }
      for (const q of filledQ) {
        blockH += 5; // label
        blockH += doc.splitTextToSize(safe(s[q.key]), CW - 10).length * 4.5 + 2;
      }
      if (authorName) blockH += 5;
      blockH += 3;

      need(blockH + 4);

      // ── En-tête du suivi : barre fine colorée + date + type ───────
      const accentClr = resolu ? C.green : C.navyMid;

      // Petit rectangle accent gauche (3px)
      sf(doc, accentClr);
      doc.rect(ML, y - 1, 2, blockH, "F");

      const headerX = ML + 5;

      // Date + type en gras
      doc.setFontSize(9.5); doc.setFont("helvetica", "bold");
      st(doc, C.gray700);
      doc.text(`${formatDate(s.date_action)}  —  ${safe(s.action_type)}`, headerX, y + 5);

      // Statut en petit, même ligne, droite
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      st(doc, resolu ? C.greenDark : C.blue);
      doc.text(resolu ? "Resolu" : statut, PW - MR, y + 5, { align: "right" });

      y += 9;

      // ── Besoins (1 ligne, gris clair) ────────────────────────────
      if (besoinsArr.length > 0) {
        const bt = besoinsArr.map(b => `${b.label} (${b.statut})`).join(", ");
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
        st(doc, C.gray400);
        doc.text(`Besoin : ${bt}`, headerX, y);
        y += 5;
      }

      // ── Commentaire ───────────────────────────────────────────────
      if (s.commentaire) {
        const cl = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 6);
        doc.setFontSize(9); doc.setFont("helvetica", "italic");
        st(doc, C.gray700);
        doc.text(cl, headerX, y);
        y += cl.length * 4.5 + 3;
      }

      // ── Questions d'entretien — style texte naturel ───────────────
      if (filledQ.length > 0) {
        for (const q of filledQ) {
          need(9);

          // Label question en gras navy (comme un titre inline)
          doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
          st(doc, C.navyMid);
          doc.text(`${q.label} :`, headerX, y);
          y += 4.5;

          // Réponse en texte normal, légèrement indenté
          const vLn = doc.splitTextToSize(safe(s[q.key]), CW - 10);
          doc.setFontSize(9); doc.setFont("helvetica", "normal");
          st(doc, C.gray700);
          doc.text(vLn, headerX + 2, y);
          y += vLn.length * 4.5 + 1.5;
        }
      }

      // ── Auteur ────────────────────────────────────────────────────
      if (authorName) {
        doc.setFontSize(7); doc.setFont("helvetica", "italic");
        st(doc, C.gray400);
        doc.text(`Redige par ${authorName}`, headerX, y);
        y += 5;
      }

      // ── Séparateur entre suivis (sauf le dernier) ─────────────────
      if (idx < suivis.length - 1) {
        y += 2;
        hline(doc, ML + 5, PW - MR, y, C.gray100, 0.3);
        y += 5;
      } else {
        y += 3;
      }
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
