"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import EditEvanRapportLine from "../components/EditEvanRapportLine";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function RapportEvangelisation() {
  const formRef = useRef(null);

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
  const [statusFilter, setStatusFilter] = useState(null);  

  // ---------------- KPI ----------------
  const [totalEnvoyes, setTotalEnvoyes] = useState(0);
  const [totalIntegres, setTotalIntegres] = useState(0);
  const [totalEncour, setTotalEncour] = useState(0);
  const [totalRefus, setTotalRefus] = useState(0);

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

    // 1️⃣ Récupérer les rapports avec filtre date côté Supabase
    let query = supabase
    .from("rapport_evangelisation")
    .select("*")
    .eq("eglise_id", egliseId)
    .eq("branche_id", brancheId)
    .order("date", { ascending: true });
  
  // Ajouter gte seulement si dateDebut existe
  if (dateDebut) query = query.gte("date", dateDebut);
  if (dateFin) query = query.lte("date", dateFin);
  
  const { data: rapportsData } = await query;
  setRapports(rapportsData || []);

    // 2️⃣ Gérer l’expansion du dernier mois
    const lastMonth = getLastMonthKey(rapportsData);
    if (lastMonth) setExpandedMonths({ [lastMonth]: true });

    setLoading(false);
    setShowTable(true);
  };

  // ---------------- FETCH KPI ----------------
  const fetchKPI = async () => {
    if (!egliseId || !brancheId) return;

    // Évangélisés envoyés au suivi
    let { data: evangelisesData } = await supabase
      .from("evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .eq("status_suivi", "Envoyé")
      .gte(dateDebut ? "created_at" : null, dateDebut || undefined)
      .lte(dateFin ? "created_at" : null, dateFin || undefined);

    setTotalEnvoyes(evangelisesData.length);

    // Suivis pour calculer Intégré / En cours / Refus
    let { data: suivisData } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .eq("eglise_id", egliseId)
      .eq("branche_id", brancheId)
      .gte(dateDebut ? "date_suivi" : null, dateDebut || undefined)
      .lte(dateFin ? "date_suivi" : null, dateFin || undefined);

    setTotalIntegres(
      suivisData.filter((e) => e.status_suivis_evangelises === "Intégré").length
    );
    setTotalEncour(
      suivisData.filter((e) => e.status_suivis_evangelises === "En cours").length
    );
    setTotalRefus(
      suivisData.filter((e) => e.status_suivis_evangelises === "Refus").length
    );
  };

  // Appeler fetchKPI après fetchRapports
  useEffect(() => {
    fetchKPI();
  }, [egliseId, brancheId, dateDebut, dateFin, rapports]);

  // Scroll vers tableau
  useEffect(() => {
    if (showTable) {
      document.getElementById("rapport-table")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showTable]);

  // ---------------- EDIT RAPPORT ----------------
  const handleSaveRapport = async (updated) => {
    await supabase.from("rapport_evangelisation").upsert(updated);
    fetchRapports();
    setMessage("✅ Rapport mis à jour !");
    setTimeout(() => setMessage(""), 3000);
  };

  // ---------------- COLLAPSE ----------------
  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };
  const toggleType = (typeKey) => {
    setExpandedTypes((prev) => ({ ...prev, [typeKey]: !prev[typeKey] }));
  };

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

  // -------- TOTALS --------
  const getTotals = (reports) => {
    let hommes = 0;
    let femmes = 0;
    let priere = 0;
    let nouveau = 0;
    let reconciliation = 0;
    let moissonneurs = 0;

    reports.forEach((r) => {
      hommes += Number(r.hommes) || 0;
      femmes += Number(r.femmes) || 0;
      priere += Number(r.priere) || 0;
      nouveau += Number(r.nouveau_converti) || 0;
      reconciliation += Number(r.reconciliation) || 0;
      moissonneurs += Number(r.moissonneurs) || 0;
    });

    return {
      hommes,
      femmes,
      total: hommes + femmes,
      priere,
      nouveau,
      reconciliation,
      moissonneurs,
    };
  };

  // ---------------- LAST MONTH ----------------
  const getLastMonthKey = (data) => {
    if (!data || data.length === 0) return null;
    const dates = data.map((r) => new Date(r.date));
    const lastDate = new Date(Math.max(...dates));
    return `${lastDate.getFullYear()}-${lastDate.getMonth()}`;
  };

  // ---------------- UTILS ----------------
  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[monthIndex] || "";
  };

  const groupedReports = groupByMonth(rapports);
  const borderColors = [
    "border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500"
  ];

  /* ================= KPI ================= */
  const filteredRapports = statusFilter
    ? rapports.filter(r => r.status_suivi === statusFilter)
    : rapports;

  const totalEvangelises = rapports.length;   
  const totalEnCours = rapports.filter(r => r.status_suivi === "En cours").length;
  const nonIntegres = totalEvangelises - totalIntegres;
  const tauxIntegration = totalEvangelises ? Math.round((totalIntegres / totalEvangelises) * 100) : 0;

  const handleKpiClick = (status) => {
    setStatusFilter(status);
    if (formRef.current) {
      window.scrollTo({ top: formRef.current.offsetTop, behavior: "smooth" });
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Evangélisation</span>
      </h1>

      {/* FILTRES */}
      <div ref={formRef} className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-white">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Date de début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e)=>setDateDebut(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Date de fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e)=>setDateFin(e.target.value)}
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

{/* ================= KPI ================= */}
      {showTable && (
        <div className="w-full max-w-4xl bg-white/10 rounded-2xl p-6 shadow-lg mt-6 text-white grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30" onClick={() => handleKpiClick(null)}>
            <div className="text-2xl font-bold">{totalEvangelises}</div>
            <div>Évangélisés</div>
          </div>
          <div className="p-4 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30" onClick={() => handleKpiClick("Envoyé")}>
            <div className="text-2xl font-bold">{totalEnvoyes}</div>
            <div>Envoyés au suivi</div>
          </div>
          <div className="p-4 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30" onClick={() => handleKpiClick("Intégré")}>
            <div className="text-2xl font-bold">{totalIntegres}</div>
            <div>Intégrés</div>
          </div>
          <div className="p-4 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30" onClick={() => handleKpiClick("En cours")}>
            <div className="text-2xl font-bold">{totalEnCours}</div>
            <div>En cours</div>
          </div>
          <div className="p-4 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30" onClick={() => handleKpiClick("Non Intégré")}>
            <div className="text-2xl font-bold">{nonIntegres}</div>
            <div>Non intégrés</div>
          </div>
          <div className="p-4 bg-white/20 rounded-xl">
            <div className="text-2xl font-bold">{tauxIntegration}%</div>
            <div>Taux d’intégration</div>
          </div>
        </div>
      )}

      {message && <div className="text-center text-white mt-4 font-medium">{message}</div>}

      {/* TABLEAU */}
      {showTable && (
        <div id="rapport-table" className="w-full flex justify-center mt-8">
          <div className="w-full md:w-max space-y-2">
            {/* HEADER DESKTOP */}
            <div className="hidden md:flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[150px] ml-2">Type / Date</div>
              <div className="min-w-[110px] text-center ml-28">Hommes</div>
              <div className="min-w-[110px] text-center">Femmes</div>        
              <div className="min-w-[120px] text-center">Prières</div>
              <div className="min-w-[140px] text-center">Nouv. conv</div>
              <div className="min-w-[130px] text-center">Recon</div>
              <div className="min-w-[130px] text-center">Moiss</div>
              <div className="min-w-[120px] text-center">Actions</div>
            </div>

            {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;
              const borderColor = borderColors[idx % borderColors.length];
              const monthTotals = getTotals(monthReports);

              return (
                <div key={monthKey} className="space-y-1">
                  {/* MOIS */}
                  <div
                    className={`px-4 py-3 rounded-lg bg-white/25 cursor-pointer border-l-4 ${borderColor}`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="hidden md:flex items-center">
                      <div className="min-w-[150px] text-white font-semibold">
                        {isExpanded ? "➖ " : "➕ "} {monthLabel}
                      </div>
                      <div className="flex ml-auto text-white font-semibold text-sm">
                        <div className="min-w-[110px] text-center">{monthTotals.hommes}</div>
                        <div className="min-w-[110px] text-center">{monthTotals.femmes}</div>                  
                        <div className="min-w-[120px] text-center">{monthTotals.priere}</div>
                        <div className="min-w-[140px] text-center">{monthTotals.nouveau}</div>
                        <div className="min-w-[130px] text-center">{monthTotals.reconciliation}</div>
                        <div className="min-w-[130px] text-center">{monthTotals.moissonneurs}</div>
                        <div className="min-w-[120px]"></div>
                      </div>
                    </div>

                    {/* MOBILE */}
                    <div className="md:hidden text-white">
                      <div className="font-semibold">{isExpanded ? "➖ " : "➕ "} {monthLabel}</div>
                      <div className="grid grid-cols-2 gap-1 text-sm mt-1">
                        <div>Hommes: {monthTotals.hommes}</div>
                        <div>Femmes: {monthTotals.femmes}</div>                  
                        <div>Prières: {monthTotals.priere}</div>
                        <div>NouvConv: {monthTotals.nouveau}</div>
                        <div>Recon: {monthTotals.reconciliation}</div>
                        <div>Moiss: {monthTotals.moissonneurs}</div>
                      </div>
                    </div>
                  </div>

                  {/* TYPES */}
                  {isExpanded &&
                    Object.entries(groupByType(monthReports)).map(([type, typeReports]) => {
                      const typeKey = `${monthKey}-${type}`;
                      const typeExpanded = expandedTypes[typeKey] || false;
                      const typeTotals = getTotals(typeReports);

                      return (
                        <div key={typeKey}>
                          {/* TYPE */}
                          <div
                            onClick={() => toggleType(typeKey)}
                            className="px-4 py-2 rounded-lg bg-white/15 cursor-pointer border-l-4 border-yellow-400 ml-4"
                          >
                            <div className="hidden md:flex items-center">
                              <div className="min-w-[150px] text-white font-semibold">
                                {typeExpanded ? "➖ " : "➕ "} {type}
                              </div>
                              <div className="flex ml-auto text-white text-sm">
                                <div className="min-w-[110px] text-center">{typeTotals.hommes}</div>
                                <div className="min-w-[110px] text-center">{typeTotals.femmes}</div>                          
                                <div className="min-w-[120px] text-center">{typeTotals.priere}</div>
                                <div className="min-w-[140px] text-center">{typeTotals.nouveau}</div>
                                <div className="min-w-[130px] text-center">{typeTotals.reconciliation}</div>
                                <div className="min-w-[130px] text-center">{typeTotals.moissonneurs}</div>
                                <div className="min-w-[120px]"></div>
                              </div>
                            </div>

                            {/* MOBILE */}
                            <div className="md:hidden text-white">
                              <div className="font-semibold">{typeExpanded ? "➖ " : "➕ "} {type}</div>
                              <div className="grid grid-cols-2 gap-1 text-sm mt-1">
                                <div>Hommes: {typeTotals.hommes}</div>
                                <div>Femmes: {typeTotals.femmes}</div>                          
                                <div>Prières: {typeTotals.priere}</div>
                                <div>NouvConv: {typeTotals.nouveau}</div>
                                <div>Recon: {typeTotals.reconciliation}</div>
                                <div>Moiss: {typeTotals.moissonneurs}</div>
                              </div>
                            </div>
                          </div>

                          {/* RAPPORTS */}
                          {typeExpanded &&
                            typeReports.map((r) => (
                              <div key={r.id} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border-l-4 border-blue-500 ml-8">
                                <div className="hidden md:flex items-center">
                                  <div className="min-w-[150px] text-white">{new Date(r.date).toLocaleDateString()}</div>
                                  <div className="min-w-[110px] text-center text-white ml-20">{r.hommes ?? "-"}</div>
                                  <div className="min-w-[110px] text-center text-white">{r.femmes ?? "-"}</div>
                                  <div className="min-w-[120px] text-center text-white">{r.priere ?? "-"}</div>
                                  <div className="min-w-[140px] text-center text-white">{r.nouveau_converti ?? "-"}</div>
                                  <div className="min-w-[130px] text-center text-white">{r.reconciliation ?? "-"}</div>
                                  <div className="min-w-[130px] text-center text-white">{r.moissonneurs ?? "-"}</div>
                                  <div className="min-w-[120px] text-center">
                                    <button onClick={() => { setSelectedRapport(r); setEditOpen(true); }} className="text-orange-400 underline hover:text-orange-500">
                                      Modifier
                                    </button>
                                  </div>
                                </div>

                                <div className="md:hidden text-white text-sm">
                                  <div className="font-semibold mb-1">{new Date(r.date).toLocaleDateString()}</div>
                                  <div className="grid grid-cols-2 gap-1">
                                    <div>Hommes: {r.hommes ?? "-"}</div>
                                    <div>Femmes: {r.femmes ?? "-"}</div>                                
                                    <div>Prières: {r.priere ?? "-"}</div>
                                    <div>NouvConv: {r.nouveau_converti ?? "-"}</div>
                                    <div>Recon: {r.reconciliation ?? "-"}</div>
                                    <div>Moiss: {r.moissonneurs ?? "-"}</div>
                                  </div>
                                  <button onClick={() => { setSelectedRapport(r); setEditOpen(true); }} className="text-orange-400 underline mt-2">
                                    Modifier
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedRapport && (
        <EditEvanRapportLine
          isOpen={editOpen}
          onClose={()=>setEditOpen(false)}
          rapport={selectedRapport}
          onSave={handleSaveRapport}
        />
      )}

      <Footer />
    </div>
  );
}
