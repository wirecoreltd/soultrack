"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import EditEvanRapportLine from "../components/EditEvanRapportLine";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

// ── Largeurs des colonnes centralisées ──────────────────────────────────────
const COL = {
  label:         "w-[160px] shrink-0",
  hommes:        "w-[90px]  shrink-0 text-center",
  femmes:        "w-[90px]  shrink-0 text-center",
  total:         "w-[90px]  shrink-0 text-center",
  priere:        "w-[90px]  shrink-0 text-center",
  nouveau:       "w-[110px] shrink-0 text-center",
  reconciliation:"w-[100px] shrink-0 text-center",
  moissonneurs:  "w-[90px]  shrink-0 text-center",
  actions:       "w-[90px]  shrink-0 text-center",
};

// ── Ligne de données desktop ─────────────────────────────────────────────────
function DesktopRow({ label, totals, actions, labelClass = "text-white", rowClass = "" }) {
  return (
    <div className={`hidden md:flex items-center w-full ${rowClass}`}>
      <div className={`${COL.label} ${labelClass}`}>{label}</div>
      <div className={`${COL.hommes} text-white`}>{totals.hommes}</div>
      <div className={`${COL.femmes} text-white`}>{totals.femmes}</div>
      <div className={`${COL.total} text-orange-300 font-semibold`}>{totals.total}</div>
      <div className={`${COL.priere} text-white`}>{totals.priere}</div>
      <div className={`${COL.nouveau} text-white`}>{totals.nouveau}</div>
      <div className={`${COL.reconciliation} text-white`}>{totals.reconciliation}</div>
      <div className={`${COL.moissonneurs} text-white`}>{totals.moissonneurs}</div>
      <div className={`${COL.actions}`}>{actions}</div>
    </div>
  );
}

export default function RapportEvangelisation() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [message, setMessage] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});
  const [showTable, setShowTable] = useState(false);

  // ---------------- PROFIL USER ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      }
    };
    fetchProfile();
  }, []);

  // ---------------- FETCH RAPPORTS ----------------
  const fetchRapports = async () => {
    if (!egliseId || !brancheId) return;
    setLoading(true);
    setShowTable(false);

    let query = supabase
      .from("rapport_evangelisation")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .order("date", { ascending: true });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data } = await query;
    const reports = data || [];
    setRapports(reports);

    const lastMonth = getLastMonthKey(reports);
    if (lastMonth) setExpandedMonths({ [lastMonth]: true });

    setLoading(false);
    setShowTable(true);

    setTimeout(() => {
      document.getElementById("rapport-table")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ---------------- EDIT RAPPORT ----------------
  const handleSaveRapport = async (updated) => {
    await supabase.from("rapport_evangelisation").upsert(updated);
    fetchRapports();
    setMessage("✅ Rapport mis à jour !");
    setTimeout(() => setMessage(""), 3000);
  };

  // ---------------- COLLAPSE ----------------
  const toggleMonth = (monthKey) =>
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  const toggleType = (typeKey) =>
    setExpandedTypes((prev) => ({ ...prev, [typeKey]: !prev[typeKey] }));

  // ---------------- GROUPING ----------------
  const groupByMonth = (data) => {
    const map = {};
    data.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const groupByType = (data) => {
    const map = {};
    data.forEach((r) => {
      const type = r.type_evangelisation || "Non défini";
      if (!map[type]) map[type] = [];
      map[type].push(r);
    });
    return map;
  };

  // ---------------- TOTALS ----------------
  const getTotals = (reports) => {
    let hommes = 0, femmes = 0, priere = 0, nouveau = 0, reconciliation = 0, moissonneurs = 0;
    reports.forEach((r) => {
      hommes        += Number(r.hommes)          || 0;
      femmes        += Number(r.femmes)          || 0;
      priere        += Number(r.priere)          || 0;
      nouveau       += Number(r.nouveau_converti)|| 0;
      reconciliation+= Number(r.reconciliation) || 0;
      moissonneurs  += Number(r.moissonneurs)    || 0;
    });
    return { hommes, femmes, total: hommes + femmes, priere, nouveau, reconciliation, moissonneurs };
  };

  // ---------------- LAST MONTH ----------------
  const getLastMonthKey = (data) => {
    if (!data || data.length === 0) return null;
    const dates = data.map((r) => new Date(r.date));
    const lastDate = new Date(Math.max(...dates));
    return `${lastDate.getFullYear()}-${lastDate.getMonth()}`;
  };

  const getMonthNameFR = (monthIndex) =>
    ["Janvier","Février","Mars","Avril","Mai","Juin",
     "Juillet","Août","Septembre","Octobre","Novembre","Décembre"][monthIndex] || "";

  const groupedReports = groupByMonth(rapports);
  const borderColors = [
    "border-red-500","border-green-500","border-blue-500",
    "border-yellow-500","border-purple-500",
  ];

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Évangélisation</span>
      </h1>

      {/* FILTRES */}
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-white">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Date de début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Date de fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg px-4 py-2"
            />
          </div>
          <button
            onClick={fetchRapports}
            disabled={loading}
            className="bg-amber-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-amber-300 transition disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Générer le rapport"}
          </button>
        </div>
      </div>

      {message && (
        <div className="text-center text-white mt-4 font-medium">{message}</div>
      )}

      {/* TABLEAU */}
      {showTable && (
        <div id="rapport-table" className="w-full mt-8 overflow-x-auto pb-4">
          <div className="min-w-max mx-auto">

            {/* ── HEADER DESKTOP ── */}
            <div className="hidden md:flex items-center font-semibold uppercase text-white/80 text-xs px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl">
              <div className={COL.label}>Type / Date</div>
              <div className={COL.hommes}>Hommes</div>
              <div className={COL.femmes}>Femmes</div>
              <div className={COL.total}>Total</div>
              <div className={COL.priere}>Prières</div>
              <div className={COL.nouveau}>Nouv. Conv</div>
              <div className={COL.reconciliation}>Recon</div>
              <div className={COL.moissonneurs}>Moiss</div>
              <div className={COL.actions}>Actions</div>
            </div>

            <div className="space-y-1 mt-1">
              {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
                const [year, monthIndex] = monthKey.split("-").map(Number);
                const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                const isExpanded = expandedMonths[monthKey] || false;
                const borderColor = borderColors[idx % borderColors.length];
                const monthTotals = getTotals(monthReports);

                return (
                  <div key={monthKey} className="space-y-1">

                    {/* ── MOIS ── */}
                    <div
                      className={`px-4 py-3 rounded-lg bg-white/25 cursor-pointer border-l-4 ${borderColor}`}
                      onClick={() => toggleMonth(monthKey)}
                    >
                      {/* Desktop */}
                      <DesktopRow
                        label={`${isExpanded ? "➖" : "➕"} ${monthLabel}`}
                        totals={monthTotals}
                        actions={null}
                        labelClass="text-white font-semibold"
                      />

                      {/* Mobile */}
                      <div className="md:hidden text-white">
                        <div className="font-semibold mb-1">
                          {isExpanded ? "➖" : "➕"} {monthLabel}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
                          <span>Hommes: {monthTotals.hommes}</span>
                          <span>Femmes: {monthTotals.femmes}</span>
                          <span className="text-orange-300 font-semibold">Total: {monthTotals.total}</span>
                          <span>Prières: {monthTotals.priere}</span>
                          <span>NouvConv: {monthTotals.nouveau}</span>
                          <span>Recon: {monthTotals.reconciliation}</span>
                          <span>Moiss: {monthTotals.moissonneurs}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── TYPES ── */}
                    {isExpanded &&
                      Object.entries(groupByType(monthReports)).map(([type, typeReports]) => {
                        const typeKey = `${monthKey}-${type}`;
                        const typeExpanded = expandedTypes[typeKey] || false;
                        const typeTotals = getTotals(typeReports);

                        return (
                          <div key={typeKey} className="space-y-1">

                            {/* Type row */}
                            <div
                              onClick={() => toggleType(typeKey)}
                              className="px-4 py-2 rounded-lg bg-white/15 cursor-pointer border-l-4 border-yellow-400 ml-4"
                            >
                              {/* Desktop */}
                              <DesktopRow
                                label={`${typeExpanded ? "➖" : "➕"} ${type}`}
                                totals={typeTotals}
                                actions={null}
                                labelClass="text-white font-semibold"
                              />

                              {/* Mobile */}
                              <div className="md:hidden text-white">
                                <div className="font-semibold mb-1">
                                  {typeExpanded ? "➖" : "➕"} {type}
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
                                  <span>Hommes: {typeTotals.hommes}</span>
                                  <span>Femmes: {typeTotals.femmes}</span>
                                  <span className="text-orange-300 font-semibold">Total: {typeTotals.total}</span>
                                  <span>Prières: {typeTotals.priere}</span>
                                  <span>NouvConv: {typeTotals.nouveau}</span>
                                  <span>Recon: {typeTotals.reconciliation}</span>
                                  <span>Moiss: {typeTotals.moissonneurs}</span>
                                </div>
                              </div>
                            </div>

                            {/* ── LIGNES DÉTAIL ── */}
                            {typeExpanded &&
                              typeReports.map((r) => {
                                const rowTotals = {
                                  hommes:         Number(r.hommes)           || 0,
                                  femmes:         Number(r.femmes)           || 0,
                                  total:         (Number(r.hommes) || 0) + (Number(r.femmes) || 0),
                                  priere:         Number(r.priere)           || 0,
                                  nouveau:        Number(r.nouveau_converti) || 0,
                                  reconciliation: Number(r.reconciliation)   || 0,
                                  moissonneurs:   Number(r.moissonneurs)     || 0,
                                };

                                const editBtn = (
                                  <button
                                    onClick={() => { setSelectedRapport(r); setEditOpen(true); }}
                                    className="text-orange-400 underline hover:text-orange-300 text-sm"
                                  >
                                    Modifier
                                  </button>
                                );

                                return (
                                  <div
                                    key={r.id}
                                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border-l-4 border-blue-500 ml-8"
                                  >
                                    {/* Desktop */}
                                    <DesktopRow
                                      label={new Date(r.date).toLocaleDateString("fr-FR")}
                                      totals={rowTotals}
                                      actions={editBtn}
                                      labelClass="text-white"
                                    />

                                    {/* Mobile */}
                                    <div className="md:hidden text-white text-sm">
                                      <div className="font-semibold mb-1">
                                        {new Date(r.date).toLocaleDateString("fr-FR")}
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                        <span>Hommes: {r.hommes ?? "-"}</span>
                                        <span>Femmes: {r.femmes ?? "-"}</span>
                                        <span className="text-orange-300 font-semibold">Total: {rowTotals.total}</span>
                                        <span>Prières: {r.priere ?? "-"}</span>
                                        <span>NouvConv: {r.nouveau_converti ?? "-"}</span>
                                        <span>Recon: {r.reconciliation ?? "-"}</span>
                                        <span>Moiss: {r.moissonneurs ?? "-"}</span>
                                      </div>
                                      <div className="mt-2">{editBtn}</div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
