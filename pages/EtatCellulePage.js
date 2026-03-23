"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function EtatCellulePage({ egliseId, brancheId }) {
  const [reports, setReports] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [typeCollapsedDesktop, setTypeCollapsedDesktop] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: null, endDate: null });

  // FETCH DATA
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchEtatCellule(egliseId, brancheId, filters);
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [egliseId, brancheId, filters]);

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  // TOTALS FUNCTIONS
  const calculateMonthTotals = (typesObj) => {
    const totals = { hommes:0, femmes:0, jeunes:0, total:0, enfants:0, connectes:0, nouveauxVenus:0, nouveauxConvertis:0 };
    Object.values(typesObj).forEach(rows => {
      rows.forEach(r => {
        totals.hommes += Number(r.hommes);
        totals.femmes += Number(r.femmes);
        totals.jeunes += Number(r.jeunes);
        totals.total += Number(r.hommes)+Number(r.femmes)+Number(r.jeunes);
        totals.enfants += Number(r.enfants || 0);
        totals.connectes += Number(r.connectes || 0);
        totals.nouveauxVenus += Number(r.nouveauxVenus || 0);
        totals.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
      });
    });
    return totals;
  };

  const calculateTypeTotals = (rows) => {
    const totals = { hommes:0, femmes:0, jeunes:0, total:0, enfants:0, connectes:0, nouveauxVenus:0, nouveauxConvertis:0 };
    rows.forEach(r => {
      totals.hommes += Number(r.hommes);
      totals.femmes += Number(r.femmes);
      totals.jeunes += Number(r.jeunes);
      totals.total += Number(r.hommes)+Number(r.femmes)+Number(r.jeunes);
      totals.enfants += Number(r.enfants || 0);
      totals.connectes += Number(r.connectes || 0);
      totals.nouveauxVenus += Number(r.nouveauxVenus || 0);
      totals.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
    });
    return totals;
  };

  const formatDateFR = (dateStr) => new Date(dateStr).toLocaleDateString("fr-FR");

  const splitTypeName = (typeName, maxLength=20) => {
    return typeName.length > maxLength ? typeName.slice(0,maxLength)+"..." : typeName;
  }

  if (loading) return <Layout>Chargement...</Layout>;

  return (
    <ProtectedRoute roles={["Admin", "ResponsableCellule"]}>
      <Layout title="État de cellule">
        <div className="max-w-6xl mx-auto p-4">

          {/* ====== FILTRES DATES ====== */}
          <div className="flex gap-4 mb-4">
            <input type="date" className="border p-2 rounded" 
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
            <input type="date" className="border p-2 rounded"
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>

          {/* ====== TABLEAU / CARDS ====== */}
          <div className="overflow-x-auto">
            <div className="w-max space-y-2">

              {/* HEADER TABLE DESKTOP */}
              <div className="hidden md:flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                <div className="min-w-[200px]">Nom / Prénom</div>
                <div className="min-w-[150px] text-center">Téléphone</div>
                <div className="min-w-[140px] text-center">Date évangélisation</div>
                <div className="min-w-[180px] text-center">Type évangélisation</div>
                <div className="min-w-[160px] text-center">Statut suivi</div>
                <div className="min-w-[160px] text-center">Date intégration</div>
                <div className="min-w-[140px] text-center">Date baptême</div>
                <div className="min-w-[180px] text-center">Dernier ministère</div>
                <div className="min-w-[220px] text-center">Cellule / Responsable</div>
              </div>

              {reports.map((r, idx) => (
                <div key={idx} className="flex md:flex-row flex-col px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                  <div className="min-w-[200px]">{r.nom} {r.prenom}</div>
                  <div className="min-w-[150px] text-center">{r.telephone}</div>
                  <div className="min-w-[140px] text-center">{formatDateFR(r.date_evangelise)}</div>
                  <div className="min-w-[180px] text-center">{r.type_evangelisation}</div>
                  <div className="min-w-[160px] text-center">{r.status_suivis_evangelises}</div>
                  <div className="min-w-[160px] text-center">{r.date_integration ? formatDateFR(r.date_integration) : "-"}</div>
                  <div className="min-w-[140px] text-center">{r.date_baptise ? formatDateFR(r.date_baptise) : "-"}</div>
                  <div className="min-w-[180px] text-center">{r.ministere_date ? formatDateFR(r.ministere_date) : "-"}</div>
                  <div className="min-w-[220px] text-center">{r.cellule_full} / {r.responsable_cellule}</div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </Layout>
    </ProtectedRoute>
  );
}
