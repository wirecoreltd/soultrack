"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient"; // default export
import EditEvanRapportLine from "../components/EditEvanRapportLine";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";

export default function RapportEvangelisation() {
  const formRef = useRef(null);
  const [rapports, setRapports] = useState([]);
  const [filteredEvangelises, setFilteredEvangelises] = useState([]);
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
  const [typeFilter, setTypeFilter] = useState("");
  const router = useRouter();
  const [filteredSuivisState, setFilteredSuivisState] = useState([]);
  // KPI
  const [totalEnvoyes, setTotalEnvoyes] = useState(0);
  const [totalIntegres, setTotalIntegres] = useState(0);
  const [totalEncour, setTotalEncour] = useState(0);
  const [totalRefus, setTotalRefus] = useState(0);
  const [totalCellule, setTotalCellule] = useState(0);
  const [totalEglise, setTotalEglise] = useState(0);
  const [totalPriereSalut, setTotalPriereSalut] = useState(0);
  const [allEvangelises, setAllEvangelises] = useState([]);
  const [allSuivis, setAllSuivis] = useState([]);

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
    
      try {
        let query = supabase
          .from("rapport_evangelisation")
          .select("*")
          .eq("eglise_id", egliseId)
          .eq("branche_id", brancheId)
          .order("date", { ascending: true });
    
        if (dateDebut) query = query.gte("date", dateDebut);
        if (dateFin) query = query.lte("date", dateFin);
    
        const { data: rapportsData } = await query;
        setRapports(rapportsData || []);
    
        // ---------------- 2️⃣ Récupérer tous les évangélisés ----------------
        let { data: evangelisesData } = await supabase
          .from("evangelises")
          .select("*")
          .eq("eglise_id", egliseId)
          .eq("branche_id", brancheId);
    
        setAllEvangelises(evangelisesData || []); // sauvegarder la source complète
    
        // Filtrer selon dates et typeFilter
        let filtered = (evangelisesData || []).filter((e) => {
          const dateOk =
            (!dateDebut || new Date(e.created_at) >= new Date(dateDebut)) &&
            (!dateFin || new Date(e.created_at) <= new Date(dateFin));
          const typeOk = !typeFilter || typeFilter === "Tous" || e.type_evangelisation === typeFilter;
          return dateOk && typeOk;
        });
    
        setFilteredEvangelises(filtered);
        setTotalEnvoyes(filtered.filter((e) => e.status_suivi === "Envoyé").length);
    
        // Expansion du dernier mois
        const lastMonth = getLastMonthKey(rapportsData || []);
        if (lastMonth) setExpandedMonths({ [lastMonth]: true });
    
      } catch (err) {
        console.error("Erreur fetchRapports:", err);
      }
    
      setLoading(false);
      setShowTable(true);
    
     setTimeout(() => {
      document.getElementById("rapport-filtres")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
    };
  
       // Fetch KPI
       const fetchKPI = async () => {
    if (!egliseId || !brancheId) return;
  
    try {
      // ---------------- 1️⃣ Récupérer tous les évangélisés ----------------
      let { data: evangelisesData } = await supabase
        .from("evangelises")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);
  
      setAllEvangelises(evangelisesData || []);
  
      let filtered = (evangelisesData || []).filter((e) => {
        const dateOk =
          (!dateDebut || new Date(e.created_at) >= new Date(dateDebut)) &&
          (!dateFin || new Date(e.created_at) <= new Date(dateFin));
        const typeOk = !typeFilter || typeFilter === "Tous" || e.type_evangelisation === typeFilter;
        return dateOk && typeOk;
      });
  
      setFilteredEvangelises(filtered);
      setTotalEnvoyes(filtered.filter((e) => e.status_suivi === "Envoyé").length);
  
      // ---------------- 2️⃣ Suivis ----------------
      let { data: suivisData } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);
  
      setAllSuivis(suivisData || []);
  
      const filteredSuivis = (suivisData || []).filter((s) => {
  const dateOk =
    !dateDebut || (s.date_suivi && new Date(s.date_suivi) >= new Date(dateDebut));
  const dateFinOk =
    !dateFin || (s.date_suivi && new Date(s.date_suivi) <= new Date(dateFin));
  const typeOk =
    !typeFilter ||
    typeFilter === "Tous" ||
    (s.type_evangelisation && s.type_evangelisation === typeFilter);

  return dateOk && dateFinOk && typeOk;
});

setFilteredSuivisState(filteredSuivis); // <-- ici on le stocke pour le JSX
  
      const normalize = (str) => (str ? str.trim() : "");
  
      const integres = filteredSuivis.filter((e) => normalize(e.status_suivis_evangelises) === "Intégré");
      const enCours = filteredSuivis.filter((e) => normalize(e.status_suivis_evangelises) === "En cours");
      const refus = filteredSuivis.filter((e) => normalize(e.status_suivis_evangelises) === "Refus");
  
      setTotalIntegres(integres.length);
      setTotalEncour(enCours.length);
      setTotalRefus(refus.length);
      setTotalCellule(filteredSuivis.filter((e) => e.cellule_id != null).length);
      setTotalEglise(filteredSuivis.filter((e) => e.conseiller_id != null).length);
  
    } catch (err) {
      console.error("Erreur fetchKPI:", err);
    }
  };

  // ---------------- KPI PRIERE ----------------
  useEffect(() => {
    const totalEvangelises = filteredRapports.reduce(
      (acc, r) => acc + (Number(r.hommes) || 0) + (Number(r.femmes) || 0),
      0
    );
    const nbPriere = filteredEvangelises.filter((e) => e.priere_salut === true).length;
    setTotalPriereSalut(nbPriere);
  }, [filteredEvangelises]);

  useEffect(() => {
  fetchKPI();
}, [egliseId, brancheId, dateDebut, dateFin, rapports, typeFilter]);

  // ---------------- EDIT RAPPORT ----------------
  const handleSaveRapport = async (updated) => {
    await supabase.from("rapport_evangelisation").upsert(updated);
    fetchRapports();
    setMessage("✅ Rapport mis à jour !");
    setTimeout(() => setMessage(""), 3000);
  };

  // ---------------- COLLAPSE ----------------
  const toggleMonth = (monthKey) => setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  const toggleType = (typeKey) => setExpandedTypes(prev => ({ ...prev, [typeKey]: !prev[typeKey] }));

  // ---------------- GROUPING ----------------
  const groupByMonth = (data) => {
    const map = {};
    (data || []).forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const groupByType = (data) => {
    const map = {};
    (data || []).forEach((r) => {
      const type = r.type_evangelisation || "Non défini";
      if (!map[type]) map[type] = [];
      map[type].push(r);
    });
    return map;
  };

  // -------- TOTALS --------
  const getTotals = (reports) => {
    let hommes = 0, femmes = 0, priere = 0, nouveau = 0, reconciliation = 0, moissonneurs = 0;
    (reports || []).forEach(r => {
      hommes += Number(r.hommes) || 0;
      femmes += Number(r.femmes) || 0;
      priere += Number(r.priere) || 0;
      nouveau += Number(r.nouveau_converti) || 0;
      reconciliation += Number(r.reconciliation) || 0;
      moissonneurs += Number(r.moissonneurs) || 0;
    });
    return { hommes, femmes, total: hommes+femmes, priere, nouveau, reconciliation, moissonneurs };
  };

  // ---------------- LAST MONTH ----------------
  const getLastMonthKey = (data) => {
    if (!data || data.length === 0) return null;
    const dates = data.map(r => new Date(r.date));
    const lastDate = new Date(Math.max(...dates));
    return `${lastDate.getFullYear()}-${lastDate.getMonth()}`;
  };

  // ---------------- UTILS ----------------
  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex] || "";
  };        

  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500"];

  // ================= KPI =================  
  const filteredRapports = rapports.filter((r) => {
    if (typeFilter && r.type_evangelisation !== typeFilter) return false;
    if (statusFilter && r.status_suivi !== statusFilter) return false;
    return true;
  });

  //-------------------------//
  // filtrer les évangélisés selon le type
const filteredEvangelisesByType = filteredEvangelises.filter((e) => {
  if (!typeFilter) return true;
  return e.type_evangelisation === typeFilter;
});
  //------------------------

  const groupedReports = groupByMonth(filteredRapports);
  const totalEvangelises = filteredEvangelisesByType.length;
  const tauxIntegration = totalEvangelises > 0 ? Math.round((totalIntegres / totalEvangelises) * 100) : 0;

  const handleKpiClick = (status) => {
    router.push({
      pathname: "/SuiviAmesPage",
      query: { status: status || "all" },
    });
  };

  //==================
  const handleCelluleClick = () => {
  router.push("/SuiviAmesPage?cellule=true");
};

const handleConseillerClick = () => {
  router.push("/SuiviAmesPage?conseiller=true");
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
      <div id="rapport-filtres" className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-white">
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
         {showTable && (
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-black"
              >
                <option value="">Tous</option>
                <option value="Individuel">Individuel</option>
                <option value="Sortie de groupe">Sortie de groupe</option>
                <option value="Campagne d’évangélisation">Campagne d’évangélisation</option>
                <option value="Évangélisation de rue">Évangélisation de rue</option>
                <option value="Évangélisation maison">Évangélisation maison</option>
                <option value="Évangélisation stade">Évangélisation stade</option>
              </select>
            </div>
          )}
        </div>
      </div>
     
      {showTable && (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
      
          {/* Évangélisés */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick(null)}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalEvangelises}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Évangélisés</div>
          </div>
      
          {/* Envoyés au suivi */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("Envoyé")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">
              {filteredEvangelisesByType.filter(e => e.status_suivi === "Envoyé").length}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Envoyés au suivi</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0
                ? Math.round((filteredEvangelisesByType.filter(e => e.status_suivi === "Envoyé").length / totalEvangelises) * 100)
                : 0}%
            </div>
          </div>

            {/* Non envoyés au suivi */}
            <div
              className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:scale-105 transition-transform flex flex-col items-center"
              onClick={() => handleKpiClick("NonEnvoye")} // tu peux gérer la navigation comme tu veux
            >
              <div className="text-2xl sm:text-3xl font-semibold">
                {filteredEvangelisesByType.filter(e => e.status_suivi !== "Envoyé").length}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Non envoyés</div>
              <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
                {totalEvangelises > 0
                  ? Math.round((filteredEvangelisesByType.filter(e => e.status_suivi !== "Envoyé").length / totalEvangelises) * 100)
                  : 0}%
              </div>
            </div>
      
          {/* Intégrés */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("Intégré")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalIntegres}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Intégrés</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0 ? Math.round((totalIntegres / totalEvangelises) * 100) : 0}%
            </div>
          </div>
      
          {/* En cours */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("En cours")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalEncour}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">En cours</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0 ? Math.round((totalEncour / totalEvangelises) * 100) : 0}%
            </div>
          </div>
      
          {/* Refus */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-red-400 to-red-600 text-white hover:scale-105 transition-transform flex flex-col items-center"
            onClick={() => handleKpiClick("Refus")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalRefus}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Refus</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEvangelises > 0 ? Math.round((totalRefus / totalEvangelises) * 100) : 0}%
            </div>
          </div>
      
          {/* Intégrés en cellule */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-indigo-400 to-indigo-500 text-white flex flex-col items-center"
            onClick={() => handleCelluleClick("all")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalCellule}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Cellule</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalCellule > 0 ? Math.round((totalCellule / filteredSuivisState.length) * 100) : 0}%
            </div>
          </div>
      
          {/* Intégrés à l'église */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-teal-400 to-teal-500 text-white flex flex-col items-center"
            onClick={() => handleConseillerClick("all")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{totalEglise}</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Église</div>
            <div className="mt-2 w-12 sm:w-16 p-1.5 sm:p-2 bg-white/20 rounded-2xl text-center text-sm sm:text-lg font-semibold">
              {totalEglise > 0 ? Math.round((totalEglise / filteredSuivisState.length) * 100) : 0}%
            </div>
          </div>
      
          {/* Convertis */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-pink-400 to-pink-500 text-white flex flex-col items-center"
            onClick={() => handleKpiClick("Converti")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">
              {totalEvangelises > 0 ? Math.round((totalPriereSalut / totalEvangelises) * 100) : 0}%
            </div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Convertis</div>
          </div>
      
          {/* Taux intégration */}
          <div
            className="p-4 sm:p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r from-orange-400 to-orange-500 text-white flex flex-col items-center"
            onClick={() => handleKpiClick("all")}
          >
            <div className="text-2xl sm:text-3xl font-semibold">{tauxIntegration}%</div>
            <div className="mt-1 text-xs sm:text-sm font-semibold text-center">Intégration</div>
          </div>
      
        </div>
      )}

      {message && <div className="text-center text-white mt-4 font-medium">{message}</div>}

      {/* TABLEAU */}
      {showTable && (
        <div id="rapport-table" className="w-full flex justify-center mt-8">
          <div className="w-full md:w-max space-y-2">
            {/* HEADER DESKTOP */}
            <div className="hidden md:flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[150px] ml-2">Type / Date</div>
              <div className="min-w-[110px] text-center ml-28">Hommes</div>
              <div className="min-w-[110px] text-center">Femmes</div>
              <div className="min-w-[110px] text-center text-orange-400 font-semibold">Total</div> 
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
                        <div className="min-w-[110px] text-center text-orange-400 font-semibold">
                       {(monthTotals.hommes || 0) + (monthTotals.femmes || 0)} </div>
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
                        <div>Total: {(monthTotals.hommes || 0) + (monthTotals.femmes || 0)}</div>
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
                                <div className="min-w-[110px] text-center text-orange-400 font-semibold">
                                  {(typeTotals.hommes || 0) + (typeTotals.femmes || 0)}
                                </div>                                  
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
                                <div>Total: {(typeTotals.hommes || 0) + (typeTotals.femmes || 0)}</div>
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
                                    <div className="min-w-[110px] text-center text-orange-400 font-semibold">
                                      {(r.hommes || 0) + (r.femmes || 0)}
                                    </div>
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
                                    <div>Total: {(r.hommes || 0) + (r.femmes || 0)}</div>  
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
