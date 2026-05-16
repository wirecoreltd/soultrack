// utils/generateMembreHTML.js

// ─── Nettoyage strict ─────────────────────────────────────────────────────────

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

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return esc(safe(dateStr));
    const M = ["Janv","Fevr","Mars","Avr","Mai","Juin","Juil","Aout","Sept","Oct","Nov","Dec"];
    return `${String(d.getDate()).padStart(2,"0")} ${M[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return esc(safe(String(dateStr))); }
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
    return esc(da(list.join(", "))) || "-";
  } catch { return esc(safe(mj)); }
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

// ─── Helpers HTML ─────────────────────────────────────────────────────────────

function infoRow(label, value) {
  const v = esc(da(value) || "-");
  return `<div class="info-row"><span class="info-label">${esc(da(label))}</span><span class="info-value">${v}</span></div>`;
}

function rubrique(title) {
  return `<div class="rubrique"><span>${esc(da(title)).toUpperCase()}</span></div>`;
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function generateMembreHTML(membre, suivis = [], options = {}) {
  const {
    churchName     = "Eglise",
    logoBase64     = null,
    celluleName    = null,
    familleName    = null,
    conseillerName = null,
  } = options;

  if (!membre) return "";

  const etat      = da((membre.etat_contact || "")).toLowerCase().trim();
  const etatLabel = etat === "nouveau"  ? "Nouveau"
                  : etat === "existant" ? "Existant"
                  : etat === "inactif"  ? "Inactif"
                  : safe(membre.etat_contact) || "Inconnu";
  const etatClass = etat === "nouveau"  ? "badge-nouveau"
                  : etat === "existant" ? "badge-existant"
                  : "badge-inconnu";

  const statutLabel = { 1:"En Attente", 2:"En Suivis", 3:"Integre", 4:"Refus" };

  const prenom = esc(safe(membre.prenom));
  const nom    = esc(safe(membre.nom));
  const dateGen = formatDate(new Date().toISOString());

  // ── Logo ────────────────────────────────────────────────────────────────────
  const logoHTML = logoBase64
    ? `<img src="${logoBase64}" alt="Logo" class="logo-img" />`
    : `<div class="logo-placeholder">+</div>`;

  // ── Soin pastoral ───────────────────────────────────────────────────────────
  const besoins = parseBesoins(membre.besoin);
  let soinHTML = "";
  if (besoins.length > 0) {
    const besoinsStr = besoins.map(b => {
      const r = (b.statut || "").toLowerCase().includes("resolu");
      return `${esc(b.label)}${r ? ' <span class="tag-resolu">[resolu]</span>' : ""}`;
    }).join(", ");
    soinHTML += `<div class="info-row"><span class="info-label">Besoins</span><span class="info-value">${besoinsStr}</span></div>`;
  } else {
    soinHTML += `<p class="empty-note">Aucun besoin enregistre.</p>`;
  }
  if (membre.commentaire_suivis) {
    soinHTML += `<blockquote class="commentaire">${esc(da(membre.commentaire_suivis))}</blockquote>`;
  }

  // ── Historique des suivis ───────────────────────────────────────────────────
  let histHTML = "";
  if (Array.isArray(suivis) && suivis.length > 0) {
    histHTML += rubrique("Historique des suivis");
    histHTML += `<div class="suivis-list">`;

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

      const isLast = idx === suivis.length - 1;

      histHTML += `<div class="suivi-bloc ${resolu ? "suivi-resolu" : ""} ${isLast ? "suivi-last" : ""}">`;
      histHTML += `<div class="suivi-accent"></div>`;
      histHTML += `<div class="suivi-content">`;

      // En-tête
      histHTML += `<div class="suivi-header">`;
      histHTML += `<span class="suivi-date-type">${formatDate(s.date_action)}&nbsp;&nbsp;—&nbsp;&nbsp;${esc(safe(s.action_type))}</span>`;
      histHTML += `<span class="suivi-statut ${resolu ? "statut-resolu" : "statut-encours"}">${resolu ? "Resolu" : esc(statut)}</span>`;
      histHTML += `</div>`;

      // Besoins
      if (besoinsArr.length > 0) {
        const bt = besoinsArr.map(b => `${esc(b.label)} <em>(${esc(b.statut)})</em>`).join(", ");
        histHTML += `<p class="suivi-besoins"><span class="suivi-besoins-label">Besoin :</span> ${bt}</p>`;
      }

      // Commentaire
      if (s.commentaire) {
        histHTML += `<blockquote class="suivi-commentaire">${esc(da(s.commentaire))}</blockquote>`;
      }

      // Questions d'entretien
      for (const q of filledQ) {
        histHTML += `<div class="suivi-question">`;
        histHTML += `<div class="suivi-q-label">${esc(q.label)} :</div>`;
        histHTML += `<div class="suivi-q-value">${esc(safe(s[q.key]))}</div>`;
        histHTML += `</div>`;
      }

      // Auteur
      if (authorName) {
        histHTML += `<p class="suivi-auteur">Redige par ${esc(authorName)}</p>`;
      }

      histHTML += `</div></div>`;
    }

    histHTML += `</div>`;
  }

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy:        #2E3192;
      --navy-mid:    #4F54C9;
      --white:       #ffffff;
      --gray-50:     #f8fafc;
      --gray-100:    #e2e8f0;
      --gray-200:    #cbd5e1;
      --gray-400:    #94a3b8;
      --gray-500:    #64748b;
      --gray-600:    #475569;
      --gray-700:    #334155;
      --green:       #16a34a;
      --green-light: #dcfce7;
      --green-dark:  #166534;
      --orange:      #ea580c;
      --orange-light:#fff7ed;
      --blue:        #2563eb;
      --amber:       #b45309;
      --radius:      10px;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      background: #eef1f8;
      color: var(--gray-700);
      padding: 28px 16px 48px;
      min-height: 100vh;
    }

    .page {
      max-width: 780px;
      margin: 0 auto;
      background: var(--white);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(46,49,146,.12), 0 1px 4px rgba(0,0,0,.06);
    }

    /* ── Header ── */
    .header {
      background: var(--navy);
      padding: 20px 28px 0;
      position: relative;
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
    }
    .logo-img {
      width: 48px; height: 48px;
      border-radius: 8px;
      object-fit: contain;
    }
    .logo-placeholder {
      width: 48px; height: 48px;
      border-radius: 8px;
      background: #5f64c3;
      color: #fff;
      font-size: 24px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .header-title { flex: 1; }
    .church-name {
      color: var(--white);
      font-family: 'Lora', serif;
      font-size: 18px; font-weight: 700;
      line-height: 1.2;
    }
    .fiche-label {
      color: #b4b9e6;
      font-size: 10px; font-weight: 400;
      letter-spacing: .12em;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .header-date { text-align: right; }
    .header-date .date-small { color: #b4b9e6; font-size: 10px; }
    .header-date .date-val   { color: var(--white); font-size: 13px; font-weight: 600; margin-top: 2px; }
    .header-stripe {
      background: var(--navy-mid);
      height: 6px;
      margin: 0 -28px; /* full bleed */
    }

    /* ── Hero ── */
    .hero {
      text-align: center;
      padding: 28px 28px 20px;
      border-bottom: 1px solid var(--gray-100);
    }
    .badge {
      display: inline-block;
      padding: 3px 14px;
      border-radius: 20px;
      font-size: 11px; font-weight: 600;
      letter-spacing: .04em;
      margin-bottom: 12px;
    }
    .badge-existant { background: var(--green-light);  color: var(--green-dark); }
    .badge-nouveau  { background: var(--orange-light); color: var(--orange); }
    .badge-inconnu  { background: var(--gray-100);     color: var(--gray-500); }
    .star-badge { color: var(--amber); font-size: 16px; margin-left: 4px; vertical-align: middle; }
    .hero-name {
      font-family: 'Lora', serif;
      font-size: 30px; font-weight: 700;
      color: var(--navy);
      line-height: 1.1;
    }
    .hero-tel {
      color: var(--orange);
      font-size: 13px; font-weight: 500;
      margin-top: 8px;
    }
    .hero-divider {
      width: 80px; height: 2px;
      background: var(--orange);
      border-radius: 2px;
      margin: 14px auto 0;
    }

    /* ── Body ── */
    .body { padding: 0 28px 28px; }

    /* ── Grid 2-col ── */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 24px;
      padding: 20px 0 16px;
      border-bottom: 1px solid var(--gray-100);
    }
    .col-block { }
    .col-heading {
      font-size: 10px; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase;
      color: var(--navy-mid);
      padding-bottom: 5px;
      border-bottom: 1.5px solid var(--navy-mid);
      margin-bottom: 10px;
    }

    /* ── Info rows ── */
    .info-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 5px;
      font-size: 12px;
      line-height: 1.5;
    }
    .info-label {
      color: var(--gray-500);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .info-label::after { content: " :"; }
    .info-value {
      color: var(--gray-700);
      font-weight: 600;
      word-break: break-word;
    }

    /* ── Rubrique ── */
    .rubrique {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 22px 0 12px;
    }
    .rubrique span {
      font-size: 9.5px; font-weight: 700;
      letter-spacing: .12em;
      color: var(--navy);
      white-space: nowrap;
    }
    .rubrique::after {
      content: '';
      flex: 1;
      height: 1.5px;
      background: var(--navy);
      border-radius: 2px;
    }

    /* ── Commentaire ── */
    .commentaire {
      margin: 10px 0 0;
      padding: 10px 14px;
      border-left: 3px solid var(--navy-mid);
      background: #f4f5fd;
      border-radius: 0 6px 6px 0;
      font-style: italic;
      font-size: 12px;
      color: var(--gray-600);
    }
    .empty-note {
      font-size: 12px;
      font-style: italic;
      color: var(--gray-400);
    }
    .tag-resolu {
      font-size: 10px; font-weight: 600;
      color: var(--green-dark);
      background: var(--green-light);
      border-radius: 4px;
      padding: 1px 5px;
    }

    /* ── Suivis ── */
    .suivis-list { display: flex; flex-direction: column; gap: 0; }
    .suivi-bloc {
      display: flex;
      gap: 0;
      padding: 14px 0;
      border-bottom: 1px solid var(--gray-100);
    }
    .suivi-bloc.suivi-last { border-bottom: none; }
    .suivi-accent {
      width: 3px;
      border-radius: 3px;
      background: var(--navy-mid);
      flex-shrink: 0;
      margin-right: 14px;
    }
    .suivi-resolu .suivi-accent { background: var(--green); }
    .suivi-content { flex: 1; min-width: 0; }

    .suivi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 7px;
    }
    .suivi-date-type {
      font-size: 13px; font-weight: 600;
      color: var(--gray-700);
    }
    .suivi-statut {
      font-size: 10.5px; font-weight: 700;
      border-radius: 12px;
      padding: 2px 10px;
    }
    .statut-resolu  { background: var(--green-light); color: var(--green-dark); }
    .statut-encours { background: #dbeafe; color: var(--blue); }

    .suivi-besoins {
      font-size: 11px;
      color: var(--gray-400);
      margin-bottom: 6px;
    }
    .suivi-besoins-label { font-weight: 600; }
    .suivi-besoins em { font-style: italic; }

    .suivi-commentaire {
      padding: 8px 12px;
      border-left: 2.5px solid var(--gray-200);
      background: var(--gray-50);
      border-radius: 0 6px 6px 0;
      font-style: italic;
      font-size: 12.5px;
      color: var(--gray-700);
      margin-bottom: 8px;
    }

    .suivi-question { margin-bottom: 8px; }
    .suivi-q-label {
      font-size: 10px; font-weight: 700;
      color: var(--navy-mid);
      letter-spacing: .05em;
      margin-bottom: 2px;
    }
    .suivi-q-value {
      font-size: 13px;
      color: var(--gray-700);
      padding-left: 8px;
    }

    .suivi-auteur {
      font-size: 10.5px;
      font-style: italic;
      color: var(--gray-400);
      margin-top: 6px;
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid var(--gray-200);
      padding: 10px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: var(--gray-400);
    }

    /* ── Print ── */
    @media print {
      body { background: #fff; padding: 0; }
      .page {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
      .print-btn { display: none; }
    }

    /* ── Print button ── */
    .print-btn {
      display: block;
      margin: 20px auto 0;
      padding: 10px 28px;
      background: var(--navy);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 600;
      cursor: pointer;
      letter-spacing: .04em;
      transition: background .2s;
    }
    .print-btn:hover { background: var(--navy-mid); }
  `;

  // ── HTML complet ────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fiche — ${prenom} ${nom}</title>
  <style>${css}</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">Imprimer / Sauvegarder en PDF</button>

<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      ${logoHTML}
      <div class="header-title">
        <div class="church-name">${esc(da(churchName))}</div>
        <div class="fiche-label">Fiche confidentielle</div>
      </div>
      <div class="header-date">
        <div class="date-small">Genere le</div>
        <div class="date-val">${dateGen}</div>
      </div>
    </div>
    <div class="header-stripe"></div>
  </div>

  <!-- HERO -->
  <div class="hero">
    <div>
      <span class="badge ${etatClass}">${esc(etatLabel)}</span>
      ${membre.star === true && etat === "existant" ? '<span class="star-badge">★</span>' : ""}
    </div>
    <div class="hero-name">${prenom} ${nom}</div>
    ${membre.telephone ? `<div class="hero-tel">Tél. : ${esc(da(String(membre.telephone)))}</div>` : ""}
    <div class="hero-divider"></div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- Bloc 1 : Identite / Suivi -->
    <div class="two-col">
      <div class="col-block">
        <div class="col-heading">Identite</div>
        ${infoRow("Civilite",  safe(membre.sexe))}
        ${infoRow("Age",       safe(membre.age))}
        ${infoRow("Ville",     safe(membre.ville))}
        ${infoRow("WhatsApp",  membre.is_whatsapp ? "Oui" : "Non")}
        ${infoRow("Ajoute le", formatDate(membre.date_venu))}
      </div>
      <div class="col-block">
        <div class="col-heading">Suivi pastoral</div>
        ${infoRow("Statut",      safe(statutLabel[membre.statut_suivis] || membre.suivi_statut))}
        ${infoRow("Envoi suivi", formatDate(membre.date_envoi_suivi))}
        ${infoRow("Cellule",     safe(celluleName))}
        ${infoRow("Famille",     safe(familleName))}
        ${infoRow("Conseiller",  safe(conseillerName))}
      </div>
    </div>

    <!-- Bloc 2 : Vie spirituelle / Parcours -->
    <div class="two-col">
      <div class="col-block">
        <div class="col-heading">Vie spirituelle</div>
        ${infoRow("Bapteme eau",  safe(membre.bapteme_eau))}
        ${infoRow("Bapteme feu",  safe(membre.bapteme_esprit))}
        ${infoRow("Priere salut", safe(membre.priere_salut))}
        ${infoRow("Conversion",   safe(membre.type_conversion))}
        ${infoRow("Ministere",    formatMinistere(membre.Ministere, membre.Autre_Ministere))}
      </div>
      <div class="col-block">
        <div class="col-heading">Parcours</div>
        ${infoRow("Comment venu", safe(membre.venu))}
        ${infoRow("Raison",       safe(membre.statut_initial))}
        ${infoRow("Formation",    safe(membre.Formation))}
        ${infoRow("Infos supp.",  safe(membre.infos_supplementaires))}
      </div>
    </div>

    <!-- Soin pastoral -->
    ${rubrique("Soin pastoral")}
    ${soinHTML}

    <!-- Historique -->
    ${histHTML}

  </div><!-- /body -->

  <!-- FOOTER -->
  <div class="footer">
    <span>Document confidentiel &mdash; Usage pastoral uniquement</span>
    <span>Fiche generee le ${dateGen}</span>
  </div>

</div><!-- /page -->

</body>
</html>`;
}

// ─── Utilitaire : déclenche le téléchargement du fichier HTML ─────────────────

export function downloadMembreHTML(membre, suivis = [], options = {}) {
  if (!membre) return;
  const html = generateMembreHTML(membre, suivis, options);
  const blob  = new Blob([html], { type: "text/html;charset=utf-8" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  const prenom = (da(membre.prenom || "") || "inconnu").toLowerCase().replace(/\s+/g, "_");
  const nom    = (da(membre.nom    || "") || "membre").toLowerCase().replace(/\s+/g, "_");
  const date   = new Date().toISOString().split("T")[0];
  a.href     = url;
  a.download = `fiche_${prenom}_${nom}_${date}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
