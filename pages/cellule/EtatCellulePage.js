"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import DetailsEtatConsEvangePopup from "../../components/DetailsEtatConsEvangePopup";
import EditMemberCellulePopup from "../../components/EditMemberCellulePopup";
import DetailsEtatConseillerPopup from "../../components/DetailsEtatConseillerPopup";

// ─────────────────────────────────────────────
// ATOMES RÉUTILISABLES (copie locale, identiques aux autres pages)
// ─────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h2 className="text-base font-semibold text-white/60 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

function KpiCard({ label, value, sub, color = "bg-white/10", onClick }) {
  const base =
    "p-4 rounded-2xl text-white text-center flex flex-col gap-1 transition";
  return (
    <div
      className={`${base} ${color} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </div>
      {sub !== undefined && (
        <div className="text-sm font-semibold opacity-90">{sub}</div>
      )}
    </div>
  );
}

function Badge({ label, color }) {
  const map = {
    green: "bg-green-500/20 text-green-300 border border-green-500/30",
    red: "bg-red-500/20 text-red-300 border border-red-500/30",
    orange: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    gray: "bg-white/10 text-white/50 border border-white/10",
    blue: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  };
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${map[color] || map.gray}`}
    >
      {label}
    </span>
  );
}

function TogglePeriode({ active, onChange }) {
  const options = [
    { label: "7j", value: 7 },
    { label: "30j", value: 30 },
    { label: "90j", value: 90 },
    { label: "6 mois", value: 180 },
    { label: "1 an", value: 365 },
  ];
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            active === o.value
              ? "bg-white text-[#333699]"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────

export default function EtatCellulePage() {
  return (
    <ProtectedRoute
      allowedRoles={["Administrateur", "SuperviseurCellule", "ResponsableCellule"]}
    >
      <EtatCellule />
    </ProtectedRoute>
  );
}

function EtatCellule() {
  const router = useRouter();

  // ── State ──
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [selectedEvangelise, setSelectedEvangelise] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Filtres
  const [modeFiltre, setModeFiltre] = useState("rapide"); // "rapide" | "tranche"
  const [periodeDays, setPeriodeDays] = useState(30);
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [filterCellule, setFilterCellule] = useState("");

  const [showTable, setShowTable] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [Cellules, setCellules] = useState([]);
  const [activeTab, setActiveTab] = useState("tableau"); // "tableau" | "synthese"

  const [kpis, setKpis] = useState({
    totalEvangelises: 0,
    totalVenus: 0,
    totalIntegration: 0,
    totalBapteme: 0,
    totalMinistere: 0,
    totalRefus: 0,
    totalEncours: 0,
    totalAttente: 0,
  });

  // ── Init ──
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const userRes = await supabase.auth.getUser();
    const user = userRes.data?.user;
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) return console.error("Erreur fetch user profile:", error);
    setUserProfile(data);
  };

  // ── Calcul des bornes selon le mode ──
  const getDateBornes = () => {
    if (modeFiltre === "rapide") {
      const fin = new Date();
      const debut = new Date();
      debut.setDate(debut.getDate() - periodeDays);
      return {
        debut: debut.toISOString().split("T")[0],
        fin: fin.toISOString().split("T")[0],
      };
    }
    return { debut: filterDebut, fin: filterFin };
  };

  // ── Fetch principal ──
  const fetchReports = async () => {
    if (!userProfile) return;
    setShowTable(false);

    const { debut, fin } = getDateBornes();

    try {
      let query = supabase
        .from("vue_flow_personnes")
        .select("*")
        .eq("eglise_id", userProfile.eglise_id)
        .order("date_depart", { ascending: false });

      if (!userProfile.roles?.includes("Administrateur")) {
        query = query.ilike("responsable", `%${userProfile.prenom}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data;
      if (debut) filtered = filtered.filter((r) => new Date(r.date_depart) >= new Date(debut));
      if (fin) filtered = filtered.filter((r) => new Date(r.date_depart) <= new Date(fin));

      const cellulesDisponibles = Array.from(
        new Set(filtered.map((r) => r.cellule_full))
      ).sort();
      setCellules(cellulesDisponibles.map((c) => ({ id: c, cellule_full: c })));

      setAllReports(filtered);
      setReports(filtered);
      updateKpis(filtered);
      setFilterCellule("");
      setShowTable(true);
    } catch (err) {
      console.error("Erreur fetch:", err);
      setAllReports([]);
      setReports([]);
      setCellules([]);
      setShowTable(false);
    }
  };

  // ── Filtre cellule réactif ──
  useEffect(() => {
    if (!showTable) return;
    const filtered = filterCellule
      ? allReports.filter((r) =>
          r.cellule_full?.toLowerCase().includes(filterCellule.toLowerCase())
        )
      : allReports;
    setReports(filtered);
    updateKpis(filtered);
  }, [filterCellule, showTable]);

  // ── KPIs ──
  const updateKpis = (filtered) => {
    const normalize = (text) =>
      text
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "";

    setKpis({
      totalEvangelises: filtered.filter((r) =>
        [
          "individuel",
          "sortie de groupe",
          "campagne d'evangelisation",
          "evangelisation de rue",
          "evangelisation maison",
          "evangelisation stade",
          "evangelisation",
        ].some((t) => normalize(r.type_evangelisation).includes(normalize(t)))
      ).length,
      totalVenus: filtered.filter((r) =>
        normalize(r.type_evangelisation).includes("integration")
      ).length,
      totalIntegration: filtered.filter(
        (r) => normalize(r.statut) === "integre"
      ).length,
      totalBapteme: filtered.filter((r) => r.date_baptise).length,
      totalMinistere: filtered.filter((r) => r.debut_ministere).length,
      totalRefus: filtered.filter((r) => normalize(r.statut) === "refus").length,
      totalEncours: filtered.filter((r) =>
        normalize(r.statut).includes("cours")
      ).length,
      totalAttente: filtered.filter((r) => {
        const s = normalize(r.statut);
        return s.includes("attente") || s.includes("envoye");
      }).length,
    });
  };

  // ── Utilitaires ──
  const getMonthNameFR = (m) =>
    [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
    ][m] || "";

  const formatDateFR = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };

  const getStatutNormalise = (statut) => {
    if (!statut) return "";
    const s = statut.toLowerCase();
    if (s.includes("envoy")) return "en attente";
    return s;
  };

  const formatStatut = (statut) => {
    if (!statut) return "—";
    const s = statut.toLowerCase();
    if (s.includes("envoy")) return "En attente";
    return statut;
  };

  const getStatutBadge = (statut) => {
    const s = getStatutNormalise(statut);
    if (s === "integre" || s === "intégré") return { color: "green", label: formatStatut(statut) };
    if (s === "refus") return { color: "red", label: "Refus" };
    if (s.includes("cours") || s.includes("suivis")) return { color: "orange", label: formatStatut(statut) };
    if (s.includes("attente")) return { color: "gray", label: "En attente" };
    return { color: "blue", label: formatStatut(statut) };
  };

  const getRowBorderColor = (statut) => {
    const s = getStatutNormalise(statut);
    if (s === "integre" || s === "intégré") return "border-green-500";
    if (s === "refus") return "border-red-500";
    if (s.includes("cours") || s.includes("suivis")) return "border-orange-500";
    if (s.includes("attente")) return "border-white/20";
    return "border-white/10";
  };

  const groupByMonth = (data) => {
    const map = {};
    data.forEach((r) => {
      const d = new Date(r.date_depart);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (key) =>
    setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));

  const groupedReports = Object.entries(groupByMonth(reports)).sort((a, b) => {
    const [yA, mA] = a[0].split("-").map(Number);
    const [yB, mB] = b[0].split("-").map(Number);
    return new Date(yB, mB) - new Date(yA, mA);
  });

  // ── Synthèse par cellule ──
  const synthParCellule = () => {
    const map = {};
    reports.forEach((r) => {
      const key = r.cellule_full || "Non assignée";
      if (!map[key]) {
        map[key] = {
          cellule: key,
          responsable: r.responsable || "—",
          total: 0,
          integres: 0,
          encours: 0,
          attente: 0,
          refus: 0,
          baptises: 0,
          ministeres: 0,
        };
      }
      const s = getStatutNormalise(r.statut);
      map[key].total += 1;
      if (s === "integre" || s === "intégré") map[key].integres += 1;
      if (s.includes("cours") || s.includes("suivis")) map[key].encours += 1;
      if (s.includes("attente")) map[key].attente += 1;
      if (s === "refus") map[key].refus += 1;
      if (r.date_baptise) map[key].baptises += 1;
      if (r.debut_ministere) map[key].ministeres += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  };

  const totalAmes = kpis.totalEvangelises + kpis.totalVenus;
  const txIntegration = totalAmes > 0 ? Math.round((kpis.totalIntegration / totalAmes) * 100) : 0;
  const txBapteme = totalAmes > 0 ? Math.round((kpis.totalBapteme / totalAmes) * 100) : 0;

  // ── Render ──
  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 md:p-6"
      style={{ background: "#333699" }}
    >
      <HeaderPages />

      {/* EN-TÊTE */}
      <h1 className="text-2xl font-bold mt-6 mb-2 text-white text-center">
        L'Évolution des Âmes par{" "}
        <span className="text-emerald-300">Cellule</span>
      </h1>
      <div className="max-w-2xl w-full mb-6 text-center">
        <p className="italic text-sm text-white/80 leading-relaxed">
          <span className="text-blue-300 font-semibold">
            Outil de vision et de gestion spirituelle.
          </span>{" "}
          Les âmes viennent de{" "}
          <span className="text-blue-300 font-semibold">
            l'évangélisation ou de l'église
          </span>
          , puis sont orientées vers les cellules pour grandir.{" "}
          <span className="text-blue-300 font-semibold">
            Chaque donnée représente une vie précieuse
          </span>
          , chaque progression témoigne de{" "}
          <span className="text-blue-300 font-semibold">l'œuvre de Dieu</span>.
        </p>
      </div>

      {/* ── FILTRES ── */}
      <div className="w-full max-w-4xl bg-white/10 rounded-2xl p-4 md:p-6 mb-6 space-y-4">
        {/* Toggle mode */}
        <div className="flex gap-2 bg-white/10 rounded-xl p-1 w-fit">
          {["rapide", "tranche"].map((m) => (
            <button
              key={m}
              onClick={() => setModeFiltre(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                modeFiltre === m
                  ? "bg-white text-[#333699]"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {m === "rapide" ? "⚡ Période rapide" : "📅 Tranche de dates"}
            </button>
          ))}
        </div>

        {/* Contenu filtre */}
        {modeFiltre === "rapide" ? (
          <div className="flex flex-col gap-3">
            <TogglePeriode active={periodeDays} onChange={setPeriodeDays} />
            <button
              onClick={fetchReports}
              className="w-fit bg-amber-400 hover:bg-amber-300 text-white font-semibold px-6 py-2 rounded-xl transition"
            >
              Générer
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 items-end flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60 uppercase tracking-wide">
                Date début
              </label>
              <input
                type="date"
                value={filterDebut}
                onChange={(e) => setFilterDebut(e.target.value)}
                className="h-10 border border-white/20 rounded-xl px-3 bg-white/5 text-white text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60 uppercase tracking-wide">
                Date fin
              </label>
              <input
                type="date"
                value={filterFin}
                onChange={(e) => setFilterFin(e.target.value)}
                className="h-10 border border-white/20 rounded-xl px-3 bg-white/5 text-white text-sm"
              />
            </div>
            <button
              onClick={fetchReports}
              className="h-10 bg-amber-400 hover:bg-amber-300 text-white font-semibold px-6 rounded-xl transition"
            >
              Générer
            </button>
          </div>
        )}

        {/* Filtre cellule (après génération) */}
        {showTable && (
          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-xs text-white/60 uppercase tracking-wide">
              Filtrer par cellule
            </label>
            <select
              value={filterCellule}
              onChange={(e) => setFilterCellule(e.target.value)}
              className="h-10 border border-white/20 rounded-xl px-3 bg-white/5 text-white text-sm"
            >
              <option value="" className="text-black">
                Toutes les cellules
              </option>
              {Cellules.map((c) => (
                <option key={c.id} value={c.cellule_full} className="text-black">
                  {c.cellule_full}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── KPIs ── */}
      {showTable && (
        <div className="w-full max-w-4xl mb-6 space-y-3">
          <SectionTitle>Indicateurs clés</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Évangélisés" value={kpis.totalEvangelises} color="bg-blue-500/30" />
            <KpiCard label="Venus à l'église" value={kpis.totalVenus} color="bg-purple-500/30" />
            <KpiCard
              label="Intégrés"
              value={kpis.totalIntegration}
              sub={`${txIntegration}%`}
              color="bg-green-500/30"
            />
            <KpiCard
              label="Baptêmes"
              value={kpis.totalBapteme}
              sub={`${txBapteme}%`}
              color="bg-indigo-500/30"
            />
            <KpiCard label="Ministère" value={kpis.totalMinistere} color="bg-pink-500/30" />
            <KpiCard label="Refus" value={kpis.totalRefus} color="bg-red-500/30" />
            <KpiCard label="En cours" value={kpis.totalEncours} color="bg-orange-500/30" />
            <KpiCard label="En attente" value={kpis.totalAttente} color="bg-white/10" />
          </div>

          {/* Barre entonnoir conversion */}
          {totalAmes > 0 && (
            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <SectionTitle>Entonnoir de progression</SectionTitle>
              {[
                { label: "Total âmes", val: totalAmes, color: "bg-blue-400" },
                { label: "Intégrés", val: kpis.totalIntegration, color: "bg-green-400" },
                { label: "Baptisés", val: kpis.totalBapteme, color: "bg-indigo-400" },
                { label: "En ministère", val: kpis.totalMinistere, color: "bg-pink-400" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-white/60 shrink-0">{label}</div>
                  <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${color} h-full rounded-full transition-all`}
                      style={{ width: `${Math.min(100, Math.round((val / totalAmes) * 100))}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs text-white font-semibold">
                    {val}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ONGLETS ── */}
      {showTable && (
        <div className="w-full max-w-4xl mb-4">
          <div className="bg-white/10 rounded-xl p-1 flex gap-1 w-fit">
            {[
              { key: "tableau", label: "📋 Tableau" },
              { key: "synthese", label: "📊 Synthèse par cellule" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === t.key
                    ? "bg-white text-[#333699]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENU ONGLET TABLEAU ── */}
      {showTable && activeTab === "tableau" && (
        <div className="w-full max-w-7xl mb-8">

          {/* DESKTOP */}
          <div className="hidden md:block w-full overflow-x-auto">
            <div className="w-max mx-auto space-y-2 bg-white/5 p-2 rounded-xl">
              {/* Header */}
              <div className="flex text-xs font-semibold uppercase text-white/50 tracking-wider px-4 py-3 border-b border-white/10 whitespace-nowrap">
                <div className="min-w-[130px]">Date départ</div>
                <div className="min-w-[190px] text-center">Nom complet</div>
                <div className="min-w-[190px] text-center">Type</div>
                <div className="min-w-[130px] text-center">Statut</div>
                <div className="min-w-[130px] text-center">Assigné le</div>
                <div className="min-w-[130px] text-center">Date évolution</div>
                <div className="min-w-[130px] text-center">Baptême</div>
                <div className="min-w-[130px] text-center">Ministère</div>
                <div className="min-w-[200px] text-center">Cellule</div>
                <div className="min-w-[180px] text-center">Responsable</div>
                <div className="min-w-[90px] text-center">Action</div>
              </div>

              {groupedReports.length === 0 && (
                <div className="text-center text-white/40 py-10 text-sm">
                  Aucune donnée pour cette période.
                </div>
              )}

              {groupedReports.map(([monthKey, rows]) => {
                const [year, monthIndex] = monthKey.split("-").map(Number);
                const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                const isExpanded = expandedMonths[monthKey] || false;

                return (
                  <div key={monthKey} className="w-full">
                    {/* Ligne mois */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition border-l-4 border-amber-300 cursor-pointer"
                      onClick={() => toggleMonth(monthKey)}
                    >
                      <span className="text-white font-semibold text-sm">
                        {isExpanded ? "▼" : "▶"} {monthLabel}
                      </span>
                      <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {rows.length}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {rows.map((r, i) => {
                          const badge = getStatutBadge(r.statut);
                          const border = getRowBorderColor(r.statut);
                          return (
                            <div
                              key={i}
                              className={`flex items-center px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border-l-4 ${border}`}
                            >
                              <div className="min-w-[130px] text-white/80 text-sm">
                                {formatDateFR(r.date_depart)}
                              </div>
                              <div className="min-w-[190px] text-center text-white text-sm font-medium">
                                {r.nom_complet}
                              </div>
                              <div className="min-w-[190px] text-center text-white/70 text-xs">
                                {r.type_evangelisation}
                              </div>
                              <div className="min-w-[130px] text-center">
                                <Badge label={badge.label} color={badge.color} />
                              </div>
                              <div className="min-w-[130px] text-center text-white/60 text-xs">
                                {formatDateFR(r.envoyer_au_suivi_le)}
                              </div>
                              <div className="min-w-[130px] text-center text-white/60 text-xs">
                                {formatDateFR(r.date_integration)}
                              </div>
                              <div className="min-w-[130px] text-center text-white/60 text-xs">
                                {formatDateFR(r.date_baptise)}
                              </div>
                              <div className="min-w-[130px] text-center text-white/60 text-xs">
                                {formatDateFR(r.debut_ministere)}
                              </div>
                              <div className="min-w-[200px] text-center text-white/80 text-xs">
                                {r.cellule_full}
                              </div>
                              <div className="min-w-[180px] text-center text-white/80 text-xs">
                                {r.responsable}
                              </div>
                              <div className="min-w-[90px] text-center">
                                <button
                                  className="text-orange-400 hover:text-orange-300 text-xs underline font-medium"
                                  onClick={() => setSelectedEvangelise(r)}
                                >
                                  Détails
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MOBILE */}
          <div className="md:hidden space-y-3 w-full">
            {groupedReports.map(([monthKey, rows]) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;

              return (
                <div key={monthKey} className="space-y-2 w-full">
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border-l-4 border-amber-300 cursor-pointer"
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <span className="text-white font-semibold text-sm">
                      {isExpanded ? "▼" : "▶"} {monthLabel}
                    </span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {rows.length}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2">
                      {rows.map((r, i) => {
                        const badge = getStatutBadge(r.statut);
                        const border = getRowBorderColor(r.statut);
                        return (
                          <div
                            key={i}
                            className={`bg-white/10 rounded-xl p-4 text-white space-y-1.5 border-l-4 ${border}`}
                          >
                            <p className="text-xs text-white/50">{formatDateFR(r.date_depart)}</p>
                            <p className="font-semibold">{r.nom_complet}</p>
                            <p className="text-xs text-white/70">{r.type_evangelisation}</p>
                            <div>
                              <Badge label={badge.label} color={badge.color} />
                            </div>
                            <p className="text-xs text-white/60">
                              Envoyé : {formatDateFR(r.envoyer_au_suivi_le)}
                            </p>
                            <p className="text-xs text-white/60">
                              Intégration : {formatDateFR(r.date_integration)}
                            </p>
                            <p className="text-xs text-white/60">
                              Baptême : {formatDateFR(r.date_baptise)}
                            </p>
                            <p className="text-xs text-white/60">
                              Ministère : {formatDateFR(r.debut_ministere)}
                            </p>
                            <p className="text-xs text-white/80 font-medium">
                              {r.cellule_full}
                            </p>
                            <p className="text-xs text-white/60">{r.responsable}</p>
                            <button
                              className="text-orange-400 text-xs underline"
                              onClick={() => setSelectedEvangelise(r)}
                            >
                              Détails
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ONGLET SYNTHÈSE PAR CELLULE ── */}
      {showTable && activeTab === "synthese" && (
        <div className="w-full max-w-4xl mb-8 space-y-3">
          <SectionTitle>Synthèse par cellule</SectionTitle>
          {synthParCellule().map((row) => {
            const pct = row.total > 0 ? Math.round((row.integres / row.total) * 100) : 0;
            return (
              <div
                key={row.cellule}
                className="bg-white/10 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-white font-semibold">{row.cellule}</p>
                    <p className="text-xs text-white/50">{row.responsable}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge label={`${row.total} âmes`} color="blue" />
                    <Badge label={`${row.integres} intégrés`} color="green" />
                    {row.refus > 0 && <Badge label={`${row.refus} refus`} color="red" />}
                  </div>
                </div>

                {/* Barre de progression intégration */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/60 w-10 text-right">{pct}%</span>
                </div>

                {/* Détail chiffres */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                  {[
                    { label: "En cours", val: row.encours, color: "text-orange-300" },
                    { label: "Attente", val: row.attente, color: "text-white/50" },
                    { label: "Baptisés", val: row.baptises, color: "text-indigo-300" },
                    { label: "Ministère", val: row.ministeres, color: "text-pink-300" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-2">
                      <div className={`font-bold text-sm ${color}`}>{val}</div>
                      <div className="text-xs text-white/40">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── POPUPS ── */}
      {selectedEvangelise && (
        <DetailsEtatConseillerPopup
          member={selectedEvangelise}
          onClose={() => setSelectedEvangelise(null)}
          onUpdate={(id, updates) => {
            setReports((prev) =>
              prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
            );
          }}
        />
      )}

      {selectedMember && (
        <DetailsEtatConsEvangePopup
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(member) => setEditMember(member)}
        />
      )}

      <Footer />
    </div>
  );
}
