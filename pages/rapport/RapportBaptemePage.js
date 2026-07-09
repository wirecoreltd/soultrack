// ═══════════════════════════════════════════════════════════════
// PAGE : Rapport des Baptêmes (RapportBaptemesPage)
// ═══════════════════════════════════════════════════════════════
// Description : Gère les rapports de baptêmes de l'église : saisie
// des sessions (date, officiant, candidats baptisés), calcul auto
// du nombre d'hommes/femmes, vue d'ensemble (KPI, tendance mensuelle,
// répartition par officiant), et vue détaillée par session. Les
// candidats affichés sont filtrés selon le rôle de l'utilisateur
// connecté (Administrateur, Responsable/Superviseur de cellule ou
// famille, Conseiller).
//
// Tables Supabase utilisées :
// - profiles           (lecture)             → profil utilisateur (rôle, eglise_id)
// - membres_complets   (lecture + écriture)  → candidats au baptême + mise à jour statut
// - cellules           (lecture)             → cellules supervisées/gérées (filtrage candidats)
// - familles           (lecture)             → familles gérées (filtrage candidats)
// - baptemes           (lecture + écriture)  → rapports de baptêmes (création, modification)
// ═══════════════════════════════════════════════════════════════


"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ───────────────────────────────────────────────
const translations = {
  fr: {
    pageTitle: "Rapport",
    pageTitleAccent: "Baptêmes",
    pageSubtitleCreez: "Créez et suivez",
    pageSubtitleText1: "les rapports de baptêmes ainsi que le suivi des",
    pageSubtitleNouveaux: "nouveaux baptisés",
    pageSubtitleText2: ". Enregistrez les données,",
    pageSubtitleAnalysez: "analysez",
    pageSubtitleText3: "les volumes et la répartition hommes/femmes pour mesurer",
    pageSubtitleImpact: "l'impact et structurer la croissance de l'église",
    perioderapide: "Période rapide",
    tranchedates: "Tranche de dates",
    periode: "Période :",
    j30: "30 j",
    j90: "90 j",
    mois6: "6 mois",
    an1: "1 an",
    an2: "2 ans",
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    genererRapport: "Générer le rapport",
    vueEnsemble: "Vue d'ensemble",
    parSession: "Par session",
    saisie: "Saisie",
    aucunRapport: "Aucun rapport sur cette période",
    ajouterRapport: "➕ Ajouter un rapport",
    sectionVueEnsemble: "Vue d'ensemble",
    sectionTendance: "Tendance mensuelle",
    sectionOfficiant: "Baptêmes par officiant",
    kpiTotalBaptises: "Total baptisés",
    kpiSub: "sur la période",
    kpiSessions: "Sessions",
    kpiCeremonies: "cérémonies",
    kpiHommes: "Hommes",
    kpiFemmes: "Femmes",
    kpiRepartition: "Répartition H / F",
    kpiHommeLabel: "Hommes",
    kpiFemmeLabel: "Femmes",
    tendanceVs: "vs mois préc.",
    tendanceInsuffisant: "Données insuffisantes (≥ 2 mois)",
    legendH: "Hommes",
    legendF: "Femmes",
    aucuneDonnee: "Aucune donnée",
    sess: "sess.",
    modifier: "✏️ Modifier",
    hommes: "Hommes",
    femmes: "Femmes",
    total: "Total",
    infoMsg: "Cette liste contient les personnes qui",
    infoMsgBold1: "n'ont pas encore été baptisées",
    infoMsgEt: "et qui",
    infoMsgBold2: "souhaitent prendre leur baptême",
    infoMsgSuite: ". Ces informations sont mises à jour dans la",
    infoMsgBold3: "Liste des membres",
    voirListe: "Voir la liste des membres",
    selectionnerBaptises: "Sélectionner les baptisés",
    toutSelectionner: "Tout sélectionner",
    toutDeselectionner: "Tout désélectionner",
    aucunCandidat: "Aucun candidat au baptême",
    ajouterBaptise: "➕ Ajouter un baptisé (s'il n'apparaît pas dans la liste)",
    selectionnes: "Sélectionnés :",
    modifierRapport: "✏️ Modifier le rapport",
    nouveauRapport: "➕ Nouveau rapport",
    annuler: "Annuler",
    dateLabel: "Date de la cérémonie",
    baptisePar: "Baptisé par",
    officiантPlaceholder: "Nom de l'officiant",
    mettrAJour: "Mettre à jour",
    ajouterLeRapport: "Ajouter le rapport",
    rapportSucces: "✅ Rapport ajouté avec succès !",
    alertOfficiant: "Le champ 'Baptisé par' est obligatoire.",
    alertCandidat: "Veuillez sélectionner au moins un candidat.",
    erreurEnregistrement: "Erreur enregistrement baptême : ",
    ajouterModifier: "➕ Ajouter / modifier un rapport",
    nouveauRapportBtn: "➕ Nouveau rapport",
    er: "er",
    eme: "ème",
  },
  en: {
    pageTitle: "Report",
    pageTitleAccent: "Baptisms",
    pageSubtitleCreez: "Create and track",
    pageSubtitleText1: "baptism reports and monitor",
    pageSubtitleNouveaux: "newly baptized members",
    pageSubtitleText2: ". Record data,",
    pageSubtitleAnalysez: "analyze",
    pageSubtitleText3: "volumes and male/female breakdown to measure",
    pageSubtitleImpact: "impact and structure church growth",
    perioderapide: "Quick period",
    tranchedates: "Date range",
    periode: "Period:",
    j30: "30 d",
    j90: "90 d",
    mois6: "6 mo",
    an1: "1 yr",
    an2: "2 yrs",
    dateDebut: "Start date",
    dateFin: "End date",
    genererRapport: "Generate report",
    vueEnsemble: "Overview",
    parSession: "By session",
    saisie: "Add data",
    aucunRapport: "No reports for this period",
    ajouterRapport: "➕ Add a report",
    sectionVueEnsemble: "Overview",
    sectionTendance: "Monthly trend",
    sectionOfficiant: "Baptisms by officiant",
    kpiTotalBaptises: "Total baptized",
    kpiSub: "for the period",
    kpiSessions: "Sessions",
    kpiCeremonies: "ceremonies",
    kpiHommes: "Men",
    kpiFemmes: "Women",
    kpiRepartition: "M / F breakdown",
    kpiHommeLabel: "Men",
    kpiFemmeLabel: "Women",
    tendanceVs: "vs prev. month",
    tendanceInsuffisant: "Insufficient data (≥ 2 months)",
    legendH: "Men",
    legendF: "Women",
    aucuneDonnee: "No data",
    sess: "sess.",
    modifier: "✏️ Edit",
    hommes: "Men",
    femmes: "Women",
    total: "Total",
    infoMsg: "This list contains people who",
    infoMsgBold1: "have not yet been baptized",
    infoMsgEt: "and who",
    infoMsgBold2: "wish to be baptized",
    infoMsgSuite: ". This information is updated in the",
    infoMsgBold3: "Member list",
    voirListe: "View member list",
    selectionnerBaptises: "Select the baptized",
    toutSelectionner: "Select all",
    toutDeselectionner: "Deselect all",
    aucunCandidat: "No baptism candidates",
    ajouterBaptise: "➕ Add a baptized person (if not in the list)",
    selectionnes: "Selected:",
    modifierRapport: "✏️ Edit report",
    nouveauRapport: "➕ New report",
    annuler: "Cancel",
    dateLabel: "Ceremony date",
    baptisePar: "Baptized by",
    officiантPlaceholder: "Officiant name",
    mettrAJour: "Update",
    ajouterLeRapport: "Add report",
    rapportSucces: "✅ Report added successfully!",
    alertOfficiant: "The 'Baptized by' field is required.",
    alertCandidat: "Please select at least one candidate.",
    erreurEnregistrement: "Baptism save error: ",
    ajouterModifier: "➕ Add / edit a report",
    nouveauRapportBtn: "➕ New report",
    er: "st",
    eme: "th",
  },
};

export default function RapportBaptemesPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "ResponsableCellule", "SuperviseurCellule", "ResponsableFamilles", "SuperviseurFamilles", "Conseiller"]}>
      <RapportBaptemes />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function getMonthNameFR(monthIndex) {
  return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";
}
function getMonthNameEN(monthIndex) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][monthIndex] || "";
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent }) {
  const c = { green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400", white: "text-white", blue: "text-blue-300", pink: "text-pink-300", purple: "text-purple-300" };
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-sm text-white">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-white/60 mt-0.5">{sub}</p>}
    </div>
  );
}
function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300",
    red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300",
    blue: "bg-blue-900/60 text-blue-300",
    pink: "bg-pink-900/60 text-pink-300",
    purple: "bg-purple-900/60 text-purple-300",
    gray: "bg-white/10 text-white/50",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
}
function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── AGRÉGATION ───────────────────────────────────────────────
function aggregateRapports(rapports) {
  const map = {};
  rapports.forEach(r => {
    const key = `${r.date}__${r.baptise_par}`;
    if (!map[key]) map[key] = { ...r, hommes: 0, femmes: 0 };
    map[key].hommes += Number(r.hommes || 0);
    map[key].femmes += Number(r.femmes || 0);
  });
  return Object.values(map);
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ rapports, t }) {
  const totalH = rapports.reduce((a, r) => a + Number(r.hommes || 0), 0);
  const totalF = rapports.reduce((a, r) => a + Number(r.femmes || 0), 0);
  const total = totalH + totalF;
  const sessions = aggregateRapports(rapports);
  const nbSessions = sessions.length;
  const pctH = total > 0 ? Math.round((totalH / total) * 100) : 0;
  const pctF = total > 0 ? 100 - pctH : 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.kpiTotalBaptises} value={total} sub={t.kpiSub} accent="amber" />
        <KpiCard label={t.kpiSessions} value={nbSessions} sub={t.kpiCeremonies} accent="green" />
        <KpiCard label={t.kpiHommes} value={totalH} sub={`${pctH}% du total`} accent="blue" />
        <KpiCard label={t.kpiFemmes} value={totalF} sub={`${pctF}% du total`} accent="pink" />
      </div>
      {total > 0 && (
        <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-3">
          <p className="text-sm text-white">{t.kpiRepartition}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-900/40 rounded-xl px-3 py-3 text-center">
              <p className="text-xl font-bold text-white/80">{totalH}</p>
              <p className="text-[11px] text-blue-400/70">{t.kpiHommeLabel}</p>
              <p className="text-[10px] text-blue-500/50">{pctH}%</p>
            </div>
            <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
              <p className="text-xl font-bold text-white/80">{totalF}</p>
              <p className="text-[11px] text-pink-400/70">{t.kpiFemmeLabel}</p>
              <p className="text-[10px] text-pink-500/50">{pctF}%</p>
            </div>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div className="bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctH}%` }} />
            <div className="bg-pink-400 rounded-r-full transition-all" style={{ width: `${pctF}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BLOC TENDANCE MENSUELLE ───────────────────────────────────
function BlocTendance({ rapports, t, lang }) {
  const parMois = {};
  rapports.forEach(r => {
    const d = new Date(r.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthName = lang === "en"
      ? `${getMonthNameEN(d.getMonth()).slice(0, 3)} ${d.getFullYear()}`
      : `${getMonthNameFR(d.getMonth()).slice(0, 3)} ${d.getFullYear()}`;
    if (!parMois[key]) parMois[key] = { h: 0, f: 0, label: monthName };
    parMois[key].h += Number(r.hommes || 0);
    parMois[key].f += Number(r.femmes || 0);
  });
  const mois = Object.entries(parMois).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  if (mois.length < 2) return <p className="text-white text-sm text-center py-4">{t.tendanceInsuffisant}</p>;
  const maxVal = Math.max(...mois.map(([, v]) => v.h + v.f), 1);
  const derniere = mois[mois.length - 1];
  const avantDerniere = mois[mois.length - 2];
  const delta = (derniere[1].h + derniere[1].f) - (avantDerniere[1].h + avantDerniere[1].f);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{derniere[1].h + derniere[1].f}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} {t.tendanceVs}
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {mois.map(([key, { h, f, label }]) => (
          <div key={key} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "60px" }}>
              <div className="flex-1 bg-blue-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (h / maxVal) * 60)}px` }} />
              <div className="flex-1 bg-pink-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (f / maxVal) * 60)}px` }} />
            </div>
            <p className="text-[9px] text-white truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-[11px] text-white">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/70 inline-block" /> {t.legendH}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-pink-500/70 inline-block" /> {t.legendF}</span>
      </div>
    </div>
  );
}

// ─── BLOC PAR OFFICIANT ────────────────────────────────────────
function BlocParOfficiant({ rapports, t }) {
  const parOfficiant = {};
  rapports.forEach(r => {
    const nom = r.baptise_par || "Non renseigné";
    if (!parOfficiant[nom]) parOfficiant[nom] = { h: 0, f: 0, nb: 0 };
    parOfficiant[nom].h += Number(r.hommes || 0);
    parOfficiant[nom].f += Number(r.femmes || 0);
    parOfficiant[nom].nb++;
  });
  const lignes = Object.entries(parOfficiant).sort((a, b) => (b[1].h + b[1].f) - (a[1].h + a[1].f));
  const maxTot = Math.max(...lignes.map(([, v]) => v.h + v.f), 1);
  if (!lignes.length) return <p className="text-white text-sm text-center py-4">{t.aucuneDonnee}</p>;
  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([nom, { h, f, nb }]) => {
        const tot = h + f;
        return (
          <div key={nom} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="text-sm text-white w-36 flex-shrink-0 truncate">{nom}</p>
              <BarreProgression pct={(tot / maxTot) * 100} color="bg-amber-400" />
              <p className="text-sm font-bold text-white w-8 text-right">{tot}</p>
              <p className="text-[11px] text-white/30 w-16 text-right flex-shrink-0">{nb} {t.sess}</p>
            </div>
            <div className="flex gap-2 ml-36">
              <Badge color="blue">H: {h}</Badge>
              <Badge color="pink">F: {f}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CARTE SESSION ─────────────────────────────────────────────
function CarteSession({ r, onEdit, t }) {
  const [open, setOpen] = useState(false);
  const total = Number(r.hommes || 0) + Number(r.femmes || 0);
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{r.baptise_par || "—"}</span>
          <span className="text-[11px] text-white/40">{formatDateFr(r.date)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes}</Badge>
          <Badge color="pink">F {r.femmes}</Badge>
          <Badge color="amber">{t.total} {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t.hommes, value: r.hommes, color: "text-blue-300" },
              { label: t.femmes, value: r.femmes, color: "text-pink-300" },
              { label: t.total, value: total, color: "text-amber-300 font-bold" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-[10px] text-white">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value || 0}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onEdit(r)}
            className="w-full py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition">
            {t.modifier}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── FORMULAIRE SAISIE ─────────────────────────────────────────
function FormulaireSaisie({ formData, setFormData, candidats, selectedCandidats, setSelectedCandidats, editRapport, onSubmit, onCancelEdit, rapportSuccess, router, t }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-900/40 border border-blue-300/20 rounded-2xl px-4 py-4 text-sm text-white/80 text-center">
        ℹ️ {t.infoMsg} <strong className="text-white">{t.infoMsgBold1}</strong> {t.infoMsgEt} <strong className="text-white">{t.infoMsgBold2}</strong>{t.infoMsgSuite} <strong className="text-white">{t.infoMsgBold3}</strong>.{" "}
        <button onClick={() => router.push("/list-members")} className="underline text-amber-300 hover:text-amber-200 mt-1 inline-block">
          {t.voirListe}
        </button>
      </div>

      <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold text-sm">{t.selectionnerBaptises}</p>
          <button
            onClick={() => setSelectedCandidats(selectedCandidats.length === 0 ? candidats.map(c => c.id) : [])}
            className="text-xs text-amber-300 hover:text-amber-200 underline"
          >
            {selectedCandidats.length === 0 ? t.toutSelectionner : t.toutDeselectionner}
          </button>
        </div>
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
          {candidats.length === 0 && (
            <p className="text-white/30 text-sm text-center py-3">{t.aucunCandidat}</p>
          )}
          {candidats.map(c => (
            <label key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition">
              <span className="text-sm text-white">{c.prenom} {c.nom}</span>
              <input
                type="checkbox"
                checked={selectedCandidats.includes(c.id)}
                onChange={() => setSelectedCandidats(
                  selectedCandidats.includes(c.id)
                    ? selectedCandidats.filter(id => id !== c.id)
                    : [...selectedCandidats, c.id]
                )}
                className="accent-[#25297e] w-4 h-4"
              />
            </label>
          ))}
        </div>
        <button onClick={() => router.push("/AddContactbaptise")}
          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
          {t.ajouterBaptise}
        </button>
        {selectedCandidats.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <p className="text-[11px] text-amber-300 font-semibold mb-2">{t.selectionnes}</p>
            <div className="flex flex-wrap gap-2">
              {candidats.filter(c => selectedCandidats.includes(c.id)).map(c => (
                <Badge key={c.id} color="amber">{c.prenom} {c.nom}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">{editRapport ? t.modifierRapport : t.nouveauRapport}</p>
          {editRapport && (
            <button onClick={onCancelEdit} className="text-xs text-white/40 hover:text-white/70 transition">{t.annuler}</button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">{t.dateLabel}</label>
          <input type="date" required value={formData.date}
            onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-blue-300/70">{t.hommes}</label>
            <input type="number" value={formData.hommes} disabled
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-blue-300 text-sm text-center opacity-70 cursor-not-allowed" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-pink-300/70">{t.femmes}</label>
            <input type="number" value={formData.femmes} disabled
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-pink-300 text-sm text-center opacity-70 cursor-not-allowed" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">{t.baptisePar}</label>
          <input type="text" required value={formData.baptise_par}
            onChange={e => setFormData(p => ({ ...p, baptise_par: e.target.value }))}
            placeholder={t.officiантPlaceholder}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 placeholder:text-white/20" />
        </div>
        <button onClick={onSubmit}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all active:scale-95">
          {editRapport ? t.mettrAJour : t.ajouterLeRapport}
        </button>
        {rapportSuccess && (
          <p className="text-center text-sm font-semibold text-emerald-400 animate-pulse">{t.rapportSucces}</p>
        )}
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportBaptemes() {
  const { lang } = useLang();
  const t = translations[lang];
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ date: "", hommes: 0, femmes: 0, baptise_par: "", eglise_id: null });
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [filtrePeriode, setFiltrePeriode] = useState("365");
  const [modePerso, setModePerso] = useState(false);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRapport, setEditRapport] = useState(null);
  const [candidats, setCandidats] = useState([]);
  const [selectedCandidats, setSelectedCandidats] = useState([]);
  const [onglet, setOnglet] = useState("kpi");
  const [rapportSuccess, setRapportSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // ← profil complet stocké
  const formRef = useRef(null);

  // ✅ Lire ?onglet=saisie depuis l'URL
  useEffect(() => {
    const ongletParam = searchParams.get("onglet");
    if (ongletParam === "saisie") setOnglet("saisie");
  }, [searchParams]);

  // Calcul hommes/femmes depuis sélection
  useEffect(() => {
    const selected = candidats.filter(c => selectedCandidats.includes(c.id));
    setFormData(prev => ({
      ...prev,
      hommes: selected.filter(c => c.sexe === "Homme").length,
      femmes: selected.filter(c => c.sexe === "Femme").length,
    }));
  }, [selectedCandidats, candidats]);

  // ─── Chargement utilisateur + fetchCandidats avec filtres par rôle ───
  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, id, role, roles, superviseur_id")
        .eq("id", session.session.user.id)
        .single();

      if (profile) {
        setFormData(prev => ({ ...prev, eglise_id: profile.eglise_id }));
        setUserProfile(profile);
        fetchCandidats(profile);
      }
    };
    fetchUser();
  }, []);

  // ─── fetchCandidats : filtre selon le rôle ───────────────────
  const fetchCandidats = async (profile) => {
    const { eglise_id, id: profileId, role, superviseur_id } = profile;
    const roles = profile.roles || [role];

    let query = supabase
      .from("membres_complets")
      .select("id,prenom,nom,sexe,evangelise_member_id")
      .eq("eglise_id", eglise_id)
      .eq("veut_se_faire_baptiser", "Oui")
      .eq("bapteme_eau", "Non");

    if (
      roles.includes("Administrateur") ||
      roles.includes("ResponsableIntegration")
    ) {
      // Voit tout — pas de filtre supplémentaire

    } else if (
      roles.includes("SuperviseurCellule") ||
      roles.includes("SuperviseurFamilles")
    ) {
      // Voit les membres des cellules qu'il supervise
      const { data: cellulesSupervisees } = await supabase
        .from("cellules")
        .select("id")
        .eq("superviseur_id", profileId);

      const ids = (cellulesSupervisees || []).map(c => c.id);
      if (ids.length > 0) {
        query = query.in("cellule_id", ids);
      } else {
        setCandidats([]);
        return;
      }

    } else if (roles.includes("ResponsableCellule")) {
      // Cellule(s) dont il est responsable direct
      const { data: celluleDirecte } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", profileId);

      const idsMere = (celluleDirecte || []).map(c => c.id);

      // Cellules filles (enfants directs)
      let idsFilles = [];
      if (idsMere.length > 0) {
        const { data: filles } = await supabase
          .from("cellules")
          .select("id")
          .in("cellule_mere_id", idsMere);
        idsFilles = (filles || []).map(c => c.id);
      }

      const allIds = [...new Set([...idsMere, ...idsFilles])];

      if (allIds.length > 0) {
        query = query.in("cellule_id", allIds);
      } else {
        setCandidats([]);
        return;
      }

    } else if (roles.includes("ResponsableFamilles")) {
      // Membres de ses familles
      const { data: familles } = await supabase
        .from("familles")
        .select("id")
        .eq("responsable_id", profileId);

      const ids = (familles || []).map(f => f.id);
      if (ids.length > 0) {
        query = query.in("famille_id", ids);
      } else {
        setCandidats([]);
        return;
      }

    } else if (roles.includes("Conseiller")) {
      // Membres qui lui sont attribués directement
      query = query.eq("conseiller_id", profileId);

    } else {
      // Rôle inconnu ou restreint — ne montre rien
      setCandidats([]);
      return;
    }

    const { data } = await query;
    setCandidats(data || []);
  };

  // ─── fetchRapports (inchangé, filtre sur eglise_id) ──────────
  const fetchRapports = async (overrideModePerso = null) => {
    if (!formData.eglise_id) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;
    let query = supabase
      .from("baptemes")
      .select("id, date, hommes, femmes, baptise_par, eglise_id, evangelise_member_id")
      .eq("eglise_id", formData.eglise_id)
      .order("date", { ascending: false });

    if (isPerso) {
      if (filterDebut) query = query.gte("date", filterDebut);
      if (filterFin)   query = query.lte("date", filterFin);
    } else {
      const depuis = new Date();
      depuis.setDate(depuis.getDate() - Number(filtrePeriode));
      query = query.gte("date", depuis.toISOString().split("T")[0]);
    }

    const { data } = await query;
    setRapports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!modePerso && formData.eglise_id) fetchRapports(false);
  }, [formData.eglise_id, filtrePeriode, modePerso]);

  // ─── handleSubmit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.baptise_par.trim()) { alert(t.alertOfficiant); return; }

    if (editRapport) {
      await supabase.from("baptemes").update({
        date: formData.date,
        hommes: formData.hommes,
        femmes: formData.femmes,
        baptise_par: formData.baptise_par,
      }).eq("id", editRapport.id);
      setEditRapport(null);
    } else {
      if (selectedCandidats.length === 0) { alert(t.alertCandidat); return; }

      for (const id of selectedCandidats) {
        const membre = candidats.find(c => c.id === id);
        if (!membre) continue;

        const evangelise_id = membre.evangelise_member_id
          ? String(membre.evangelise_member_id)
          : String(membre.id);

        const payload = {
          date: formData.date,
          hommes: Number(formData.hommes) || 0,
          femmes: Number(formData.femmes) || 0,
          baptise_par: formData.baptise_par.trim(),
          eglise_id: formData.eglise_id,
          evangelise_member_id: evangelise_id,
        };

        const { error: insertError } = await supabase.from("baptemes").insert([payload]);
        if (insertError) {
          console.error("Erreur insert bapteme:", JSON.stringify(insertError));
          alert(t.erreurEnregistrement + (insertError.message || insertError.details || JSON.stringify(insertError)));
          return;
        }

        await supabase
          .from("membres_complets")
          .update({ bapteme_eau: "Oui", veut_se_faire_baptiser: "Non" })
          .eq("id", id);
      }

      setSelectedCandidats([]);
      // ✅ Utiliser userProfile pour recharger les candidats filtrés
      if (userProfile) fetchCandidats(userProfile);
      setRapportSuccess(true);
      setTimeout(() => setRapportSuccess(false), 3000);
    }

    setFormData(prev => ({ ...prev, date: "", hommes: 0, femmes: 0, baptise_par: "" }));
    fetchRapports();
  };

  const handleEdit = (r) => {
    setEditRapport(r);
    setFormData(prev => ({ ...prev, date: r.date, hommes: r.hommes, femmes: r.femmes, baptise_par: r.baptise_par }));
    setOnglet("saisie");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const sessions = aggregateRapports(rapports).sort((a, b) => new Date(b.date) - new Date(a.date));

  const onglets = [
    { key: "kpi", label: t.vueEnsemble },
    { key: "sessions", label: t.parSession },
    { key: "saisie", label: t.saisie },
  ];

  const periodes = [
    { label: t.j30, val: "30" },
    { label: t.j90, val: "90" },
    { label: t.mois6, val: "180" },
    { label: t.an1, val: "365" },
    { label: t.an2, val: "730" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-3 text-center text-white">
        {t.pageTitle} <span className="text-emerald-300">{t.pageTitleAccent}</span>
      </h1>
      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          <span className="text-blue-300 font-semibold">{t.pageSubtitleCreez}</span> {t.pageSubtitleText1}{" "}
          <span className="text-blue-300 font-semibold">{t.pageSubtitleNouveaux}</span>{t.pageSubtitleText2}{" "}
          <span className="text-blue-300 font-semibold">{t.pageSubtitleAnalysez}</span> {t.pageSubtitleText3}{" "}
          <span className="text-blue-300 font-semibold">{t.pageSubtitleImpact}</span>.
        </p>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {t.perioderapide}
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {t.tranchedates}
            </button>
          </div>
          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/80 flex-shrink-0">{t.periode}</span>
              {periodes.map(p => (
                <button key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateDebut}</label>
                  <input type="date" value={filterDebut} onChange={e => setFilterDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateFin}</label>
                  <input type="date" value={filterFin} onChange={e => setFilterFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => fetchRapports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                {t.genererRapport}
              </button>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : onglet === "saisie" ? (
          <div ref={formRef}>
            <FormulaireSaisie
              formData={formData}
              setFormData={setFormData}
              candidats={candidats}
              selectedCandidats={selectedCandidats}
              setSelectedCandidats={setSelectedCandidats}
              editRapport={editRapport}
              onSubmit={handleSubmit}
              onCancelEdit={() => {
                setEditRapport(null);
                setFormData(p => ({ ...p, date: "", hommes: 0, femmes: 0, baptise_par: "" }));
              }}
              rapportSuccess={rapportSuccess}
              router={router}
              t={t}
            />
          </div>
        ) : rapports.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center flex flex-col gap-3">
            <p className="text-white text-sm">{t.aucunRapport}</p>            
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>             
              <BlocKpiGlobaux rapports={rapports} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionTendance}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance rapports={rapports} t={t} lang={lang} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionOfficiant}</SectionTitle>
              <BlocParOfficiant rapports={rapports} t={t} />
            </div>
            <div className="flex justify-center">
              <button onClick={() => setOnglet("saisie")}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition active:scale-95">
                {t.ajouterModifier}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <button onClick={() => setOnglet("saisie")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
                {t.nouveauRapportBtn}
              </button>
            </div>
            {sessions.map((r, i) => (
              <CarteSession key={`${r.date}-${r.baptise_par}-${i}`} r={r} onEdit={handleEdit} t={t} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
