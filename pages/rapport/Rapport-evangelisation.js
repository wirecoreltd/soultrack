"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import EditEvanRapportLine from "../../components/EditEvanRapportLine";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";

// ─── HELPERS ──────────────────────────────────────────────────
function formatDateFr(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatDateCourt(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short",
  });
}
function getMonthNameFR(monthIndex) {
  return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";
}

// ─── UI ATOMS ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">{children}</p>;
}
function KpiCard({ label, value, sub, accent, onClick }) {
  const c = {
    green: "text-emerald-400", red: "text-red-400", amber: "text-amber-400",
    white: "text-white", blue: "text-blue-300", pink: "text-pink-300",
    purple: "text-purple-300", teal: "text-teal-300", orange: "text-orange-300", gray: "text-white/40",
  };
  return (
    <div onClick={onClick}
      className={`bg-white/10 rounded-2xl px-4 py-4 flex flex-col gap-1 ${onClick ? "cursor-pointer hover:bg-white/15 active:scale-95 transition" : ""}`}>
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
    pink: "bg-pink-900/60 text-pink-300", teal: "bg-teal-900/60 text-teal-300",
    orange: "bg-orange-900/60 text-orange-300",
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

// ─── CALCUL TOTAUX ─────────────────────────────────────────────
function getTotals(reports) {
  let hommes = 0, femmes = 0, priere = 0, nouveau = 0, reconciliation = 0, moissonneurs = 0;
  (reports || []).forEach(r => {
    hommes += Number(r.hommes) || 0;
    femmes += Number(r.femmes) || 0;
    priere += Number(r.priere) || 0;
    nouveau += Number(r.nouveau_converti) || 0;
    reconciliation += Number(r.reconciliation) || 0;
    moissonneurs += Number(r.moissonneurs) || 0;
  });
  return { hommes, femmes, total: hommes + femmes, priere, nouveau, reconciliation, moissonneurs };
}

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ filteredEvangelises, filteredSuivis, rapports, onKpiClick, onCelluleClick, onConseillerClick }) {
  const totalEvangelises = filteredEvangelises.length;
  const totalEnvoyes = filteredEvangelises.filter(e => e.status_suivi === "Envoyé").length;
  const totalNonEnvoyes = filteredEvangelises.filter(e => e.status_suivi !== "Envoyé").length;
  const totalConvertis = filteredEvangelises.filter(e => e.priere_salut === true).length;
  const normalize = (str) => (str ? str.trim() : "");
  const totalIntegres = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "Intégré").length;
  const totalEncours = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "En cours").length;
  const totalRefus = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "Refus").length;
  const totalCellule = filteredSuivis.filter(s => s.cellule_id != null).length;
  const totalEglise = filteredSuivis.filter(s => s.conseiller_id != null).length;
  const pct = (n) => totalEvangelises > 0 ? Math.round((n / totalEvangelises) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Ligne 1 — chiffres clés */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Évangélisés" value={totalEvangelises} sub="sur la période" accent="white" onClick={() => onKpiClick(null)} />
        <KpiCard label="Convertis" value={`${pct(totalConvertis)}%`} sub={`${totalConvertis} prières du salut`} accent="pink" onClick={() => onKpiClick("Converti")} />
        <KpiCard label="Intégrés" value={`${pct(totalIntegres)}%`} sub={`${totalIntegres} personnes`} accent="green" onClick={() => onKpiClick("Intégré")} />
        <KpiCard label="En cours" value={totalEncours} sub="de suivi" accent="amber" onClick={() => onKpiClick("En cours")} />
      </div>
      {/* Ligne 2 — envoi & refus */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Envoyés au suivi" value={totalEnvoyes} sub={`${pct(totalEnvoyes)}% des évangélisés`} accent="purple" onClick={() => onKpiClick("Envoyé")} />
        <KpiCard label="Non envoyés" value={totalNonEnvoyes} sub={`${pct(totalNonEnvoyes)}%`} accent="gray" onClick={() => onKpiClick("NonEnvoye")} />
        <KpiCard label="Refus" value={totalRefus} sub={`${pct(totalRefus)}%`} accent="red" onClick={() => onKpiClick("Refus")} />
        <KpiCard label="Moissonneurs" value={getTotals(rapports).moissonneurs} sub="impliqués" accent="teal" />
      </div>
      {/* Ligne 3 — intégration */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Intégrés en cellule" value={totalCellule} sub={filteredSuivis.length > 0 ? `${Math.round((totalCellule / filteredSuivis.length) * 100)}% des suivis` : "—"} accent="blue" onClick={onCelluleClick} />
        <KpiCard label="Intégrés à l'église" value={totalEglise} sub={filteredSuivis.length > 0 ? `${Math.round((totalEglise / filteredSuivis.length) * 100)}% des suivis` : "—"} accent="teal" onClick={onConseillerClick} />
      </div>
    </div>
  );
}

// ─── BLOC ENTONNOIR ─────────────────────────────────────────────
function BlocEntonnoir({ filteredEvangelises, filteredSuivis }) {
  const total = filteredEvangelises.length;
  if (!total) return <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>;
  const normalize = (str) => (str ? str.trim() : "");
  const envoyes = filteredEvangelises.filter(e => e.status_suivi === "Envoyé").length;
  const integres = filteredSuivis.filter(s => normalize(s.status_suivis_evangelises) === "Intégré").length;
  const convertis = filteredEvangelises.filter(e => e.priere_salut === true).length;

  const etapes = [
    { label: "Évangélisés", val: total, pct: 100, color: "bg-blue-400" },
    { label: "Envoyés au suivi", val: envoyes, pct: Math.round((envoyes / total) * 100), color: "bg-purple-400" },
    { label: "Convertis", val: convertis, pct: Math.round((convertis / total) * 100), color: "bg-pink-400" },
    { label: "Intégrés", val: integres, pct: Math.round((integres / total) * 100), color: "bg-emerald-400" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {etapes.map(({ label, val, pct, color }) => (
        <div key={label} className="flex items-center gap-3">
          <p className="text-xs text-white/70 w-36 flex-shrink-0">{label}</p>
          <BarreProgression pct={pct} color={color} />
          <span className="text-xs font-bold text-white w-8 text-right">{val}</span>
          <span className="text-[11px] text-white/40 w-9 text-right">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── BLOC PAR TYPE D'ÉVANGÉLISATION ────────────────────────────
function BlocParType({ filteredEvangelises, rapports }) {
  const parType = {};
  filteredEvangelises.forEach(e => {
    const t = e.type_evangelisation || "Non défini";
    if (!parType[t]) parType[t] = { nb: 0, convertis: 0 };
    parType[t].nb++;
    if (e.priere_salut) parType[t].convertis++;
  });
  const max = Math.max(...Object.values(parType).map(v => v.nb), 1);
  const lignes = Object.entries(parType).sort((a, b) => b[1].nb - a[1].nb);
  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([type, { nb, convertis }]) => (
        <div key={type} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white w-40 flex-shrink-0 truncate">{type}</p>
            <BarreProgression pct={(nb / max) * 100} color="bg-blue-400" />
            <span className="text-sm font-bold text-white w-8 text-right">{nb}</span>
          </div>
          <div className="flex gap-2 ml-40">
            <Badge color="pink">Convertis: {convertis}</Badge>
            <Badge color="green">{nb > 0 ? Math.round((convertis / nb) * 100) : 0}%</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BLOC TENDANCE MENSUELLE ───────────────────────────────────
function BlocTendance({ filteredEvangelises }) {
  const parMois = {};
  filteredEvangelises.forEach(e => {
    if (!e.date_evangelise) return;
    const d = new Date(e.date_evangelise);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!parMois[key]) parMois[key] = { nb: 0, convertis: 0, label: `${getMonthNameFR(d.getMonth()).slice(0, 3)} ${d.getFullYear()}` };
    parMois[key].nb++;
    if (e.priere_salut) parMois[key].convertis++;
  });
  const mois = Object.entries(parMois).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  if (mois.length < 2) return <p className="text-white/30 text-sm text-center py-4">Données insuffisantes (≥ 2 mois)</p>;
  const maxNb = Math.max(...mois.map(([, v]) => v.nb), 1);
  const derniere = mois[mois.length - 1][1];
  const avantDerniere = mois[mois.length - 2][1];
  const delta = derniere.nb - avantDerniere.nb;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{derniere.nb}</span>
        <span className={`text-sm font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} vs mois préc.
        </span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {mois.map(([key, { nb, convertis, label }]) => (
          <div key={key} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "52px" }}>
              <div className="flex-1 bg-blue-500/70 rounded-t-sm" style={{ height: `${Math.max(3, (nb / maxNb) * 52)}px` }} />
              <div className="flex-1 bg-pink-500/70 rounded-t-sm" style={{ height: `${Math.max(2, (convertis / maxNb) * 52)}px` }} />
            </div>
            <p className="text-[9px] text-white/30 truncate w-full text-center">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-[11px] text-white/40">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/70 inline-block" /> Évangélisés</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-pink-500/70 inline-block" /> Convertis</span>
      </div>
    </div>
  );
}

// ─── CARTE SESSION (par mois > type > lignes) ──────────────────
function CarteSession({ r, onEdit }) {
  const [open, setOpen] = useState(false);
  const total = (Number(r.hommes) || 0) + (Number(r.femmes) || 0);
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white text-sm">{r.type_evangelisation || "Non défini"}</span>
          <span className="text-[11px] text-white/40">{formatDateFr(r.date_evangelise)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">H {r.hommes ?? 0}</Badge>
          <Badge color="pink">F {r.femmes ?? 0}</Badge>
          <Badge color="amber">Total {total}</Badge>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Hommes", value: r.hommes, color: "text-blue-300" },
              { label: "Femmes", value: r.femmes, color: "text-pink-300" },
              { label: "Total", value: total, color: "text-amber-300 font-bold" },
              { label: "Prière du salut", value: r.priere, color: "text-emerald-300" },
              { label: "Nv. convertis", value: r.nouveau_converti, color: "text-white" },
              { label: "Réconciliation", value: r.reconciliation, color: "text-white" },
              { label: "Moissonneurs", value: r.moissonneurs, color: "text-teal-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex flex-col">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value ?? 0}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onEdit(r)}
            className="w-full py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition">
            ✏️ Modifier
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ONGLET PAR SESSION (groupé mois > type) ──────────────────
function OngletSessions({ rapports, onEdit }) {
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});

  const grouped = {};
  rapports.forEach(r => {
    const d = new Date(r.date_evangelise);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[monthKey]) grouped[monthKey] = { label: `${getMonthNameFR(d.getMonth())} ${d.getFullYear()}`, types: {} };
    const type = r.type_evangelisation || "Non défini";
    if (!grouped[monthKey].types[type]) grouped[monthKey].types[type] = [];
    grouped[monthKey].types[type].push(r);
  });

  if (!Object.keys(grouped).length) return <p className="text-white/30 text-sm text-center py-8">Aucun rapport sur cette période</p>;

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(grouped).map(([monthKey, { label, types }]) => {
        const isMonthOpen = expandedMonths[monthKey];
        const monthTotals = getTotals(Object.values(types).flat());
        return (
          <div key={monthKey} className="bg-white/10 rounded-2xl overflow-hidden">
            <button onClick={() => setExpandedMonths(p => ({ ...p, [monthKey]: !p[monthKey] }))}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition text-left gap-3">
              <span className="font-semibold text-white">{label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color="amber">Total {monthTotals.total}</Badge>
                <Badge color="green">🙏 {monthTotals.priere}</Badge>
                <span className="text-white/30 text-xs">{isMonthOpen ? "▲" : "▼"}</span>
              </div>
            </button>
            {isMonthOpen && (
              <div className="border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
                {Object.entries(types).map(([type, rows]) => {
                  const typeKey = `${monthKey}-${type}`;
                  const isTypeOpen = expandedTypes[typeKey];
                  const typeTotals = getTotals(rows);
                  return (
                    <div key={typeKey} className="bg-white/5 rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedTypes(p => ({ ...p, [typeKey]: !p[typeKey] }))}
                        className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 transition text-left gap-3">
                        <span className="text-sm text-white/80 font-semibold">{type}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge color="blue">H {typeTotals.hommes}</Badge>
                          <Badge color="pink">F {typeTotals.femmes}</Badge>
                          <Badge color="amber">{typeTotals.total}</Badge>
                          <span className="text-white/30 text-xs">{isTypeOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>
                      {isTypeOpen && (
                        <div className="border-t border-white/10 px-3 pb-3 pt-2 flex flex-col gap-2">
                          {rows.map(r => <CarteSession key={r.id} r={r} onEdit={onEdit} />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
export default function RapportEvangelisation() {
  const router = useRouter();
  const [rapports, setRapports] = useState([]);
  const [allEvangelises, setAllEvangelises] = useState([]);
  const [filteredEvangelises, setFilteredEvangelises] = useState([]);
  const [filteredSuivis, setFilteredSuivis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [egliseId, setEgliseId] = useState(null);
  const [onglet, setOnglet] = useState("kpi");

  // Filtres
  const [modePerso, setModePerso] = useState(false);
  const [filtrePeriode, setFiltrePeriode] = useState("30");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filtreType, setFiltreType] = useState("");

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [message, setMessage] = useState("");

  // ─── Profil ─────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("eglise_id").eq("id", user.id).single();
      if (profile) setEgliseId(profile.eglise_id);
    };
    fetchProfile();
  }, []);

  // ─── Fetch ──────────────────────────────────────
  const fetchRapports = async (overrideModePerso = null) => {
    if (!egliseId) return;
    setLoading(true);
    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    // Calcul plage de dates
    let startDate = null;
    let endDate = null;
    if (isPerso) {
      if (dateDebut) startDate = new Date(dateDebut);
      if (dateFin) { endDate = new Date(dateFin); endDate.setHours(23, 59, 59, 999); }
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(filtrePeriode));
    }

    try {
      // Évangélisés
      const { data: evangelisesData } = await supabase
        .from("evangelises").select("*")
        .eq("eglise_id", egliseId).neq("status_suivi", "supprime");
      setAllEvangelises(evangelisesData || []);

      const filtered = (evangelisesData || []).filter(e => {
        const d = e.date_evangelise ? new Date(e.date_evangelise) : null;
        const afterStart = !startDate || (d && d >= startDate);
        const beforeEnd = !endDate || (d && d <= endDate);
        const typeOk = !filtreType || filtreType === "Tous" || e.type_evangelisation === filtreType;
        return afterStart && beforeEnd && typeOk;
      });
      setFilteredEvangelises(filtered);

      // Rapports
      let query = supabase.from("rapport_evangelisation").select("*")
        .eq("eglise_id", egliseId)
        .in("evangelise_member_id", filtered.map(e => e.id))
        .order("date_evangelise", { ascending: false });
      if (startDate) query = query.gte("date_evangelise", startDate.toISOString());
      if (endDate) query = query.lte("date_evangelise", endDate.toISOString());
      const { data: rapportsData } = await query;
      setRapports(rapportsData || []);

      // Suivis
      const { data: suivisData } = await supabase.from("suivis_des_evangelises").select("*").eq("eglise_id", egliseId);
      const evangeliseIds = new Set(filtered.map(e => e.id));
      const filteredSuivisFinal = (suivisData || []).filter(s => {
        const d = s.date_suivi ? new Date(s.date_suivi) : null;
        const afterStart = !startDate || (d && d >= startDate);
        const beforeEnd = !endDate || (d && d <= endDate);
        const typeOk = !filtreType || filtreType === "Tous" || s.type_evangelisation === filtreType;
        return evangeliseIds.has(s.evangelise_id) && afterStart && beforeEnd && typeOk;
      });
      setFilteredSuivis(filteredSuivisFinal);

    } catch (err) {
      console.error("Erreur fetchRapports:", err);
    }
    setLoading(false);
  };

  useEffect(() => { if (egliseId && !modePerso) fetchRapports(false); }, [egliseId, filtrePeriode, filtreType, modePerso]);

  const handleSaveRapport = async (updated) => {
    await supabase.from("rapport_evangelisation").upsert(updated);
    fetchRapports();
    setMessage("✅ Rapport mis à jour !");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = (r) => { setSelectedRapport(r); setEditOpen(true); };

  const handleKpiClick = (status) => {
    const ids = filteredEvangelises.map(e => e.id);
    router.push({ pathname: "/SuiviAmesPage", query: { status: status || "all", ids: ids.join(",") } });
  };

  const typesDisponibles = [...new Set((allEvangelises || []).map(e => e.type_evangelisation).filter(Boolean))];

  const onglets = [
    { key: "kpi", label: "Vue d'ensemble" },
    { key: "sessions", label: "Par session" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-10">

        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord évangélisation</h1>
          <p className="text-white/50 text-sm mt-0.5">Suivi des activités — évangélisés, convertis, intégrés</p>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          {/* Toggle mode */}
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

          {/* Période rapide */}
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

          {/* Tranche personnalisée */}
          {modePerso && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de début</label>
                  <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de fin</label>
                  <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                </div>
              </div>
              <button onClick={() => fetchRapports(true)}
                className="w-full py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-white text-sm font-semibold transition active:scale-95">
                Générer le rapport
              </button>
            </div>
          )}

          {/* Filtre type */}
          {typesDisponibles.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">Type :</span>
              <button onClick={() => setFiltreType("")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${!filtreType ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                Tous
              </button>
              {typesDisponibles.map(t => (
                <button key={t} onClick={() => setFiltreType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filtreType === t ? "bg-white text-[#333699]" : "bg-white/15 text-white/70 hover:bg-white/20"}`}>
                  {t}
                </button>
              ))}
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
        ) : filteredEvangelises.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40 text-sm">
            Aucune donnée sur cette période
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">

            <div>
              <SectionTitle>Vue d'ensemble</SectionTitle>
              <BlocKpiGlobaux
                filteredEvangelises={filteredEvangelises}
                filteredSuivis={filteredSuivis}
                rapports={rapports}
                onKpiClick={handleKpiClick}
                onCelluleClick={() => router.push("/SuiviAmesPage?cellule=true")}
                onConseillerClick={() => router.push("/SuiviAmesPage?conseiller=true")}
              />
            </div>

            <div>
              <SectionTitle>Entonnoir de conversion</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocEntonnoir filteredEvangelises={filteredEvangelises} filteredSuivis={filteredSuivis} />
              </div>
            </div>

            <div>
              <SectionTitle>Tendance mensuelle</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocTendance filteredEvangelises={filteredEvangelises} />
              </div>
            </div>

            <div>
              <SectionTitle>Résultats par type d'évangélisation</SectionTitle>
              <BlocParType filteredEvangelises={filteredEvangelises} rapports={rapports} />
            </div>

          </div>

        ) : (
          <OngletSessions rapports={rapports} onEdit={handleEdit} />
        )}

        {message && <p className="text-center text-sm font-medium text-white/80 mt-2">{message}</p>}

      </div>

      {selectedRapport && (
        <EditEvanRapportLine
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          rapport={selectedRapport}
          onSave={handleSaveRapport}
        />
      )}

      <Footer />
    </div>
  );
}
