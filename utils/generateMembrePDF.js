// utils/generateMembrePDF.js

import jsPDF from "jspdf";

// ─── Nettoyage strict — tout ce qui va dans jsPDF passe par da() ──────────────

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
    // Tirets spéciaux -> tiret normal
    .replace(/[\u2013\u2014\u2015]/g, "-")
    // Guillemets typographiques -> droits
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    // Supprimer emojis et symboles non supportés
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/[\u{E000}-\u{F8FF}]/gu, "")
    // Supprimer tout caractère hors latin étendu
    .replace(/[^\x00-\xFF]/g, "")
    .trim();
}

// safe : jamais de chaîne vide dans jsPDF (causerait des bugs de rendu)
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
  amber:      [180, 90,  0],
};

// ─── Helpers dessin ───────────────────────────────────────────────────────────

function sf(doc, rgb)              { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function sd(doc, rgb)              { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
function st(doc, rgb)              { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
function frect(doc,x,y,w,h,rgb)   { sf(doc,rgb); doc.rect(x,y,w,h,"F"); }
function rrect(doc,x,y,w,h,r,rgb) { sf(doc,rgb); doc.roundedRect(x,y,w,h,r,r,"F"); }
function hline(doc,x1,x2,yy,rgb,lw){ sd(doc,rgb); doc.setLineWidth(lw||0.3); doc.line(x1,yy,x2,yy); }

// ─── Export ───────────────────────────────────────────────────────────────────

export async function generateMembrePDF(membre, suivis = [], options = {}) {
  const {
    churchName     = "Eglise",
    logoBase64     = null,
    celluleName    = null,
    familleName    = null,
    conseillerName = null,
  } = options;

  // Sécurité : membre ne doit jamais être null
  if (!membre) return;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW  = 210;
  const PH  = 297;
  const ML  = 16;
  const MR  = 16;
  const CW  = PW - ML - MR; // 178 mm
  const BOT = 16;

  let y = 0;

  // Saut de page si besoin
  const need = (h) => {
    if (y + h > PH - BOT) { doc.addPage(); y = 16; }
  };

  // Ligne "Label : Valeur" — label gris, valeur gras, wrap automatique
  // Retourne la hauteur consommée
  const infoLine = (label, value, x, maxW) => {
    const safeLabel = da(label);
    const safeValue = da(value) || "-";
    const prefix    = `${safeLabel} : `;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    st(doc, C.gray500);
    const prefixW = doc.getTextWidth(prefix);
    doc.text(prefix, x, y);

    doc.setFont("helvetica", "bold");
    st(doc, C.gray700);
    const lines = doc.splitTextToSize(safeValue, maxW - prefixW);
    doc.text(lines, x + prefixW, y);

    const h = 5 + (lines.length > 1 ? (lines.length - 1) * 4.2 : 0);
    y += h;
    return h;
  };

  // Titre rubrique : gras navy + filet pleine largeur
  const rubrique = (title) => {
    need(12);
    y += 3;
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    st(doc, C.navy);
    doc.text(da(title).toUpperCase(), ML, y);
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
  const drawLogo = (d) => {
    rrect(d, ML, 4, 16, 16, 2, [95, 100, 195]);
    st(d, C.white);
    d.setFontSize(13); d.setFont("helvetica", "bold");
    d.text("+", ML + 8, 14.5, { align: "center" });
  };
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", ML, 4, 16, 16); }
    catch { drawLogo(doc); }
  } else {
    drawLogo(doc);
  }

  st(doc, C.white);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(safe(churchName) || "Eglise", ML + 20, 12);

  st(doc, [180, 185, 230]);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("FICHE CONFIDENTIELLE", ML + 20, 18);

  st(doc, [180, 185, 230]);
  doc.setFontSize(7);
  doc.text("Genere le", PW - MR, 10, { align: "right" });
  st(doc, C.white);
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
  doc.text(formatDate(new Date().toISOString()), PW - MR, 16.5, { align: "right" });

  y = 36;

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

  // Nom
  const prenom = safe(membre.prenom);
  const nom    = safe(membre.nom);
  st(doc, C.navy); doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text(`${prenom} ${nom}`.trim() || "-", PW / 2, y, { align: "center" });
  y += 9;

  // Tel
  if (membre.telephone) {
    st(doc, C.orange); doc.setFontSize(9.5); doc.setFont("helvetica", "normal");
    doc.text(`Tel. : ${da(String(membre.telephone))}`, PW / 2, y, { align: "center" });
    y += 6;
  }

  // Filet
  hline(doc, ML + 15, PW - MR - 15, y, C.orange, 0.5);
  y += 7;

  // ══════════════════════════════════════════════════════════════════
  // INFORMATIONS — 2 mini-colonnes de texte pur (sans grille)
  // ══════════════════════════════════════════════════════════════════
  const COL_W = CW / 2 - 5;
  const COL2X = ML + COL_W + 10;

  const statutLabel = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };

  // Bloc 1 : Identite / Suivi
  need(55);

  // Sous-titres
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.navyMid);
  doc.text("Identite", ML, y);
  hline(doc, ML, ML + COL_W, y + 1.5, C.navyMid, 0.25);
  doc.text("Suivi pastoral", COL2X, y);
  hline(doc, COL2X, COL2X + COL_W, y + 1.5, C.navyMid, 0.25);
  y += 5;

  const yStart1 = y;

  // Col gauche — chaque ligne indépendante, y local
  let yL = yStart1;
  const leftRows1 = [
    ["Civilite",  safe(membre.sexe)],
    ["Age",       safe(membre.age)],
    ["Ville",     safe(membre.ville)],
    ["WhatsApp",  membre.is_whatsapp ? "Oui" : "Non"],
    ["Ajoute le", formatDate(membre.date_venu)],
  ];
  for (const [k, v] of leftRows1) {
    const prefix = `${da(k)} : `;
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); st(doc, C.gray500);
    const pw2 = doc.getTextWidth(prefix);
    doc.text(prefix, ML, yL);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(da(v) || "-", COL_W - pw2);
    doc.text(lines, ML + pw2, yL);
    yL += 5 + (lines.length > 1 ? (lines.length - 1) * 4.2 : 0);
  }

  // Col droite
  let yR = yStart1;
  const rightRows1 = [
    ["Statut",      safe(statutLabel[membre.statut_suivis] || membre.suivi_statut)],
    ["Envoi suivi", formatDate(membre.date_envoi_suivi)],
    ["Cellule",     safe(celluleName)],
    ["Famille",     safe(familleName)],
    ["Conseiller",  safe(conseillerName)],
  ];
  for (const [k, v] of rightRows1) {
    const prefix = `${da(k)} : `;
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); st(doc, C.gray500);
    const pw2 = doc.getTextWidth(prefix);
    doc.text(prefix, COL2X, yR);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(da(v) || "-", COL_W - pw2);
    doc.text(lines, COL2X + pw2, yR);
    yR += 5 + (lines.length > 1 ? (lines.length - 1) * 4.2 : 0);
  }

  y = Math.max(yL, yR) + 4;

  // Bloc 2 : Vie spirituelle / Parcours
  need(50);

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.navyMid);
  doc.text("Vie spirituelle", ML, y);
  hline(doc, ML, ML + COL_W, y + 1.5, C.navyMid, 0.25);
  doc.text("Parcours", COL2X, y);
  hline(doc, COL2X, COL2X + COL_W, y + 1.5, C.navyMid, 0.25);
  y += 5;

  const yStart2 = y;
  yL = yStart2;
  const leftRows2 = [
    ["Bapteme eau",  safe(membre.bapteme_eau)],
    ["Bapteme feu",  safe(membre.bapteme_esprit)],
    ["Priere salut", safe(membre.priere_salut)],
    ["Conversion",   safe(membre.type_conversion)],
    ["Ministere",    formatMinistere(membre.Ministere, membre.Autre_Ministere)],
  ];
  for (const [k, v] of leftRows2) {
    const prefix = `${da(k)} : `;
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); st(doc, C.gray500);
    const pw2 = doc.getTextWidth(prefix);
    doc.text(prefix, ML, yL);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(da(v) || "-", COL_W - pw2);
    doc.text(lines, ML + pw2, yL);
    yL += 5 + (lines.length > 1 ? (lines.length - 1) * 4.2 : 0);
  }

  yR = yStart2;
  const rightRows2 = [
    ["Comment venu", safe(membre.venu)],
    ["Raison",       safe(membre.statut_initial)],
    ["Formation",    safe(membre.Formation)],
    ["Infos supp.",  safe(membre.infos_supplementaires)],
  ];
  for (const [k, v] of rightRows2) {
    const prefix = `${da(k)} : `;
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); st(doc, C.gray500);
    const pw2 = doc.getTextWidth(prefix);
    doc.text(prefix, COL2X, yR);
    doc.setFont("helvetica", "bold"); st(doc, C.gray700);
    const lines = doc.splitTextToSize(da(v) || "-", COL_W - pw2);
    doc.text(lines, COL2X + pw2, yR);
    yR += 5 + (lines.length > 1 ? (lines.length - 1) * 4.2 : 0);
  }

  y = Math.max(yL, yR) + 3;
  hline(doc, ML, PW - MR, y, C.gray100, 0.35);

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
    need(8);
    infoLine("Besoins", besoinsStr, ML, CW);
  } else {
    need(6);
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray400);
    doc.text("Aucun besoin enregistre.", ML, y);
    y += 5;
  }

  if (membre.commentaire_suivis) {
    need(8);
    y += 1;
    const cL = doc.splitTextToSize(`"${da(membre.commentaire_suivis)}"`, CW);
    doc.setFontSize(8.5); doc.setFont("helvetica", "italic"); st(doc, C.gray600);
    doc.text(cL, ML, y);
    y += cL.length * 4.5 + 2;
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

      const filledQ = IQ.filter(q => {
        const v = s[q.key];
        return v !== null && v !== undefined && String(v).trim() !== "";
      });

      // ── Pré-calcul hauteur du bloc ────────────────────────────────
      // (sans appels jsPDF qui modifient l'état — juste taille de texte)
      let blockH = 10; // date + type

      if (besoinsArr.length > 0) {
        const bt = besoinsArr.map(b => `${da(b.label)} (${da(b.statut)})`).join(", ");
        blockH += doc.splitTextToSize(`Besoin : ${bt}`, CW - 6).length * 4.2 + 2;
      }
      if (s.commentaire) {
        blockH += doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 6).length * 4.5 + 3;
      }
      for (const q of filledQ) {
        blockH += 5; // label
        blockH += doc.splitTextToSize(safe(s[q.key]), CW - 10).length * 4.5 + 2;
      }
      if (authorName) blockH += 6;
      blockH += 4;

      need(blockH);

      const accentClr = resolu ? C.green : C.navyMid;
      const blockStartY = y;

      // Barre accent gauche
      sf(doc, accentClr);
      doc.rect(ML, blockStartY - 1, 2.5, blockH, "F");

      const X = ML + 6; // x de départ pour tout le contenu du bloc

      // Date + type
      doc.setFontSize(9.5); doc.setFont("helvetica", "bold"); st(doc, C.gray700);
      const dateType = `${formatDate(s.date_action)}  -  ${safe(s.action_type)}`;
      doc.text(dateType, X, y + 5);

      // Statut à droite
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      st(doc, resolu ? C.greenDark : C.blue);
      doc.text(resolu ? "Resolu" : statut, PW - MR, y + 5, { align: "right" });

      y += 9;

      // Besoins
      if (besoinsArr.length > 0) {
        const bt  = besoinsArr.map(b => `${da(b.label)} (${da(b.statut)})`).join(", ");
        const btL = doc.splitTextToSize(`Besoin : ${bt}`, CW - 6);
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); st(doc, C.gray400);
        doc.text(btL, X, y);
        y += btL.length * 4.2 + 2;
      }

      // Commentaire
      if (s.commentaire) {
        const cl = doc.splitTextToSize(`"${da(s.commentaire)}"`, CW - 6);
        doc.setFontSize(9); doc.setFont("helvetica", "italic"); st(doc, C.gray700);
        doc.text(cl, X, y);
        y += cl.length * 4.5 + 3;
      }

      // Questions d'entretien
      for (const q of filledQ) {
        need(10);
        // Label
        doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); st(doc, C.navyMid);
        doc.text(`${q.label} :`, X, y);
        y += 4.5;
        // Reponse
        const vL = doc.splitTextToSize(safe(s[q.key]), CW - 10);
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); st(doc, C.gray700);
        doc.text(vL, X + 2, y);
        y += vL.length * 4.5 + 2;
      }

      // Auteur
      if (authorName) {
        doc.setFontSize(7); doc.setFont("helvetica", "italic"); st(doc, C.gray400);
        doc.text(`Redige par ${authorName}`, X, y);
        y += 6;
      }

      // Separateur entre suivis
      if (idx < suivis.length - 1) {
        y += 1;
        hline(doc, ML + 4, PW - MR, y, C.gray100, 0.3);
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
