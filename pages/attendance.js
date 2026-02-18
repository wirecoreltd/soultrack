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
    setShowTable(true);
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

  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await supabase.from("attendance").delete().eq("id", id);
    fetchRapports();
  };

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[monthIndex];
  };

  const groupByMonth = (data) => {
    const map = {};
    data.forEach(r => {
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
    hommes: 0,femmes: 0,jeunes: 0,enfants: 0,
    connectes: 0,nouveauxVenus: 0,nouveauxConvertis: 0
  });

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6">
        Rapports d'assistance
      </h1>

      {/* FORMULAIRE */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <input
              key={key}
              type={key === "date" ? "date" : "number"}
              name={key}
              value={formData[key]}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.value })
              }
              className="bg-white/20 text-white p-2 rounded-lg"
              required={key === "date"}
            />
          ))}
          <button className="col-span-2 bg-indigo-500 py-3 rounded-xl text-white font-bold">
            {editId ? "Mettre à jour" : "Ajouter"}
          </button>
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

      {/* TABLE */}
      {showTable && (
        <div className="max-w-6xl w-full mt-6 space-y-2">

          {Object.entries(groupedReports).map(([monthKey, monthReports]) => {
            const [year, monthIndex] = monthKey.split("-").map(Number);
            const label = `${getMonthNameFR(monthIndex)} ${year}`;

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

                {/* HEADER MOIS */}
                <div
                  className="flex justify-between bg-white/20 text-white px-4 py-3 rounded-lg cursor-pointer font-bold"
                  onClick={() =>
                    setExpandedMonths(prev => ({
                      ...prev,
                      [monthKey]: !prev[monthKey]
                    }))
                  }
                >
                  <div>{label}</div>
                  <div>Total: {monthTotal.hommes + monthTotal.femmes + monthTotal.jeunes}</div>
                </div>

                {/* LIGNES */}
                {expandedMonths[monthKey] &&
                  monthReports.map((r) => (
                    <div key={r.id} className="flex justify-between bg-white/10 text-white px-4 py-2 rounded-lg">
                      <div>{new Date(r.date).toLocaleDateString("fr-FR")}</div>
                      <div>{r.hommes + r.femmes + r.jeunes}</div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(r)}>✏️</button>
                        <button onClick={() => handleDelete(r.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}

              </div>
            );
          })}

          {/* TOTAL GLOBAL */}
          <div className="bg-white/30 text-white font-bold px-4 py-3 rounded-lg mt-4 flex justify-between">
            <div>TOTAL GLOBAL</div>
            <div>{totalGlobal.hommes + totalGlobal.femmes + totalGlobal.jeunes}</div>
          </div>

        </div>
      )}

      <Footer />
    </div>
  );
}
