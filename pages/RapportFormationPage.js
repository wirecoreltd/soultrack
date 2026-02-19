"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportFormationPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportFormation />
    </ProtectedRoute>
  );
}

function RapportFormation() {
  const [formData, setFormData] = useState({
    date_debut: "",
    date_fin: "",
    nom_formation: "",
    hommes: 0,
    femmes: 0,
    eglise_id: null,
    branche_id: null,
  });

  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [editRapport, setEditRapport] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          eglise_id: profile.eglise_id,
          branche_id: profile.branche_id,
        }));
      }
    };
    fetchUser();
  }, []);

  const formatDate = (dateString) => {
  if (!dateString) return "";

  const d = new Date(dateString);
  if (isNaN(d)) return dateString;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editRapport) {
      await supabase
        .from("formations")
        .update({
          date_debut: formData.date_debut,
          date_fin: formData.date_fin,
          nom_formation: formData.nom_formation,
          hommes: formData.hommes,
          femmes: formData.femmes,
        })
        .eq("id", editRapport.id);
      setEditRapport(null);
    } else {
      await supabase.from("formations").insert([formData]);
    }

    setFormData((prev) => ({
      ...prev,
      date_debut: "",
      date_fin: "",
      nom_formation: "",
      hommes: 0,
      femmes: 0,
    }));

    fetchRapports();
  };

  const fetchRapports = async () => {
    if (!formData.eglise_id || !formData.branche_id) return;

    setShowTable(false);

    let query = supabase
      .from("formations")
      .select("*")
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .order("date_debut", { ascending: true });

    if (filterDebut) query = query.gte("date_debut", filterDebut);
    if (filterFin) query = query.lte("date_fin", filterFin);

    const { data } = await query;
    setRapports(data || []);
    setShowTable(true);
  };

  const handleEdit = (r) => {
    setEditRapport(r);
    setFormData((prev) => ({
      ...prev,
      date_debut: r.date_debut,
      date_fin: r.date_fin,
      nom_formation: r.nom_formation,
      hommes: r.hommes,
      femmes: r.femmes,
    }));
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[monthIndex] || "";
  };

  const groupByMonth = (data) => {
    const map = {};
    data.forEach((r) => {
      const d = new Date(r.date_debut);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const groupedReports = groupByMonth(rapports);
  const borderColors = [
    "border-red-500",
    "border-green-500",
    "border-blue-500",
    "border-yellow-500",
    "border-purple-500",
    "border-pink-500",
    "border-indigo-500"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">Rapport Formation</h1>
      <p className="text-white/80 mb-6">Résumé des formations par date</p>

      {/* Formulaire de création de rapport */}
        <div className="max-w-2xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div className="flex gap-4 w-full">
              <div className="flex flex-col flex-1">
                <label className="text-white font-medium mb-1">Date de début</label>
                <input
                  type="date"
                  required
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="input bg-white/20 text-white placeholder-white w-full py-1"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-white font-medium mb-1">Date de fin</label>
                <input
                  type="date"
                  required
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="input bg-white/20 text-white placeholder-white w-full py-1"
                />
              </div>
            </div>
        
            <div className="flex flex-col">
              <label className="text-white font-medium mb-1">Nom de la formation</label>
              <input
                type="text"
                required
                value={formData.nom_formation}
                onChange={(e) => setFormData({ ...formData, nom_formation: e.target.value })}
                className="input bg-white/20 text-white placeholder-white w-full py-1"
              />
            </div>
        
            <div className="flex gap-4 w-full">
              <div className="flex flex-col flex-1">
                <label className="text-white font-medium mb-1">Hommes</label>
                <input
                  type="number"
                  min={0}
                  value={formData.hommes}
                  onChange={(e) => setFormData({ ...formData, hommes: Number(e.target.value) })}
                  className="input bg-white/20 text-white placeholder-white w-full py-1"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-white font-medium mb-1">Femmes</label>
                <input
                  type="number"
                  min={0}
                  value={formData.femmes}
                  onChange={(e) => setFormData({ ...formData, femmes: Number(e.target.value) })}
                  className="input bg-white/20 text-white placeholder-white w-full py-1"
                />
              </div>
            </div>
        
            <div className="flex flex-col">
              <label className="text-white font-medium mb-1">Formateur</label>
              <input
                type="text"
                value={formData.formateur || ""}
                onChange={(e) => setFormData({ ...formData, formateur: e.target.value })}
                className="input bg-white/20 text-white placeholder-white w-full py-1"
              />
            </div>
        
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all"
            >
              {editRapport ? "Mettre à jour" : "Ajouter le rapport"}
            </button>
          </form>
        </div>

      {/* Filtres */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          lang="fr"
          value={filterDebut}
          onChange={(e)=>setFilterDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          title="Format : jj/mm/aaaa"
        />
        
        <input
          type="date"
          lang="fr"
          value={filterFin}
          onChange={(e)=>setFilterFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          title="Format : jj/mm/aaaa"
        />

        <button onClick={fetchRapports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>

      {/* Tableau */}
      {showTable && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">

            {/* Header */}
            <div className="flex font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[180px]">Date Début</div>
              <div className="min-w-[180px]">Date Fin</div>
              <div className="min-w-[200px] text-center">Nom Formation</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">Total</div>
              <div className="min-w-[150px] text-center">Actions</div>
            </div>

            {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
            
              const totalMonth = monthReports.reduce(
                (acc, r) => {
                  acc.hommes += Number(r.hommes || 0);
                  acc.femmes += Number(r.femmes || 0);
                  acc.total += Number(r.hommes || 0) + Number(r.femmes || 0);
                  return acc;
                },
                { hommes: 0, femmes: 0, total: 0 }
              );
            
              const isExpanded = expandedMonths[monthKey] || false;
              const borderColor = borderColors[idx % borderColors.length];
            
              return (
                <div key={monthKey} className="space-y-1">
                  {/* Ligne Mois */}
                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer ${borderColor}`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[180px] text-white font-semibold">
                      {isExpanded ? "➖" : "➕"} {monthLabel}
                    </div>
                    <div className="min-w-[180px]"></div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[120px] text-center text-white font-bold ml-1.5">
                      {totalMonth.hommes}
                    </div>
                    <div className="min-w-[120px] text-center text-white font-bold">
                      {totalMonth.femmes}
                    </div>
                    <div className="min-w-[120px] text-center text-orange-500 font-semibold">
                      {totalMonth.total}
                    </div>
                    <div className="min-w-[150px]"></div>
                  </div>
            
                  {/* Lignes rapports */}
                  {isExpanded &&
                    monthReports.map((r) => {
                      const total = Number(r.hommes || 0) + Number(r.femmes || 0);
            
                      return (
                        <div
                          key={r.id}
                          className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
                        >
                          <div className="min-w-[180px] text-white text-center">
                            {formatDate(r.date_debut)}
                          </div>
                          <div className="min-w-[180px] text-white text-center">
                            {formatDate(r.date_fin)}
                          </div>
                          <div className="min-w-[200px] text-center text-white">
                            {r.nom_formation}
                          </div>
                          <div className="min-w-[120px] text-center text-white">
                            {r.hommes}
                          </div>
                          <div className="min-w-[120px] text-center text-white">
                            {r.femmes}
                          </div>
                          <div className="min-w-[120px] text-center text-orange-500 font-semibold">
                            {total}
                          </div>
                          <div className="min-w-[150px] text-center">
                            <button
                              onClick={() => handleEdit(r)}
                              className="text-orange-400 underline hover:text-orange-500 hover:no-underline px-4 py-1 rounded-xl"
                            >
                              Modifier
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}



            {/* TOTAL GENERAL */}
            <div className="flex items-center px-6 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl">
              <div className="min-w-[180px] text-orange-500 font-semibold">TOTAL</div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[200px]"></div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.hommes),0)}</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.femmes),0)}</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.hommes)+Number(r.femmes),0)}</div>
              <div className="min-w-[150px]"></div>
            </div>

            {rapports.length===0 && (
              <div className="text-white/70 px-4 py-6 text-center">
                Aucun rapport trouvé
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
