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
  const [loading, setLoading] = useState(true);

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
  const [message, setMessage] = useState("");

  // 🔹 Filtres date
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // 🔹 Charger eglise/branche du superviseur connecté
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

  // 🔹 Fetch reports filtré par eglise/branche + date
  const fetchRapports = async () => {
    if (!superviseur.eglise_id || !superviseur.branche_id) return;

    setLoading(true);
    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id)
      .order("date", { ascending: false });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data, error } = await query;
    if (error) console.error("❌ Erreur fetch:", error);
    else setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRapports();
  }, [superviseur]);

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

      setTimeout(() => setMessage(""), 3000); // disparaît après 3s

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
      fetchRapports();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const handleEdit = (report) => {
    setEditId(report.id);
    setFormData({
      date: report.date,
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

  // 🔹 TOTAL GLOBAL BAS
const totalGlobal = reports.reduce(
  (acc, r) => {
    acc.hommes += Number(r.hommes || 0);
    acc.femmes += Number(r.femmes || 0);
    acc.jeunes += Number(r.jeunes || 0);
    acc.enfants += Number(r.enfants || 0);
    acc.connectes += Number(r.connectes || 0);
    acc.nouveauxVenus += Number(r.nouveauxVenus || 0);
    acc.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
    return acc;
  },
  {
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    connectes: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
  }
);

const totalPrincipal =
  totalGlobal.hommes +
  totalGlobal.femmes +
  totalGlobal.jeunes;


  if (loading) return <p className="text-center mt-10 text-lg text-white">Chargement...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">
        Rapports d'assistance
      </h1>

      {/* 🔹 Formulaire */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Date", name: "date", type: "date" },
            { label: "Hommes", name: "hommes", type: "number" },
            { label: "Femmes", name: "femmes", type: "number" },
            { label: "Jeunes", name: "jeunes", type: "number" },
            { label: "Enfants", name: "enfants", type: "number" },
            { label: "Connectés", name: "connectes", type: "number" },
            { label: "Nouveaux venus", name: "nouveauxVenus", type: "number" },
            { label: "Nouveaux convertis", name: "nouveauxConvertis", type: "number" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="font-medium mb-1 text-white">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="input bg-white/20 text-white placeholder-white"
                required={field.type === "date"}
              />
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

      {/* 🔹 FILTRE DATE */}
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
      <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
        <div className="w-max space-y-2">
          {/* HEADER */}
          <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[150px] ml-1">Date</div>
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
          {reports.map((r) => {
            const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
            return (
              <div key={r.id} className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-purple-500">
                <div className="min-w-[150px] text-white font-semibold">{r.date}</div>
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

            {/* 🔹 TOTAL BAS */}
            <div className="flex items-center px-4 py-4 mt-2 rounded-xl bg-white/20 border-t border-white/40 font-bold">
              <div className="min-w-[150px] text-orange-400 font-semibold uppercase ml-1">TOTAL</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGlobal.hommes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGlobal.femmes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGlobal.jeunes}</div>
              <div className="min-w-[130px] text-center text-orange-400">{totalPrincipal}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalGlobal.enfants}</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">{totalGlobal.connectes}</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">{totalGlobal.nouveauxVenus}</div>
              <div className="min-w-[180px] text-center text-orange-400 font-semibold">{totalGlobal.nouveauxConvertis}</div>
              <div className="min-w-[140px]"></div>
            </div>
        </div>
      </div>

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
