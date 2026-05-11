"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useFeature } from "../../components/FeaturesContext";
import dynamic from "next/dynamic";

const Bar = dynamic(
  () => import("react-chartjs-2").then(async (mod) => {
    const {
      Chart, CategoryScale, LinearScale, BarElement,
      Title, Tooltip, Legend,
    } = await import("chart.js");
    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
    return mod.Bar;
  }),
  { ssr: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Constantes & helpers
// ─────────────────────────────────────────────────────────────────────────────

const ROLES_AUTORISES = [
  "Administrateur", "ResponsableSuivi", "SuperviseurCellule",
  "SuperviseurFamille", "ResponsableCellule", "ResponsableFamilles",
];

const fmtDate  = (d) => new Date(d).toLocaleDateString("fr-FR");
const fmtShort = (d) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

const formatSession = (typeTemps, numeroCulte) => {
  if (!typeTemps) return "Session";
  const n = numeroCulte || 1;
  const suffix = n === 1 ? "er" : "ème";
  if (typeTemps === "Culte") return `${n}${suffix} Culte`;
  if (typeTemps === "Temps de prière") return `${n}${suffix} Prière`;
  return numeroCulte ? `${typeTemps} n°${numeroCulte}` : typeTemps;
};

// Couleur selon taux (0–1)
const tauxStyle = (taux) => {
  if (taux >= 0.75) return { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-400/30", bar: "bg-emerald-400" };
  if (taux >= 0.5)  return { bg: "bg-yellow-500/15",  text: "text-yellow-300",  border: "border-yellow-400/30",  bar: "bg-yellow-400" };
  if (taux >= 0.25) return { bg: "bg-orange-500/15",  text: "text-orange-300",  border: "border-orange-400/30",  bar: "bg-orange-400" };
  return               { bg: "bg-red-500/15",      text: "text-red-300",     border: "border-red-400/30",     bar: "bg-red-400" };
};

// ─────────────────────────────────────────────────────────────────────────────
// Composants UI
// ─────────────────────────────────────────────────────────────────────────────

function TauxBar({ present, total }) {
  if (total === 0) return null;
  const taux = present / total;
  const pct  = Math.round(taux * 100);
  const col  = tauxStyle(taux);
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${col.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold ${col.text} w-10 text-right`}>{present}/{total}</span>
      <span className={`text-xs ${col.text} w-9 text-right`}>{pct}%</span>
    </div>
  );
}

function Avatar({ prenom, nom, sexe }) {
  const initiales = [(prenom || "?")[0], (nom || "?")[0]].join("").toUpperCase();
  const cls = sexe === "Homme"
    ? "bg-blue-500/25 text-blue-200"
    : sexe === "Femme"
    ? "bg-pink-500/25 text-pink-200"
    : "bg-white/10 text-white/50";
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${cls}`}>
      {initiales}
    </div>
  );
}

function MetricCard({ label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
        active
          ? "bg-white text-[#333699] border-white"
          : "border-white/25 text-white/60 hover:border-white/60 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function RapportPresencePage() {
  return (
    <ProtectedRoute allowedRoles={ROLES_AUTORISES}>
      <RapportPresence />
    </ProtectedRoute>
  );
}

function RapportPresence() {
  const cellulesActive = useFeature("cellules");
  const famillesActive = useFeature("familles");

  // ── profil utilisateur ──────────────────────────────────────────────────
  const [userProfile,  setUserProfile]  = useState(null);
  const [userRole,     setUserRole]     = useState(null);
  const [mesCellules,  setMesCellules]  = useState([]);
  const [mesFamilles,  setMesFamilles]  = useState([]);
  const [allCellules,  setAllCellules]  = useState([]);
  const [allFamilles,  setAllFamilles]  = useState([]);

  // ── filtres formulaire ──────────────────────────────────────────────────
  const [dateDebut,     setDateDebut]     = useState("");
  const [dateFin,       setDateFin]       = useState("");
  const [filterCellule, setFilterCellule] = useState("");
  const [filterFamille, setFilterFamille] = useState("");
  const [typeFilter,    setTypeFilter]    = useState("tous");

  // ── données brutes ──────────────────────────────────────────────────────
  const [sessions,      setSessions]      = useState([]); // attendance rows
  const [presencesRaw,  setPresencesRaw]  = useState([]); // { membre_id, attendance_id, statut, membre: {...} }
  const [allMembres,    setAllMembres]    = useState([]); // membres_complets hors supprimés
  const [totalRegistre, setTotalRegistre] = useState(0);

  // ── UI ──────────────────────────────────────────────────────────────────
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState("");
  const [activeTab, setActiveTab] = useState("evolution");
  const [suiviFilter, setSuiviFilter] = useState("tous");
  const [searchQuery,  setSearchQuery]  = useState("");

  // ── init : profil + listes ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, eglise_id")
        .eq("id", sess.session.user.id)
        .single();

      if (!profile) return;
      setUserProfile(profile);
      setUserRole(profile.role);
      const eid = profile.eglise_id;

      // Total registre (hors supprimés)
      const { count } = await supabase
        .from("membres_complets")
        .select("id", { count: "exact", head: true })
        .eq("eglise_id", eid)
        .neq("etat_contact", "supprime");
      setTotalRegistre(count || 0);

      // Tous les membres actifs
      const { data: membresData } = await supabase
        .from("membres_complets")
        .select("id, nom, prenom, sexe, age, cellule_id, famille_id, etat_contact")
        .eq("eglise_id", eid)
        .neq("etat_contact", "supprime");
      setAllMembres(membresData || []);

      // Cellules
      if (cellulesActive) {
        const { data: ce } = await supabase
          .from("cellules")
          .select("id, cellule, cellule_full, responsable_id, superviseur_id")
          .eq("eglise_id", eid);
        setAllCellules(ce || []);
        const uid = profile.id;
        if (profile.role === "ResponsableCellule") {
          setMesCellules((ce || []).filter(c => c.responsable_id === uid));
        } else if (["SuperviseurCellule", "SuperviseurFamille"].includes(profile.role)) {
          setMesCellules((ce || []).filter(c => c.superviseur_id === uid));
        }
      }

      // Familles
      if (famillesActive) {
        const { data: fa } = await supabase
          .from("familles")
          .select("id, famille, famille_full, responsable_id")
          .eq("eglise_id", eid);
        setAllFamilles(fa || []);
        if (profile.role === "ResponsableFamilles") {
          const mine = (fa || []).filter(f => f.responsable_id === profile.id);
          setMesFamilles(mine);
          if (mine.length === 1) setFilterFamille(mine[0].id);
        }
      }
    })();
  }, [cellulesActive, famillesActive]);

  // ── sélecteurs selon rôle ───────────────────────────────────────────────
  const cellulesSelect = useMemo(() => {
    if (["ResponsableCellule", "SuperviseurCellule", "SuperviseurFamille"].includes(userRole)) return mesCellules;
    return allCellules;
  }, [userRole, mesCellules, allCellules]);

  const famillesSelect = useMemo(() => {
    if (userRole === "ResponsableFamilles") return mesFamilles;
    return allFamilles;
  }, [userRole, mesFamilles, allFamilles]);

  const showCelluleSelect = cellulesActive && !["ResponsableFamilles"].includes(userRole);
  const showFamilleSelect = famillesActive && !["ResponsableCellule", "SuperviseurCellule"].includes(userRole);

  // ── membres autorisés selon rôle ────────────────────────────────────────
  const membresAutorises = useMemo(() => {
    if (userRole === "ResponsableCellule" && mesCellules.length > 0) {
      const ids = new Set(mesCellules.map(c => c.id));
      return allMembres.filter(m => ids.has(m.cellule_id));
    }
    if (userRole === "ResponsableFamilles" && mesFamilles.length > 0) {
      const ids = new Set(mesFamilles.map(f => f.id));
      return allMembres.filter(m => ids.has(m.famille_id));
    }
    if (["SuperviseurCellule", "SuperviseurFamille"].includes(userRole) && mesCellules.length > 0) {
      const ids = new Set(mesCellules.map(c => c.id));
      return allMembres.filter(m => ids.has(m.cellule_id));
    }
    return allMembres;
  }, [userRole, mesCellules, mesFamilles, allMembres]);

  // ── fetch rapport ───────────────────────────────────────────────────────
  const fetchRapport = async () => {
    if (!userProfile?.eglise_id) return;
    setLoading(true);
    setMessage("⏳ Chargement...");
    setSessions([]);
    setPresencesRaw([]);
    setActiveTab("evolution");
    setSuiviFilter("tous");
    setSearchQuery("");

    try {
      const eid = userProfile.eglise_id;

      // 1. Sessions sur la période
      let aq = supabase
        .from("attendance")
        .select(`id, date, "typeTemps", numero_culte`)
        .eq("eglise_id", eid)
        .order("date", { ascending: true });
      if (dateDebut) aq = aq.gte("date", dateDebut);
      if (dateFin)   aq = aq.lte("date", dateFin);
      const { data: sessData, error: sessErr } = await aq;
      if (sessErr) throw sessErr;
      if (!sessData?.length) { setMessage("Aucune session sur cette période."); setLoading(false); return; }
      setSessions(sessData);

      // 2. Toutes les lignes de présence pour ces sessions
      //    (présent ET absent — les deux sont enregistrés)
      const attIds = sessData.map(s => s.id);
      const { data: pData, error: pErr } = await supabase
        .from("presences")
        .select(`
          id,
          membre_id,
          attendance_id,
          statut,
          membres_complets (
            id, nom, prenom, sexe, age,
            cellule_id, famille_id, etat_contact
          )
        `)
        .in("attendance_id", attIds);
      if (pErr) throw pErr;

      // Dédupliquer (membre × session) et exclure les supprimés
      const seen = new Set();
      const deduped = (pData || []).filter(p => {
        if (p.membres_complets?.etat_contact === "supprime") return false;
        const key = `${p.membre_id}|${p.attendance_id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setPresencesRaw(deduped);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasData = sessions.length > 0;

  // ── sessions filtrées par type ──────────────────────────────────────────
  const sessionsFiltrees = useMemo(() => {
    let s = sessions;
    if (filterCellule || filterFamille) {
      // On ne filtre pas les sessions, seulement les présences
    }
    if (typeFilter !== "tous") s = s.filter(x => x["typeTemps"] === typeFilter);
    return s;
  }, [sessions, typeFilter, filterCellule, filterFamille]);

  const typesDisponibles = useMemo(() => {
    return [...new Set(sessions.map(s => s["typeTemps"]).filter(Boolean))];
  }, [sessions]);

  // ── présences filtrées (cellule/famille + type session) ─────────────────
  const presencesFiltrees = useMemo(() => {
    const sessIds = new Set(sessionsFiltrees.map(s => s.id));
    let src = presencesRaw.filter(p => sessIds.has(p.attendance_id));

    if (cellulesActive && filterCellule) {
      src = src.filter(p => p.membres_complets?.cellule_id === filterCellule);
    } else if (famillesActive && filterFamille) {
      src = src.filter(p => p.membres_complets?.famille_id === filterFamille);
    } else if (userRole === "ResponsableCellule" && mesCellules.length > 0) {
      const ids = new Set(mesCellules.map(c => c.id));
      src = src.filter(p => ids.has(p.membres_complets?.cellule_id));
    } else if (userRole === "ResponsableFamilles" && mesFamilles.length > 0) {
      const ids = new Set(mesFamilles.map(f => f.id));
      src = src.filter(p => ids.has(p.membres_complets?.famille_id));
    } else if (["SuperviseurCellule", "SuperviseurFamille"].includes(userRole) && mesCellules.length > 0) {
      const ids = new Set(mesCellules.map(c => c.id));
      src = src.filter(p => ids.has(p.membres_complets?.cellule_id));
    }
    return src;
  }, [presencesRaw, sessionsFiltrees, filterCellule, filterFamille, userRole, mesCellules, mesFamilles, cellulesActive, famillesActive]);

  // ── métriques globales ──────────────────────────────────────────────────
  // Nombre total de membres du périmètre (selon rôle + filtre)
  const nbMembresPerimetre = useMemo(() => {
    if (cellulesActive && filterCellule) {
      return allMembres.filter(m => m.cellule_id === filterCellule).length;
    }
    if (famillesActive && filterFamille) {
      return allMembres.filter(m => m.famille_id === filterFamille).length;
    }
    return membresAutorises.length || totalRegistre;
  }, [filterCellule, filterFamille, allMembres, membresAutorises, totalRegistre, cellulesActive, famillesActive]);

  // Présents uniques sur toute la période
  const presentsUniques = useMemo(() => {
    const ids = new Set(
      presencesFiltrees.filter(p => p.statut === "present").map(p => p.membre_id)
    );
    return ids.size;
  }, [presencesFiltrees]);

  // Absents sur TOUTES les sessions (jamais présent)
  const absentsTotal = useMemo(() => {
    const presentIds = new Set(
      presencesFiltrees.filter(p => p.statut === "present").map(p => p.membre_id)
    );
    return nbMembresPerimetre - presentsUniques;
  }, [presencesFiltrees, nbMembresPerimetre, presentsUniques]);

  const totalPresences = presencesFiltrees.filter(p => p.statut === "present").length;
  const nbSessions     = sessionsFiltrees.length;
  const tauxMoyen      = nbSessions > 0 && nbMembresPerimetre > 0
    ? Math.round((totalPresences / (nbSessions * nbMembresPerimetre)) * 100)
    : 0;

  // ── données par session (tableau + graphique) ───────────────────────────
  const sessionStats = useMemo(() => {
    const map = {};
    sessionsFiltrees.forEach(s => {
      map[s.id] = {
        id: s.id, date: s.date,
        typeTemps: s["typeTemps"], numero_culte: s.numero_culte,
        presents: 0, absents: 0,
        hommes: 0, femmes: 0,
      };
    });
    presencesFiltrees.forEach(p => {
      if (!map[p.attendance_id]) return;
      if (p.statut === "present") {
        map[p.attendance_id].presents++;
        const sexe = p.membres_complets?.sexe;
        if (sexe === "Homme") map[p.attendance_id].hommes++;
        else if (sexe === "Femme") map[p.attendance_id].femmes++;
      } else {
        map[p.attendance_id].absents++;
      }
    });
    // Les membres du périmètre non listés dans presences = absents non enregistrés
    Object.values(map).forEach(s => {
      const totalEnregistres = s.presents + s.absents;
      s.nonEnregistres = Math.max(0, nbMembresPerimetre - totalEnregistres);
      s.absentsTotal   = s.absents + s.nonEnregistres;
      s.taux           = nbMembresPerimetre > 0 ? Math.round((s.presents / nbMembresPerimetre) * 100) : 0;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [sessionsFiltrees, presencesFiltrees, nbMembresPerimetre]);

  // ── suivi pastoral ──────────────────────────────────────────────────────
  // Un rapport par membre du périmètre, avec son historique de présence
  const suiviParMembre = useMemo(() => {
    if (!hasData || nbSessions === 0) return [];

    const sessIds = new Set(sessionsFiltrees.map(s => s.id));

    // Map présences par membre
    const presMap = {};
    presencesFiltrees.forEach(p => {
      if (!sessIds.has(p.attendance_id)) return;
      const id = p.membre_id;
      if (!presMap[id]) presMap[id] = { sessions_presentes: [], sessions_absentes: [] };
      if (p.statut === "present") presMap[id].sessions_presentes.push(p.attendance_id);
      else presMap[id].sessions_absentes.push(p.attendance_id);
    });

    const sessionMap = {};
    sessionsFiltrees.forEach(s => { sessionMap[s.id] = s; });

    // Périmètre membres
    let perimetreIds;
    if (cellulesActive && filterCellule) {
      perimetreIds = allMembres.filter(m => m.cellule_id === filterCellule).map(m => m.id);
    } else if (famillesActive && filterFamille) {
      perimetreIds = allMembres.filter(m => m.famille_id === filterFamille).map(m => m.id);
    } else {
      perimetreIds = membresAutorises.map(m => m.id);
    }

    const membreMap = {};
    allMembres.forEach(m => { membreMap[m.id] = m; });

    return perimetreIds.map(id => {
      const m = membreMap[id] || {};
      const data = presMap[id] || { sessions_presentes: [], sessions_absentes: [] };
      const nbPresent = data.sessions_presentes.length;
      const taux = nbSessions > 0 ? nbPresent / nbSessions : 0;

      const sessionsDetail = sessionsFiltrees.map(s => ({
        id: s.id,
        date: s.date,
        label: formatSession(s["typeTemps"], s.numero_culte),
        present: data.sessions_presentes.includes(s.id),
      }));

      return {
        id, nom: m.nom, prenom: m.prenom, sexe: m.sexe,
        cellule_id: m.cellule_id, famille_id: m.famille_id,
        nbPresent, nbSessions, taux, sessionsDetail,
      };
    }).sort((a, b) => {
      if (a.taux !== b.taux) return a.taux - b.taux;
      return `${a.nom}${a.prenom}`.localeCompare(`${b.nom}${b.prenom}`);
    });
  }, [hasData, nbSessions, sessionsFiltrees, presencesFiltrees, membresAutorises, allMembres, filterCellule, filterFamille, cellulesActive, famillesActive]);

  const nbPresentsTotaux = suiviParMembre.filter(m => m.nbPresent === m.nbSessions && m.nbSessions > 0).length;
  const nbPresentsPartiel = suiviParMembre.filter(m => m.nbPresent > 0 && m.nbPresent < m.nbSessions).length;
  const nbAbsentsTotaux  = suiviParMembre.filter(m => m.nbPresent === 0).length;

  // ── données graphique évolution ─────────────────────────────────────────
  const isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const tcColor = isDark ? "#b4b2a9" : "#6b7280";
  const gcColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  const barData = {
    labels: sessionStats.map(s => `${fmtShort(s.date)} · ${formatSession(s.typeTemps, s.numero_culte)}`),
    datasets: [
      {
        label: "Présents",
        data: sessionStats.map(s => s.presents),
        backgroundColor: "rgba(52,211,153,0.5)",
        borderColor: "#34d399",
        borderWidth: 1,
      },
      {
        label: "Absents",
        data: sessionStats.map(s => s.absentsTotal),
        backgroundColor: "rgba(248,113,113,0.4)",
        borderColor: "#f87171",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          footer: (items) => {
            const total = items.reduce((s, i) => s + i.raw, 0);
            return `Total registre : ${total}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: tcColor, font: { size: 11 }, maxRotation: 40, autoSkip: false },
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: Math.max(nbMembresPerimetre + 2, 10),
        ticks: { color: tcColor, font: { size: 11 }, stepSize: Math.ceil(nbMembresPerimetre / 5) || 10 },
        grid: { color: gcColor },
        title: { display: true, text: "Membres", color: tcColor, font: { size: 11 } },
      },
    },
  };

  // ── répartition par sexe ────────────────────────────────────────────────
  const repartitionSexe = useMemo(() => {
    const presentIds = new Set(presencesFiltrees.filter(p => p.statut === "present").map(p => p.membre_id));
    const counts = { H_pres: 0, H_abs: 0, F_pres: 0, F_abs: 0, N_pres: 0, N_abs: 0 };
    allMembres.filter(m => {
      if (cellulesActive && filterCellule) return m.cellule_id === filterCellule;
      if (famillesActive && filterFamille) return m.famille_id === filterFamille;
      return membresAutorises.some(ma => ma.id === m.id);
    }).forEach(m => {
      const est_present = presentIds.has(m.id);
      if (m.sexe === "Homme") est_present ? counts.H_pres++ : counts.H_abs++;
      else if (m.sexe === "Femme") est_present ? counts.F_pres++ : counts.F_abs++;
      else est_present ? counts.N_pres++ : counts.N_abs++;
    });
    return counts;
  }, [presencesFiltrees, allMembres, membresAutorises, filterCellule, filterFamille, cellulesActive, famillesActive]);

  const sexeBarData = {
    labels: ["Hommes", "Femmes", "Non renseigné"],
    datasets: [
      {
        label: "Présents",
        data: [repartitionSexe.H_pres, repartitionSexe.F_pres, repartitionSexe.N_pres],
        backgroundColor: "rgba(52,211,153,0.5)",
        borderColor: "#34d399",
        borderWidth: 1,
      },
      {
        label: "Absents",
        data: [repartitionSexe.H_abs, repartitionSexe.F_abs, repartitionSexe.N_abs],
        backgroundColor: "rgba(248,113,113,0.4)",
        borderColor: "#f87171",
        borderWidth: 1,
      },
    ],
  };

  const sexeBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { stacked: true, ticks: { color: tcColor, font: { size: 12 } }, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, ticks: { color: tcColor, font: { size: 11 } }, grid: { color: gcColor } },
    },
  };

  // ── suivi — liste filtrée + recherche ───────────────────────────────────
  const suiviAffiche = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return suiviParMembre.filter(m => {
      const nom = `${m.prenom || ""} ${m.nom || ""}`.toLowerCase();
      if (q && !nom.includes(q)) return false;
      if (suiviFilter === "present") return m.nbPresent === m.nbSessions && m.nbSessions > 0;
      if (suiviFilter === "partiel") return m.nbPresent > 0 && m.nbPresent < m.nbSessions;
      if (suiviFilter === "absent")  return m.nbPresent === 0;
      return true;
    });
  }, [suiviParMembre, suiviFilter, searchQuery]);

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-1 text-center text-white">
        Rapport <span className="text-emerald-300">Présences</span>
      </h1>
      <p className="text-sm text-white/60 mb-6 text-center italic">
        Suivre chaque membre · personne ne doit se perdre
      </p>

      {/* ── FORMULAIRE ── */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 w-full max-w-2xl mb-6 text-white">
        <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider text-center mb-4">Définir la période</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Date de début</label>
            <input
              type="date" value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="border border-white/30 rounded-lg px-3 py-2 bg-transparent text-white focus:outline-none focus:border-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Date de fin</label>
            <input
              type="date" value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="border border-white/30 rounded-lg px-3 py-2 bg-transparent text-white focus:outline-none focus:border-white"
            />
          </div>
        </div>

        <button
          onClick={fetchRapport}
          disabled={loading}
          className="w-full h-10 bg-amber-300 hover:bg-amber-400 text-[#333699] font-semibold rounded-lg transition disabled:opacity-60"
        >
          {loading ? "⏳ Chargement..." : "Générer le rapport"}
        </button>

        {/* Filtres secondaires */}
        {hasData && (showCelluleSelect || showFamilleSelect) && (
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap gap-3 items-end">
            {showCelluleSelect && cellulesSelect.length > 1 && (
              <div className="flex flex-col flex-1 min-w-[150px] gap-1">
                <label className="text-xs text-white/50">Cellule</label>
                <select
                  value={filterCellule}
                  onChange={e => { setFilterCellule(e.target.value); setFilterFamille(""); }}
                  className="border border-white/30 rounded-lg px-3 py-1.5 bg-white text-gray-800 text-sm"
                >
                  <option value="">Toutes les cellules</option>
                  {cellulesSelect.map(c => (
                    <option key={c.id} value={c.id}>{c.cellule_full || c.cellule}</option>
                  ))}
                </select>
              </div>
            )}
            {showFamilleSelect && famillesSelect.length > 1 && (
              <div className="flex flex-col flex-1 min-w-[150px] gap-1">
                <label className="text-xs text-white/50">Famille</label>
                <select
                  value={filterFamille}
                  onChange={e => { setFilterFamille(e.target.value); setFilterCellule(""); }}
                  className="border border-white/30 rounded-lg px-3 py-1.5 bg-white text-gray-800 text-sm"
                >
                  <option value="">Toutes les familles</option>
                  {famillesSelect.map(f => (
                    <option key={f.id} value={f.id}>{f.famille_full || f.famille}</option>
                  ))}
                </select>
              </div>
            )}
            {(filterCellule || filterFamille) && (
              <button
                onClick={() => { setFilterCellule(""); setFilterFamille(""); }}
                className="text-xs text-white/40 hover:text-white border border-white/15 rounded-lg px-3 py-1.5 self-end"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {message && <p className="text-white mb-4 text-center text-sm">{message}</p>}

      {hasData && (
        <div className="w-full max-w-4xl">

          {/* ── MÉTRIQUES ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <MetricCard label="Registre" value={nbMembresPerimetre} sub="membres actifs" />
            <MetricCard label="Sessions" value={nbSessions} sub="sur la période" color="text-amber-300" />
            <MetricCard label="Présences cumulées" value={totalPresences} sub="toutes sessions" color="text-emerald-300" />
            <MetricCard label="Membres présents ≥1×" value={presentsUniques} sub={`${Math.round((presentsUniques / nbMembresPerimetre) * 100)}% du registre`} color="text-cyan-300" />
            <MetricCard label="Taux moyen" value={`${tauxMoyen}%`} sub="par session" color={tauxMoyen >= 75 ? "text-emerald-300" : tauxMoyen >= 50 ? "text-yellow-300" : "text-red-300"} />
          </div>

          {/* ── FILTRE TYPE SESSION ── */}
          {typesDisponibles.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-4 items-center">
              <span className="text-xs text-white/40">Type :</span>
              {["tous", ...typesDisponibles].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${
                    typeFilter === t
                      ? "bg-white/20 border-white/60 text-white"
                      : "border-white/20 text-white/50 hover:border-white/40"
                  }`}
                >
                  {t === "tous" ? "Tous" : t}
                  {t !== "tous" && <span className="ml-1 text-white/30">({sessions.filter(s => s["typeTemps"] === t).length})</span>}
                </button>
              ))}
            </div>
          )}

          {/* ── ONGLETS ── */}
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { key: "evolution",   label: "Évolution" },
              { key: "repartition", label: "Répartition" },
              { key: "tableau",     label: "Tableau" },
              { key: "suivi",       label: "Suivi pastoral" },
            ].map(({ key, label }) => (
              <TabBtn key={key} label={label} active={activeTab === key} onClick={() => setActiveTab(key)} />
            ))}
          </div>

          {/* ── ÉVOLUTION ── */}
          {activeTab === "evolution" && (
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
              <p className="text-white font-semibold mb-1">Présents vs absents par session</p>
              <p className="text-white/40 text-xs mb-4">
                Chaque barre = une session · vert = présents · rouge = absents · total = {nbMembresPerimetre} membres
              </p>
              <div className="flex gap-4 flex-wrap text-xs text-white/60 mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-400/60 inline-block" />Présents
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-400/60 inline-block" />Absents
                </span>
              </div>
              <div style={{ height: Math.max(220, sessionStats.length * 60) }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          )}

          {/* ── RÉPARTITION ── */}
          {activeTab === "repartition" && (
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
              <p className="text-white font-semibold mb-1">Présents vs absents par sexe</p>
              <p className="text-white/40 text-xs mb-4">
                Sur toute la période · membres uniques ayant été présents au moins une fois
              </p>
              <div className="flex gap-4 flex-wrap text-xs text-white/60 mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-400/60 inline-block" />Présents ≥1 session
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-400/60 inline-block" />Jamais présents
                </span>
              </div>
              <div style={{ height: 240 }}>
                <Bar data={sexeBarData} options={sexeBarOptions} />
              </div>

              {/* Résumé chiffré */}
              <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                {[
                  { label: "Hommes présents", val: repartitionSexe.H_pres, total: repartitionSexe.H_pres + repartitionSexe.H_abs },
                  { label: "Femmes présentes", val: repartitionSexe.F_pres, total: repartitionSexe.F_pres + repartitionSexe.F_abs },
                  { label: "Non renseigné", val: repartitionSexe.N_pres, total: repartitionSexe.N_pres + repartitionSexe.N_abs },
                ].map(({ label, val, total }) => (
                  <div key={label} className="text-center">
                    <p className="text-white/40 text-xs mb-1">{label}</p>
                    <p className="text-emerald-300 font-semibold">{val} <span className="text-white/30 font-normal">/ {total}</span></p>
                    <p className="text-white/30 text-xs">{total > 0 ? Math.round(val / total * 100) : 0}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TABLEAU ── */}
          {activeTab === "tableau" && (
            <div className="overflow-x-auto rounded-2xl border border-white/15">
              <table className="w-full text-sm text-white text-left">
                <thead>
                  <tr className="bg-white/10">
                    {["Date", "Session", "Présents", "Absents", "H", "F", "Taux", "Registre"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-xs text-white/50 uppercase tracking-wider font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessionStats.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-white/30 text-sm">Aucune donnée</td></tr>
                  ) : sessionStats.map((s, i) => {
                    const col = tauxStyle(s.taux / 100);
                    const prev = i > 0 ? sessionStats[i - 1] : null;
                    const diff = prev ? s.presents - prev.presents : null;
                    return (
                      <tr key={s.id} className="border-t border-white/10 hover:bg-white/5 transition">
                        <td className="px-3 py-2.5 text-white/80">{fmtDate(s.date)}</td>
                        <td className="px-3 py-2.5 text-white/50 text-xs">{formatSession(s.typeTemps, s.numero_culte)}</td>
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-emerald-400">{s.presents}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-red-400">{s.absentsTotal}</span>
                        </td>
                        <td className="px-3 py-2.5 text-blue-300">{s.hommes}</td>
                        <td className="px-3 py-2.5 text-pink-300">{s.femmes}</td>
                        <td className="px-3 py-2.5">
                          <span className={`font-semibold ${col.text}`}>{s.taux}%</span>
                        </td>
                        <td className="px-3 py-2.5 text-white/30 text-xs">
                          {nbMembresPerimetre}
                          {diff !== null && (
                            <span className={`ml-1 ${diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-white/20"}`}>
                              {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "="}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {sessionStats.length > 1 && (
                  <tfoot>
                    <tr className="border-t border-white/20 bg-white/5">
                      <td colSpan={2} className="px-3 py-2 text-xs text-white/40 font-medium">Moyenne</td>
                      <td className="px-3 py-2 text-emerald-300 font-semibold text-sm">
                        {Math.round(sessionStats.reduce((s, r) => s + r.presents, 0) / sessionStats.length)}
                      </td>
                      <td className="px-3 py-2 text-red-300 font-semibold text-sm">
                        {Math.round(sessionStats.reduce((s, r) => s + r.absentsTotal, 0) / sessionStats.length)}
                      </td>
                      <td colSpan={2} />
                      <td className="px-3 py-2 text-white/60 font-semibold text-sm">{tauxMoyen}%</td>
                      <td className="px-3 py-2 text-white/30 text-xs">{nbMembresPerimetre}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* ── SUIVI PASTORAL ── */}
          {activeTab === "suivi" && (
            <div className="flex flex-col gap-4">

              {/* Alerte absents */}
              {nbAbsentsTotaux > 0 && (
                <div className="border-l-4 border-red-400 bg-red-500/10 rounded-r-xl px-4 py-3 text-sm text-red-200">
                  <span className="font-semibold">{nbAbsentsTotaux} membre{nbAbsentsTotaux > 1 ? "s" : ""} absent{nbAbsentsTotaux > 1 ? "s" : ""} sur toute la période</span>
                  {" "}— visite pastorale recommandée.
                </div>
              )}

              {/* Résumé 3 blocs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-500/15 border border-emerald-400/30 rounded-xl p-3 text-center">
                  <p className="text-emerald-300 text-2xl font-semibold">{nbPresentsTotaux}</p>
                  <p className="text-emerald-400/60 text-xs mt-0.5">Toutes sessions ✓</p>
                </div>
                <div className="bg-yellow-500/15 border border-yellow-400/30 rounded-xl p-3 text-center">
                  <p className="text-yellow-300 text-2xl font-semibold">{nbPresentsPartiel}</p>
                  <p className="text-yellow-400/60 text-xs mt-0.5">Présence partielle</p>
                </div>
                <div className="bg-red-500/15 border border-red-400/30 rounded-xl p-3 text-center">
                  <p className="text-red-300 text-2xl font-semibold">{nbAbsentsTotaux}</p>
                  <p className="text-red-400/60 text-xs mt-0.5">Absents totaux</p>
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs text-white/40">Filtrer :</span>
                {[
                  { key: "tous",    label: `Tous (${suiviParMembre.length})` },
                  { key: "absent",  label: `Absents (${nbAbsentsTotaux})` },
                  { key: "partiel", label: `Partiels (${nbPresentsPartiel})` },
                  { key: "present", label: `Complets (${nbPresentsTotaux})` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSuiviFilter(key)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      suiviFilter === key
                        ? "bg-white/20 border-white/60 text-white"
                        : "border-white/20 text-white/50 hover:border-white/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Recherche */}
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un membre..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/50"
              />

              {/* Sessions de la période */}
              {sessionsFiltrees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sessionsFiltrees.map((s, i) => (
                    <span key={i} className="text-xs bg-white/10 border border-white/15 text-white/50 px-3 py-1 rounded-full">
                      {fmtDate(s.date)} · {formatSession(s["typeTemps"], s.numero_culte)}
                    </span>
                  ))}
                </div>
              )}

              {/* Liste membres */}
              <div className="flex flex-col gap-2">
                {suiviAffiche.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-white/30 text-sm">
                    Aucun membre trouvé.
                  </div>
                ) : suiviAffiche.map(membre => {
                  const col = tauxStyle(membre.taux);
                  const nomComplet = [membre.prenom, membre.nom].filter(Boolean).join(" ") || "Inconnu";
                  const sexeLbl = membre.sexe === "Homme" ? "Homme" : membre.sexe === "Femme" ? "Femme" : "—";
                  return (
                    <div
                      key={membre.id}
                      className={`bg-white/5 hover:bg-white/8 border ${col.border} rounded-xl px-4 py-3 flex items-start gap-3 transition`}
                    >
                      <Avatar prenom={membre.prenom} nom={membre.nom} sexe={membre.sexe} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium text-sm">{nomComplet}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            membre.sexe === "Homme" ? "bg-blue-500/20 text-blue-300"
                            : membre.sexe === "Femme" ? "bg-pink-500/20 text-pink-300"
                            : "bg-white/10 text-white/40"
                          }`}>{sexeLbl}</span>
                        </div>
                        <TauxBar present={membre.nbPresent} total={membre.nbSessions} />
                        {/* Sessions détail */}
                        {membre.sessionsDetail.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {membre.sessionsDetail.map((s, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-0.5 rounded-full border ${
                                  s.present
                                    ? "bg-emerald-500/15 border-emerald-400/20 text-emerald-300"
                                    : "bg-red-500/10 border-red-400/15 text-red-400/60"
                                }`}
                              >
                                {s.present ? "✓" : "✗"} {fmtShort(s.date)} · {s.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {membre.nbPresent === 0 && (
                          <p className="text-red-400/60 text-xs mt-1">
                            Absent sur toute la période — visite pastorale recommandée
                          </p>
                        )}
                      </div>
                      <div className={`flex-shrink-0 text-right px-2 py-1 rounded-lg ${col.bg}`}>
                        <p className={`text-sm font-semibold ${col.text}`}>{membre.nbPresent}/{membre.nbSessions}</p>
                        <p className={`text-xs ${col.text}`}>{Math.round(membre.taux * 100)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      <Footer />
    </div>
  );
}
