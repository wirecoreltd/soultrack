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
  const [collapsed, setCollapsed] = useState({});

  // 🔹 Filtres date
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

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
    let query = supabase
      .from("attendance")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id)
      .order("date", { ascending: true });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data, error } = await query;
    if (error) console.error("❌ Erreur fetch:", error);
    else setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRapports(); }, [superviseur]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");
    try {
      const rapportAvecEglise = { ...formData, eglise_id: superviseur.eglise_id, branche_id: superviseur.branche_id };
      if (editId) {
        const { error } = await supabase.from("attendance").update(rapportAvecEglise).eq("id", editId);
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { error } = await supabase.from("attendance").insert([rapportAvecEglise]);
        if (error) throw error;
        setMessage("✅ Rapport ajouté !");
      }
      setTimeout(() => setMessage(""), 3000);
      setFormData({ date: "", hommes: 0, femmes: 0, jeunes: 0, enfants: 0, connectes: 0, nouveauxVenus: 0, nouveauxConvertis: 0 });
      setEditId(null);
      fetchRapports();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData({ ...r });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (error) console.error("❌ Erreur delete:", error);
    else fetchRapports();
  };

  const formatDateFr = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
  };
  const getMonthKey = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()+1}`;
  };
  const getMonthName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("fr-FR", { month: "long", year: "numeric" }).replace(/\b\w/g,l=>l.toUpperCase());
  };

  // 🔹 Grouper par mois
  const groupedReports = {};
  reports.forEach(r => {
    const key = getMonthKey(r.date);
    if (!groupedReports[key]) groupedReports[key] = [];
    groupedReports[key].push(r);
  });

  // 🔹 Totaux par mois
  const totalsByMonth = {};
  Object.entries(groupedReports).forEach(([k,list])=>{
    totalsByMonth[k] = list.reduce((acc,r)=>{
      acc.hommes += Number(r.hommes||0);
      acc.femmes += Number(r.femmes||0);
      acc.jeunes += Number(r.jeunes||0);
      acc.enfants += Number(r.enfants||0);
      acc.connectes += Number(r.connectes||0);
      acc.nouveauxVenus += Number(r.nouveauxVenus||0);
      acc.nouveauxConvertis += Number(r.nouveauxConvertis||0);
      return acc;
    }, {hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0});
  });

  // 🔹 Total global
  const totalGlobal = reports.reduce((acc,r)=>{
    acc.hommes += Number(r.hommes||0);
    acc.femmes += Number(r.femmes||0);
    acc.jeunes += Number(r.jeunes||0);
    acc.enfants += Number(r.enfants||0);
    acc.connectes += Number(r.connectes||0);
    acc.nouveauxVenus += Number(r.nouveauxVenus||0);
    acc.nouveauxConvertis += Number(r.nouveauxConvertis||0);
    return acc;
  }, {hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0});

  if (loading) return <p className="text-center mt-10 text-lg text-white">Chargement...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold text-white mt-4 mb-6 text-center">Rapports d'assistance</h1>

      {/* FORMULAIRE */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["date","hommes","femmes","jeunes","enfants","connectes","nouveauxVenus","nouveauxConvertis"].map((name)=>(
            <div key={name} className="flex flex-col">
              <label className="font-medium mb-1 text-white">{name==="date"?"Date":name.charAt(0).toUpperCase()+name.slice(1)}</label>
              <input type={name==="date"?"date":"number"} name={name} value={formData[name]} onChange={handleChange} className="input bg-white/20 text-white placeholder-white" required={name==="date"}/>
            </div>
          ))}
          <button type="submit" className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all">{editId?"Mettre à jour":"Ajouter le rapport"}</button>
        </form>
        {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
      </div>

      {/* FILTRE */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-4 flex flex-wrap justify-center gap-4 text-white w-full max-w-3xl">
        <div className="flex flex-col w-full sm:w-auto">
          <label className="font-medium mb-1">Date de début</label>
          <input type="date" value={dateDebut} onChange={e=>setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label className="font-medium mb-1">Date de fin</label>
          <input type="date" value={dateFin} onChange={e=>setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        </div>
        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto self-end">Générer</button>
      </div>

      {/* TABLEAU COMPLET */}
      <div className="max-w-6xl w-full overflow-x-auto mt-6 mb-6">
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-white/5">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Hommes</th>
              <th className="px-4 py-2">Femmes</th>
              <th className="px-4 py-2">Jeunes</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Enfants</th>
              <th className="px-4 py-2">Connectés</th>
              <th className="px-4 py-2">Nouveaux Venus</th>
              <th className="px-4 py-2">Nouveaux Convertis</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedReports).map(([monthKey,list])=>{
              const monthName = getMonthName(list[0].date);
              const monthTotal = totalsByMonth[monthKey];
              const isCollapsed = collapsed[monthKey] ?? true;

              return (
                <React.Fragment key={monthKey}>
                  {/* Ligne mois */}
                  <tr className="bg-white/20 cursor-pointer" onClick={()=>setCollapsed(prev=>({...prev,[monthKey]:!isCollapsed}))}>
                    <td className="px-4 py-2 font-bold">{isCollapsed ? "➕" : "➖"} {monthName}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.hommes}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.femmes}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.jeunes}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.hommes+monthTotal.femmes+monthTotal.jeunes}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.enfants}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.connectes}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.nouveauxVenus}</td>
                    <td className="px-4 py-2 font-semibold">{monthTotal.nouveauxConvertis}</td>
                    <td></td>
                  </tr>
                  {!isCollapsed && list.map(r=>{
                    const total = Number(r.hommes)+Number(r.femmes)+Number(r.jeunes);
                    return (
                      <tr key={r.id} className="bg-white/10 hover:bg-white/20">
                        <td className="px-4 py-2">{formatDateFr(r.date)}</td>
                        <td className="px-4 py-2">{r.hommes}</td>
                        <td className="px-4 py-2">{r.femmes}</td>
                        <td className="px-4 py-2">{r.jeunes}</td>
                        <td className="px-4 py-2 font-semibold">{total}</td>
                        <td className="px-4 py-2">{r.enfants}</td>
                        <td className="px-4 py-2">{r.connectes}</td>
                        <td className="px-4 py-2">{r.nouveauxVenus}</td>
                        <td className="px-4 py-2">{r.nouveauxConvertis}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <button onClick={()=>handleEdit(r)} className="text-blue-400 hover:text-blue-600">✏️</button>
                          <button onClick={()=>handleDelete(r.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                        </td>
                      </tr>
                    )
                  })}
                  {/* Total du mois quand expand */}
                  {!isCollapsed && (
                    <tr className="bg-white/20 font-bold">
                      <td className="px-4 py-2">- Total {monthName}</td>
                      <td className="px-4 py-2">{monthTotal.hommes}</td>
                      <td className="px-4 py-2">{monthTotal.femmes}</td>
                      <td className="px-4 py-2">{monthTotal.jeunes}</td>
                      <td className="px-4 py-2">{monthTotal.hommes+monthTotal.femmes+monthTotal.jeunes}</td>
                      <td className="px-4 py-2">{monthTotal.enfants}</td>
                      <td className="px-4 py-2">{monthTotal.connectes}</td>
                      <td className="px-4 py-2">{monthTotal.nouveauxVenus}</td>
                      <td className="px-4 py-2">{monthTotal.nouveauxConvertis}</td>
                      <td></td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}

            {/* Total global */}
            <tr className="bg-white/30 font-bold">
              <td className="px-4 py-2">TOTAL GLOBAL</td>
              <td className="px-4 py-2">{totalGlobal.hommes}</td>
              <td className="px-4 py-2">{totalGlobal.femmes}</td>
              <td className="px-4 py-2">{totalGlobal.jeunes}</td>
              <td className="px-4 py-2">{totalGlobal.hommes+totalGlobal.femmes+totalGlobal.jeunes}</td>
              <td className="px-4 py-2">{totalGlobal.enfants}</td>
              <td className="px-4 py-2">{totalGlobal.connectes}</td>
              <td className="px-4 py-2">{totalGlobal.nouveauxVenus}</td>
              <td className="px-4 py-2">{totalGlobal.nouveauxConvertis}</td>
              <td></td>
            </tr>

          </tbody>
        </table>
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
