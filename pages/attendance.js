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

  const [formData, setFormData] = useState({
    date: "",
    numero_culte: 1,
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

  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (error) console.error("Erreur fetch superviseur :", error);
      else setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
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

    query = query.order("date", { ascending: true }).order("numero_culte", { ascending: true });

    const { data, error } = await query;
    if (error) console.error("❌ Erreur fetch:", error);
    else setReports(data || []);

    setLoading(false);
    setShowTable(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    try {
      const rapportAvecEglise = {
        ...formData,
        eglise_id: superviseur.eglise_id,
        branche_id: superviseur.branche_id,
      };

      if (editId) {
        const { error } = await supabase
          .from("attendance")
          .update(rapportAvecEglise)
          .eq("id", editId);
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { error } = await supabase
          .from("attendance")
          .insert([rapportAvecEglise]);
        if (error) throw error;
        setMessage("✅ Rapport ajouté !");
      }

      setTimeout(() => setMessage(""), 3000);

      setFormData({
        date: "",
        numero_culte: 1,
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
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const handleEdit = (report) => {
    setEditId(report.id);
    setFormData({
      date: report.date,
      numero_culte: report.numero_culte || 1,
      hommes: report.hommes,
      femmes: report.femmes,
      jeunes: report.jeunes,
      enfants: report.enfants,
      connectes: report.connectes,
      nouveauxVenus: report.nouveauxVenus,
      nouveauxConvertis: report.nouveauxConvertis,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("id", id);
    if (error) console.error("❌ Erreur delete:", error);
    else fetchRapports();
  };

  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months[monthIndex] || "";
  };

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
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
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
  });

  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500","border-pink-500","border-indigo-500"];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapports d'assistance
      </h1>

      {/* Formulaire */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[ 
            { label: "Date", name: "date", type: "date" },
            { label: "Numéro de culte", name: "numero_culte", type: "select" },
            { label: "Hommes", name: "hommes", type: "number" },
            { label: "Femmes", name: "femmes", type: "number" },
            { label: "Jeunes", name: "jeunes", type: "number" },
            { label: "Enfants", name: "enfants", type: "number" },
            { label: "Connectés", name: "connectes", type: "number" },
            { label: "Nouveaux venus", name: "nouveauxVenus", type: "number" },
            { label: "Nouveaux convertis", name: "nouveauxConvertis", type: "number" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="font-medium mb-1 text-white">{field.label}</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  id={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="input bg-white/20 text-white placeholder-white"
                >
                  {[1,2,3,4,5,6,7].map((n) => (
                    <option key={n} value={n}>{n} {n===1 ? "er" : "ème"} Culte</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="input bg-white/20 text-white placeholder-white"
                  required={field.type === "date"}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all"
          >
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>
        </form>
        {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
      </div>

      {/* Filtre date */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-4 flex flex-wrap justify-center gap-4 text-white w-full max-w-3xl">
        <div className="flex flex-col w-full sm:w-auto">
          <label htmlFor="dateDebut" className="font-medium mb-1">Date de début</label>
          <input
            type="date"
            id="dateDebut"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label htmlFor="dateFin" className="font-medium mb-1">Date de fin</label>
          <input
            type="date"
            id="dateFin"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto self-end"
        >
          Générer
        </button>
      </div>

      {/* 🔹 Tableau des rapports */}
    {showTable && (
    <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
      <div className="w-max space-y-2">
    
        {/* HEADER */}
        <div className="flex font-semibold uppercase text-white px-4 py-3 
                        border-b border-white/30 bg-white/5 rounded-t-xl 
                        whitespace-nowrap border-l-4 border-transparent">
    
          <div className="min-w-[150px] pl-2">Culte / Date</div>
          <div className="min-w-[120px] text-center">Hommes</div>
          <div className="min-w-[120px] text-center">Femmes</div>
          <div className="min-w-[120px] text-center">Jeunes</div>
          <div className="min-w-[130px] text-center text-orange-400 font-semibold">Total</div>
          <div className="min-w-[120px] text-center">Enfants</div>
          <div className="min-w-[140px] text-center">Connectés</div>
          <div className="min-w-[150px] text-center">Nouveaux Venus</div>
          <div className="min-w-[180px] text-center">Nouveaux Convertis</div>
          <div className="min-w-[140px] text-center text-orange-400 font-semibold">Actions</div>
        </div>
    
        {/* LIGNES */}
        {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
          const [year, monthIndex] = monthKey.split("-").map(Number);
          const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
          const isExpanded = expandedMonths[monthKey] || false;
          const borderColor = borderColors[idx % borderColors.length];
    
          const totalMonth = monthReports.reduce((acc, r) => {
            acc.hommes += Number(r.hommes || 0);
            acc.femmes += Number(r.femmes || 0);
            acc.jeunes += Number(r.jeunes || 0);
            acc.enfants += Number(r.enfants || 0);
            acc.connectes += Number(r.connectes || 0);
            acc.nouveauxVenus += Number(r.nouveauxVenus || 0);
            acc.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
            return acc;
          }, {
            hommes: 0, femmes: 0, jeunes: 0,
            enfants: 0, connectes: 0,
            nouveauxVenus: 0, nouveauxConvertis: 0
          });
    
          return (
            <div key={monthKey} className="space-y-1">
    
              {/* MOIS */}
              <div
                className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer 
                            border-l-4 ${borderColor}`}
                onClick={() => toggleMonth(monthKey)}
              >
                <div className="min-w-[150px] pl-2 text-white font-semibold">
                  {isExpanded ? "➖" : "➕"} {monthLabel}
                </div>
    
                <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.hommes}</div>
                <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.femmes}</div>
                <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.jeunes}</div>
                <div className="min-w-[130px] text-center text-orange-400 font-semibold">
                  {totalMonth.hommes + totalMonth.femmes + totalMonth.jeunes}
                </div>
                <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.enfants}</div>
                <div className="min-w-[140px] text-center text-orange-400 font-semibold">{totalMonth.connectes}</div>
                <div className="min-w-[150px] text-center text-orange-400 font-semibold">{totalMonth.nouveauxVenus}</div>
                <div className="min-w-[180px] text-center text-orange-400 font-semibold">{totalMonth.nouveauxConvertis}</div>
                <div className="min-w-[140px]"></div>
              </div>
    
              {/* DETAILS */}
              {(isExpanded || monthReports.length === 1) &&
                monthReports.map((r) => {
                  const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
                  const culteLabel =
                    r.numero_culte === 1
                      ? "1er Culte"
                      : `${r.numero_culte}ème Culte`;
    
                  return (
                    <div
                      key={r.id}
                      className="flex items-center px-4 py-2 rounded-lg 
                                 bg-white/10 hover:bg-white/20 transition 
                                 border-l-4 border-l-green-500"
                    >
                      <div className="min-w-[150px] pl-2 text-white">
                        {`${culteLabel} : ${formatDateFR(r.date)}`}
                      </div>
    
                      <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                      <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                      <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                      <div className="min-w-[130px] text-center text-orange-400 font-semibold">{total}</div>
                      <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                      <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                      <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                      <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
    
                      <div className="min-w-[140px] text-center flex justify-center gap-2">
                        <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-600">✏️</button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* TOTAL GLOBAL */}
          <div className="flex items-center px-6 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl text-orange-500 font-semibold">
            <div className="min-w-[150px]">Total Global</div>
            <div className="min-w-[120px] text-center text-orange-500 font-semibold -ml-1">{totalGlobal.hommes}</div>
            <div className="min-w-[120px] text-center text-orange-500 font-semibold">{totalGlobal.femmes}</div>
            <div className="min-w-[120px] text-center text-orange-500 font-semibold">{totalGlobal.jeunes}</div>
            <div className="min-w-[130px] text-center text-orange-500 font-semibold">{totalGlobal.hommes + totalGlobal.femmes + totalGlobal.jeunes}</div>
            <div className="min-w-[120px] text-center text-orange-500 font-semibold">{totalGlobal.enfants}</div>
            <div className="min-w-[140px] text-center text-orange-500 font-semibold">{totalGlobal.connectes}</div>
            <div className="min-w-[150px] text-center text-orange-500 font-semibold">{totalGlobal.nouveauxVenus}</div>
            <div className="min-w-[180px] text-center text-orange-500 font-semibold">{totalGlobal.nouveauxConvertis}</div>
            <div className="min-w-[140px]"></div>
          </div>
        </div>
      </div>
      )}

      <Footer />

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
