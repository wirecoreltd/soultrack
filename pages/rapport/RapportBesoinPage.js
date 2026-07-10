"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useLang } from "../../hooks/useLang";

// ─── TRADUCTIONS ───────────────────────────────────────────────
const translations = {
  fr: {
    title: "Rapport",
    titleAccent: "Difficultés & Besoins",
    intro1: "Comprenez",
    intro2: "les besoins réels de votre assemblée",
    intro3: ". Identifiez les difficultés",
    intro4: "exprimées par les membres",
    intro5: ", observez les tendances et accompagnez chaque personne avec",
    intro6: "discernement et un suivi adapté",
    perioderapide: "Période rapide",
    tranchedates: "Tranche de dates",
    periode: "Période :",
    j7: "7 j",
    j30: "30 j",
    j90: "90 j",
    mois6: "6 mois",
    an1: "1 an",
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    genererRapport: "Générer le rapport",
    vueEnsemble: "Vue d'ensemble",
    parBesoin: "Par besoin",
    besoinsExprimes: "Besoins exprimés",
    surLaPeriode: "sur la période",
    enSuivi: "En suivi",
    aPrendreEnCharge: "à prendre en charge",
    resolus: "Résolus",
    casTraites: "cas traités",
    tauxResolution: "Taux résolution",
    besoinsResolus: "besoins résolus",
    categoriesActives: "Catégories actives",
    typesDeBesoins: "types de besoins",
    pctMembres: "% membres concernés",
    sur: "sur",
    membres: "membres",
    sectionVueEnsemble: "Vue d'ensemble",
    sectionRepartitionHF: "Répartition H / F",
    sectionSuiviResolu: "Suivi vs Résolu",
    sectionClassement: "Classement par catégorie",
    hommes: "Hommes",
    femmes: "Femmes",
    enSuiviLabel: "En suivi",
    resoluLabel: "Résolus",
    hommes_badge: "H:",
    femmes_badge: "F:",
    suivi_badge: "Suivi:",
    resolu_badge: "Résolu:",
    resolution: "Résolution :",
    concerneMembres: "Concerne",
    pctDesMembres: "% des membres",
    voirMembres: "👥 Voir les membres concernés",
    chargement: "⏳ Chargement...",
    selectionnezPeriode: "Sélectionnez une période pour afficher les données.",
    aucunBesoin: "Aucun besoin enregistré sur cette période.",
  },
  en: {
    title: "Report",
    titleAccent: "Difficulties & Needs",
    intro1: "Understand",
    intro2: "your congregation's real needs",
    intro3: ". Identify difficulties",
    intro4: "expressed by members",
    intro5: ", observe trends and support each person with",
    intro6: "discernment and tailored follow-up",
    perioderapide: "Quick period",
    tranchedates: "Date range",
    periode: "Period:",
    j7: "7 d",
    j30: "30 d",
    j90: "90 d",
    mois6: "6 mo",
    an1: "1 yr",
    dateDebut: "Start date",
    dateFin: "End date",
    genererRapport: "Generate report",
    vueEnsemble: "Overview",
    parBesoin: "By need",
    besoinsExprimes: "Expressed needs",
    surLaPeriode: "for the period",
    enSuivi: "In follow-up",
    aPrendreEnCharge: "to be handled",
    resolus: "Resolved",
    casTraites: "cases handled",
    tauxResolution: "Resolution rate",
    besoinsResolus: "needs resolved",
    categoriesActives: "Active categories",
    typesDeBesoins: "need types",
    pctMembres: "% members affected",
    sur: "out of",
    membres: "members",
    sectionVueEnsemble: "Overview",
    sectionRepartitionHF: "M / F distribution",
    sectionSuiviResolu: "Follow-up vs Resolved",
    sectionClassement: "Ranking by category",
    hommes: "Men",
    femmes: "Women",
    enSuiviLabel: "In follow-up",
    resoluLabel: "Resolved",
    hommes_badge: "M:",
    femmes_badge: "F:",
    suivi_badge: "Follow-up:",
    resolu_badge: "Resolved:",
    resolution: "Resolution:",
    concerneMembres: "Affects",
    pctDesMembres: "% of members",
    voirMembres: "👥 View affected members",
    chargement: "⏳ Loading...",
    selectionnezPeriode: "Select a period to display data.",
    aucunBesoin: "No needs recorded for this period.",
  },
};

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableSuivi"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

// ─── UI ATOMS ──────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-3">
      {children}
    </p>
  );
}

function KpiCard({ label, value, sub, accent }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", orange: "text-orange-300", yellow: "text-yellow-300",
  };
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
    yellow: "bg-yellow-900/60 text-yellow-300",
    orange: "bg-orange-900/60 text-orange-300",
    gray: "bg-white/10 text-white/50",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>
      {children}
    </span>
  );
}

function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── CONFIG BESOINS ────────────────────────────────────────────
const BESOIN_CONFIG = {
  // Français
  "Finances":                   { bar: "bg-green-400",   dot: "bg-green-400",   badge: "green" },
  "Santé":                      { bar: "bg-red-400",     dot: "bg-red-400",     badge: "red" },
  "Travail / Études":           { bar: "bg-blue-400",    dot: "bg-blue-400",    badge: "blue" },
  "Famille / Enfants":          { bar: "bg-pink-400",    dot: "bg-pink-400",    badge: "pink" },
  "Relations / Conflits":       { bar: "bg-orange-400",  dot: "bg-orange-400",  badge: "orange" },
  "Addictions / Dépendances":   { bar: "bg-purple-400",  dot: "bg-purple-400",  badge: "gray" },
  "Guidance spirituelle":       { bar: "bg-indigo-400",  dot: "bg-indigo-400",  badge: "blue" },
  "Logement / Sécurité":        { bar: "bg-yellow-400",  dot: "bg-yellow-400",  badge: "yellow" },
  "Communauté / Isolement":     { bar: "bg-cyan-400",    dot: "bg-cyan-400",    badge: "blue" },
  "Dépression / Santé mentale": { bar: "bg-rose-500",    dot: "bg-rose-500",    badge: "red" },
  "Miracle":                    { bar: "bg-violet-400",  dot: "bg-violet-400",  badge: "blue" },
  "Délivrance":                 { bar: "bg-fuchsia-400", dot: "bg-fuchsia-400", badge: "pink" },
  // Anglais (données en base)
  "Health":                     { bar: "bg-red-400",     dot: "bg-red-400",     badge: "red" },
  "Work / Studies":             { bar: "bg-blue-400",    dot: "bg-blue-400",    badge: "blue" },
  "Family / Children":          { bar: "bg-pink-400",    dot: "bg-pink-400",    badge: "pink" },
  "Relationships / Conflicts":  { bar: "bg-orange-400",  dot: "bg-orange-400",  badge: "orange" },
  "Addictions / Dependencies":  { bar: "bg-purple-400",  dot: "bg-purple-400",  badge: "gray" },
  "Spiritual Guidance":         { bar: "bg-indigo-400",  dot: "bg-indigo-400",  badge: "blue" },
  "Housing / Safety":           { bar: "bg-yellow-400",  dot: "bg-yellow-400",  badge: "yellow" },
  "Community / Isolation":      { bar: "bg-cyan-400",    dot: "bg-cyan-400",    badge: "blue" },
  "Depression / Mental Health": { bar: "bg-rose-500",    dot: "bg-rose-500",    badge: "red" },
  "Deliverance":                { bar: "bg-fuchsia-400", dot: "bg-fuchsia-400", badge: "pink" },
  "Others":                     { bar: "bg-white/60",    dot: "bg-white/40",    badge: "gray" },
  "Autres":                     { bar: "bg-white/60",    dot: "bg-white/40",    badge: "gray" },
};
function getCfg(b) { return BESOIN_CONFIG[b] || BESOIN_CONFIG["Autres"]; }

//-----------------------
const BESOIN_LABELS = {
  fr: {
    "Finances": "Finances",
    "Santé": "Santé", "Health": "Santé",
    "Travail / Études": "Travail / Études", "Work / Studies": "Travail / Études",
    "Famille / Enfants": "Famille / Enfants", "Family / Children": "Famille / Enfants",
    "Relations / Conflits": "Relations / Conflits", "Relationships / Conflicts": "Relations / Conflits",
    "Addictions / Dépendances": "Addictions / Dépendances", "Addictions / Dependencies": "Addictions / Dépendances",
    "Guidance spirituelle": "Guidance spirituelle", "Spiritual Guidance": "Guidance spirituelle",
    "Logement / Sécurité": "Logement / Sécurité", "Housing / Safety": "Logement / Sécurité",
    "Communauté / Isolement": "Communauté / Isolement", "Community / Isolation": "Communauté / Isolement",
    "Dépression / Santé mentale": "Dépression / Santé mentale", "Depression / Mental Health": "Dépression / Santé mentale",
    "Miracle": "Miracle",
    "Délivrance": "Délivrance", "Deliverance": "Délivrance",
    "Others": "Autres", "Autres": "Autres",
  },
  en: {
    "Finances": "Finances",
    "Santé": "Health", "Health": "Health",
    "Travail / Études": "Work / Studies", "Work / Studies": "Work / Studies",
    "Famille / Enfants": "Family / Children", "Family / Children": "Family / Children",
    "Relations / Conflits": "Relationships / Conflicts", "Relationships / Conflicts": "Relationships / Conflicts",
    "Addictions / Dépendances": "Addictions / Dependencies", "Addictions / Dependencies": "Addictions / Dependencies",
    "Guidance spirituelle": "Spiritual Guidance", "Spiritual Guidance": "Spiritual Guidance",
    "Logement / Sécurité": "Housing / Safety", "Housing / Safety": "Housing / Safety",
    "Communauté / Isolement": "Community / Isolation", "Community / Isolation": "Community / Isolation",
    "Dépression / Santé mentale": "Depression / Mental Health", "Depression / Mental Health": "Depression / Mental Health",
    "Miracle": "Miracle",
    "Délivrance": "Deliverance", "Deliverance": "Deliverance",
    "Others": "Others", "Autres": "Others",
  },
};

function getBesoinLabel(besoin, lang) {
  if (!besoin) return "—";
  const map = BESOIN_LABELS[lang] || BESOIN_LABELS.fr;
  return map[besoin] || besoin;
}
// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ besoinsCount, totalMembres, t }) {
  const lignes = Object.entries(besoinsCount);
  const totalBesoins = lignes.reduce((a, [, v]) => a + v.total, 0);
  const totalResolus = lignes.reduce((a, [, v]) => a + v.resolu, 0);
  const totalEnSuivi = lignes.reduce((a, [, v]) => a + v.enSuivi, 0);
  const tauxResolution = totalBesoins > 0 ? Math.round((totalResolus / totalBesoins) * 100) : 0;
  const nbCategories = lignes.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t.besoinsExprimes} value={totalBesoins} sub={t.surLaPeriode} accent="orange" />
        <KpiCard label={t.enSuivi} value={totalEnSuivi} sub={t.aPrendreEnCharge} accent="yellow" />
        <KpiCard label={t.resolus} value={totalResolus} sub={t.casTraites} accent="green" />
        <KpiCard label={t.tauxResolution} value={`${tauxResolution}%`} sub={t.besoinsResolus} accent="amber" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label={t.categoriesActives} value={nbCategories} sub={t.typesDeBesoins} accent="blue" />
        <KpiCard
          label={t.pctMembres}
          value={totalMembres > 0 ? `${((totalBesoins / totalMembres) * 100).toFixed(1)}%` : "—"}
          sub={`${t.sur} ${totalMembres} ${t.membres}`}
          accent="white"
        />
      </div>
    </div>
  );
}

// ─── BLOC RÉPARTITION H/F ──────────────────────────────────────
function BlocGenre({ besoinsCount, t }) {
  const lignes = Object.values(besoinsCount);
  const totalH = lignes.reduce((a, v) => a + v.hommes, 0);
  const totalF = lignes.reduce((a, v) => a + v.femmes, 0);
  const total = totalH + totalF;
  const pctH = total > 0 ? Math.round((totalH / total) * 100) : 0;
  const pctF = 100 - pctH;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text font-semibold text-white/80">{totalH}</p>
          <p className="text-xs text-white/80">{t.hommes}</p>
          <p className="text-xs text-white/80">{pctH}%</p>
        </div>
        <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text font-semibold text-white/80">{totalF}</p>
          <p className="text-xs text-white/80">{t.femmes}</p>
          <p className="text-xs text-white/80">{pctF}%</p>
        </div>
      </div>
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="bg-blue-400 rounded-l-full transition-all" style={{ width: `${pctH}%` }} />
          <div className="bg-pink-400 rounded-r-full transition-all" style={{ width: `${pctF}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── BLOC STATUT ───────────────────────────────────────────────
function BlocStatut({ besoinsCount, t }) {
  const lignes = Object.values(besoinsCount);
  const totalEnSuivi = lignes.reduce((a, v) => a + v.enSuivi, 0);
  const totalResolu = lignes.reduce((a, v) => a + v.resolu, 0);
  const total = totalEnSuivi + totalResolu;
  const pctSuivi = total > 0 ? Math.round((totalEnSuivi / total) * 100) : 0;
  const pctResolu = 100 - pctSuivi;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-yellow-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text font-semibold text-white/80">{totalEnSuivi}</p>
          <p className="text-xs text-white/80">{t.enSuiviLabel}</p>
          <p className="text-xs text-white/80">{pctSuivi}%</p>
        </div>
        <div className="bg-emerald-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text font-semibold text-white/80">{totalResolu}</p>
          <p className="text-xs text-white/80">{t.resoluLabel}</p>
          <p className="text-xs text-white/80">{pctResolu}%</p>
        </div>
      </div>
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="bg-yellow-400 rounded-l-full transition-all" style={{ width: `${pctSuivi}%` }} />
          <div className="bg-emerald-400 rounded-r-full transition-all" style={{ width: `${pctResolu}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── BLOC CLASSEMENT BESOINS ───────────────────────────────────
function BlocClassement({ besoinsCount, t, lang }) {
  const lignes = Object.entries(besoinsCount).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...lignes.map(([, v]) => v.total), 1);

  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">—</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([besoin, data]) => {
        const cfg = getCfg(besoin);
        return (
          <div key={besoin} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-44 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <p className="text-sm text-white truncate">{getBesoinLabel(besoin, lang)}</p>
              </div>
              <BarreProgression pct={(data.total / maxTotal) * 100} color={cfg.bar} />
              <p className="text-sm font-bold text-orange-300 w-8 text-right">{data.total}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Badge color="blue">{t.hommes_badge} {data.hommes}</Badge>
              <Badge color="pink">{t.femmes_badge} {data.femmes}</Badge>
              <Badge color="yellow">{t.suivi_badge} {data.enSuivi}</Badge>
              <Badge color="green">{t.resolu_badge} {data.resolu}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CARTE BESOIN ──────────────────────────────────────────────
function CarteBesoin({ besoin, data, totalMembres, onNavigate, t, lang }) {
  const [open, setOpen] = useState(false);
  const cfg = getCfg(besoin);
  const pctResolu = data.total > 0 ? Math.round((data.resolu / data.total) * 100) : 0;
  const pctMembres = totalMembres > 0 ? ((data.total / totalMembres) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <span className="font-semibold text-white text-sm truncate">{getBesoinLabel(besoin, lang)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="orange">{data.total}</Badge>
          <Badge color="yellow">S:{data.enSuivi}</Badge>
          <Badge color="green">R:{data.resolu}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: t.hommes,      value: data.hommes,  color: "text-white/80" },
              { label: t.femmes,      value: data.femmes,  color: "text-white/80" },
              { label: "Total",       value: data.total,   color: "text-amber-400" },
              { label: t.enSuiviLabel,value: data.enSuivi, color: "text-white/80" },
              { label: t.resoluLabel, value: data.resolu,  color: "text-white/80" },
              { label: t.tauxResolution ?? "% résolution", value: `${pctResolu}%`, color: "text-white/80" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-sm text-white/80">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-400">{t.resolution}</span>
            <BarreProgression pct={pctResolu} />
            <span className="text-xs text-orange-400">{pctResolu}%</span>
          </div>
          <p className="text-xs text-amber-400 text-center">
            {t.concerneMembres} {pctMembres}% {t.pctDesMembres}
          </p>
          <button
            onClick={() => onNavigate(besoin)}
            className="w-full py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-white/80 text-sm font-semibold transition"
          >
            {t.voirMembres}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportBesoin() {
  const { lang } = useLang();
  const t = translations[lang];

  const [egliseId, setEgliseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [besoinsCount, setBesoinsCount] = useState({});
  const [totalMembres, setTotalMembres] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [message, setMessage] = useState("");

  const [filtrePeriode, setFiltrePeriode] = useState("90");
  const [modePerso, setModePerso] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [onglet, setOnglet] = useState("kpi");

  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (data) setEgliseId(data.eglise_id);
    };
    loadUser();
  }, []);

  const fetchRapport = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    setMessage(t.chargement);

    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    try {
      const { data: membres, error: errorMembres } = await supabase
        .from("membres_complets")
        .select("id, etat_contact, sexe")
        .eq("eglise_id", egliseId);
      if (errorMembres) throw errorMembres;

      const totalMembresLocal = membres.filter(m =>
        ["existant", "nouveau"].includes(m.etat_contact?.toLowerCase())
      ).length;
      setTotalMembres(totalMembresLocal);

      const membreIds = membres.map(m => m.id);
      const sexeMap = {};
      membres.forEach(m => {
        sexeMap[m.id] = m.sexe?.toLowerCase() === "homme" ? "hommes" : "femmes";
      });

      let query = supabase
        .from("suivis")
        .select("membre_id, besoin, date_action")
        .in("membre_id", membreIds);

      if (isPerso) {
        if (dateDebut) query = query.gte("date_action", dateDebut);
        if (dateFin) query = query.lte("date_action", dateFin);
      } else {
        const depuis = new Date();
        depuis.setDate(depuis.getDate() - Number(filtrePeriode));
        query = query.gte("date_action", depuis.toISOString().split("T")[0]);
      }

      const { data: suivis, error: errorSuivis } = await query;
      if (errorSuivis) throw errorSuivis;

      const count = {};
      (suivis || []).forEach(s => {
        if (!s.besoin) return;
        const sexe = sexeMap[s.membre_id] || "femmes";
        let items = [];
        try {
          items = Array.isArray(s.besoin) ? s.besoin : JSON.parse(s.besoin);
        } catch { return; }

        items.forEach(item => {
          const label = typeof item === "string" ? item.trim() : item?.label?.trim();
          const statut = typeof item === "string" ? null : item?.statut;
          if (!label) return;
          if (!count[label]) count[label] = { total: 0, hommes: 0, femmes: 0, enSuivi: 0, resolu: 0 };
          count[label].total++;
          if (sexe === "hommes") count[label].hommes++;
          else count[label].femmes++;
          const isResolu = statut === "Résolu" || statut === "Resolved";
if (isResolu) count[label].resolu++;
else count[label].enSuivi++;
        });
      });

      const sorted = Object.fromEntries(
        Object.entries(count).sort((a, b) => b[1].total - a[1].total)
      );

      setBesoinsCount(sorted);
      setHasData(true);
      setMessage("");
    } catch (err) {
      setMessage("❌ " + err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!modePerso && egliseId) fetchRapport(false);
  }, [egliseId, filtrePeriode, modePerso]);

  const handleNavigate = (besoin) => {
    const params = new URLSearchParams({ besoin });
    if (dateDebut) params.set("dateDebut", dateDebut);
    if (dateFin) params.set("dateFin", dateFin);
    router.push(`/membres/list-members?${params.toString()}`);
  };

  const hasBesoins = Object.keys(besoinsCount).length > 0;

  const onglets = [
    { key: "kpi", label: t.vueEnsemble },
    { key: "detail", label: t.parBesoin },
  ];

  const periodes = [
    { label: t.j7, val: "7" },
    { label: t.j30, val: "30" },
    { label: t.j90, val: "90" },
    { label: t.mois6, val: "180" },
    { label: t.an1, val: "365" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* ─── EN-TÊTE ─── */}
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold mb-3 text-white">
            {t.title} <span className="text-emerald-300">{t.titleAccent}</span>
          </h1>
          <p className="italic text-base text-white/90 max-w-2xl mx-auto">
            {t.intro1}{" "}
            <span className="text-blue-300 font-semibold">{t.intro2}</span>
            {t.intro3}{" "}
            <span className="text-blue-300 font-semibold">{t.intro4}</span>
            {t.intro5}{" "}
            <span className="text-blue-300 font-semibold">{t.intro6}</span>.
          </p>
        </div>

        {/* ─── FILTRES ─── */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}
            >
              {t.perioderapide}
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}
            >
              {t.tranchedates}
            </button>
          </div>

          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-white/60 flex-shrink-0">{t.periode}</span>
              <div className="flex gap-1 bg-white/10 rounded-xl p-1 flex-wrap">
                {periodes.map(p => (
                  <button
                    key={p.val}
                    onClick={() => setFiltrePeriode(p.val)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${filtrePeriode === p.val ? "bg-white text-[#333699]" : "text-white/60 hover:text-white/80"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateDebut}</label>
                  <input
                    type="date" value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/80">{t.dateFin}</label>
                  <input
                    type="date" value={dateFin}
                    onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
              <button
                onClick={() => fetchRapport(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95"
              >
                {t.genererRapport}
              </button>
            </div>
          )}
        </div>

        {/* ─── ONGLETS ─── */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/80 hover:text-white"}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* ─── CONTENU ─── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-white text-sm">
              {!egliseId ? t.chargement : t.selectionnezPeriode}
            </p>
          </div>
        ) : !hasBesoins ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-white text-sm">{t.aucunBesoin}</p>
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>{t.sectionVueEnsemble}</SectionTitle>
              <BlocKpiGlobaux besoinsCount={besoinsCount} totalMembres={totalMembres} t={t} />
            </div>
            <div>
              <SectionTitle>{t.sectionRepartitionHF}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocGenre besoinsCount={besoinsCount} t={t} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionSuiviResolu}</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocStatut besoinsCount={besoinsCount} t={t} />
              </div>
            </div>
            <div>
              <SectionTitle>{t.sectionClassement}</SectionTitle>
              <BlocClassement besoinsCount={besoinsCount} t={t} lang={lang} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries(besoinsCount).map(([besoin, data]) => (
              <CarteBesoin
                key={besoin}
                besoin={besoin}
                data={data}
                totalMembres={totalMembres}
                onNavigate={handleNavigate}
                t={t}
                lang={lang}
              />
            ))}
          </div>
        )}

        {message && !loading && (
          <p className="text-center text-sm text-white/60">{message}</p>
        )}
      </div>

      <Footer />
    </div>
  );
}
