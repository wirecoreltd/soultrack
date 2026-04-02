"use client";

import { useState, useEffect, useRef } from "react";
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
  const [tempsOptions, setTempsOptions] = useState(["Culte"]);
  const formRef = useRef(null);
  const selectRef = useRef(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [typeCollapsedDesktop, setTypeCollapsedDesktop] = useState({});
  const [availableTypes, setAvailableTypes] = useState([]);
  const [filterType, setFilterType] = useState(""); 
  const [formData, setFormData] = useState({
    date: "",
    typeTemps: "",
    nouveauTemps: "",
    enregistrerTemps: false,
    numero_culte: "",
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* ================= USER ================= */
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();
      if (error) console.error(error);
      else setSuperviseur({ eglise_id: data.eglise_id, branche_id: data.branche_id });
    };
    loadSuperviseur();
  }, []);

  /*===========*/
  // Fonction utilitaire pour splitter le texte en lignes de max 15 caractères
const splitTypeName = (name, lineLength = 15) => {
  if (!name) return "";
  const regex = new RegExp(`.{1,${lineLength}}`, "g");
  return name.match(regex).join("\n");
};

  /*------------------*/
  const groupByMonthAndType = (reports) => {
  const map = {};
  reports.forEach(r => {
    const d = new Date(r.date);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map[monthKey]) map[monthKey] = {};
    if (!map[monthKey][r.typeTemps]) map[monthKey][r.typeTemps] = [];
    map[monthKey][r.typeTemps].push(r);
  });
  return map;
};

const calculateMonthTotals = (typesObj) => {
  const totals = {hommes:0,femmes:0,jeunes:0,total:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0};
  Object.values(typesObj).forEach(rows => {
    rows.forEach(r => {
      totals.hommes += Number(r.hommes||0);
      totals.femmes += Number(r.femmes||0);
      totals.jeunes += Number(r.jeunes||0);
      totals.total += Number(r.hommes||0)+Number(r.femmes||0)+Number(r.jeunes||0);
      totals.enfants += Number(r.enfants||0);
      totals.connectes += Number(r.connectes||0);
      totals.nouveauxVenus += Number(r.nouveauxVenus||0);
      totals.nouveauxConvertis += Number(r.nouveauxConvertis||0);
    });
  });
  return totals;
};

const calculateTypeTotals = (rows) => {
  const totals = {hommes:0,femmes:0,jeunes:0,total:0,enfants:0,connectes:0,nouveauxVenus:0,nouveauxConvertis:0};
  rows.forEach(r => {
    totals.hommes += Number(r.hommes||0);
    totals.femmes += Number(r.femmes||0);
    totals.jeunes += Number(r.jeunes||0);
    totals.total += Number(r.hommes||0)+Number(r.femmes||0)+Number(r.jeunes||0);
    totals.enfants += Number(r.enfants||0);
    totals.connectes += Number(r.connectes||0);
    totals.nouveauxVenus += Number(r.nouveauxVenus||0);
    totals.nouveauxConvertis += Number(r.nouveauxConvertis||0);
  });
  return totals;
};
  
  /* ================= TEMPS ================= */
  useEffect(() => {
    const loadTemps = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("typeTemps")
         .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id)
        .not("typeTemps", "is", null);
      if (error) console.error(error);
      else {
        const uniqueTemps = ["Culte", ...new Set(data.map(t => t.typeTemps).filter(t => t && t !== "Culte"))];
        setTempsOptions(uniqueTemps);
      }
    };
    loadTemps();
  }, [superviseur]);

  /* ================= DROPDOWN CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    // Renommer un temps (✏️)
    const handleRenameTemps = async (ancienNom, nouveauNom) => {
      if (!nouveauNom) return; // si l'utilisateur annule le prompt
      try {
        const { error } = await supabase
          .from("attendance")
          .update({ typeTemps: nouveauNom })
          .eq("typeTemps", ancienNom)
          .eq("eglise_id", superviseur.eglise_id)
          .eq("branche_id", superviseur.branche_id);
        if (error) throw error;
        fetchRapports(); // recharge les rapports pour voir le nouveau nom
      } catch (err) {
        console.error("Erreur renommer temps:", err.message);
        alert("Erreur lors du renommage du temps.");
      }
    };
    
    // Supprimer un temps (🗑️)
    const handleDeleteTemps = async (nomTemps) => {
      const confirmDelete = confirm(
        "Voulez-vous vraiment supprimer ce temps ? Les rapports existants resteront mais sans nom de temps."
      );
      if (!confirmDelete) return;
    
      try {
        const { error } = await supabase
          .from("attendance")
          .update({ typeTemps: null })
          .eq("typeTemps", nomTemps)
          .eq("eglise_id", superviseur.eglise_id)
          .eq("branche_id", superviseur.branche_id);
        if (error) throw error;
        fetchRapports(); // recharge la table
      } catch (err) {
        console.error("Erreur suppression temps:", err.message);
        alert("Erreur lors de la suppression du temps.");
      }
    };

  /* ================= HANDLE FORM ================= */
  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: ["hommes","femmes","jeunes","enfants","connectes","nouveauxVenus","nouveauxConvertis"].includes(name)
      ? Number(value) || 0 // transforme "" en 0
      : value
  }));
};
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    let typeTempsFinal = formData.typeTemps === "AUTRE" ? formData.nouveauTemps : formData.typeTemps;

    if (formData.enregistrerTemps && formData.typeTemps === "AUTRE" && !tempsOptions.includes(typeTempsFinal)) {
      setTempsOptions(prev => [...prev, typeTempsFinal]);
      await supabase.from("attendance").insert([{ 
        typeTemps: typeTempsFinal,
        eglise_id: superviseur.eglise_id,
        branche_id: superviseur.branche_id  
      }]);
    }

    const rapportAvecEglise = {
      ...formData,
      typeTemps: typeTempsFinal,
      eglise_id: superviseur.eglise_id,
      branche_id: superviseur.branche_id,
      hommes: Number(formData.hommes) || 0,
      femmes: Number(formData.femmes) || 0,
      jeunes: Number(formData.jeunes) || 0,
      enfants: Number(formData.enfants) || 0,
      connectes: Number(formData.connectes) || 0,
      nouveauxVenus: Number(formData.nouveauxVenus) || 0,
      nouveauxConvertis: Number(formData.nouveauxConvertis) || 0,
      numero_culte: Number(formData.numero_culte) || 1
    };

    try {
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
      fetchRapports();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const handleEdit = (r) => {
  setEditId(r.id);

  setFormData({
    date: r.date,
    typeTemps: r.typeTemps === "Culte" ? "Culte" : "AUTRE", // <-- ici
    nouveauTemps: r.typeTemps !== "Culte" ? r.typeTemps : "", // <-- ici
    numero_culte: r.numero_culte || 1,
    hommes: r.hommes,
    femmes: r.femmes,
    jeunes: r.jeunes,
    enfants: r.enfants,
    connectes: r.connectes,
    nouveauxVenus: r.nouveauxVenus,
    nouveauxConvertis: r.nouveauxConvertis,
    enregistrerTemps: false, // par défaut
  });

  formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
};
  
    /* ================= FETCH RAPPORTS ================= */
  const fetchRapports = async () => {
    if (!superviseur.eglise_id) return;
    setLoading(true);
    let query = supabase.from("attendance").select("*")
      .eq("eglise_id", superviseur.eglise_id)
      .eq("branche_id", superviseur.branche_id);
    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);
    query = query.order("date", { ascending: true }).order("numero_culte", { ascending: true });
    const { data, error } = await query;
    if (error) console.error(error);
    else setReports(data || []);
    setLoading(false);
    setShowTable(true);
  };

  /* ================= UTIL ================= */
  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return months[monthIndex] || "";
  };
  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    return `${String(dateObj.getDate()).padStart(2,"0")}/${String(dateObj.getMonth()+1).padStart(2,"0")}/${dateObj.getFullYear()}`;
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
  const borderColors = [
  "border-red-500",
  "border-green-500",
  "border-blue-500",
  "border-yellow-500",
  "border-purple-500",
  "border-pink-500",
  "border-indigo-500"  // <- fermer la chaîne
];

  const filteredReports = filterType
  ? reports.filter(r => r.typeTemps === filterType)
  : reports;

// pour remplir le dropdown de type
useEffect(() => {
  if (reports.length > 0) {
    const types = [...new Set(reports.map(r => r.typeTemps))];
    setAvailableTypes(types);
  }
}, [reports]);                      

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">Rapport <span className="text-amber-300">Présence / Temps</span></h1>

      {/* FORMULAIRE */}
      <div ref={formRef} className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="flex flex-col">
            <label className="text-white mb-1">Date du culte</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input w-full" required />
          </div>
        
          {/* Type de temps */}
          <div className="flex flex-col relative w-full md:w-64" ref={selectRef}>
            <label className="text-white mb-1">Type du temps</label>
            <div
              className="input h-12 flex items-center justify-between px-3 cursor-pointer text-black bg-white"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {formData.typeTemps || "-- Sélectionner un temps --"} <span>▼</span>
            </div>
        
            {dropdownOpen && (
              <div className="absolute top-full left-0 z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border rounded shadow-lg">
                {tempsOptions.map((t) => (
                  <div
                    key={t}
                    className="flex justify-between items-center px-3 py-2 hover:bg-gray-200 cursor-pointer text-black"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, typeTemps: t }));
                      setDropdownOpen(false);
                    }}
                  >
                    <span>{t}</span>
                    {t !== "Culte" && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e)=>{ e.stopPropagation(); handleRenameTemps(t, prompt("Nouveau nom ?", t)) }}
                          className="text-blue-500"
                        >✏️</button>
                        <button
                          onClick={(e)=>{ e.stopPropagation(); handleDeleteTemps(t) }}
                          className="text-red-500"
                        >🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
                <div
                  className="px-3 py-2 text-[#333699] font-semibold hover:bg-gray-200 cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, typeTemps: "AUTRE", nouveauTemps: "" }))}
                >
                  + Ajouter un temps
                </div>
              </div>
            )}
          </div>
        
          {/* Nouveau temps si AUTRE */}
{formData.typeTemps === "AUTRE" && (
  <>
    <div className="flex flex-col col-span-1 md:col-span-2">
      <label className="text-white mb-1">Nom du temps</label>
      <input
        type="text"
        name="nouveauTemps"
        value={formData.nouveauTemps}
        onChange={(e) => {
          // Limite à 30 caractères
          const value = e.target.value.slice(0, 30);
          setFormData(prev => ({ ...prev, nouveauTemps: value }));
        }}
        className="input w-full"
        placeholder="Ex: ADP"
        maxLength={30} // limite côté HTML
      />
    </div>
    <div className="flex items-center gap-2 col-span-1 md:col-span-2">
      <input
        type="checkbox"
        name="enregistrerTemps"
        checked={formData.enregistrerTemps}
        onChange={e => setFormData(prev => ({ ...prev, enregistrerTemps: e.target.checked }))}
      />
      <label className="text-amber-300 text-sm">Enregistrer ce temps pour le futur</label>
    </div>
  </>
)}
        
          {/* Numéro de culte si Culte */}
          {formData.typeTemps === "Culte" && (
            <div className="flex flex-col w-full">
              <label className="text-white mb-1">Numéro de culte</label>
              <select name="numero_culte" value={formData.numero_culte} onChange={handleChange} className="input w-full appearance-none pr-8 cursor-pointer">
                <option value="">--- Sélectionner un numéro ---</option>
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} {n===1?"er":"ème"} Culte</option>)}
              </select>
            </div>
          )}
        
          {/* Détails chiffrés */}
          {["hommes","femmes","jeunes","enfants","connectes","nouveauxVenus","nouveauxConvertis"].map(field => (
            <div className="flex flex-col w-full" key={field}>
              <label className="text-white mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type="number"
                name={field}
                value={formData[field] || 0}  // <-- assure toujours un nombre
                onChange={handleChange}
                className="input w-full"
              />
            </div>
          ))}
        
          {/* Bouton */}
          <button type="submit" className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all">
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-white font-medium">{message}</p>}
      </div>

      {/* FILTRE DATE */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-white">
        
            {/* Date début */}
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold mb-1">Date de début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
                className="h-10 w-full bg-white/10 border border-white/30 rounded-lg px-4"
              />
            </div>
        
            {/* Date fin */}
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold mb-1">Date de fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
                className="h-10 w-full bg-white/10 border border-white/30 rounded-lg px-4"
              />
            </div>
        
            {/* Bouton */}
            <button
              onClick={fetchRapports}
              className="h-10 w-full bg-amber-400 text-white font-semibold px-6 rounded-lg hover:bg-amber-300 transition"
            >
              Générer
            </button>
        
            {/* Type */}
            {availableTypes.length > 0 && (
              <div className="flex flex-col w-full">
                <label className="text-sm font-semibold mb-1">Type de temps</label>
                <select
                  className="h-10 w-full bg-white/10 border border-white/30 rounded-lg px-4 text-white"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="">Tous</option>
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
        
          </div>
        </div>
     
  {/* TABLEAU / CARDS DESKTOP + MOBILE */}
{showTable && (
  <div className="max-w-5xl w-full mt-6 mb-6">

   {/* ================= DESKTOP ================= */}
{showTable && (
  <div className="hidden md:block overflow-x-auto w-full max-w-5xl mt-6 mb-6">   

    <div className="w-max space-y-2">

      {/* HEADER TABLE */}
      <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
        <div className="min-w-[220px]">Type / Date</div>
        <div className="min-w-[120px] text-center">Hommes</div>
        <div className="min-w-[120px] text-center">Femmes</div>
        <div className="min-w-[120px] text-center">Jeunes</div>
        <div className="min-w-[130px] text-center">Total</div>
        <div className="min-w-[120px] text-center">Enfants</div>
        <div className="min-w-[140px] text-center">Connectés</div>
        <div className="min-w-[150px] text-center">Nouveaux venus</div>
        <div className="min-w-[180px] text-center">Nouveaux convertis</div>
        <div className="min-w-[140px] text-center">Actions</div>
      </div>

      {Object.entries(groupByMonthAndType(filteredReports)).map(([monthKey, typesObj]) => {
        const [year, monthIndex] = monthKey.split("-").map(Number);
        const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
        const monthExpanded = expandedMonths[monthKey] || false;

        // border color basé sur le premier type du mois (stable par type)
        const firstType = Object.keys(typesObj)[0];
        const colorIndex = availableTypes.indexOf(firstType) % borderColors.length;
        const monthBorderColor = borderColors[colorIndex];

        const monthTotals = calculateMonthTotals(typesObj);

        return (
          <div key={monthKey} className="space-y-1">

            {/* MOIS */}
            <div
              className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${monthBorderColor} cursor-pointer`}
              onClick={() => toggleMonth(monthKey)}
            >
              <div className="min-w-[220px] text-white font-semibold flex items-center gap-2">
                {monthExpanded ? "➖" : "➕"} {monthLabel}
              </div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.hommes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.femmes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.jeunes}</div>
              <div className="min-w-[130px] text-center text-orange-400 font-semibold">{monthTotals.total}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.enfants}</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">{monthTotals.connectes}</div>
              <div className="min-w-[150px] text-center text-orange-400 font-semibold">{monthTotals.nouveauxVenus}</div>
              <div className="min-w-[180px] text-center text-orange-400 font-semibold">{monthTotals.nouveauxConvertis}</div>
              <div className="min-w-[140px]"></div>
            </div>

            {/* TYPES PAR MOIS */}
            {monthExpanded && Object.entries(typesObj).map(([typeTemps, rows]) => {
              const typeExpanded = typeCollapsedDesktop[typeTemps] || false;
              const typeTotals = calculateTypeTotals(rows);

              // couleur par type stable
              const typeColorIndex = availableTypes.indexOf(typeTemps) % borderColors.length;
              const typeBorderColor = borderColors[typeColorIndex];

              return (
                <div key={typeTemps} className="space-y-1">

                  {/* HEADER TYPE */}
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/5 cursor-pointer border-l-4 ${typeBorderColor}`}
                    onClick={() => setTypeCollapsedDesktop(prev => ({ ...prev, [typeTemps]: !prev[typeTemps] }))}
                  >
                    <div className="min-w-[220px] max-w-[220px] text-white">
                      <div className="ml-6 flex items-center gap-2 whitespace-pre-line break-words">
                        {typeExpanded ? "➖" : "➕"} {splitTypeName(typeTemps, 15)}
                      </div>
                    </div>

                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.hommes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.femmes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.jeunes}</div>
                    <div className="min-w-[130px] text-center text-orange-400 font-semibold">{typeTotals.total}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.enfants}</div>
                    <div className="min-w-[140px] text-center text-orange-400 font-semibold">{typeTotals.connectes}</div>
                    <div className="min-w-[150px] text-center text-orange-400 font-semibold">{typeTotals.nouveauxVenus}</div>
                    <div className="min-w-[180px] text-center text-orange-400 font-semibold">{typeTotals.nouveauxConvertis}</div>
                    <div className="min-w-[140px]"></div>
                  </div>

                  {/* LIGNES */}
                  {typeExpanded && rows.map(r => {
                    const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
                    return (
                      <div
                        key={r.id}
                        className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${typeBorderColor} cursor-pointer`}
                      >
                        <div className="min-w-[220px] text-white ml-12 break-words">{formatDateFR(r.date)}</div>
                        <div className="min-w-[120px] text-center text-white -ml-12">{r.hommes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                        <div className="min-w-[130px] text-center text-white">{total}</div>
                        <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                        <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                        <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                        <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
                        <div className="min-w-[140px] flex justify-center gap-2">
                          <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-500">✏️</button>
                          <button onClick={() => handleDeleteTemps(r.typeTemps)} className="text-red-400 hover:text-red-500">🗑️</button>
                        </div>
                      </div>
                    );
                  })}

                </div>
              );
            })}

          </div>
        );
      })}

    </div>
  </div>
)}

    {/* ================= MOBILE ================= */}
    <div className="md:hidden space-y-4">
      {Object.entries(groupByMonthAndType(reports)).map(([monthKey, typesObj]) => {
        const [year, monthIndex] = monthKey.split("-").map(Number);
        const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

        return (
          <div key={monthKey} className="space-y-2">

            <h3 className="text-white font-bold">{monthLabel}</h3>

            {Object.entries(typesObj).map(([typeTemps, rows]) => {
              const typeTotals = calculateTypeTotals(rows);

              return (
                <div key={typeTemps} className="space-y-2 bg-white/10 rounded-xl p-2">
                  <h4 className="text-orange-400 font-semibold flex justify-between">
                    <span>{typeTemps}</span>
                    <span>Total: {typeTotals.total}</span>
                  </h4>
                  {rows.map(r => (
                    <div key={r.id} className="bg-white/5 rounded-xl p-4 text-white space-y-1">
                      <p>{formatDateFR(r.date)}</p>
                      <p>Hommes: {r.hommes} | Femmes: {r.femmes} | Jeunes: {r.jeunes}</p>
                      <p>Total: {Number(r.hommes)+Number(r.femmes)+Number(r.jeunes)}</p>
                      <p>Enfants: {r.enfants} | Connectés: {r.connectes}</p>
                      <p>Nouveaux venus: {r.nouveauxVenus} | Nouveaux convertis: {r.nouveauxConvertis}</p>
                    </div>
                  ))}
                </div>
              );
            })}

          </div>
        );
      })}
    </div>

  </div>
)}

      <Footer />

     <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 12px 14px; /* plus large pour agrandir le champ */
          border-radius: 12px;
          background: white; /* fond du select blanc */
          color: black; /* texte par défaut noir */
          font-size: 16px;
          height: 48px; /* hauteur plus grande */
          -webkit-appearance: none; /* supprime la flèche */
          -moz-appearance: none;
          appearance: none;
          cursor: pointer;
        }
      
        /* + Ajouter un temps en couleur spéciale */
        select.input option[value='AUTRE'] {
          color: #333699;
        }
      
        /* Hover sur toutes les options sauf + Ajouter un temps */
        select.input option:hover {
          background: #e0e0e0; /* hover gris clair */
          color: black;
        }
      
        /* Hover pour + Ajouter un temps */
        select.input option[value='AUTRE']:hover {
          background: #333699;
          color: white;
        }
      `}</style>
    </div>
  );
}
