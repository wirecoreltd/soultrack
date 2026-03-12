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
    typeTemps: "",
    nouveauTemps: "",
    enregistrerTemps: false,
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
  const [tempsOptions, setTempsOptions] = useState(["Culte"]);

  // --- Load superviseur ---
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

  // --- Load temps enregistrés ---
  useEffect(() => {
    const loadTemps = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("typeTemps")
        .not("typeTemps", "is", null);
      if (error) {
        console.error("Erreur chargement temps:", error);
        return;
      }
      const uniqueTemps = [
        "Culte",
        ...new Set(
          data
            .map(t => t.typeTemps)
            .filter(t => t && t !== "Culte")
        )
      ];
      setTempsOptions(uniqueTemps);
    };
    loadTemps();
  }, []);

  // --- Renommer un temps ---
  const renameTemps = async (ancienNom, nouveauNom) => {
    const { error } = await supabase
      .from("attendance")
      .update({ typeTemps: nouveauNom })
      .eq("typeTemps", ancienNom);

    if (error) {
      console.error(error);
      return;
    }
    fetchRapports();
  };

  // --- Supprimer un temps ---
  const deleteTemps = async (nomTemps) => {
    const confirmDelete = confirm(
      "Si vous supprimez ce temps, les rapports existants resteront dans la base mais ils n'auront plus de nom de temps. Voulez-vous continuer ?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("attendance")
      .update({ typeTemps: null })
      .eq("typeTemps", nomTemps);

    if (error) {
      console.error(error);
      return;
    }
    fetchRapports();
  };

  // --- Fetch rapports ---
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
    if (error) console.error("Erreur fetch:", error);
    else setReports(data || []);
    setLoading(false);
    setShowTable(true);
  };

  // --- Handle form ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    let typeTempsFinal = formData.typeTemps;
    if (formData.typeTemps === "AUTRE") {
      typeTempsFinal = formData.nouveauTemps;
      if (formData.enregistrerTemps && !tempsOptions.includes(typeTempsFinal)) {
        setTempsOptions(prev => [...prev, typeTempsFinal]);
      }
    }

    try {
      const rapportAvecEglise = {
        ...formData,
        typeTemps: typeTempsFinal,
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
        typeTemps: "",
        nouveauTemps: "",
        enregistrerTemps: false,
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

  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData({
      date: r.date,
      typeTemps: r.typeTemps || "",
      nouveauTemps: "",
      enregistrerTemps: false,
      numero_culte: r.numero_culte || 1,
      hommes: r.hommes,
      femmes: r.femmes,
      jeunes: r.jeunes,
      enfants: r.enfants,
      connectes: r.connectes,
      nouveauxVenus: r.nouveauxVenus,
      nouveauxConvertis: r.nouveauxConvertis,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (error) console.error("Erreur delete:", error);
    else fetchRapports();
  };

  // --- Utilities ---
  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    return `${String(dateObj.getDate()).padStart(2,"0")}/${String(dateObj.getMonth()+1).padStart(2,"0")}/${dateObj.getFullYear()}`;
  };

  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
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

  const toggleMonth = (key) => setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));

  const groupedReports = groupByMonth(reports);

  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500","border-pink-500","border-indigo-500"];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport <span className="text-amber-300">Présence / Temps</span>
      </h1>

      {/* FORMULAIRE */}
      <div className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* DATE */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-white">Date du culte</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input bg-white/20 text-white" required/>
          </div>

          {/* TYPE TEMPS */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-white">Type du temps</label>
            <select
              name="typeTemps"
              value={formData.typeTemps}
              onChange={handleChange}
              className="input bg-white text-[#333699]"
              required
            >
              <option value="">-- Sélectionner un temps --</option>
              {tempsOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="AUTRE">+ Ajouter un temps</option>
            </select>

            {/* Boutons renommer/supprimer */}
            {tempsOptions.length > 1 && formData.typeTemps !== "AUTRE" && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tempsOptions.filter(t => t !== "Culte").map(t => (
                  <div key={t} className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-white text-sm">
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nouveauNom = prompt("Nouveau nom pour ce temps :", t);
                        if (nouveauNom && nouveauNom !== t) renameTemps(t, nouveauNom);
                      }}
                      className="text-yellow-300 hover:text-yellow-400"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTemps(t)}
                      className="text-red-300 hover:text-red-400"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NOUVEAU TEMPS */}
          {formData.typeTemps === "AUTRE" && (
            <>
              <div className="flex flex-col">
                <label className="font-medium mb-1 text-white">Nom du temps</label>
                <input
                  type="text"
                  name="nouveauTemps"
                  value={formData.nouveauTemps}
                  onChange={handleChange}
                  className="input bg-white text-black"
                  placeholder="Ex: ADP"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="enregistrerTemps"
                  checked={formData.enregistrerTemps}
                  onChange={handleChange}
                />
                <label className="text-white text-sm">
                  Enregistrer ce temps pour le futur
                </label>
              </div>
            </>
          )}

          {/* NUMÉRO CULTE */}
          {formData.typeTemps === "Culte" && (
            <div className="flex flex-col">
              <label className="font-medium mb-1 text-white">Numéro de culte</label>
              <select name="numero_culte" value={formData.numero_culte} onChange={handleChange} className="input bg-transparent text-white">
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} {n===1 ? "er" : "ème"} Culte</option>)}
              </select>
            </div>
          )}

          {/* DÉTAILS CHIFFRÉS */}
          {["hommes","femmes","jeunes","enfants","connectes","nouveauxVenus","nouveauxConvertis"].map(field => (
            <div className="flex flex-col" key={field}>
              <label className="font-medium mb-1 text-white">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input type="number" name={field} value={formData[field]} onChange={handleChange} className="input bg-white text-black"/>
            </div>
          ))}

          <button type="submit" className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all">
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>
        </form>
        {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
      </div>

      {/* FILTRE DATE */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-4 flex flex-wrap justify-center gap-4 text-white w-full max-w-3xl">
        <div className="flex flex-col w-full sm:w-auto">
          <label>Date de début</label>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label>Date de fin</label>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        </div>
        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto self-end">Générer</button>
      </div>

      {/* TABLEAU */}
      {showTable && (
        <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
          <div className="w-max space-y-2">
            {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const isExpanded = expandedMonths[monthKey] || false;
              const borderColor = borderColors[idx % borderColors.length];

              const totalMonth = monthReports.reduce((acc,r) => {
                acc.hommes += Number(r.hommes||0);
                acc.femmes += Number(r.femmes||0);
                acc.jeunes += Number(r.jeunes||0);
                acc.enfants += Number(r.enfants||0);
                acc.connectes += Number(r.connectes||0);
                acc.nouveauxVenus += Number(r.nouveauxVenus||0);
                acc.nouveauxConvertis += Number(r.nouveauxConvertis||0);
                return acc;
              }, {hommes:0,femmes:0,jeunes:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0});

              return (
                <div key={monthKey} className="space-y-1">
                  <div className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`} onClick={()=>toggleMonth(monthKey)}>
                    <div className="min-w-[150px] pl-2 text-white font-semibold">{isExpanded ? "➖":"➕"} {monthLabel}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold ml-1">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.femmes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.jeunes}</div>
                    <div className="min-w-[130px] text-center text-orange-400 font-semibold">{totalMonth.hommes+totalMonth.femmes+totalMonth.jeunes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.enfants}</div>
                    <div className="min-w-[140px] text-center text-orange-400 font-semibold">{totalMonth.connectes}</div>
                    <div className="min-w-[150px] text-center text-orange-400 font-semibold">{totalMonth.nouveauxVenus}</div>
                    <div className="min-w-[180px] text-center text-orange-400 font-semibold">{totalMonth.nouveauxConvertis}</div>
                    <div className="min-w-[140px]"></div>
                  </div>

                  {(isExpanded || monthReports.length===1) && monthReports.map(r => {
                    const total = Number(r.hommes)+Number(r.femmes)+Number(r.jeunes);
                    return (
                      <div key={r.id} className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}>
                        <div className="min-w-[150px] pl-2 text-white">{r.typeTemps} : {formatDateFR(r.date)}</div>
                        <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                        <div className="min-w-[130px] text-center text-orange-400 font-semibold">{total}</div>
                        <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                        <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                        <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                        <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
                        <div className="min-w-[140px] text-center flex justify-center gap-2">
                          <button onClick={()=>handleEdit(r)} className="text-blue-400 hover:text-blue-600">✏️</button>
                          <button onClick={()=>handleDelete(r.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
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
        select {
          background: white;
          color: black;
        }
        select:focus {
          outline: 2px solid #333699;
        }
        select option:checked {
          background: #333699;
          color: white;
        }
      `}</style>
    </div>
  );
}
