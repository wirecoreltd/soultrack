"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AttendanceFamillePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Superadmin", "ResponsableFamilles"]}>
      <AttendanceFamille />
    </ProtectedRoute>
  );
}

function AttendanceFamille() {
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

  const [formData, setFormData] = useState({
    date: "",
    typeTemps: "",
    nouveauTemps: "",
    enregistrerTemps: false,
    famille_id: "",
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
        .select("id, eglise_id, role")
        .eq("id", user.id)
        .single();
      if (error) console.error(error);
      else setSuperviseur({ eglise_id: data.eglise_id, id: data.id, role: data.role });
    };
    loadSuperviseur();
  }, []);

  /* ================= FAMILLES ================= */
  useEffect(() => {
    if (!superviseur.eglise_id) return;
    const loadFamilles = async () => {
      const { data, error } = await supabase
        .from("familles")
        .select("id, famille_full, responsable_id")
        .eq("eglise_id", superviseur.eglise_id)
        .order("famille_full");
      if (error) { console.error(error); return; }

      let filtered = data || [];
      if (superviseur.role === "ResponsableFamilles") {
        filtered = filtered.filter((f) => f.responsable_id === superviseur.id);
      }
      setFamilles(filtered);

      // Pré-sélectionner la première famille si ResponsableFamilles
      if (superviseur.role === "ResponsableFamilles" && filtered.length === 1) {
        setFormData(prev => ({ ...prev, famille_id: filtered[0].id }));
      }
    };
    loadFamilles();
  }, [superviseur]);

  /* ================= SPLIT TYPE NAME ================= */
  const splitTypeName = (name, lineLength = 15) => {
    if (!name) return "";
    const regex = new RegExp(`.{1,${lineLength}}`, "g");
    return name.match(regex).join("\n");
  };

  /* ================= GROUP / TOTALS ================= */
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
    const totals = { hommes: 0, femmes: 0, jeunes: 0, total: 0, enfants: 0, nouveauxVenus: 0, nouveauxConvertis: 0 };
    Object.values(typesObj).forEach(rows => {
      rows.forEach(r => {
        totals.hommes += Number(r.hommes || 0);
        totals.femmes += Number(r.femmes || 0);
        totals.jeunes += Number(r.jeunes || 0);
        totals.total += Number(r.hommes || 0) + Number(r.femmes || 0) + Number(r.jeunes || 0);
        totals.enfants += Number(r.enfants || 0);
        totals.nouveauxVenus += Number(r.nouveauxVenus || 0);
        totals.nouveauxConvertis += Number(r.nouveauxConvertis || 0);
      });
    });
    return totals;
  };

  const calculateTypeTotals = (rows) => {
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

  /* ================= TEMPS ================= */
  useEffect(() => {
    if (!superviseur.eglise_id) return;
    const loadTemps = async () => {
      const { data, error } = await supabase
        .from("attendance_famille")
        .select("typeTemps")
        .eq("eglise_id", superviseur.eglise_id)
        .not("typeTemps", "is", null);
      if (error) console.error(error);
      else {
        const uniqueTemps = [
          "Famille",
          ...new Set(
            data.map(t => t.typeTemps?.trim())
              .filter(t => t && t !== "" && t !== "Famille")
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

  /* ================= RENAME / DELETE TEMPS ================= */
  const handleRenameTemps = async (ancienNom, nouveauNom) => {
    if (!nouveauNom) return;
    try {
      const { error } = await supabase
        .from("attendance_famille")
        .update({ typeTemps: nouveauNom })
        .eq("typeTemps", ancienNom)
        .eq("eglise_id", superviseur.eglise_id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error("Erreur renommer temps:", err.message);
      alert("Erreur lors du renommage du temps.");
    }
  };

  const handleDeleteTemps = async (nomTemps) => {
    const confirmDelete = confirm(
      "Voulez-vous vraiment supprimer ce temps ? Les rapports existants resteront mais sans nom de temps."
    );
    if (!confirmDelete) return;
    try {
      const { error } = await supabase
        .from("attendance_famille")
        .update({ typeTemps: null })
        .eq("typeTemps", nomTemps)
        .eq("eglise_id", superviseur.eglise_id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error("Erreur suppression temps:", err.message);
      alert("Erreur lors de la suppression du temps.");
    }
  };

  const handleDeleteReport = async (id) => {
    const confirmDelete = confirm("Voulez-vous vraiment supprimer ce rapport ?");
    if (!confirmDelete) return;
    try {
      const { error } = await supabase.from("attendance_famille").delete().eq("id", id);
      if (error) throw error;
      fetchRapports();
    } catch (err) {
      console.error("Erreur suppression rapport:", err.message);
      alert("Erreur lors de la suppression.");
    }
  };

  /* ================= HANDLE FORM ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["hommes", "femmes", "jeunes", "enfants", "nouveauxVenus", "nouveauxConvertis"].includes(name)
        ? Number(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");

    if (!superviseur.eglise_id) {
      setMessage("❌ Les informations de l'église ne sont pas encore chargées.");
      return;
    }

    if (!formData.famille_id) {
      setMessage("❌ Veuillez sélectionner une famille.");
      return;
    }

    let typeTempsFinal =
      formData.typeTemps === "AUTRE" ? formData.nouveauTemps.trim() : formData.typeTemps;

    if (!typeTempsFinal) {
      setMessage("❌ Le nom du temps ne peut pas être vide.");
      return;
    }

    if (formData.enregistrerTemps && formData.typeTemps === "AUTRE" && !tempsOptions.includes(typeTempsFinal)) {
      setTempsOptions(prev => [...prev, typeTempsFinal]);
      try {
        const { error } = await supabase.from("attendance_famille").insert([{
          typeTemps: typeTempsFinal,
          eglise_id: superviseur.eglise_id
        }]);
        if (error) throw error;
      } catch (err) {
        console.error("Erreur ajout nouveau temps :", err.message);
        setMessage("❌ Impossible d'ajouter le nouveau temps.");
        return;
      }
    }

    const rapportAvecEglise = {
      ...formData,
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

    const rapportClean = Object.fromEntries(
      Object.entries(rapportAvecEglise).filter(([_, v]) => v !== "" && v !== null)
    );

    try {
      if (editId) {
        const { error } = await supabase.from("attendance_famille").update(rapportClean).eq("id", editId);
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { error } = await supabase.from("attendance_famille").insert([rapportClean]);
        if (error) throw error;
        setMessage("✅ Rapport ajouté !");
      }

      setTimeout(() => setMessage(""), 3000);
      setFormData({
        date: "",
        typeTemps: "",
        nouveauTemps: "",
        enregistrerTemps: false,
        famille_id: superviseur.role === "ResponsableFamilles" && familles.length === 1 ? familles[0].id : "",
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
      typeTemps: r.typeTemps === "Famille" ? "Famille" : "AUTRE",
      nouveauTemps: r.typeTemps !== "Famille" ? r.typeTemps : "",
      famille_id: r.famille_id || "",
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

    let query = supabase
      .from("attendance_famille")
      .select("*")
      .eq("eglise_id", superviseur.eglise_id);

    // Filtre ResponsableFamilles : uniquement ses familles
    if (superviseur.role === "ResponsableFamilles") {
      const mesFamillesIds = familles.map(f => f.id);
      if (mesFamillesIds.length > 0) {
        query = query.in("famille_id", mesFamillesIds);
      }
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

  /* ================= UTIL ================= */
  const getMonthNameFR = (monthIndex) => {
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return months[monthIndex] || "";
  };

  const formatDateFR = (d) => {
    const dateObj = new Date(d);
    return `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
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

  const borderColors = ["border-red-500", "border-green-500", "border-blue-500",
    "border-yellow-500", "border-purple-500", "border-pink-500", "border-indigo-500"];

  const filteredReports = filterType
    ? reports.filter(r => r.typeTemps === filterType)
    : reports;

  useEffect(() => {
    if (reports.length > 0) {
      const types = [...new Set(reports.map(r => r.typeTemps?.trim()).filter(t => t && t !== ""))];
      setAvailableTypes(types);
    }
  }, [reports]);

  const getFamilleLabel = (id) => {
    const f = familles.find(f => f.id === id);
    return f?.famille_full || "—";
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        Suivi des Âmes & Présences <span className="text-emerald-300">des Familles</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          Ce module a pour but <span className="text-blue-300 font-semibold">d'accompagner </span> l'Église dans sa
          <span className="text-blue-300 font-semibold"> mission de croissance </span>, de{" "}
          <span className="text-blue-300 font-semibold">suivi et de transformation des vies</span>.
          À travers le suivi des <span className="text-blue-300 font-semibold">présences </span> dans les familles, il ne s'agit pas simplement de compter des personnes, mais de
          reconnaître <span className="text-blue-300 font-semibold">chaque âme comme précieuse et importante devant Dieu</span>.
        </p>
      </div>

      {/* FORMULAIRE */}
      <div ref={formRef} className="max-w-3xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Famille */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="text-white mb-1">👨‍👩‍👦 Famille</label>
            <select
              name="famille_id"
              value={formData.famille_id}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="">-- Sélectionner une famille --</option>
              {familles.map(f => (
                <option key={f.id} value={f.id}>{f.famille_full}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-white mb-1">Date de la rencontre</label>
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
                    {t !== "Famille" && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRenameTemps(t, prompt("Nouveau nom ?", t)); }}
                          className="text-blue-500"
                        >✏️</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTemps(t); }}
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
                    const value = e.target.value.slice(0, 30);
                    setFormData(prev => ({ ...prev, nouveauTemps: value }));
                  }}
                  className="input w-full"
                  placeholder="Ex: Réunion de prière"
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
                <label className="text-amber-300 text-sm">Enregistrer ce temps pour le futur</label>
              </div>
            </>
          )}

          {/* Champs chiffrés */}
          {["hommes", "femmes", "jeunes", "enfants", "nouveauxVenus", "nouveauxConvertis"].map(field => (
            <div className="flex flex-col w-full" key={field}>
              <label className="text-white mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
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
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-white font-medium">{message}</p>}
      </div>

      {/* FILTRE DATE */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 mt-2 w-full md:w-fit md:mx-auto flex flex-col text-white">
        <p className="text-base text-red-400 font-semibold text-center mb-4">
          Choisissez les paramètres pour générer le rapport
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full flex-wrap">

          {/* Famille filtre */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1">Famille</label>
            <select
              value={filterFamille}
              onChange={e => setFilterFamille(e.target.value)}
              className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white"
            >
              <option value="" className="text-black">Toutes</option>
              {familles.map(f => (
                <option key={f.id} value={f.id} className="text-black">{f.famille_full}</option>
              ))}
            </select>
          </div>

          {/* Date début */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1">Date de début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white"
            />
          </div>

          {/* Date fin */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1">Date de fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white"
            />
          </div>

          {/* Bouton générer */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-base text-center mb-1 opacity-0">btn</label>
            <button
              onClick={fetchRapports}
              className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition"
            >
              {loading ? "Chargement..." : "Générer le rapport"}
            </button>
          </div>

          {/* Type filtre */}
          {availableTypes.length > 0 && (
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-base text-center mb-1">Type de temps</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full h-10 bg-white/10 border border-white/30 rounded-lg px-3 text-white text-center"
              >
                <option value="" className="text-black">Tous</option>
                {availableTypes.map(t => (
                  <option key={t} value={t} className="text-black">{t}</option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* TABLEAU */}
      {showTable && (
        <div className="w-full px-4 mt-6 mb-6">

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <div className="w-max space-y-2">

              {/* HEADER */}
              <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                <div className="min-w-[220px]">Type / Date</div>
                <div className="min-w-[160px] text-center">Famille</div>
                <div className="min-w-[120px] text-center">Hommes</div>
                <div className="min-w-[120px] text-center">Femmes</div>
                <div className="min-w-[120px] text-center">Jeunes</div>
                <div className="min-w-[130px] text-center">Total</div>
                <div className="min-w-[120px] text-center">Enfants</div>
                <div className="min-w-[150px] text-center">Nouveaux venus</div>
                <div className="min-w-[180px] text-center">Nouveaux convertis</div>
                <div className="min-w-[140px] text-center">Actions</div>
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

                    {/* TYPES */}
                    {monthExpanded && Object.entries(typesObj).map(([typeTemps, rows], typeIdx) => {
                      const typeExpanded = typeCollapsedDesktop[typeTemps] || false;
                      const borderColorClass = borderColors[typeIdx % borderColors.length];
                      const typeTotals = calculateTypeTotals(rows);

                      return (
                        <div key={typeTemps} className="space-y-1">

                          {/* HEADER TYPE */}
                          <div
                            className={`flex items-center px-4 py-2 rounded-lg bg-white/5 cursor-pointer border-l-4 ${borderColorClass}`}
                            onClick={() => setTypeCollapsedDesktop(prev => ({ ...prev, [typeTemps]: !prev[typeTemps] }))}
                          >
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

                          {/* LIGNES DATE */}
                          {typeExpanded && rows.map(r => {
                            const total = Number(r.hommes) + Number(r.femmes) + Number(r.jeunes);
                            return (
                              <div
                                key={r.id}
                                className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColorClass} cursor-pointer ml-12`}
                              >
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
                          onClick={() => setTypeCollapsedDesktop(prev => ({ ...prev, [typeTemps]: !prev[typeTemps] }))}
                        >
                          <span>{typeExpanded ? "➖" : "➕"} {typeTemps}</span>
                          <div className="text-right leading-tight">
                            <p className="text-sm font-bold text-amber-300">Total (H+F+J): {totalHFJ}</p>
                            <p className="text-sm font-bold text-orange-400">Total Global: {totalGlobal}</p>
                          </div>
                        </div>

                        {/* DATES */}
                        {typeExpanded && rows.map(r => (
                          <div
                            key={r.id}
                            className={`ml-4 bg-white/10 rounded-lg p-3 text-white border-l-4 ${borderColorClass}`}
                          >
                            <p className="text-amber-300 text-right">{formatDateFR(r.date)}</p>
                            <p className="text-sm text-blue-200 mt-1">👨‍👩‍👦 {getFamilleLabel(r.famille_id)}</p>
                            <p className="mt-2">Hommes: {r.hommes} | Femmes: {r.femmes} | Jeunes: {r.jeunes}</p>
                            <p className="font-semibold text-orange-400">Total: {Number(r.hommes) + Number(r.femmes) + Number(r.jeunes)}</p>
                            <p className="mt-2">Enfants: {r.enfants}</p>
                            <p className="mt-1">Nouveaux Venus: {r.nouveauxVenus} | Nouveaux Convertis: {r.nouveauxConvertis}</p>

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
