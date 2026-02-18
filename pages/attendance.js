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
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, branche_id: null });
  const [expandedMonths, setExpandedMonths] = useState({});

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
  const [message, setMessage] = useState("");
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

      if (data) {
        setSuperviseur({
          eglise_id: data.eglise_id,
          branche_id: data.branche_id
        });
      }
    };
    loadSuperviseur();
  }, []);

  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;

    setLoading(true);
    setShowTable(false);

    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id);

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    query = query.order("date", { ascending: true });

    const { data } = await query;
    setReports(data || []);
    setLoading(false);
    setShowTable(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      eglise_id: superviseur.eglise_id,
      branche_id: superviseur.branche_id,
    };

    if (editId) {
      await supabase.from("attendance").update(payload).eq("id", editId);
    } else {
      await supabase.from("attendance").insert([payload]);
    }

    setFormData({
      date: "",
      hommes: 0,
      femmes: 0,
      jeunes: 0,
      enfants: 0,
      connectes: 0,
      nouveauxVenus: 0,
      nouveauxConvertis: 0,
    });

    setEditId(null);
    setShowTable(false);
  };

  const handleEdit = (report) => {
    setEditId(report.id);
    setFormData(report);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await supabase.from("attendance").delete().eq("id", id);
    fetchRapports();
  };

  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString("fr-FR");
  };

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[monthIndex] || "";
  };

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (key) => {
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const groupedReports = groupByMonth(reports);

  // 🔥 TOTAL GLOBAL
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
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
  });

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapports d'assistance
      </h1>

      {/* FILTRE */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg flex gap-4 text-white w-full max-w-3xl">
        <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="bg-transparent border px-3 py-2 rounded-lg"/>
        <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="bg-transparent border px-3 py-2 rounded-lg"/>
        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl">
          Générer
        </button>
      </div>

      {/* TABLE */}
      {showTable && (
        <div className="max-w-6xl w-full overflow-x-auto mt-6 mb-6 space-y-2">

          {/* HEADER */}
          <div className="flex font-semibold text-white px-4 py-3 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[150px]">Date</div>
            <div className="min-w-[120px] text-center">Hommes</div>
            <div className="min-w-[120px] text-center">Femmes</div>
            <div className="min-w-[120px] text-center">Jeunes</div>
            <div className="min-w-[120px] text-center">Enfants</div>
            <div className="min-w-[140px] text-center">Connectés</div>
            <div className="min-w-[150px] text-center">Nouveaux Venus</div>
            <div className="min-w-[180px] text-center">Nouveaux Convertis</div>
            <div className="min-w-[140px] text-center">Actions</div>
          </div>

          {/* LIGNES */}
          {reports.map(r => (
            <div key={r.id} className="flex items-center px-4 py-2 rounded-lg bg-white/10 border-l-4 border-l-green-500 whitespace-nowrap">
              <div className="min-w-[150px] text-white">{formatDateFR(r.date)}</div>
              <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
              <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
              <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
              <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
              <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
              <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
              <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
              <div className="min-w-[140px] text-center flex justify-center gap-2">
                <button onClick={() => handleEdit(r)}>✏️</button>
                <button onClick={() => handleDelete(r.id)}>🗑️</button>
              </div>
            </div>
          ))}

          {/* ✅ TOTAL GLOBAL */}
          <div className="flex items-center px-4 py-3 rounded-lg bg-white/20 font-bold text-white whitespace-nowrap border-t border-white/40">
            <div className="min-w-[150px]">TOTAL GLOBAL</div>
            <div className="min-w-[120px] text-center">{totalGlobal.hommes}</div>
            <div className="min-w-[120px] text-center">{totalGlobal.femmes}</div>
            <div className="min-w-[120px] text-center">{totalGlobal.jeunes}</div>
            <div className="min-w-[120px] text-center">{totalGlobal.enfants}</div>
            <div className="min-w-[140px] text-center">{totalGlobal.connectes}</div>
            <div className="min-w-[150px] text-center">{totalGlobal.nouveauxVenus}</div>
            <div className="min-w-[180px] text-center">{totalGlobal.nouveauxConvertis}</div>
            <div className="min-w-[140px]"></div>
          </div>

        </div>
      )}

      <Footer />
    </div>
  );
}
