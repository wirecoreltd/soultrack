"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function EtatFamillePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "SuperviseurCellule", "ResponsableCellule"]}>
      <EtatFamille />
    </ProtectedRoute>
  );
}

const [modePerso, setModePerso] = useState(false);   // ← était true
const [filtrePeriode, setFiltrePeriode] = useState("30");  // déjà "30", rien à changer

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFR(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function getMonthNameFR(monthIndex) {
  return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", teal: "text-teal-300", orange: "text-orange-300",
    gray: "text-white/40", indigo: "text-indigo-300", yellow: "text-yellow-300",
  };
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1">
      <p className="text-xs text-white/50">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}
function Badge({ children, color }) {
  const m = {
    green: "bg-emerald-900/60 text-emerald-300", red: "bg-red-900/60 text-red-300",
    amber: "bg-amber-900/60 text-amber-300", blue: "bg-blue-900/60 text-blue-300",
    purple: "bg-purple-900/60 text-purple-300", gray: "bg-white/10 text-white/50",
    orange: "bg-orange-900/60 text-orange-300", indigo: "bg-indigo-900/60 text-indigo-300",
    teal: "bg-teal-900/60 text-teal-300",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[color] || m.gray}`}>{children}</span>;
}
function BarreProgression({ pct, color }) {
  const col = color || (pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400");
  return (
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${Math.min(pct || 0, 100)}%` }} />
    </div>
  );
}

// ─── BLOC KPI GLOBAL ──────────────────────────────────────────
function BlocKpi({ kpis, total }) {
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Familles" value={kpis.totalFamilles} sub="familles suivies" accent="blue" />
        <KpiCard label="Membres" value={kpis.totalMembres} sub="total membres" accent="purple" />
        <KpiCard label="Baptisés eau" value={kpis.totalBaptisesEau} sub={`${pct(kpis.totalBaptisesEau)}% des membres`} accent="indigo" />
        <KpiCard label="En ministère" value={kpis.totalMinistere} sub={`${pct(kpis.totalMinistere)}% des membres`} accent="teal" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KpiCard label="Baptisés Esprit" value={kpis.totalBaptisesEsprit} sub="baptême Esprit" accent="pink" />
        <KpiCard label="En formation" value={kpis.totalFormation} sub="en cours de formation" accent="amber" />
        <KpiCard label="Actifs" value={kpis.totalActifs} sub="membres actifs" accent="green" />
      </div>

      {total > 0 && (
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3 mt-1">
          <SectionTitle>Entonnoir de progression</SectionTitle>
          {[
            { label: "Total membres", val: kpis.totalMembres, color: "bg-blue-400" },
            { label: "Actifs", val: kpis.totalActifs, color: "bg-emerald-400" },
            { label: "Baptisés eau", val: kpis.totalBaptisesEau, color: "bg-indigo-400" },
            { label: "En ministère", val: kpis.totalMinistere, color: "bg-pink-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3">
              <p className="text-xs text-white/50 w-28 flex-shrink-0">{label}</p>
              <BarreProgression
                pct={kpis.totalMembres > 0 ? Math.round((val / kpis.totalMembres) * 100) : 0}
                color={color}
              />
              <span className="text-xs text-white font-semibold w-8 text-right">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BLOC PAR VILLE (synthèse KPI) ────────────────────────────
function BlocParVille({ familles }) {
  const parVille = {};
  familles.forEach(f => {
    const v = f.ville || "Inconnue";
    if (!parVille[v]) parVille[v] = { total: 0, membres: 0, baptises: 0 };
    parVille[v].total++;
    parVille[v].membres += Number(f.nb_membres) || 0;
    parVille[v].baptises += Number(f.nb_baptises_eau) || 0;
  });
  const max = Math.max(...Object.values(parVille).map(v => v.total), 1);
  const lignes = Object.entries(parVille).sort((a, b) => b[1].total - a[1].total);
  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([ville, { total, membres, baptises }]) => (
        <div key={ville} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-32 flex-shrink-0 truncate">{ville}</p>
            <BarreProgression pct={(total / max) * 100} color="bg-blue-400" />
            <span className="text-sm font-bold text-white w-6 text-right">{total}</span>
          </div>
          <div className="flex gap-2 ml-32">
            <Badge color="purple">👥 {membres} membres</Badge>
            <Badge color="indigo">💧 {baptises} baptisés</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CARTE FAMILLE ────────────────────────────────────────────
function CarteFamille({ f, membres, loadingMembres }) {
  const [open, setOpen] = useState(false);
  const pctBaptise = f.nb_membres > 0
    ? Math.round((Number(f.nb_baptises_eau) / Number(f.nb_membres)) * 100)
    : 0;

  return (
    <div className="bg-white/10 rounded-xl overflow-hidden border-l-2 border-blue-500/50">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left gap-3"
      >
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-semibold text-white truncate">{f.famille_full}</span>
          <span className="text-[11px] text-white/40">{f.responsable} · {f.nb_membres} membre{f.nb_membres > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">👥 {f.nb_membres}</Badge>
          {Number(f.nb_baptises_eau) > 0 && <Badge color="indigo">💧 {f.nb_baptises_eau}</Badge>}
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          {/* Stats famille */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Membres", val: f.nb_membres, color: "text-blue-300" },
              { label: "Actifs", val: f.nb_actifs, color: "text-emerald-300" },
              { label: "Baptisés eau", val: f.nb_baptises_eau, color: "text-indigo-300" },
              { label: "Ministère", val: f.nb_ministere, color: "text-pink-300" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 text-center">
                <p className={`text-sm font-bold ${color}`}>{val || 0}</p>
                <p className="text-[10px] text-white/40">{label}</p>
              </div>
            ))}
          </div>

          {/* Barre baptême */}
          {f.nb_membres > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/40 w-24 flex-shrink-0">Baptisés eau</span>
              <BarreProgression pct={pctBaptise} color="bg-indigo-400" />
              <span className="text-xs text-white/50">{pctBaptise}%</span>
            </div>
          )}

          {/* Infos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Responsable", value: f.responsable },
              { label: "Ville", value: f.ville },
              { label: "1ère visite", value: formatDateFR(f.premiere_visite) },
              { label: "Dernière visite", value: formatDateFR(f.derniere_visite) },
              { label: "Dernière MAJ", value: formatDateFR(f.derniere_maj) },
              { label: "Cellule", value: f.cellule_nom || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className="text-sm text-white font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>

          {/* Liste membres */}
          <div className="flex flex-col gap-1 mt-1">
            <SectionTitle>Membres de la famille</SectionTitle>
            {loadingMembres ? (
              <p className="text-xs text-white/30 text-center py-2">Chargement…</p>
            ) : membres.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-2">Aucun membre</p>
            ) : (
              membres.map((m, i) => (
                <div key={i} className="bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{m.prenom} {m.nom}</p>
                    <p className="text-[10px] text-white/40">
                      Venu le {formatDateFR(m.date_venu)}
                      {m.sexe ? ` · ${m.sexe}` : ""}
                      {m.age ? ` · ${m.age} ans` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {m.bapteme_eau === "true" && <Badge color="indigo">💧</Badge>}
                    {m.bapteme_esprit === "true" && <Badge color="purple">🔥</Badge>}
                    {m["Ministere"] && <Badge color="teal">⭐</Badge>}
                    {m.statut === "actif" && <Badge color="green">Actif</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ONGLET PAR VILLE DÉTAIL ──────────────────────────────────
function OngletParVilleDetail({ familles, membresParFamille, loadingMembres }) {
  const [expandedVilles, setExpandedVilles] = useState({});

  const grouped = {};
  familles.forEach(f => {
    const v = f.ville || "Inconnue";
    if (!grouped[v]) grouped[v] = [];
    grouped[v].push(f);
  });

  const sorted = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  if (!sorted.length) return <p className="text-white/30 text-sm text-center py-8">Aucune donnée</p>;

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([ville, fams]) => {
        const isOpen = expandedVilles[ville];
        const totalMembres = fams.reduce((s, f) => s + (Number(f.nb_membres) || 0), 0);
        const totalBaptises = fams.reduce((s, f) => s + (Number(f.nb_baptises_eau) || 0), 0);

        return (
          <div key={ville} className="bg-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedVilles(p => ({ ...p, [ville]: !p[ville] }))}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-semibold text-white">{ville}</span>
                <span className="text-[11px] text-white/40">{fams.length} famille{fams.length > 1 ? "s" : ""} · {totalMembres} membres</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="blue">🏠 {fams.length}</Badge>
                <Badge color="purple">👥 {totalMembres}</Badge>
                <Badge color="indigo">💧 {totalBaptises}</Badge>
                <span className="text-white/30 text-xs">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
                {fams.map((f, i) => (
                  <CarteFamille
                    key={i}
                    f={f}
                    membres={membresParFamille[f.famille_id] || []}
                    loadingMembres={loadingMembres}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ONGLET PAR MOIS ──────────────────────────────────────────
function OngletParMois({ familles, membresParFamille, loadingMembres }) {
  const [expandedMonths, setExpandedMonths] = useState({});

  const grouped = {};
  familles.forEach(f => {
    const d = new Date(f.famille_created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = { label: `${getMonthNameFR(d.getMonth())} ${d.getFullYear()}`, rows: [] };
    grouped[key].rows.push(f);
  });

  const sorted = Object.entries(grouped).sort((a, b) => {
    const [yA, mA] = a[0].split("-").map(Number);
    const [yB, mB] = b[0].split("-").map(Number);
    return new Date(yB, mB) - new Date(yA, mA);
  });

  if (!sorted.length) return <p className="text-white/30 text-sm text-center py-8">Aucune donnée sur cette période</p>;

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([key, { label, rows }]) => {
        const isOpen = expandedMonths[key];
        const totalMembres = rows.reduce((s, f) => s + (Number(f.nb_membres) || 0), 0);
        return (
          <div key={key} className="bg-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedMonths(p => ({ ...p, [key]: !p[key] }))}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3"
            >
              <span className="font-semibold text-white">{label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="gray">{rows.length} famille{rows.length > 1 ? "s" : ""}</Badge>
                <Badge color="purple">👥 {totalMembres}</Badge>
                <span className="text-white/30 text-xs">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
                {rows.map((f, i) => (
                  <CarteFamille
                    key={i}
                    f={f}
                    membres={membresParFamille[f.famille_id] || []}
                    loadingMembres={loadingMembres}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────
function EtatFamille() {
  const [familles, setFamilles] = useState([]);
  const [allFamilles, setAllFamilles] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [membresParFamille, setMembresParFamille] = useState({});
  const [loadingMembres, setLoadingMembres] = useState(false);

  // Filtres
  const [modePerso, setModePerso] = useState(true);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [availableVilles, setAvailableVilles] = useState([]);

  // Onglets
  const [onglet, setOnglet] = useState("kpi");

  // KPIs
  const [kpis, setKpis] = useState({
    totalFamilles: 0, totalMembres: 0, totalActifs: 0,
    totalBaptisesEau: 0, totalBaptisesEsprit: 0,
    totalMinistere: 0, totalFormation: 0,
  });

  // ─── Profil ───────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setUserProfile(data);
    };
    fetchProfile();
  }, []);

  // ─── Fetch familles ───────────────────────────────
  const fetchFamilles = async (overrideModePerso = null) => {
    if (!userProfile) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;
    const isAdmin = userProfile.roles?.includes("Administrateur");

    try {
      let query = supabase
        .from("vue_flow_familles")
        .select("*")
        .eq("eglise_id", userProfile.eglise_id)
        .order("famille_created_at", { ascending: false });

      if (!isAdmin) {
        query = query.ilike("responsable", `%${userProfile.prenom}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];

      if (isPerso) {
        if (filterDebut) filtered = filtered.filter(f => new Date(f.famille_created_at) >= new Date(filterDebut));
        if (filterFin) filtered = filtered.filter(f => new Date(f.famille_created_at) <= new Date(filterFin));
      } else {
        const depuis = new Date();
        depuis.setDate(depuis.getDate() - Number(filtrePeriode));
        filtered = filtered.filter(f => new Date(f.famille_created_at) >= depuis);
      }

      setAllFamilles(filtered);
      setFamilles(filtered);
      setAvailableVilles([...new Set(filtered.map(f => f.ville).filter(Boolean))].sort());
      setFilterVille("");
      updateKpis(filtered);

      // Charger tous les membres d'un coup
      await fetchTousMembres(filtered);
    } catch (err) {
      console.error("Erreur fetch familles:", err);
      setAllFamilles([]);
      setFamilles([]);
    }
    setLoading(false);
  };

  // ─── Fetch membres ────────────────────────────────
  const fetchTousMembres = async (fams) => {
    if (!fams.length) return;
    setLoadingMembres(true);
    const ids = fams.map(f => f.famille_id);

    const { data, error } = await supabase
      .from("membres_complets")
      .select("id, nom, prenom, date_venu, sexe, age, statut, bapteme_eau, bapteme_esprit, Ministere, famille_id")
      .in("famille_id", ids);

    if (!error && data) {
      const map = {};
      data.forEach(m => {
        if (!map[m.famille_id]) map[m.famille_id] = [];
        map[m.famille_id].push(m);
      });
      setMembresParFamille(map);
    }
    setLoadingMembres(false);
  };

  useEffect(() => {
    if (userProfile && !modePerso) fetchFamilles(false);
  }, [userProfile, filtrePeriode, modePerso]);

  // ─── Filtre ville réactif ─────────────────────────
  const displayedFamilles = filterVille
    ? allFamilles.filter(f => f.ville === filterVille)
    : allFamilles;

  // ─── KPIs ─────────────────────────────────────────
  const updateKpis = (filtered) => {
    setKpis({
      totalFamilles: filtered.length,
      totalMembres: filtered.reduce((s, f) => s + (Number(f.nb_membres) || 0), 0),
      totalActifs: filtered.reduce((s, f) => s + (Number(f.nb_actifs) || 0), 0),
      totalBaptisesEau: filtered.reduce((s, f) => s + (Number(f.nb_baptises_eau) || 0), 0),
      totalBaptisesEsprit: filtered.reduce((s, f) => s + (Number(f.nb_baptises_esprit) || 0), 0),
      totalMinistere: filtered.reduce((s, f) => s + (Number(f.nb_ministere) || 0), 0),
      totalFormation: filtered.reduce((s, f) => s + (Number(f.nb_formation) || 0), 0),
    });
  };

  useEffect(() => {
    updateKpis(displayedFamilles);
  }, [filterVille, allFamilles]);

  const hasData = allFamilles.length > 0;

  const onglets = [
    { key: "kpi", label: "Vue d'ensemble" },
    { key: "familles", label: "Par famille" },
    { key: "mois", label: "Par mois" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mt-4 mb-2 text-center text-white">
            L'Évolution des <span className="text-emerald-300">Familles</span>
          </h1>
          <p className="italic text-base text-white/90">
            <span className="text-blue-300 font-semibold">Suivi spirituel par famille.</span>{" "}
            Chaque famille est une cellule de croissance —{" "}
            <span className="text-blue-300 font-semibold">chaque membre compte</span>,
            chaque progression témoigne de{" "}
            <span className="text-blue-300 font-semibold">l'œuvre de Dieu</span>.
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${!modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              Période rapide
            </button>
            <button onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              Tranche de dates
            </button>
          </div>

          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">Période :</span>
              {[{ label: "7 j", val: "7" }, { label: "30 j", val: "30" }, { label: "90 j", val: "90" }, { label: "6 mois", val: "180" }, { label: "1 an", val: "365" }].map(p => (
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
                  <label className="text-xs text-white/50">Date de début</label>
                  <input type="date" value={filterDebut} onChange={e => setFilterDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de fin</label>
                  <input type="date" value={filterFin} onChange={e => setFilterFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => fetchFamilles(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                Générer le rapport
              </button>
            </div>
          )}

          {hasData && availableVilles.length > 1 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">Ville</label>
              <select value={filterVille} onChange={e => setFilterVille(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
                <option value="" className="bg-[#2a2d80]">Toutes les villes</option>
                {availableVilles.map((v, i) => (
                  <option key={i} value={v} className="bg-[#2a2d80]">{v}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            {modePerso ? "Choisissez une plage de dates et cliquez sur « Générer le rapport »" : "Aucune donnée sur cette période"}
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>Vue d'ensemble</SectionTitle>
              <BlocKpi kpis={kpis} total={kpis.totalFamilles} />
            </div>
            <div>
              <SectionTitle>Répartition par ville</SectionTitle>
              <BlocParVille familles={displayedFamilles} />
            </div>
          </div>
        ) : onglet === "familles" ? (
          <OngletParVilleDetail
            familles={displayedFamilles}
            membresParFamille={membresParFamille}
            loadingMembres={loadingMembres}
          />
        ) : (
          <OngletParMois
            familles={displayedFamilles}
            membresParFamille={membresParFamille}
            loadingMembres={loadingMembres}
          />
        )}

      </div>
      <Footer />
    </div>
  );
}
