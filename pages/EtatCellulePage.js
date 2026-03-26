"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function EtatCellulePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <EtatCellule />
    </ProtectedRoute>
  );
}

function EtatCellule() {
  const [reports, setReports] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) fetchReports();
  }, [userProfile, filterDebut, filterFin]);

  // ================= FETCH USER =================
  const fetchUserProfile = async () => {
    const user = supabase.auth.getUser
      ? (await supabase.auth.getUser()).data.user
      : null;
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erreur fetch user profile:", error);
      return;
    }
    setUserProfile(data);
  };

  // ================= FETCH DATA =================
  const fetchReports = async () => {
    try {
      setShowTable(false);

      // ================= CELLULES & PROFILES =================
      const { data: cellules, error: cellulesError } = await supabase
        .from("cellules")
        .select("id, cellule_full, responsable_id");
      if (cellulesError) throw cellulesError;

      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, prenom, nom");
      if (profilesError) throw profilesError;

     //============================
 // ================= ETAT_CELLULE =================
const { data: dataCellule, error: errorCellule } = await supabase
  .from("etat_cellule")
  .select("*")
  .not("cellule_id", "is", null)
  .order("date_evangelise", { ascending: false });
      // ================= MEMBRES_VENUS_PAR_EGLISE =================
      const { data: dataEglise, error: errorEglise } = await supabase
        .from("membres_venus_par_eglise")
        .select("*")
        .order("date_evangelise", { ascending: false });
      if (errorEglise) throw errorEglise;

      // ================= NORMALIZE & ADD RESPONSABLE =================
      const addResponsableName = (arr) =>
        (arr || []).map((r) => {
          const cellule = cellules.find((c) => c.id === r.cellule_id);
          const responsableProfile = allProfiles.find(
            (p) => p.id === cellule?.responsable_id
          );
          return {
            ...r,
            responsable_cellule: responsableProfile
              ? `${responsableProfile.prenom} ${responsableProfile.nom}`
              : "Inconnu",
            cellule_full: cellule?.cellule_full || r.cellule_full,
          };
        });

      let normalizedCellule = addResponsableName(dataCellule).map((r) => ({
        id: r.id,
        nom: r.nom,
        prenom: r.prenom,
        nom_complet: `${r.prenom} ${r.nom}`,
        type_evangelisation: r.type_evangelisation || "Evangélisation",
        status_suivis_evangelises: r.status_suivis_evangelises,
        date_evangelise: r.date_evangelise,
        date_suivi: r.date_suivi,
        date_integration: r.date_integration,
        date_baptise: r.date_baptise,
        ministere_date: r.ministere_date,
        cellule_full: r.cellule_full,
        responsable_cellule: r.responsable_cellule,
      }));

      let normalizedEglise = addResponsableName(dataEglise).map((r) => ({
        id: r.id,
        nom: r.nom || "",
        prenom: r.prenom || "",
        nom_complet: r.nom_complet || `${r.prenom} ${r.nom}`,
        type_evangelisation: r.type_integration || "Integration",
        status_suivis_evangelises: r.statut || "Inconnu",
        date_evangelise: r.date_evangelise,
        date_suivi: r.envoyer_au_suivi_le,
        date_integration: r.date_integration,
        date_baptise: r.bapteme_date,
        ministere_date: r.debut_ministere,
        cellule_full: r.cellule_full,
        responsable_cellule: r.responsable_cellule,
      }));

      // ================= COMBINE & FILTER =================
      let combined = [...normalizedCellule, ...normalizedEglise];

      combined = combined.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
      combined = combined.filter((r) => r.cellule_full);

      if (!userProfile.roles?.includes("Administrateur")) {
        combined = combined.filter(
          (r) =>
            cellules.find((c) => c.cellule_full === r.cellule_full)
              ?.responsable_id === userProfile.id
        );
      }

      if (filterDebut) combined = combined.filter((r) => new Date(r.date_evangelise) >= new Date(filterDebut));
      if (filterFin) combined = combined.filter((r) => new Date(r.date_evangelise) <= new Date(filterFin));

      setReports(combined);

      // ================= KPI =================
      setKpis({
  totalEvangelises: dataCellule.length,
  totalVenus: dataEglise.length,
  totalIntegration: combined.filter((r) => r.date_integration).length,
  totalBapteme: combined.filter((r) => r.date_baptise).length,
  totalMinistere: combined.filter((r) => r.ministere_date).length,
  totalRefus: combined.filter((r) => r.status_suivis_evangelises?.toLowerCase().includes("refus")).length,
  totalEncours: combined.filter((r) => r.status_suivis_evangelises?.toLowerCase().includes("cours")).length,
  totalAttente: combined.filter((r) => r.status_suivis_evangelises?.toLowerCase().includes("attente")).length,
});

      setShowTable(true);
    } catch (error) {
      console.error("Erreur fetch :", error);
      setReports([]);
      setShowTable(false);
    }
  };

  // ================= UTIL =================
  const getStatusStyles = (status) => {
    if (!status) return { border: "border-gray-400", text: "text-gray-300" };
    const s = status.toLowerCase();
    if (s.includes("intégr") || s.includes("integre"))
      return { border: "border-green-500", text: "text-green-400" };
    if (s.includes("refus")) return { border: "border-red-500", text: "text-red-400" };
    if (s.includes("cours") || s.includes("suivi"))
      return { border: "border-orange-500", text: "text-orange-400" };
    return { border: "border-blue-500", text: "text-blue-400" };
  };

  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex] || "";
  };

  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach((r) => {
      const d = new Date(r.date_evangelise);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const groupedReports = Object.entries(groupByMonth(reports))
    .sort((a, b) => {
      const [yearA, monthA] = a[0].split("-").map(Number);
      const [yearB, monthB] = b[0].split("-").map(Number);
      return new Date(yearB, monthB) - new Date(yearA, monthA);
    });

  // ================= RENDER =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        État de <span className="text-amber-300">Cellule</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
        <input type="date" value={filterDebut} onChange={(e) => setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <input type="date" value={filterFin} onChange={(e) => setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white" />
        <button onClick={fetchReports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 w-full max-w-6xl">
        <div className="p-4 rounded-2xl bg-blue-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalEvangelises}</div>
          <div className="text-sm">Total Évangélisés</div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalVenus}</div>
          <div className="text-sm">Total Venus Église</div>
        </div>
        <div className="p-4 rounded-2xl bg-green-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalIntegration}</div>
          <div className="text-sm">Intégrés</div>
          <div className="text-sm">{kpis.totalEvangelises ? Math.round((kpis.totalIntegration/kpis.totalEvangelises)*100) : 0}%</div>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalBapteme}</div>
          <div className="text-sm">Baptêmes</div>
          <div className="text-sm">{kpis.totalEvangelises+kpis.totalVenus ? Math.round((kpis.totalBapteme/(kpis.totalEvangelises+kpis.totalVenus))*100) : 0}%</div>
        </div>
        <div className="p-4 rounded-2xl bg-pink-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalMinistere}</div>
          <div className="text-sm">Ministère</div>
        </div>
        <div className="p-4 rounded-2xl bg-red-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalRefus}</div>
          <div className="text-sm">Refus</div>
        </div>
        <div className="p-4 rounded-2xl bg-yellow-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalEncours}</div>
          <div className="text-sm">En cours</div>
        </div>
        <div className="p-4 rounded-2xl bg-gray-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalAttente}</div>
          <div className="text-sm">En attente</div>
        </div>
      </div>

      {/* ================= TABLEAU ================= */}
      {showTable && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-full max-w-7xl">
            {/* DESKTOP */}
            <div className="hidden md:block w-full overflow-x-auto">
              <div className="w-max mx-auto space-y-2 bg-white/5 p-2 rounded-xl">
                <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                  <div className="min-w-[150px]">Date Evangelisé</div>
                  <div className="min-w-[200px] text-center">Nom Complet</div>
                  <div className="min-w-[200px] text-center">Type</div>
                  <div className="min-w-[200px] text-center">Statut</div>
                  <div className="min-w-[150px] text-center">Envoyé au Suivi</div>
                  <div className="min-w-[150px] text-center">Date Intégration</div>
                  <div className="min-w-[150px] text-center">Date Baptême</div>
                  <div className="min-w-[150px] text-center">Début Ministère</div>
                  <div className="min-w-[220px] text-center">Cellule</div>
                  <div className="min-w-[200px] text-center">Responsable</div>
                </div>

                {groupedReports.map(([monthKey, rows]) => {
                  const [year, monthIndex] = monthKey.split("-").map(Number);
                  const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                  const isExpanded = expandedMonths[monthKey] || false;

                  return (
                    <div key={monthKey} className="space-y-1">
                      <div
                        className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-amber-300 cursor-pointer"
                        onClick={() => toggleMonth(monthKey)}
                      >
                        <div className="min-w-[150px] text-white font-semibold">
                          {isExpanded ? "➖" : "➕"} {monthLabel} ({rows.length})
                        </div>
                      </div>

                      {isExpanded &&
                        rows.map((r, i) => {
                          const statusStyle = getStatusStyles(r.status_suivis_evangelises);
                          return (
                            <div
                              key={i}
                              className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${statusStyle.border}`}
                            >
                              <div className="min-w-[150px] text-white">{formatDateFR(r.date_evangelise)}</div>
                              <div className="min-w-[200px] text-center text-white">{r.nom_complet}</div>
                              <div className="min-w-[200px] text-center text-white">{r.type_evangelisation}</div>
                              <div className={`min-w-[200px] text-center font-semibold ${statusStyle.text}`}>{r.status_suivis_evangelises}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_suivi)}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_integration)}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_baptise)}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.ministere_date)}</div>
                              <div className="min-w-[220px] text-center text-white">{r.cellule_full}</div>
                              <div className="min-w-[200px] text-center text-white">{r.responsable_cellule}</div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-4">
              {groupedReports.map(([monthKey, rows]) => {
                const [year, monthIndex] = monthKey.split("-").map(Number);
                const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                return (
                  <div key={monthKey} className="space-y-2">
                    <h3 className="text-white font-bold">{monthLabel}</h3>
                    {rows.map((r, i) => (
                      <div key={i} className="bg-white/10 rounded-xl p-4 text-white space-y-1">
                        <p><strong>Date:</strong> {formatDateFR(r.date_evangelise)}</p>
                        <p><strong>Nom:</strong> {r.nom_complet}</p>
                        <p><strong>Type:</strong> {r.type_evangelisation}</p>
                        <p><strong>Statut:</strong> {r.status_suivis_evangelises}</p>
                        <p><strong>Envoyé au suivi:</strong> {formatDateFR(r.date_suivi)}</p>
                        <p><strong>Date Intégration:</strong> {formatDateFR(r.date_integration)}</p>
                        <p><strong>Baptême:</strong> {formatDateFR(r.date_baptise)}</p>
                        <p><strong>Début Ministère:</strong> {formatDateFR(r.ministere_date)}</p>
                        <p><strong>Cellule:</strong> {r.cellule_full}</p>
                        <p><strong>Responsable:</strong> {r.responsable_cellule}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
