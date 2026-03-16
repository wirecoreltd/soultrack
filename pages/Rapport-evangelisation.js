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

  // ---------------- KPI ----------------
  const filteredRapports = statusFilter
    ? rapports.filter(r => r.status_suivi === statusFilter)
    : rapports;

  // ⚡ Correction KPI : calcul basé sur les évangélisés uniques (distinct id dans evangelises)
  const [kpiEvangelises, setKpiEvangelises] = useState(0);
  useEffect(() => {
    const fetchKpi = async () => {
      if (!egliseId || !brancheId) return;
      let query = supabase
        .from("evangelises")
        .select("id")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .distinct("id");

      if (dateDebut) query = query.gte("created_at", dateDebut);
      if (dateFin) query = query.lte("created_at", dateFin);

      const { data } = await query;
      setKpiEvangelises(data?.length || 0);
    };
    fetchKpi();
  }, [rapports, egliseId, brancheId, dateDebut, dateFin]);

  const totalEvangelises = rapports.length;
  const totalEnvoyes = rapports.filter(r => r.status_suivi === "Envoyé").length;
  const totalIntegres = rapports.filter(r => r.status_suivi === "Intégré").length;
  const totalEnCours = rapports.filter(r => r.status_suivi === "En cours").length;
  const nonIntegres = totalEvangelises - totalIntegres;
  const tauxIntegration = totalEvangelises ? Math.round((totalIntegres / totalEvangelises) * 100) : 0;

  const handleKpiClick = (status) => {
    setStatusFilter(status);
    window.scrollTo({ top: formRef.current.offsetTop, behavior: "smooth" });
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
            <div className="text-2xl font-bold">{kpiEvangelises}</div>
            <div>Évangélisés uniques</div>
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

      {/* ================= TABLEAU ================= */}
      {showTable && (
        <div id="rapport-table" className="w-full flex justify-center mt-8">
          <div className="w-full md:w-max space-y-2">
            {/* --- ... le reste de ton tableau reste inchangé, exactement comme dans ton fichier original --- */}
            {/* Tu conserves tes 400+ lignes, la structure collapsible par mois et type, l’édition, mobile/desktop, etc. */}
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
