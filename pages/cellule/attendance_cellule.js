"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    // Page title
    pageTitle: "Suivi des Âmes & Présences",
    pageTitleHighlight: "des Cellules",
    // Subtitle
    subtitle1: "Ce module a pour but",
    subtitle2: "d'accompagner",
    subtitle3: "l'Église dans sa",
    subtitle4: "mission de croissance",
    subtitle5: ", de",
    subtitle6: "suivi et de transformation des vies",
    subtitle7: ". À travers le suivi des",
    subtitle8: "présences",
    subtitle9: "dans les cellules, il ne s'agit pas simplement de compter des personnes, mais de reconnaître",
    subtitle10: "chaque âme comme précieuse et importante devant Dieu",
    // Form
    dateLabel: "Date de la recontre",
    typeLabel: "Type du temps",
    typePlaceholder: "-- Sélectionner un temps --",
    addTemps: "+ Ajouter un temps",
    nomTemps: "Nom du temps",
    nomTempsPlaceholder: "Ex: Tour de Prière",
    saveTemps: "Enregistrer ce temps pour le futur",
    submitAdd: "Ajouter le rapport",
    submitUpdate: "Mettre à jour",
    // Fields
    hommes: "Hommes",
    femmes: "Femmes",
    jeunes: "Jeunes",
    enfants: "Enfants",
    nouveauxVenus: "NouveauxVenus",
    nouveauxConvertis: "NouveauxConvertis",
    // Filter
    filterTitle: "Choisissez les paramètres pour générer le rapport",
    dateDebut: "Date de début",
    dateFin: "Date de fin",
    generateBtn: "Générer le rapport",
    loadingBtn: "Chargement...",
    typeFilter: "Type de temps",
    tous: "Tous",
    // Table headers
    typeDate: "Type / Date",
    total: "Total",
    totalHFJ: "Total (H+F+J):",
    totalGlobal: "Total Global:",
    actions: "Actions",
    // Messages
    saving: "⏳ Enregistrement en cours...",
    errEglise: "❌ Les informations de l'église ne sont pas encore chargées.",
    errTempsVide: "❌ Le nom du temps ne peut pas être vide.",
    errAddTemps: "❌ Impossible d'ajouter le nouveau temps.",
    successUpdate: "✅ Rapport mis à jour !",
    successAdd: "✅ Rapport ajouté !",
    // Confirms / Alerts
    confirmDelete: "Voulez-vous vraiment supprimer ce temps ? Les rapports existants resteront mais sans nom de temps.",
    errRename: "Erreur lors du renommage du temps.",
    errDelete: "Erreur lors de la suppression du temps.",
    renamePrompt: "Nouveau nom ?",
    // Months
    months: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    // Mobile card
    mobileHommes: "Hommes",
    mobileFemmes: "Femmes",
    mobileJeunes: "Jeunes",
    mobileEnfants: "Enfants",
    mobileNouveauxVenus: "Nouveaux Venus",
    mobileNouveauxConvertis: "Nouveaux Convertis",
  },
  en: {
    pageTitle: "Souls & Attendance Tracking",
    pageTitleHighlight: "of Cells",
    subtitle1: "This module aims",
    subtitle2: "to support",
    subtitle3: "the Church in its",
    subtitle4: "growth mission",
    subtitle5: ", of",
    subtitle6: "follow-up and transformation of lives",
    subtitle7: ". Through tracking",
    subtitle8: "attendance",
    subtitle9: "in cells, it is not simply about counting people, but recognising",
    subtitle10: "each soul as precious and important before God",
    dateLabel: "Date of meeting",
    typeLabel: "Time type",
    typePlaceholder: "-- Select a time --",
    addTemps: "+ Add a time",
    nomTemps: "Time name",
    nomTempsPlaceholder: "e.g. Prayer Tour",
    saveTemps: "Save this time for future use",
    submitAdd: "Add report",
    submitUpdate: "Update",
    hommes: "Men",
    femmes: "Women",
    jeunes: "Youth",
    enfants: "Children",
    nouveauxVenus: "NewComers",
    nouveauxConvertis: "NewConverts",
    filterTitle: "Choose the parameters to generate the report",
    dateDebut: "Start date",
    dateFin: "End date",
    generateBtn: "Generate report",
    loadingBtn: "Loading...",
    typeFilter: "Time type",
    tous: "All",
    typeDate: "Type / Date",
    total: "Total",
    totalHFJ: "Total (M+W+Y):",
    totalGlobal: "Global Total:",
    actions: "Actions",
    saving: "⏳ Saving...",
    errEglise: "❌ Church information not yet loaded.",
    errTempsVide: "❌ Time name cannot be empty.",
    errAddTemps: "❌ Unable to add the new time.",
    successUpdate: "✅ Report updated!",
    successAdd: "✅ Report added!",
    confirmDelete: "Do you really want to delete this time? Existing reports will remain but without a time name.",
    errRename: "Error renaming the time.",
    errDelete: "Error deleting the time.",
    renamePrompt: "New name?",
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    mobileHommes: "Men",
    mobileFemmes: "Women",
    mobileJeunes: "Youth",
    mobileEnfants: "Children",
    mobileNouveauxVenus: "New Comers",
    mobileNouveauxConvertis: "New Converts",
  },
};

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Superadmin", "ResponsableCellule"]}>
      <Attendance />
    </ProtectedRoute>
  );
}

function Attendance() {
  const { lang } = useLang();
  const t = translations[lang];

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [superviseur, setSuperviseur] = useState({ eglise_id: null });
  const [tempsOptions, setTempsOptions] = useState(["Cellule"]);
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
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
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
        .select("eglise_id")
        .eq("id", user.id)
        .single();
      if (error) console.error(error);
      else setSuperviseur({ eglise_id: data.eglise_id });
    };
    loadSuperviseur();
  }, []);

  const splitTypeName = (name, lineLength = 15) => {
    if (!name) return "";
    const regex = new RegExp(`.{1,${lineLength}}`, "g");
    return name.match(regex).join("\n");
  };

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
    const totals = { hommes:0, femmes:0, jeunes:0, total:0, enfants:0, nouveauxVenus:0, nouveauxConvertis:0 };
    Object.values(typesObj).forEach(rows => {
      rows.forEach(r => {
        totals.hommes += Number(r.hommes||0);
        totals.femmes += Number(r.femmes||0);
        totals.jeunes += Number(r.jeunes||0);
        totals.total += Number(r.hommes||0)+Number(r.femmes||0)+Number(r.jeunes||0);
        totals.enfants += Number(r.enfants||0);
        totals.nouveauxVenus += Number(r.nouveauxVenus||0);
        totals.nouveauxConvertis += Number(r.nouveauxConvertis||0);
      });
    });
    return totals;
  };

  const calculateTypeTotals = (rows) => {
    const totals = { hommes:0, femmes:0, jeunes:0, total:0, enfants:0, nouveauxVenus:0, nouveauxConvertis:0 };
    rows.forEach(r => {
      totals.hommes += Number(r.hommes||0);
      totals.femmes += Number(r.femmes||0);
      totals.jeunes += Number(r.jeunes||0);
      totals.total += Number(r.hommes||0)+Number(r.femmes||0)+Number(r.jeunes||0);
      totals.enfants += Number(r.enfants||0);
      totals.nouveauxVenus += Number(r.nouveauxVenus||0);
      totals.nouveauxConvertis += Number(r.nouveauxConvertis||0);
    });
    return totals;
  };

  /* ================= TEMPS ================= */
  useEffect(() => {
    const loadTemps = async () => {
      const { data, error } = await supabase
        .from("attendance_cellule")
        .select("typeTemps")
        .eq("eglise_id", superviseur.eglise_id)
        .not("typeTemps", "is", null);

      if (error) console.error(error);
      else {
        const uniqueTemps = [
          "Cellule",
          ...new Set(
            data.map(t => t.typeTemps?.trim())
                .filter(t => t && t !== "" && t !== "Cellule")
          )
        ];
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

  const handleRenameTemps = async (ancienNom, nouveauNom) => {
    if (!nouveauNom) return;
    try {
      const { error } = await supabase
        .from("attendance_cellule")
        .update({ typeTemps: nouveauNom })
        .eq("typeTemps", ancienNom)
        .eq("eglise_id", superviseur.eglise_id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error("Erreur renommer temps:", err.message);
      alert(t.errRename);
    }
  };

  const handleDeleteTemps = async (nomTemps) => {
    const confirmDelete = confirm(t.confirmDelete);
    if (!confirmDelete) return;
    try {
      const { error } = await supabase
        .from("attendance_cellule")
        .update({ typeTemps: null })
        .eq("typeTemps", nomTemps)
        .eq("eglise_id", superviseur.eglise_id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error("Erreur suppression temps:", err.message);
      alert(t.errDelete);
    }
  };

  /* ================= HANDLE FORM ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["hommes","femmes","jeunes","enfants","nouveauxVenus","nouveauxConvertis"].includes(name)
        ? Number(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(t.saving);

    if (!superviseur.eglise_id) {
      setMessage(t.errEglise);
      return;
    }

    let typeTempsFinal =
      formData.typeTemps === "AUTRE" ? formData.nouveauTemps.trim() : formData.typeTemps;

    if (!typeTempsFinal) {
      setMessage(t.errTempsVide);
      return;
    }

    if (formData.enregistrerTemps && formData.typeTemps === "AUTRE" && !tempsOptions.includes(typeTempsFinal)) {
      setTempsOptions(prev => [...prev, typeTempsFinal]);
      try {
        const { error } = await supabase.from("attendance_cellule").insert([{
          typeTemps: typeTempsFinal,
          eglise_id: superviseur.eglise_id
        }]);
        if (error) throw error;
      } catch (err) {
        console.error("Erreur ajout nouveau temps :", err.message);
        setMessage(t.errAddTemps);
        return;
      }
    }

    const rapportAvecEglise = {
      ...formData,
      typeTemps: typeTempsFinal,
      eglise_id: superviseur.eglise_id,
      hommes: Number(formData.hommes) || 0,
      femmes: Number(formData.femmes) || 0,
      jeunes: Number(formData.jeunes) || 0,
      enfants: Number(formData.enfants) || 0,
      nouveauxVenus: Number(formData.nouveauxVenus) || 0,
      nouveauxConvertis: Number(formData.nouveauxConvertis) || 0,
    };

    const rapportClean = Object.fromEntries(
      Object.entries(rapportAvecEglise).filter(([_, v]) => v !== "" && v !== null)
    );

    try {
      if (editId) {
        const { error } = await supabase.from("attendance_cellule").update(rapportClean).eq("id", editId);
        if (error) throw error;
        setMessage(t.successUpdate);
      } else {
        const { error } = await supabase.from("attendance_cellule").insert([rapportClean]);
        if (error) throw error;
        setMessage(t.successAdd);
      }

      setTimeout(() => setMessage(""), 3000);
      setFormData({
        date: "",
        typeTemps: "",
        nouveauTemps: "",
        enregistrerTemps: false,
        hommes: 0,
        femmes: 0,
        jeunes: 0,
        enfants: 0,
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
      typeTemps: r.typeTemps === "Cellule" ? "Cellule" : "AUTRE",
      nouveauTemps: r.typeTemps !== "Cellule" ? r.typeTemps : "",
      hommes: r.hommes,
      femmes: r.femmes,
      jeunes: r.jeunes,
      enfants: r.enfants,
      nouveauxVenus: r.nouveauxVenus,
      nouveauxConvertis: r.nouveauxConvertis,
      enregistrerTemps: false,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ================= FETCH RAPPORTS ================= */
  const fetchRapports = async () => {
    if (!superviseur.eglise_id) return;
    setLoading(true);
    let query = supabase.from("attendance_cellule").select("*")
      .eq("eglise_id", superviseur.eglise_id);
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
  const getMonthNameFR = (monthIndex) => t.months[monthIndex] || "";

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

  const filteredReports = filterType
    ? reports.filter(r => r.typeTemps === filterType)
    : reports;

  useEffect(() => {
    if (reports.length > 0) {
      const types = [
        ...new Set(
          reports
            .map(r => r.typeTemps?.trim())
            .filter(t => t && t !== "")
        )
      ];
      setAvailableTypes(types);
    }
  }, [reports]);

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        {t.pageTitle} <span className="text-emerald-300">{t.pageTitleHighlight}</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          {t.subtitle1} <span className="text-blue-300 font-semibold">{t.subtitle2}</span> {t.subtitle3}{" "}
          <span className="text-blue-300 font-semibold">{t.subtitle4}</span>{t.subtitle5}{" "}
          <span className="text-blue-300 font-semibold">{t.subtitle6}</span>{t.subtitle7}{" "}
          <span className="text-blue-300 font-semibold">{t.subtitle8}</span> {t.subtitle9}{" "}
          <span className="text-blue-300 font-semibold">{t.subtitle10}</span>.
        </p>
      </div>

      {/* FORMULAIRE */}
      <div ref={formRef} className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-white mb-1">{t.dateLabel}</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input w-full" required />
          </div>

          {/* Type de temps */}
          <div className="flex flex-col relative w-full md:w-64" ref={selectRef}>
            <label className="text-white mb-1">{t.typeLabel}</label>
            <div
              className="input h-12 flex items-center justify-between px-3 cursor-pointer text-black bg-white"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {formData.typeTemps || t.typePlaceholder} <span>▼</span>
            </div>

            {dropdownOpen && (
              <div className="absolute top-full left-0 z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border rounded shadow-lg">
                {tempsOptions.map((item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center px-3 py-2 hover:bg-gray-200 cursor-pointer text-black"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, typeTemps: item }));
                      setDropdownOpen(false);
                    }}
                  >
                    <span>{item}</span>
                    {item !== "Cellule" && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRenameTemps(item, prompt(t.renamePrompt, item)); }}
                          className="text-blue-500"
                        >✏️</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTemps(item); }}
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
                  {t.addTemps}
                </div>
              </div>
            )}
          </div>

          {/* Nouveau temps si AUTRE */}
          {formData.typeTemps === "AUTRE" && (
            <>
              <div className="flex flex-col col-span-1 md:col-span-2">
                <label className="text-white mb-1">{t.nomTemps}</label>
                <input
                  type="text"
                  name="nouveauTemps"
                  value={formData.nouveauTemps}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 30);
                    setFormData(prev => ({ ...prev, nouveauTemps: value }));
                  }}
                  className="input w-full"
                  placeholder={t.nomTempsPlaceholder}
                  maxLength={30}
                />
              </div>
              <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                <input
                  type="checkbox"
                  name="enregistrerTemps"
                  checked={formData.enregistrerTemps}
                  onChange={e => setFormData(prev => ({ ...prev, enregistrerTemps: e.target.checked }))}
                />
                <label className="text-amber-300 text-sm">{t.saveTemps}</label>
              </div>
            </>
          )}

          {/* Détails chiffrés */}
          {["hommes","femmes","jeunes","enfants","nouveauxVenus","nouveauxConvertis"].map(field => (
            <div className="flex flex-col w-full" key={field}>
              <label className="text-white mb-1">{t[field]}</label>
              <input
                type="number"
                name={field}
                value={formData[field] || 0}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
          ))}

          {/* Bouton */}
          <button type="submit" className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all">
            {editId ? t.submitUpdate : t.submitAdd}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-white font-medium">{message}</p>}
      </div>

      {/* FILTRE DATE */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 mt-2 w-full md:w-fit md:mx-auto flex flex-col text-white">
        <p className="text-base text-red-400 font-semibold text-center mb-4">
          {t.filterTitle}
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full">
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1">{t.dateDebut}</label>
            <input
              type="date"
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white"
            />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1">{t.dateFin}</label>
            <input
              type="date"
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white"
            />
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1 opacity-0">btn</label>
            <button
              onClick={fetchRapports}
              className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition"
            >
              {loading ? t.loadingBtn : t.generateBtn}
            </button>
          </div>

          {availableTypes.length > 0 && (
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-base text-center mb-1">{t.typeFilter}</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white text-center"
              >
                <option value="" className="text-black">{t.tous}</option>
                {availableTypes.map(item => (
                  <option key={item} value={item} className="text-black">
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TABLEAU / CARDS DESKTOP + MOBILE */}
      {showTable && (
        <div className="w-full px-4 mt-6 mb-6">

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <div className="w-max space-y-2">

              {/* HEADER TABLE */}
              <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                <div className="min-w-[220px]">{t.typeDate}</div>
                <div className="min-w-[120px] text-center">{t.hommes}</div>
                <div className="min-w-[120px] text-center">{t.femmes}</div>
                <div className="min-w-[120px] text-center">{t.jeunes}</div>
                <div className="min-w-[130px] text-center">{t.total}</div>
                <div className="min-w-[120px] text-center">{t.enfants}</div>
                <div className="min-w-[150px] text-center">{t.mobileNouveauxVenus}</div>
                <div className="min-w-[180px] text-center">{t.mobileNouveauxConvertis}</div>
                <div className="min-w-[140px] text-center">{t.actions}</div>
              </div>

              {Object.entries(groupByMonthAndType(filteredReports)).map(([monthKey, typesObj]) => {
                const [year, monthIndex] = monthKey.split("-").map(Number);
                const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                const monthExpanded = expandedMonths[monthKey] || false;
                const monthTotals = calculateMonthTotals(typesObj);

                return (
                  <div key={monthKey} className="space-y-1">
                    {/* MOIS */}
                    <div
                      className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-orange-500 cursor-pointer"
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
                      <div className="min-w-[150px] text-center text-orange-400 font-semibold">{monthTotals.nouveauxVenus}</div>
                      <div className="min-w-[180px] text-center text-orange-400 font-semibold">{monthTotals.nouveauxConvertis}</div>
                      <div className="min-w-[140px]"></div>
                    </div>

                    {/* TYPES PAR MOIS */}
                    {monthExpanded && Object.entries(typesObj).map(([typeTemps, rows], typeIdx) => {
                      const typeExpanded = typeCollapsedDesktop[typeTemps] || false;
                      const borderColorClass = borderColors[typeIdx % borderColors.length];
                      const typeTotals = calculateTypeTotals(rows);

                      return (
                        <div key={typeTemps} className="space-y-1">
                          {/* HEADER TYPE */}
                          <div
                            className={`flex items-center px-4 py-2 rounded-lg bg-white/5 cursor-pointer border-l-4 ${borderColorClass}`}
                            onClick={() => setTypeCollapsedDesktop(prev => ({
                              ...prev,
                              [typeTemps]: !prev[typeTemps]
                            }))}
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
                            <div className="min-w-[150px] text-center text-orange-400 font-semibold">{typeTotals.nouveauxVenus}</div>
                            <div className="min-w-[180px] text-center text-orange-400 font-semibold">{typeTotals.nouveauxConvertis}</div>
                            <div className="min-w-[140px]"></div>
                          </div>

                          {/* LIGNES (DATE) */}
                          {typeExpanded && rows.map(r => {
                            const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
                            return (
                              <div
                                key={r.id}
                                className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColorClass} cursor-pointer ml-12`}
                              >
                                <div className="min-w-[220px] text-white">{formatDateFR(r.date)}</div>
                                <div className="min-w-[120px] text-center text-white -ml-12">{r.hommes}</div>
                                <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                                <div className="min-w-[120px] text-center text-white">{r.jeunes}</div>
                                <div className="min-w-[130px] text-center text-white">{total}</div>
                                <div className="min-w-[120px] text-center text-white">{r.enfants}</div>
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

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4">
            {Object.entries(groupByMonthAndType(filteredReports)).map(([monthKey, typesObj]) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
              const monthExpanded = expandedMonths[monthKey] || false;

              return (
                <div key={monthKey} className="space-y-2">
                  {/* MOIS */}
                  <div
                    className="bg-white/10 rounded-xl p-3 text-white font-bold flex justify-between items-center cursor-pointer border-l-4 border-red-500"
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <span>{monthExpanded ? "➖" : "➕"} {monthLabel}</span>
                  </div>

                  {/* TYPES */}
                  {monthExpanded && Object.entries(typesObj).map(([typeTemps, rows], typeIdx) => {
                    const typeExpanded = typeCollapsedDesktop[typeTemps] || false;
                    const borderColorClass = borderColors[typeIdx % borderColors.length];
                    const typeTotals = calculateTypeTotals(rows);
                    const totalHFJ = typeTotals.total;
                    const totalGlobal = typeTotals.total + typeTotals.enfants;

                    return (
                      <div key={typeTemps} className="ml-3 space-y-2">
                        {/* TYPE */}
                        <div
                          className={`bg-white/5 rounded-lg p-3 text-orange-400 font-semibold flex justify-between items-center cursor-pointer border-l-4 ${borderColorClass}`}
                          onClick={() => setTypeCollapsedDesktop(prev => ({
                            ...prev,
                            [typeTemps]: !prev[typeTemps]
                          }))}
                        >
                          <span>{typeExpanded ? "➖" : "➕"} {typeTemps}</span>
                          <div className="text-right leading-tight">
                            <p className="text-sm font-bold text-amber-300">{t.totalHFJ} {totalHFJ}</p>
                            <p className="text-sm font-bold text-orange-400">{t.totalGlobal} {totalGlobal}</p>
                          </div>
                        </div>

                        {/* DATES */}
                        {typeExpanded && rows.map(r => (
                          <div
                            key={r.id}
                            className={`ml-4 bg-white/10 rounded-lg p-3 text-white border-l-4 ${borderColorClass}`}
                          >
                            <p className="text-amber-300 text-right">{formatDateFR(r.date)}</p>
                            <p className="mt-2">{t.mobileHommes}: {r.hommes} | {t.mobileFemmes}: {r.femmes} | {t.mobileJeunes}: {r.jeunes}</p>
                            <p className="font-semibold text-orange-400">{t.total}: {Number(r.hommes)+Number(r.femmes)+Number(r.jeunes)}</p>
                            <p className="mt-2">{t.mobileEnfants}: {r.enfants}</p>
                            <p className="mt-1">{t.mobileNouveauxVenus}: {r.nouveauxVenus} | {t.mobileNouveauxConvertis}: {r.nouveauxConvertis}</p>

                            <div className="flex justify-center gap-4 mt-3">
                              <button
                                onClick={() => handleEdit(r)}
                                className="text-blue-400 hover:text-blue-500 text-lg"
                                style={{ fontSize: '1rem' }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteTemps(r.typeTemps)}
                                className="text-red-600 hover:text-red-700 text-lg"
                                style={{ fontSize: '1rem' }}
                              >
                                🗑️
                              </button>
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
        select.input option[value='AUTRE'] {
          color: #333699;
        }
        select.input option:hover {
          background: #e0e0e0;
          color: black;
        }
        select.input option[value='AUTRE']:hover {
          background: #333699;
          color: white;
        }
      `}</style>
    </div>
  );
}
