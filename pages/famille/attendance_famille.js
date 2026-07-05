"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    pageTitle: "Suivi des Âmes & Présences",
    pageTitleAccent: "des Familles",
    pageIntro1: "Ce module a pour but",
    pageIntroAccent1: "d'accompagner",
    pageIntro2: "l'Église dans sa",
    pageIntroAccent2: "mission de croissance",
    pageIntro3: ", de",
    pageIntroAccent3: "suivi et de transformation des vies",
    pageIntro4: ". À travers le suivi des",
    pageIntroAccent4: "présences",
    pageIntro5: "dans les familles, il ne s'agit pas simplement de compter des personnes, mais de reconnaître",
    pageIntroAccent5: "chaque âme comme précieuse et importante devant Dieu",
    labelFamille: "👨‍👩‍👦 Famille",
    familleDefault: "-- Sélectionner une famille --",
    labelDate: "Date de la rencontre",
    labelTypeTemps: "Type du temps",
    typeTempsDefault: "-- Sélectionner un temps --",
    ajouterTemps: "+ Ajouter un temps",
    labelNomTemps: "Nom du temps",
    nomTempsPlaceholder: "Ex: Réunion de prière",
    enregistrerTemps: "Enregistrer ce temps pour le futur",
    btnAjouter: "Ajouter le rapport",
    btnMettre: "Mettre à jour",
    labelHommes: "Hommes",
    labelFemmes: "Femmes",
    labelJeunes: "Jeunes",
    labelEnfants: "Enfants",
    labelNouveauxVenus: "Nouveaux Venus",
    labelNouveauxConvertis: "Nouveaux Convertis",
    filtresTitre: "Choisissez les paramètres pour générer le rapport",
    filtreFamille: "Famille",
    filtreTous: "Toutes",
    filtreDateDebut: "Date de début",
    filtreDateFin: "Date de fin",
    filtreTypeTemps: "Type de temps",
    filtreTypeTous: "Tous",
    btnGenerer: "Générer le rapport",
    btnChargement: "Chargement...",
    colTypeDate: "Type / Date",
    colFamille: "Famille",
    colHommes: "Hommes",
    colFemmes: "Femmes",
    colJeunes: "Jeunes",
    colTotal: "Total",
    colEnfants: "Enfants",
    colNouveauxVenus: "Nouveaux venus",
    colNouveauxConvertis: "Nouveaux convertis",
    colActions: "Actions",
    totalHFJ: "Total (H+F+J):",
    totalGlobal: "Total Global:",
    msgEnregistrement: "⏳ Enregistrement en cours...",
    msgEgliseNonChargee: "❌ Les informations de l'église ne sont pas encore chargées.",
    msgFamilleRequise: "❌ Veuillez sélectionner une famille.",
    msgNomTempsVide: "❌ Le nom du temps ne peut pas être vide.",
    msgErreurTemps: "❌ Impossible d'ajouter le nouveau temps.",
    msgMisAJour: "✅ Rapport mis à jour !",
    msgAjoute: "✅ Rapport ajouté !",
    confirmSupprimerTemps: "Voulez-vous vraiment supprimer ce temps ? Les rapports existants resteront mais sans nom de temps.",
    confirmSupprimerRapport: "Voulez-vous vraiment supprimer ce rapport ?",
    alertErreurRenommage: "Erreur lors du renommage du temps.",
    alertErreurSuppressionTemps: "Erreur lors de la suppression du temps.",
    alertErreurSuppressionRapport: "Erreur lors de la suppression.",
    promptNouveauNom: "Nouveau nom ?",
    mois: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  },
  en: {
    pageTitle: "Soul & Attendance Tracking",
    pageTitleAccent: "for Families",
    pageIntro1: "This module aims",
    pageIntroAccent1: "to support",
    pageIntro2: "the Church in its",
    pageIntroAccent2: "growth mission",
    pageIntro3: ", of",
    pageIntroAccent3: "follow-up and life transformation",
    pageIntro4: ". Through tracking",
    pageIntroAccent4: "attendance",
    pageIntro5: "in families, it is not simply about counting people, but recognizing",
    pageIntroAccent5: "every soul as precious and important before God",
    labelFamille: "👨‍👩‍👦 Family",
    familleDefault: "-- Select a family --",
    labelDate: "Meeting date",
    labelTypeTemps: "Session type",
    typeTempsDefault: "-- Select a session --",
    ajouterTemps: "+ Add a session type",
    labelNomTemps: "Session name",
    nomTempsPlaceholder: "e.g. Prayer meeting",
    enregistrerTemps: "Save this session type for the future",
    btnAjouter: "Add report",
    btnMettre: "Update",
    labelHommes: "Men",
    labelFemmes: "Women",
    labelJeunes: "Youth",
    labelEnfants: "Children",
    labelNouveauxVenus: "First-time visitors",
    labelNouveauxConvertis: "New converts",
    filtresTitre: "Choose parameters to generate the report",
    filtreFamille: "Family",
    filtreTous: "All",
    filtreDateDebut: "Start date",
    filtreDateFin: "End date",
    filtreTypeTemps: "Session type",
    filtreTypeTous: "All",
    btnGenerer: "Generate report",
    btnChargement: "Loading...",
    colTypeDate: "Type / Date",
    colFamille: "Family",
    colHommes: "Men",
    colFemmes: "Women",
    colJeunes: "Youth",
    colTotal: "Total",
    colEnfants: "Children",
    colNouveauxVenus: "First-time visitors",
    colNouveauxConvertis: "New converts",
    colActions: "Actions",
    totalHFJ: "Total (M+W+Y):",
    totalGlobal: "Global total:",
    msgEnregistrement: "⏳ Saving...",
    msgEgliseNonChargee: "❌ Church information not yet loaded.",
    msgFamilleRequise: "❌ Please select a family.",
    msgNomTempsVide: "❌ Session name cannot be empty.",
    msgErreurTemps: "❌ Unable to add the new session type.",
    msgMisAJour: "✅ Report updated!",
    msgAjoute: "✅ Report added!",
    confirmSupprimerTemps: "Are you sure you want to delete this session type? Existing reports will remain but without a session name.",
    confirmSupprimerRapport: "Are you sure you want to delete this report?",
    alertErreurRenommage: "Error renaming session type.",
    alertErreurSuppressionTemps: "Error deleting session type.",
    alertErreurSuppressionRapport: "Error deleting report.",
    promptNouveauNom: "New name?",
    mois: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  },
};

const NUMERIC_FIELDS = ["hommes", "femmes", "jeunes", "enfants", "nouveauxVenus", "nouveauxConvertis"];

export default function AttendanceFamillePage() {
  return (
    <ProtectedRoute      
      allowedRoles={["Administrateur", "Superadmin", "ResponsableFamilles"]}
      requiredFeature="familles"    
    >
      <AttendanceFamille />
    </ProtectedRoute>
  );
}

function AttendanceFamille() {
  const { lang } = useLang();
  const t = translations[lang];

  const fieldLabels = {
    hommes: t.labelHommes,
    femmes: t.labelFemmes,
    jeunes: t.labelJeunes,
    enfants: t.labelEnfants,
    nouveauxVenus: t.labelNouveauxVenus,
    nouveauxConvertis: t.labelNouveauxConvertis,
  };

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [superviseur, setSuperviseur] = useState({ eglise_id: null, id: null, role: null });
  const [tempsOptions, setTempsOptions] = useState(["Famille"]);
  const [familles, setFamilles] = useState([]);
  const formRef = useRef(null);
  const selectRef = useRef(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [typeCollapsedDesktop, setTypeCollapsedDesktop] = useState({});
  const [availableTypes, setAvailableTypes] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterFamille, setFilterFamille] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    typeTemps: "",
    nouveauTemps: "",
    enregistrerTemps: false,
    famille_id: "",
    hommes: 0, femmes: 0, jeunes: 0, enfants: 0,
    nouveauxVenus: 0, nouveauxConvertis: 0,
  });

  /* ── User ── */
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles").select("id, eglise_id, role").eq("id", user.id).single();
      if (error) console.error(error);
      else setSuperviseur({ eglise_id: data.eglise_id, id: data.id, role: data.role });
    };
    loadSuperviseur();
  }, []);

  /* ── Familles ── */
  useEffect(() => {
    if (!superviseur.eglise_id) return;
    const loadFamilles = async () => {
      const { data, error } = await supabase
        .from("familles").select("id, famille_full, responsable_id")
        .eq("eglise_id", superviseur.eglise_id).order("famille_full");
      if (error) { console.error(error); return; }

      let filtered = data || [];
      if (superviseur.role === "ResponsableFamilles") {
        filtered = filtered.filter(f => f.responsable_id === superviseur.id);
        // Auto-assigner la famille
        if (filtered.length >= 1) {
          setFormData(prev => ({ ...prev, famille_id: filtered[0].id }));
        }
      }
      setFamilles(filtered);
    };
    loadFamilles();
  }, [superviseur]);

  /* ── Temps ── */
  useEffect(() => {
    if (!superviseur.eglise_id) return;
    const loadTemps = async () => {
      const { data, error } = await supabase
        .from("attendance_famille").select("typeTemps")
        .eq("eglise_id", superviseur.eglise_id).not("typeTemps", "is", null);
      if (error) console.error(error);
      else {
        const uniqueTemps = [
          "Famille",
          ...new Set(data.map(item => item.typeTemps?.trim()).filter(item => item && item !== "" && item !== "Famille"))
        ];
        setTempsOptions(uniqueTemps);
      }
    };
    loadTemps();
  }, [superviseur]);

  /* ── Dropdown click outside ── */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Available types from reports ── */
  useEffect(() => {
    if (reports.length > 0) {
      const types = [...new Set(reports.map(r => r.typeTemps?.trim()).filter(tp => tp && tp !== ""))];
      setAvailableTypes(types);
    }
  }, [reports]);

  /* ── Helpers ── */
  const splitTypeName = (name, lineLength = 15) => {
    if (!name) return "";
    return name.match(new RegExp(`.{1,${lineLength}}`, "g")).join("\n");
  };

  const getMonthName = (monthIndex) => t.mois[monthIndex] || "";

  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    return `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
  };

  const getFamilleLabel = (id) => familles.find(f => f.id === id)?.famille_full || "—";

  const toggleMonth = (key) => setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));

  const borderColors = [
    "border-red-500", "border-green-500", "border-blue-500",
    "border-yellow-500", "border-purple-500", "border-pink-500", "border-indigo-500",
  ];

  /* ── Group / totals ── */
  const groupByMonthAndType = (list) => {
    const map = {};
    list.forEach(r => {
      const d = new Date(r.date);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[monthKey]) map[monthKey] = {};
      if (!map[monthKey][r.typeTemps]) map[monthKey][r.typeTemps] = [];
      map[monthKey][r.typeTemps].push(r);
    });
    return map;
  };

  const sumRows = (rows) => {
    const totals = { hommes: 0, femmes: 0, jeunes: 0, total: 0, enfants: 0, nouveauxVenus: 0, nouveauxConvertis: 0 };
    rows.forEach(r => {
      totals.hommes += Number(r.hommes || 0);
      totals.femmes += Number(r.femmes || 0);
      totals.jeunes += Number(r.jeunes || 0);
      totals.total += Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
      totals.enfants += Number(r.enfants || 0);
      totals.nouveauxVenus += Number(r.nouveauxVenus || 0);
      totals.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
    });
    return totals;
  };

  const calculateMonthTotals = (typesObj) => sumRows(Object.values(typesObj).flat());
  const calculateTypeTotals = (rows) => sumRows(rows);

  /* ── Rename / delete temps ── */
  const handleRenameTemps = async (ancienNom, nouveauNom) => {
    if (!nouveauNom) return;
    try {
      const { error } = await supabase.from("attendance_famille")
        .update({ typeTemps: nouveauNom }).eq("typeTemps", ancienNom).eq("eglise_id", superviseur.eglise_id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error(err.message);
      alert(t.alertErreurRenommage);
    }
  };

  const handleDeleteTemps = async (nomTemps) => {
    if (!confirm(t.confirmSupprimerTemps)) return;
    try {
      const { error } = await supabase.from("attendance_famille")
        .update({ typeTemps: null }).eq("typeTemps", nomTemps).eq("eglise_id", superviseur.eglise_id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error(err.message);
      alert(t.alertErreurSuppressionTemps);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!confirm(t.confirmSupprimerRapport)) return;
    try {
      const { error } = await supabase.from("attendance_famille").delete().eq("id", id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error(err.message);
      alert(t.alertErreurSuppressionRapport);
    }
  };

  /* ── Form ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: NUMERIC_FIELDS.includes(name) ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(t.msgEnregistrement);

    if (!superviseur.eglise_id) { setMessage(t.msgEgliseNonChargee); return; }
    if (!formData.famille_id) { setMessage(t.msgFamilleRequise); return; }

    let typeTempsFinal = formData.typeTemps === "AUTRE" ? formData.nouveauTemps.trim() : formData.typeTemps;
    if (!typeTempsFinal) { setMessage(t.msgNomTempsVide); return; }

    if (formData.enregistrerTemps && formData.typeTemps === "AUTRE" && !tempsOptions.includes(typeTempsFinal)) {
      setTempsOptions(prev => [...prev, typeTempsFinal]);
    }

    const payload = {
      date: formData.date,
      typeTemps: typeTempsFinal,
      eglise_id: superviseur.eglise_id,
      famille_id: formData.famille_id,
      hommes: Number(formData.hommes) || 0,
      femmes: Number(formData.femmes) || 0,
      jeunes: Number(formData.jeunes) || 0,
      enfants: Number(formData.enfants) || 0,
      nouveauxVenus: Number(formData.nouveauxVenus) || 0,
      nouveauxConvertis: Number(formData.nouveauxConvertis) || 0,
    };

    try {
      if (editId) {
        const { error } = await supabase.from("attendance_famille").update(payload).eq("id", editId);
        if (error) throw error;
        setMessage(t.msgMisAJour);
      } else {
        const { error } = await supabase.from("attendance_famille").insert([payload]);
        if (error) throw error;
        setMessage(t.msgAjoute);
      }
      setTimeout(() => setMessage(""), 3000);
      setFormData({
        date: "", typeTemps: "", nouveauTemps: "", enregistrerTemps: false,
        famille_id: superviseur.role === "ResponsableFamilles" && familles.length >= 1
          ? familles[0].id : "",
        hommes: 0, femmes: 0, jeunes: 0, enfants: 0, nouveauxVenus: 0, nouveauxConvertis: 0,
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
      typeTemps: tempsOptions.includes(r.typeTemps) ? r.typeTemps : "AUTRE",
      nouveauTemps: !tempsOptions.includes(r.typeTemps) ? r.typeTemps : "",
      famille_id: r.famille_id || "",
      hommes: r.hommes, femmes: r.femmes, jeunes: r.jeunes,
      enfants: r.enfants, nouveauxVenus: r.nouveauxVenus, nouveauxConvertis: r.nouveauxConvertis,
      enregistrerTemps: false,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Fetch rapports ── */
  const fetchRapports = async () => {
    if (!superviseur.eglise_id) return;
    setLoading(true);

    let query = supabase.from("attendance_famille").select("*").eq("eglise_id", superviseur.eglise_id);

    if (superviseur.role === "ResponsableFamilles") {
      const ids = familles.map(f => f.id);
      if (ids.length > 0) query = query.in("famille_id", ids);
    }

    if (filterFamille) query = query.eq("famille_id", filterFamille);
    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);
    query = query.order("date", { ascending: true });

    const { data, error } = await query;
    if (error) console.error(error);
    else setReports(data || []);
    setLoading(false);
    setShowTable(true);
  };

  const filteredReports = filterType ? reports.filter(r => r.typeTemps === filterType) : reports;

  /* ── Render ── */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        {t.pageTitle} <span className="text-emerald-300">{t.pageTitleAccent}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          {t.pageIntro1} <span className="text-blue-300 font-semibold">{t.pageIntroAccent1} </span>
          {t.pageIntro2} <span className="text-blue-300 font-semibold">{t.pageIntroAccent2}</span>
          {t.pageIntro3} <span className="text-blue-300 font-semibold">{t.pageIntroAccent3}</span>
          {t.pageIntro4} <span className="text-blue-300 font-semibold">{t.pageIntroAccent4} </span>
          {t.pageIntro5} <span className="text-blue-300 font-semibold">{t.pageIntroAccent5}</span>.
        </p>
      </div>

      {/* ── FORMULAIRE ── */}
      <div ref={formRef} className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Famille : dropdown pour Admin/Superadmin, affichage fixe pour ResponsableFamilles */}
          {superviseur.role !== "ResponsableFamilles" ? (
            <div className="flex flex-col col-span-1 md:col-span-2">
              <label className="text-white mb-1">{t.labelFamille}</label>
              <select name="famille_id" value={formData.famille_id} onChange={handleChange} className="input w-full" required>
                <option value="">{t.familleDefault}</option>
                {familles.map(f => <option key={f.id} value={f.id}>{f.famille_full}</option>)}
              </select>
            </div>
          ) : (
            <div className="flex flex-col col-span-1 md:col-span-2">
              <label className="text-white mb-1">{t.labelFamille}</label>
              <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm">
                {getFamilleLabel(formData.famille_id)}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-white mb-1">{t.labelDate}</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input w-full" required />
          </div>

          {/* Type de temps — dropdown custom */}
          <div className="flex flex-col relative w-full md:w-64" ref={selectRef}>
            <label className="text-white mb-1">{t.labelTypeTemps}</label>
            <div
              className="input h-12 flex items-center justify-between px-3 cursor-pointer text-black bg-white"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{formData.typeTemps || t.typeTempsDefault}</span>
              <span>▼</span>
            </div>
            {dropdownOpen && (
              <div className="absolute top-full left-0 z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border rounded shadow-lg">
                {tempsOptions.map((option) => (
                  <div
                    key={option}
                    className="flex justify-between items-center px-3 py-2 hover:bg-gray-200 cursor-pointer text-black"
                    onClick={() => { setFormData(prev => ({ ...prev, typeTemps: option })); setDropdownOpen(false); }}
                  >
                    <span>{option}</span>
                    {option !== "Famille" && (
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleRenameTemps(option, prompt(t.promptNouveauNom, option)); }} className="text-blue-500">✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTemps(option); }} className="text-red-500">🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
                <div
                  className="px-3 py-2 text-[#333699] font-semibold hover:bg-gray-200 cursor-pointer"
                  onClick={() => { setFormData(prev => ({ ...prev, typeTemps: "AUTRE", nouveauTemps: "" })); setDropdownOpen(false); }}
                >
                  {t.ajouterTemps}
                </div>
              </div>
            )}
          </div>

          {/* Nouveau temps */}
          {formData.typeTemps === "AUTRE" && (
            <>
              <div className="flex flex-col col-span-1 md:col-span-2">
                <label className="text-white mb-1">{t.labelNomTemps}</label>
                <input
                  type="text" name="nouveauTemps" value={formData.nouveauTemps}
                  onChange={(e) => setFormData(prev => ({ ...prev, nouveauTemps: e.target.value.slice(0, 30) }))}
                  className="input w-full" placeholder={t.nomTempsPlaceholder} maxLength={30}
                />
              </div>
              <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                <input type="checkbox" checked={formData.enregistrerTemps}
                  onChange={e => setFormData(prev => ({ ...prev, enregistrerTemps: e.target.checked }))} />
                <label className="text-amber-300 text-sm">{t.enregistrerTemps}</label>
              </div>
            </>
          )}

          {/* Champs numériques */}
          {NUMERIC_FIELDS.map(field => (
            <div className="flex flex-col w-full" key={field}>
              <label className="text-white mb-1">{fieldLabels[field]}</label>
              <input type="number" name={field} value={formData[field] || 0} onChange={handleChange} className="input w-full" min={0} />
            </div>
          ))}

          <button type="submit" className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all">
            {editId ? t.btnMettre : t.btnAjouter}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-white font-medium">{message}</p>}
      </div>

      {/* ── FILTRES ── */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 mt-2 w-full md:w-fit md:mx-auto flex flex-col text-white">
        <p className="text-base text-red-400 font-semibold text-center mb-4">{t.filtresTitre}</p>
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full flex-wrap">

          {/* Filtre famille : seulement pour Admin/Superadmin */}
          {superviseur.role !== "ResponsableFamilles" && (
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-base text-center mb-1">{t.filtreFamille}</label>
              <select value={filterFamille} onChange={e => setFilterFamille(e.target.value)}
                className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white">
                <option value="" className="text-black">{t.filtreTous}</option>
                {familles.map(f => <option key={f.id} value={f.id} className="text-black">{f.famille_full}</option>)}
              </select>
            </div>
          )}

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1">{t.filtreDateDebut}</label>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
              className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white" />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1">{t.filtreDateFin}</label>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
              className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white" />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1 opacity-0">btn</label>
            <button onClick={fetchRapports}
              className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition">
              {loading ? t.btnChargement : t.btnGenerer}
            </button>
          </div>

          {availableTypes.length > 0 && (
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-base text-center mb-1">{t.filtreTypeTemps}</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white text-center">
                <option value="" className="text-black">{t.filtreTypeTous}</option>
                {availableTypes.map(type => <option key={type} value={type} className="text-black">{type}</option>)}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* ── TABLEAU ── */}
      {showTable && (
        <div className="w-full px-4 mt-6 mb-6">

          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <div className="w-max space-y-2">
              <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                <div className="min-w-[220px]">{t.colTypeDate}</div>
                <div className="min-w-[160px] text-center">{t.colFamille}</div>
                <div className="min-w-[120px] text-center">{t.colHommes}</div>
                <div className="min-w-[120px] text-center">{t.colFemmes}</div>
                <div className="min-w-[120px] text-center">{t.colJeunes}</div>
                <div className="min-w-[130px] text-center">{t.colTotal}</div>
                <div className="min-w-[120px] text-center">{t.colEnfants}</div>
                <div className="min-w-[150px] text-center">{t.colNouveauxVenus}</div>
                <div className="min-w-[180px] text-center">{t.colNouveauxConvertis}</div>
                <div className="min-w-[140px] text-center">{t.colActions}</div>
              </div>

              {Object.entries(groupByMonthAndType(filteredReports)).map(([monthKey, typesObj]) => {
                const [year, monthIndex] = monthKey.split("-").map(Number);
                const monthLabel = `${getMonthName(monthIndex)} ${year}`;
                const monthExpanded = expandedMonths[monthKey] || false;
                const monthTotals = calculateMonthTotals(typesObj);

                return (
                  <div key={monthKey} className="space-y-1">
                    <div className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-orange-500 cursor-pointer"
                      onClick={() => toggleMonth(monthKey)}>
                      <div className="min-w-[220px] text-white font-semibold flex items-center gap-2">
                        {monthExpanded ? "➖" : "➕"} {monthLabel}
                      </div>
                      <div className="min-w-[160px] text-center text-orange-400 font-semibold">—</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.hommes}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.femmes}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.jeunes}</div>
                      <div className="min-w-[130px] text-center text-orange-400 font-semibold">{monthTotals.total}</div>
                      <div className="min-w-[120px] text-center text-orange-400 font-semibold">{monthTotals.enfants}</div>
                      <div className="min-w-[150px] text-center text-orange-400 font-semibold">{monthTotals.nouveauxVenus}</div>
                      <div className="min-w-[180px] text-center text-orange-400 font-semibold">{monthTotals.nouveauxConvertis}</div>
                      <div className="min-w-[140px]"></div>
                    </div>

                    {monthExpanded && Object.entries(typesObj).map(([typeTemps, rows], typeIdx) => {
                      const typeExpanded = typeCollapsedDesktop[typeTemps] || false;
                      const borderColorClass = borderColors[typeIdx % borderColors.length];
                      const typeTotals = calculateTypeTotals(rows);

                      return (
                        <div key={typeTemps} className="space-y-1">
                          <div className={`flex items-center px-4 py-2 rounded-lg bg-white/5 cursor-pointer border-l-4 ${borderColorClass}`}
                            onClick={() => setTypeCollapsedDesktop(prev => ({ ...prev, [typeTemps]: !prev[typeTemps] }))}>
                            <div className="min-w-[220px] max-w-[220px] text-white">
                              <div className="ml-6 flex items-center gap-2 whitespace-pre-line break-words">
                                {typeExpanded ? "➖" : "➕"} {splitTypeName(typeTemps, 15)}
                              </div>
                            </div>
                            <div className="min-w-[160px] text-center text-orange-400 font-semibold">—</div>
                            <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.hommes}</div>
                            <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.femmes}</div>
                            <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.jeunes}</div>
                            <div className="min-w-[130px] text-center text-orange-400 font-semibold">{typeTotals.total}</div>
                            <div className="min-w-[120px] text-center text-orange-400 font-semibold">{typeTotals.enfants}</div>
                            <div className="min-w-[150px] text-center text-orange-400 font-semibold">{typeTotals.nouveauxVenus}</div>
                            <div className="min-w-[180px] text-center text-orange-400 font-semibold">{typeTotals.nouveauxConvertis}</div>
                            <div className="min-w-[140px]"></div>
                          </div>

                          {typeExpanded && rows.map(r => {
                            const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
                            return (
                              <div key={r.id}
                                className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColorClass} ml-12`}>
                                <div className="min-w-[220px] text-white">{formatDateFR(r.date)}</div>
                                <div className="min-w-[160px] text-center text-white -ml-12 text-sm">{getFamilleLabel(r.famille_id)}</div>
                                <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                                <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                                <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                                <div className="min-w-[130px] text-center text-white">{total}</div>
                                <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
                                <div className="min-w-[150px] text-center text-white">{r.nouveauxVenus}</div>
                                <div className="min-w-[180px] text-center text-white">{r.nouveauxConvertis}</div>
                                <div className="min-w-[140px] flex justify-center gap-2">
                                  <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-500">✏️</button>
                                  <button onClick={() => handleDeleteReport(r.id)} className="text-red-400 hover:text-red-500">🗑️</button>
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

          {/* MOBILE */}
          <div className="md:hidden space-y-4">
            {Object.entries(groupByMonthAndType(filteredReports)).map(([monthKey, typesObj]) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthName(monthIndex)} ${year}`;
              const monthExpanded = expandedMonths[monthKey] || false;

              return (
                <div key={monthKey} className="space-y-2">
                  <div className="bg-white/10 rounded-xl p-3 text-white font-bold flex justify-between items-center cursor-pointer border-l-4 border-red-500"
                    onClick={() => toggleMonth(monthKey)}>
                    <span>{monthExpanded ? "➖" : "➕"} {monthLabel}</span>
                  </div>

                  {monthExpanded && Object.entries(typesObj).map(([typeTemps, rows], typeIdx) => {
                    const typeExpanded = typeCollapsedDesktop[typeTemps] || false;
                    const borderColorClass = borderColors[typeIdx % borderColors.length];
                    const typeTotals = calculateTypeTotals(rows);

                    return (
                      <div key={typeTemps} className="ml-3 space-y-2">
                        <div className={`bg-white/5 rounded-lg p-3 text-orange-400 font-semibold flex justify-between items-center cursor-pointer border-l-4 ${borderColorClass}`}
                          onClick={() => setTypeCollapsedDesktop(prev => ({ ...prev, [typeTemps]: !prev[typeTemps] }))}>
                          <span>{typeExpanded ? "➖" : "➕"} {typeTemps}</span>
                          <div className="text-right leading-tight">
                            <p className="text-sm font-bold text-amber-300">{t.totalHFJ} {typeTotals.total}</p>
                            <p className="text-sm font-bold text-orange-400">{t.totalGlobal} {typeTotals.total + typeTotals.enfants}</p>
                          </div>
                        </div>

                        {typeExpanded && rows.map(r => (
                          <div key={r.id} className={`ml-4 bg-white/10 rounded-lg p-3 text-white border-l-4 ${borderColorClass}`}>
                            <p className="text-amber-300 text-right">{formatDateFR(r.date)}</p>
                            <p className="text-sm text-blue-200 mt-1">👨‍👩‍👦 {getFamilleLabel(r.famille_id)}</p>
                            <p className="mt-2">{t.labelHommes}: {r.hommes} | {t.labelFemmes}: {r.femmes} | {t.labelJeunes}: {r.jeunes}</p>
                            <p className="font-semibold text-orange-400">{t.colTotal}: {Number(r.hommes) + Number(r.femmes) + Number(r.jeunes)}</p>
                            <p className="mt-2">{t.labelEnfants}: {r.enfants}</p>
                            <p className="mt-1">{t.labelNouveauxVenus}: {r.nouveauxVenus} | {t.labelNouveauxConvertis}: {r.nouveauxConvertis}</p>
                            <div className="flex justify-center gap-4 mt-3">
                              <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-500 text-lg">✏️</button>
                              <button onClick={() => handleDeleteReport(r.id)} className="text-red-600 hover:text-red-700 text-lg">🗑️</button>
                            </div>
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
          padding: 12px 14px;
          border-radius: 12px;
          background: white;
          color: black;
          font-size: 16px;
          height: 48px;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
