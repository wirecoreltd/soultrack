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

  // --- CARTES STATISTIQUES ---
  const totalMembres = reports.length;

  const venuReseaux = reports.reduce((acc, r) => acc + (r.nouveauxVenus || 0), 0);
  const invite = reports.reduce((acc, r) => acc + (r.nouveauxVenus || 0), 0); // exemple
  const evangelisation = reports.reduce((acc, r) => acc + (r.nouveauxConvertis || 0), 0);

  const prieres = reports.reduce((acc, r) => acc + (r.nouveauxVenus || 0), 0);
  const conversion = reports.reduce((acc, r) => acc + (r.nouveauxConvertis || 0), 0);
  const reconciliation = reports.reduce((acc, r) => acc + (r.connectes || 0), 0);

  const ageCounts = {
    "12-17": reports.filter(r => r.jeunes >= 1 && r.jeunes <= 17).length,
    "18-25": reports.filter(r => r.jeunes >= 18 && r.jeunes <= 25).length,
    "26-30": reports.filter(r => r.jeunes >= 26 && r.jeunes <= 30).length,
    "31-40": reports.filter(r => r.jeunes >= 31 && r.jeunes <= 40).length,
    "41-55": reports.filter(r => r.jeunes >= 41 && r.jeunes <= 55).length,
    "56-69": reports.filter(r => r.jeunes >= 56 && r.jeunes <= 69).length,
    "70+": reports.filter(r => r.jeunes >= 70).length,
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Présence Culte</span>
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

      {/* Tableau des rapports */}
      {showTable && (
        <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
          <div className="w-max space-y-2">
            {/* --- TABLEAU EXISTANT --- */}
            {/* Le tableau que tu avais déjà fonctionne parfaitement */}
          </div>
        </div>
      )}

      {/* --- CARTES STATISTIQUES --- */}
      {showTable && (
        <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {/* Total Membres */}
          <div className="bg-white/20 p-4 rounded-xl text-center">
            <div className="font-bold text-white text-lg">Total membres dans le hub</div>
            <div className="text-amber-300 text-2xl font-bold">{totalMembres}</div>
          </div>

          {/* Venu / Invité / Évangélisation */}
          <div className="bg-white/20 p-4 rounded-xl text-center">
            <div className="font-bold text-white text-lg">Venu / Invité / Évangélisation</div>
            <div className="text-white">{venuReseaux} / {invite} / {evangelisation}</div>
          </div>

          {/* Prière / Conversion / Réconciliation */}
          <div className="bg-white/20 p-4 rounded-xl text-center">
            <div className="font-bold text-white text-lg">Prière / Conversion / Réconciliation</div>
            <div className="text-white">{prieres} / {conversion} / {reconciliation}</div>
          </div>

          {/* Tranche d'âge */}
          <div className="bg-white/20 p-4 rounded-xl text-center">
            <div className="font-bold text-white text-lg">Tranche d'âge</div>
            {Object.entries(ageCounts).map(([age, count]) => (
              <div key={age} className="text-white">{age}: {count}</div>
            ))}
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
}
