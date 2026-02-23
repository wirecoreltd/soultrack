"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportBaptemePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <RapportBapteme />
    </ProtectedRoute>
  );
}

function RapportBapteme() {
  const [formData, setFormData] = useState({
    date: "",
    hommes: 0,
    femmes: 0,
    baptise_par: "",
    eglise_id: null,
    branche_id: null,
  });

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapports, setRapports] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showTable, setShowTable] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enregistrement en cours...");
    try {
      const dataToSave = { ...formData };
      if (editId) {
        const { error } = await supabase
          .from("baptemes")
          .update(dataToSave)
          .eq("id", editId);
        if (error) throw error;
        setMessage("✅ Rapport mis à jour !");
      } else {
        const { error } = await supabase
          .from("baptemes")
          .insert([dataToSave]);
        if (error) throw error;
        setMessage("✅ Rapport ajouté !");
      }
      setTimeout(() => setMessage(""), 3000);
      setEditId(null);
      setFormData({ ...formData, date: "", hommes: 0, femmes: 0, baptise_par: "" });
      fetchRapports();
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  const fetchRapports = async () => {
    if (!formData.eglise_id || !formData.branche_id) return;

    setShowTable(false);

    let query = supabase
      .from("baptemes")
      .select("*")
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .order("date", { ascending: true });

    if (dateDebut) query = query.gte("date", dateDebut);
    if (dateFin) query = query.lte("date", dateFin);

    const { data } = await query;
    setRapports(data || []);
    setShowTable(true);
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData({ ...r });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rapport ?")) return;
    const { error } = await supabase.from("baptemes").delete().eq("id", id);
    if (error) console.error(error);
    else fetchRapports();
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months[monthIndex] || "";
  };

  const groupByMonth = (data) => {
    const map = {};
    data.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const groupedReports = groupByMonth(rapports);
  const borderColors = ["border-red-500","border-green-500","border-blue-500","border-yellow-500","border-purple-500","border-pink-500","border-indigo-500"];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

            <h1 className="text-2xl font-bold mt-4 mb-6 text-center">
        <span className="text-white">Rapport </span>
        <span className="text-amber-300">Baptême</span>
      </h1>
      {/* Formulaire */}
      <div className="max-w-2xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div className="flex flex-col items-center">
            <label className="text-white font-medium mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input bg-white/20 text-white placeholder-white max-w-[200px] py-1"
            />
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex flex-col flex-1">
              <label className="text-white font-medium mb-1">Hommes</label>
              <input
                type="number"
                value={formData.hommes}
                onChange={(e) => setFormData({ ...formData, hommes: e.target.value })}
                className="input bg-white/20 text-white placeholder-white w-full py-1"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-white font-medium mb-1">Femmes</label>
              <input
                type="number"
                value={formData.femmes}
                onChange={(e) => setFormData({ ...formData, femmes: e.target.value })}
                className="input bg-white/20 text-white placeholder-white w-full py-1"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-white font-medium mb-1">Baptisé par</label>
            <input
              type="text"
              value={formData.baptise_par}
              onChange={(e) => setFormData({ ...formData, baptise_par: e.target.value })}
              className="input bg-white/20 text-white placeholder-white w-full py-1"
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all"
          >
            {editId ? "Mettre à jour" : "Ajouter le rapport"}
          </button>

          {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
        </form>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* Tableau Groupé par mois */}
      {showTable && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-max overflow-x-auto space-y-2">
            {/* Header */}
            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[150px]">Date</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[130px] text-center text-orange-400 font-semibold">Total</div>
              <div className="min-w-[180px] text-center">Baptisé par</div>
              <div className="min-w-[140px] text-center text-orange-400 font-semibold">Actions</div>
            </div>

            {Object.entries(groupedReports).map(([monthKey, monthReports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

              const totalMonth = monthReports.reduce((acc,r)=>{
                acc.hommes += Number(r.hommes||0);
                acc.femmes += Number(r.femmes||0);
                acc.total += (Number(r.hommes||0) + Number(r.femmes||0));
                return acc;
              }, {hommes:0,femmes:0,total:0});

              const isExpanded = expandedMonths[monthKey] || false;
              const borderColor = borderColors[idx % borderColors.length];

              return (
                <div key={monthKey} className="space-y-1">
                  {/* Header mois */}
                  <div className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer ${borderColor}`}
                       onClick={()=>toggleMonth(monthKey)}>
                    <div className="min-w-[150px] text-white font-semibold">{isExpanded ? "➖ " : "➕ "} {monthLabel}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                    <div className="min-w-[130px] text-center text-orange-400 font-semibold">{totalMonth.total}</div>
                    <div className="min-w-[180px]"></div>
                    <div className="min-w-[140px]"></div>
                  </div>

                  {/* Lignes */}
                  {isExpanded && monthReports.map((r)=>{
                    const total = Number(r.hommes) + Number(r.femmes);
                    return (
                      <div key={r.id} className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500">
                        <div className="min-w-[150px] text-white font-semibold">{r.date}</div>
                        <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                        <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                        <div className="min-w-[130px] text-center text-orange-400 font-semibold">{total}</div>
                        <div className="min-w-[180px] text-center text-white">{r.baptise_par}</div>
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

            {/* TOTAL GENERAL */}
            <div className="flex items-center px-4 py-4 mt-6 rounded-lg bg-white/30 text-white font-bold whitespace-nowrap border-t-2 border-white">
              <div className="min-w-[150px] font-bold text-orange-500">TOTAL</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.hommes||0),0)}</div>
              <div className="min-w-[120px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>s+Number(r.femmes||0),0)}</div>
              <div className="min-w-[130px] text-center text-orange-500 font-semibold">{rapports.reduce((s,r)=>(s+Number(r.hommes||0)+Number(r.femmes||0)),0)}</div>
              <div className="min-w-[180px]"></div>
              <div className="min-w-[140px]"></div>
            </div>

            {rapports.length === 0 && (
              <div className="text-white/70 px-4 py-6 text-center">Aucun rapport trouvé</div>
            )}

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
