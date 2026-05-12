"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function RapportBesoinPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableSuivi"]}>
      <RapportBesoin />
    </ProtectedRoute>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function getMonthNameFR(monthIndex) {
  return ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";
}

// ─── UI ATOMS ──────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
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
      <p className="text-xs text-white/50">{label}</p>
      <p className={`text-2xl font-bold leading-none ${c[accent] || "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}
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
  "Finances":                  { bar: "bg-green-400",   dot: "bg-green-400",   badge: "green" },
  "Santé":                     { bar: "bg-red-400",     dot: "bg-red-400",     badge: "red" },
  "Travail / Études":          { bar: "bg-blue-400",    dot: "bg-blue-400",    badge: "blue" },
  "Famille / Enfants":         { bar: "bg-pink-400",    dot: "bg-pink-400",    badge: "pink" },
  "Relations / Conflits":      { bar: "bg-orange-400",  dot: "bg-orange-400",  badge: "orange" },
  "Addictions / Dépendances":  { bar: "bg-purple-400",  dot: "bg-purple-400",  badge: "gray" },
  "Guidance spirituelle":      { bar: "bg-indigo-400",  dot: "bg-indigo-400",  badge: "blue" },
  "Logement / Sécurité":       { bar: "bg-yellow-400",  dot: "bg-yellow-400",  badge: "yellow" },
  "Communauté / Isolement":    { bar: "bg-cyan-400",    dot: "bg-cyan-400",    badge: "blue" },
  "Dépression / Santé mentale":{ bar: "bg-rose-500",    dot: "bg-rose-500",    badge: "red" },
  "Autres":                    { bar: "bg-white/60",    dot: "bg-white/40",    badge: "gray" },
};
function getCfg(b) { return BESOIN_CONFIG[b] || BESOIN_CONFIG["Autres"]; }

// ─── BLOC KPI GLOBAUX ──────────────────────────────────────────
function BlocKpiGlobaux({ besoinsCount, totalMembres }) {
  const lignes = Object.entries(besoinsCount);
  const totalBesoins = lignes.reduce((a, [, v]) => a + v.total, 0);
  const totalResolus = lignes.reduce((a, [, v]) => a + v.resolu, 0);
  const totalEnSuivi = lignes.reduce((a, [, v]) => a + v.enSuivi, 0);
  const tauxResolution = totalBesoins > 0 ? Math.round((totalResolus / totalBesoins) * 100) : 0;
  const nbCategories = lignes.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Besoins exprimés" value={totalBesoins} sub="sur la période" accent="orange" />
        <KpiCard label="En suivi" value={totalEnSuivi} sub="à prendre en charge" accent="yellow" />
        <KpiCard label="Résolus" value={totalResolus} sub="cas traités" accent="green" />
        <KpiCard label="Taux résolution" value={`${tauxResolution}%`} sub="besoins résolus" accent="amber" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Catégories actives" value={nbCategories} sub="types de besoins" accent="blue" />
        <KpiCard
          label="% membres concernés"
          value={totalMembres > 0 ? `${((totalBesoins / totalMembres) * 100).toFixed(1)}%` : "—"}
          sub={`sur ${totalMembres} membres`}
          accent="white"
        />
      </div>
    </div>
  );
}

// ─── BLOC RÉPARTITION H/F ──────────────────────────────────────
function BlocGenre({ besoinsCount }) {
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
          <p className="text-2xl font-bold text-blue-300">{totalH}</p>
          <p className="text-[11px] text-blue-400/70">Hommes</p>
          <p className="text-[10px] text-blue-500/50">{pctH}%</p>
        </div>
        <div className="bg-pink-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-2xl font-bold text-pink-300">{totalF}</p>
          <p className="text-[11px] text-pink-400/70">Femmes</p>
          <p className="text-[10px] text-pink-500/50">{pctF}%</p>
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

// ─── BLOC STATUT (suivi vs résolu) ─────────────────────────────
function BlocStatut({ besoinsCount }) {
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
          <p className="text-2xl font-bold text-yellow-300">{totalEnSuivi}</p>
          <p className="text-[11px] text-yellow-400/70">En suivi</p>
          <p className="text-[10px] text-yellow-500/50">{pctSuivi}%</p>
        </div>
        <div className="bg-emerald-900/40 rounded-xl px-3 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-300">{totalResolu}</p>
          <p className="text-[11px] text-emerald-400/70">Résolus</p>
          <p className="text-[10px] text-emerald-500/50">{pctResolu}%</p>
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
function BlocClassement({ besoinsCount }) {
  const lignes = Object.entries(besoinsCount).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...lignes.map(([, v]) => v.total), 1);

  if (!lignes.length) return <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>;

  return (
    <div className="flex flex-col gap-2">
      {lignes.map(([besoin, data]) => {
        const cfg = getCfg(besoin);
        return (
          <div key={besoin} className="bg-white/10 rounded-xl px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-44 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <p className="text-sm text-white truncate">{besoin}</p>
              </div>
              <BarreProgression pct={(data.total / maxTotal) * 100} color={cfg.bar} />
              <p className="text-sm font-bold text-orange-300 w-8 text-right">{data.total}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Badge color="blue">H: {data.hommes}</Badge>
              <Badge color="pink">F: {data.femmes}</Badge>
              <Badge color="yellow">Suivi: {data.enSuivi}</Badge>
              <Badge color="green">Résolu: {data.resolu}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CARTE BESOIN (onglet détail, cliquable) ───────────────────
function CarteBesoin({ besoin, data, totalMembres, onNavigate }) {
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
          <span className="font-semibold text-white text-sm truncate">{besoin}</span>
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
              { label: "Hommes",      value: data.hommes,  color: "text-blue-300" },
              { label: "Femmes",      value: data.femmes,  color: "text-pink-300" },
              { label: "Total",       value: data.total,   color: "text-orange-300 font-bold" },
              { label: "En suivi",    value: data.enSuivi, color: "text-yellow-300" },
              { label: "Résolus",     value: data.resolu,  color: "text-emerald-300" },
              { label: "% résolution",value: `${pctResolu}%`, color: "text-amber-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/40">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40">Résolution :</span>
            <BarreProgression pct={pctResolu} />
            <span className="text-[11px] text-white/40">{pctResolu}%</span>
          </div>
          <p className="text-[11px] text-white/30 text-center">
            Concerne {pctMembres}% des membres
          </p>
          <button
            onClick={() => onNavigate(besoin)}
            className="w-full py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 text-sm font-semibold transition"
          >
            👥 Voir les membres concernés
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
function RapportBesoin() {
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

  // Chargement utilisateur
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
    setMessage("⏳ Chargement...");

    const isPerso = overrideModePerso !== null ? overrideModePerso : modePerso;

    try {
      // Membres
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

      // Suivis
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
          const label = typeof item === "string" ? item.trim() : item.label;
          const statut = typeof item === "string" ? null : item.statut;
          if (!label) return;
          if (!count[label]) count[label] = { total: 0, hommes: 0, femmes: 0, enSuivi: 0, resolu: 0 };
          count[label].total++;
          if (sexe === "hommes") count[label].hommes++;
          else count[label].femmes++;
          if (statut === "Résolu") count[label].resolu++;
          else count[label].enSuivi++;
        });
      });

      // Tri par total décroissant
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

  // Auto-fetch en mode période rapide
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
    { key: "kpi", label: "Vue d'ensemble" },
    { key: "detail", label: "Par besoin" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 sm:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* ─── EN-TÊTE ─── */}
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold mb-3 text-white">
            Rapport <span className="text-emerald-300">Difficultés & Besoins</span>
          </h1>
          <p className="italic text-base text-white/90 max-w-2xl mx-auto">
            Comprenez{" "}
            <span className="text-blue-300 font-semibold">les besoins réels de votre assemblée</span>.
            Identifiez les difficultés{" "}
            <span className="text-blue-300 font-semibold">exprimées par les membres</span>, observez
            les tendances et accompagnez chaque personne avec{" "}
            <span className="text-blue-300 font-semibold">discernement et un suivi adapté</span>.
          </p>
        </div>

        {/* ─── FILTRES ─── */}
        <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setModePerso(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                !modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
              }`}
            >
              Période rapide
            </button>
            <button
              onClick={() => setModePerso(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                modePerso ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
              }`}
            >
              Tranche de dates
            </button>
          </div>

          {!modePerso && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/50 flex-shrink-0">Période :</span>
              {[
                { label: "7 j", val: "7" }, { label: "30 j", val: "30" },
                { label: "90 j", val: "90" }, { label: "6 mois", val: "180" },
                { label: "1 an", val: "365" },
              ].map(p => (
                <button
                  key={p.val} onClick={() => setFiltrePeriode(p.val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    filtrePeriode === p.val
                      ? "bg-white text-[#333699]"
                      : "bg-white/15 text-white/70 hover:bg-white/20"
                  }`}
                >
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
                  <input
                    type="date" value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">Date de fin</label>
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
                Générer le rapport
              </button>
            </div>
          )}
        </div>

        {/* ─── ONGLETS ─── */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {onglets.map(o => (
            <button
              key={o.key} onClick={() => setOnglet(o.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                onglet === o.key ? "bg-white text-[#333699]" : "text-white/50 hover:text-white/80"
              }`}
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
            <p className="text-white/40 text-sm">
              {!egliseId ? "⏳ Chargement..." : "Sélectionnez une période pour afficher les données."}
            </p>
          </div>
        ) : !hasBesoins ? (
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">Aucun besoin enregistré sur cette période.</p>
          </div>
        ) : onglet === "kpi" ? (
          <div className="flex flex-col gap-7">
            <div>
              <SectionTitle>Vue d'ensemble</SectionTitle>
              <BlocKpiGlobaux besoinsCount={besoinsCount} totalMembres={totalMembres} />
            </div>

            <div>
              <SectionTitle>Répartition H / F</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocGenre besoinsCount={besoinsCount} />
              </div>
            </div>

            <div>
              <SectionTitle>Suivi vs Résolu</SectionTitle>
              <div className="bg-white/10 rounded-2xl px-4 py-4">
                <BlocStatut besoinsCount={besoinsCount} />
              </div>
            </div>

            <div>
              <SectionTitle>Classement par catégorie</SectionTitle>
              <BlocClassement besoinsCount={besoinsCount} />
            </div>
          </div>
        ) : (
          /* ─── PAR BESOIN ─── */
          <div className="flex flex-col gap-3">
            {Object.entries(besoinsCount).map(([besoin, data]) => (
              <CarteBesoin
                key={besoin}
                besoin={besoin}
                data={data}
                totalMembres={totalMembres}
                onNavigate={handleNavigate}
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
