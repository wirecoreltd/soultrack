"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <Attendance />
    </ProtectedRoute>
  );
}

function Attendance() {
  const [reports, setReports] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });

  const [formData, setFormData] = useState({
    date: "",
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
  });

  const [editId, setEditId] = useState(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (data) setSuperviseur(data);
    };

    loadSuperviseur();
  }, []);

  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;

    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id)
      .order("date", { ascending: true });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data } = await query;

    setReports(data || []);
    setShowTable(true);
  };

  const getMonthNameFR = (index) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[index];
  };

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

  const groupedReports = groupByMonth(reports);

  const totalGlobal = reports.reduce((acc, r) => {
    acc.hommes += Number(r.hommes || 0);
    acc.femmes += Number(r.femmes || 0);
    acc.jeunes += Number(r.jeunes || 0);
    acc.enfants += Number(r.enfants || 0);
    acc.connectes += Number(r.connectes || 0);
    acc.nouveauxVenus += Number(r.nouveauxVenus || 0);
    acc.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
    return acc;
  }, {
    hommes:0,femmes:0,jeunes:0,enfants:0,
    connectes:0,nouveauxVenus:0,nouveauxConvertis:0
  });

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">
        Rapports d'assistance
      </h1>

      {/* FORMULAIRE */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 mb-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <input
              key={key}
              type={key === "date" ? "date" : "number"}
              value={formData[key]}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.value })
              }
              className="bg-white/20 text-white p-2 rounded-lg"
            />
          ))}
        </form>
      </div>

      {/* FILTRE */}
      <div className="bg-white/10 p-4 rounded-2xl flex gap-4 text-white w-full max-w-3xl">
        <input type="date" value={dateDebut} onChange={(e)=>setDateDebut(e.target.value)} className="bg-transparent border p-2 rounded"/>
        <input type="date" value={dateFin} onChange={(e)=>setDateFin(e.target.value)} className="bg-transparent border p-2 rounded"/>
        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 rounded-xl">
          Générer
        </button>
      </div>

      {/* TABLEAU */}
      {showTable && (
        <div className="max-w-6xl w-full mt-6 space-y-2">

          {/* HEADER */}
          <div className="flex font-semibold uppercase text-white px-4 py-3 bg-white/5 rounded-lg">
            <div className="min-w-[150px]">Date</div>
            <div className="min-w-[100px] text-center">Hommes</div>
            <div className="min-w-[100px] text-center">Femmes</div>
            <div className="min-w-[100px] text-center">Jeunes</div>
            <div className="min-w-[100px] text-center">Enfants</div>
            <div className="min-w-[120px] text-center">Connectés</div>
            <div className="min-w-[150px] text-center">Nouveaux</div>
            <div className="min-w-[150px] text-center">Convertis</div>
          </div>

          {Object.entries(groupedReports).map(([monthKey, monthReports]) => {
            const [year, monthIndex] = monthKey.split("-").map(Number);
            const label = `${getMonthNameFR(monthIndex)} ${year}`;

            const isExpanded = expandedMonths[monthKey];

            const monthTotal = monthReports.reduce((acc, r) => {
              acc.hommes += Number(r.hommes || 0);
              acc.femmes += Number(r.femmes || 0);
              acc.jeunes += Number(r.jeunes || 0);
              acc.enfants += Number(r.enfants || 0);
              acc.connectes += Number(r.connectes || 0);
              acc.nouveauxVenus += Number(r.nouveauxVenus || 0);
              acc.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
              return acc;
            }, {
              hommes:0,femmes:0,jeunes:0,enfants:0,
              connectes:0,nouveauxVenus:0,nouveauxConvertis:0
            });

            return (
              <div key={monthKey} className="space-y-1">

                {/* MOIS */}
                <div
                  className="flex px-4 py-3 bg-white/20 text-white font-bold rounded-lg cursor-pointer"
                  onClick={() =>
                    setExpandedMonths(prev => ({
                      ...prev,
                      [monthKey]: !prev[monthKey]
                    }))
                  }
                >
                  {isExpanded ? "➖ " : "➕ "} {label}
                </div>

                {/* TOTAL MOIS */}
                <div className="flex px-4 py-2 bg-white/10 text-white rounded-lg">
                  <div className="min-w-[150px] font-semibold">Total {label}</div>
                  <div className="min-w-[100px] text-center">{monthTotal.hommes}</div>
                  <div className="min-w-[100px] text-center">{monthTotal.femmes}</div>
                  <div className="min-w-[100px] text-center">{monthTotal.jeunes}</div>
                  <div className="min-w-[100px] text-center">{monthTotal.enfants}</div>
                  <div className="min-w-[120px] text-center">{monthTotal.connectes}</div>
                  <div className="min-w-[150px] text-center">{monthTotal.nouveauxVenus}</div>
                  <div className="min-w-[150px] text-center">{monthTotal.nouveauxConvertis}</div>
                </div>

                {/* LIGNES DETAILS */}
                {isExpanded && monthReports.map(r => (
                  <div key={r.id} className="flex px-4 py-2 bg-white/5 text-white rounded-lg">
                    <div className="min-w-[150px]">
                      {new Date(r.date).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="min-w-[100px] text-center">{r.hommes}</div>
                    <div className="min-w-[100px] text-center">{r.femmes}</div>
                    <div className="min-w-[100px] text-center">{r.jeunes}</div>
                    <div className="min-w-[100px] text-center">{r.enfants}</div>
                    <div className="min-w-[120px] text-center">{r.connectes}</div>
                    <div className="min-w-[150px] text-center">{r.nouveauxVenus}</div>
                    <div className="min-w-[150px] text-center">{r.nouveauxConvertis}</div>
                  </div>
                ))}

              </div>
            );
          })}

          {/* TOTAL GLOBAL */}
          <div className="flex px-4 py-4 bg-white/30 text-white font-bold rounded-lg mt-4">
            <div className="min-w-[150px]">TOTAL GLOBAL</div>
            <div className="min-w-[100px] text-center">{totalGlobal.hommes}</div>
            <div className="min-w-[100px] text-center">{totalGlobal.femmes}</div>
            <div className="min-w-[100px] text-center">{totalGlobal.jeunes}</div>
            <div className="min-w-[100px] text-center">{totalGlobal.enfants}</div>
            <div className="min-w-[120px] text-center">{totalGlobal.connectes}</div>
            <div className="min-w-[150px] text-center">{totalGlobal.nouveauxVenus}</div>
            <div className="min-w-[150px] text-center">{totalGlobal.nouveauxConvertis}</div>
          </div>

        </div>
      )}

      <Footer />
    </div>
  );
}
