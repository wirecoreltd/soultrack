"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
    
  /* ===================== STATS CARTES ===================== */
  const [ageStats, setAgeStats] = useState({});
  const [sexStats, setSexStats] = useState({ men: 0, women: 0 });
  const [needsStats, setNeedsStats] = useState({});
  const [contactStats, setContactStats] = useState({});
  const [reasonStats, setReasonStats] = useState({});
  const [followUpStats, setFollowUpStats] = useState({});
  const [showCards, setShowCards] = useState(true);
  const [membres, setMembres] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Calcul des stats à partir de la table membres_complets et stats_ministere_besoin
  const fetchDashboardStats = async () => {
    if (!superviseur.eglise_id) return;
  
    try {
      // 1️⃣ Récupérer tous les membres
      const { data: membres, error: membresErr } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id);
  
      if (membresErr) throw membresErr;

      setMembres(membres);
  
      // 2️⃣ Âge
      const ageCount = {};
      membres.forEach(m => {
        const range = m.age || "Non défini";
        ageCount[range] = (ageCount[range] || 0) + 1;
      });
      setAgeStats(ageCount);
  
      // 3️⃣ Sexe
      let men = 0, women = 0;
      membres.forEach(m => {
        if (m.sexe?.toLowerCase() === "homme") men++;
        if (m.sexe?.toLowerCase() === "femme") women++;
      });
      setSexStats({ men, women });
  
      // 4️⃣ Besoins principaux
      const { data: besoins, error: besoinsErr } = await supabase
        .from("stats_ministere_besoin")
        .select("*")
        .eq("eglise_id", superviseur.eglise_id)
        .eq("branche_id", superviseur.branche_id)
        .eq("type", "besoin");
  
      if (besoinsErr) throw besoinsErr;
  
      const besoinsCount = {};
      besoins.forEach(b => {
        const val = b.valeur || "Non défini";
        besoinsCount[val] = (besoinsCount[val] || 0) + 1;
      });
      setNeedsStats(besoinsCount);
  
      // 5️⃣ État contact
      const contactCount = {};
      membres.forEach(m => {
        const etat = m.etat_contact || "Non défini";
        contactCount[etat] = (contactCount[etat] || 0) + 1;
      });
      setContactStats(contactCount);
  
      // 6️⃣ Raison de la venue (statut_initial)
      const raisonCount = {};
      membres.forEach(m => {
        const raison = m.statut_initial || "Non défini";
        raisonCount[raison] = (raisonCount[raison] || 0) + 1;
      });
      setReasonStats(raisonCount);
  
      // 7️⃣ Nombre envoyés en suivis (statut_suivis = 1)
      const suiviCount = membres.filter(m => m.statut_suivis === 1).length;
      setFollowUpStats({ "Envoyés": suiviCount });
  
    } catch (err) {
      console.error("Erreur fetchDashboardStats:", err.message);
    }
  };

   const membresSuivi = useMemo(() => {
  if (!membres || !selectedDate) return [];
  return membres.filter(m =>
    m.date_premiere_visite &&
    new Date(m.date_premiere_visite).toDateString() === new Date(selectedDate).toDateString() &&
    m.statut_suivis === 2 // en suivi
  );
}, [membres, selectedDate]);
  
  
  // Lancer le fetch quand les membres ou superviseur sont prêts
  useEffect(() => {
    fetchDashboardStats();
  }, [superviseur]);

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
  const [expandedMonths, setExpandedMonths] = useState({});
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

  /* ================= TEMPS ================= */
  useEffect(() => {
    const loadTemps = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("typeTemps")
        .not("typeTemps", "is", null);
      if (error) console.error(error);
      else {
        const uniqueTemps = ["Culte", ...new Set(data.map(t => t.typeTemps).filter(t => t && t !== "Culte"))];
        setTempsOptions(uniqueTemps);
      }
    };
    loadTemps();
  }, []);

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
          .eq("typeTemps", ancienNom);
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
          .eq("typeTemps", nomTemps);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    let typeTempsFinal = formData.typeTemps === "AUTRE" ? formData.nouveauTemps : formData.typeTemps;

    if (formData.enregistrerTemps && formData.typeTemps === "AUTRE" && !tempsOptions.includes(typeTempsFinal)) {
      setTempsOptions(prev => [...prev, typeTempsFinal]);
      await supabase.from("attendance").insert([{ typeTemps: typeTempsFinal }]);
    }

    const rapportAvecEglise = {
      ...formData,
      typeTemps: typeTempsFinal,
      eglise_id: superviseur.eglise_id,
      branche_id: superviseur.branche_id,
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
  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500","border-pink-500","border-indigo-500"];

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
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input" required />
          </div>
          
         {/* TYPE TEMPS */}
<div className="flex flex-col relative w-64" ref={selectRef}>
  <label className="text-white mb-1">Type du temps</label>
  <div
    className="input h-12 flex items-center justify-between px-3 cursor-pointer text-black bg-white"
    onClick={() => setDropdownOpen(!dropdownOpen)}
  >
    {formData.typeTemps || "-- Sélectionner un temps --"}
    <span>▼</span>
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
              <button onClick={(e)=>{ e.stopPropagation(); handleRenameTemps(t, prompt("Nouveau nom ?", t)) }} className="text-blue-500">✏️</button>
              <button onClick={(e)=>{ e.stopPropagation(); handleDeleteTemps(t) }} className="text-red-500">🗑️</button>
            </div>
          )}
        </div>
      ))}

      <div
        className="px-3 py-2 text-[#333699] font-semibold hover:bg-gray-200 cursor-pointer"
        onClick={() => {
          setFormData(prev => ({
            ...prev,
            typeTemps: "AUTRE",
            nouveauTemps: ""
          }));
          setDropdownOpen(false);
        }}
      >
        + Ajouter un temps
      </div>
    </div>
  )}
</div>
          
          {formData.typeTemps === "AUTRE" && (
            <>
              <div className="flex flex-col col-span-2">
                <label className="text-white mb-1">Nom du temps</label>
                <input type="text" name="nouveauTemps" value={formData.nouveauTemps} onChange={handleChange} className="input" placeholder="Ex: ADP" />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input type="checkbox" name="enregistrerTemps" checked={formData.enregistrerTemps} onChange={e => setFormData(prev => ({ ...prev, enregistrerTemps: e.target.checked }))}/>
                <label className="text-amber-300 text-sm">Enregistrer ce temps pour le futur</label>
              </div>
            </>
          )}

          {formData.typeTemps === "Culte" && (
            <div className="flex flex-col">
              <label className="text-white mb-1">Numéro de culte</label>
              <select name="numero_culte" value={formData.numero_culte} onChange={handleChange} className="input appearance-none pr-8 cursor-pointer">
              <option value="">--- Sélectionner un numéro ---</option><span>▼</span>              
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} {n===1?"er":"ème"} Culte</option>)}
              </select>
            </div>
          )}

          {/* Détails chiffrés */}
          {["hommes","femmes","jeunes","enfants","connectes","nouveauxVenus","nouveauxConvertis"].map(field => (
            <div className="flex flex-col" key={field}>
              <label className="text-white mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input type="number" name={field} value={formData[field]} onChange={handleChange} className="input" />
            </div>
          ))}

          <button type="submit" className="col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all">
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>           
        </form>
        {message && <p className="mt-4 text-center text-white font-medium">{message}</p>}
      </div>

      {/* FILTRE DATE */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-2xl shadow-lg mt-4 flex flex-wrap justify-center gap-4 text-white w-full max-w-3xl">
        <div className="flex flex-col w-full sm:w-auto">
          <label>Date de début</label>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="input" />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <label>Date de fin</label>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="input"/>
        </div>
        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366] w-full sm:w-auto self-end">Générer</button>
      </div>

      {/* TABLEAU */}
        {showTable && (
          <div className="max-w-5xl w-full overflow-x-auto mt-6 mb-6">
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
        
                    {/* MOIS */}
                    <div className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`} onClick={()=>toggleMonth(monthKey)}>
                      <div className="min-w-[220px] pl-2 text-white font-semibold">{isExpanded?"➖":"➕"} {monthLabel}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{totalMonth.hommes}</div>
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
                          
                          <div className="min-w-[220px] max-w-[220px] break-words pl-2 text-white">
                            {r.typeTemps} : {formatDateFR(r.date)}
                          </div>
        
                          <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                          <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                          <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                          <div className="min-w-[130px] text-center text-white">{total}</div>
                          <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                          <div className="min-w-[140px] text-center text-white">{r.connectes}</div>
                          <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                          <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>        
                                  
                            <div className="min-w-[140px] flex justify-center gap-2">
                              <button onClick={() => handleEdit(r)} className="text-blue-400 underline hover:text-blue-500">✏️</button>
                              <button onClick={() => handleDeleteTemps(r.typeTemps)} className="text-red-400 underline hover:text-red-500">🗑️</button>
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

          {/* CARTES DE SUIVI */}
            {showCards && membresSuivi && membresSuivi.length > 0 && (
              <div className="max-w-5xl w-full mt-6 mb-6">
                <h2 className="text-white font-bold text-lg mb-4">Rapport Suivi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membresSuivi.map((membre, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Âge</span>
                        <span className="text-base font-semibold text-white">{membre.age || "—"}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Sexe</span>
                        <span className="text-base font-semibold text-white">{membre.sexe || "—"}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">État contact</span>
                        <span className="text-base font-semibold text-white">{membre.etat_contact || "—"}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Comment est-il venu</span>
                        <span className="text-base font-semibold text-white">{membre.venu || "—"}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Raison de la venue</span>
                        <span className="text-base font-semibold text-white">{membre.statut_initial || "—"}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Envoyé en suivi</span>
                        <span className="text-base font-semibold text-white">
                          {membre.date_envoi_suivi
                            ? new Date(membre.date_envoi_suivi).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">En suivi</span>
                        <span className="text-base font-semibold text-white">
                          {membre.statut_suivis === 2 ? "Oui" : "Non"}
                        </span>
                      </div>
                    </div>
                  ))}
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
