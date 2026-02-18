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
  const [collapsedMonths, setCollapsedMonths] = useState({}); // 🔹 pour collapse

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 🔹 Retourne 'YYYY-MM' pour le regroupement par mois
  const getMonthKey = (dateString) => {
    const d = new Date(dateString);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}`;
  };

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

    let query = supabase
      .from("formations")
      .select("*")
      .eq("eglise_id", formData.eglise_id)
      .eq("branche_id", formData.branche_id)
      .order("date_debut", { ascending: false });

    if (filterDebut) query = query.gte("date_debut", filterDebut);
    if (filterFin) query = query.lte("date_fin", filterFin);

    const { data } = await query;
    setRapports(data || []);
  };

  useEffect(() => {
    if (formData.eglise_id && formData.branche_id) {
      fetchRapports();
    }
  }, [formData.eglise_id, formData.branche_id, filterDebut, filterFin]);

  const handleEdit = (r) => {
    setEditRapport(r);
    setFormData({
      ...formData,
      date_debut: r.date_debut,
      date_fin: r.date_fin,
      nom_formation: r.nom_formation,
      hommes: r.hommes,
      femmes: r.femmes,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 Toggle collapse par mois
  const toggleMonth = (monthKey) => {
    setCollapsedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  // 🔹 Regroupement des rapports par mois
  const rapportsByMonth = rapports.reduce((acc, r) => {
    const key = getMonthKey(r.date_debut);
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">Rapport Formation</h1>
      <p className="text-white/80 mb-6">Résumé des formations par date</p>

      {/* Formulaire */}
      <div className="max-w-2xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-white mb-1">Date Début</label>
            <input
              type="date"
              required
              value={formData.date_debut}
              onChange={(e) =>
                setFormData({ ...formData, date_debut: e.target.value })
              }
              className="input"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Date Fin</label>
            <input
              type="date"
              required
              value={formData.date_fin}
              onChange={(e) =>
                setFormData({ ...formData, date_fin: e.target.value })
              }
              className="input"
            />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-white mb-1">Nom de la Formation</label>
            <input
              type="text"
              required
              placeholder="Nom de la formation"
              value={formData.nom_formation}
              onChange={(e) =>
                setFormData({ ...formData, nom_formation: e.target.value })
              }
              className="input"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Hommes</label>
            <input
              type="number"
              value={formData.hommes}
              onChange={(e) =>
                setFormData({ ...formData, hommes: e.target.value })
              }
              className="input"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Femmes</label>
            <input
              type="number"
              value={formData.femmes}
              onChange={(e) =>
                setFormData({ ...formData, femmes: e.target.value })
              }
              className="input"
            />
          </div>
          <div className="col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="w-full max-w-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold text-lg py-3 px-6 rounded-2xl shadow-lg hover:from-blue-500 hover:to-indigo-600 hover:scale-105 transition-all duration-300"
            >
              {editRapport ? "Modifier" : "Ajouter le rapport"}
            </button>
          </div>
        </form>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={filterDebut}
          onChange={(e) => setFilterDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={filterFin}
          onChange={(e) => setFilterFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* Tableau collapse par mois */}
      <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
        <div className="w-max space-y-4">
          {Object.entries(rapportsByMonth).map(([month, items]) => {
            const monthName = new Date(month + "-01").toLocaleString("fr-FR", { month: "long", year: "numeric" });
            const collapsed = collapsedMonths[month] ?? false;

            return (
              <div key={month} className="bg-white/10 rounded-xl">
                <div
                  className="px-4 py-2 cursor-pointer font-semibold text-white flex justify-between items-center hover:bg-white/20 transition"
                  onClick={() => toggleMonth(month)}
                >
                  <span>{monthName}</span>
                  <span>{collapsed ? "▼" : "▲"}</span>
                </div>
                {!collapsed && (
                  <div className="space-y-2">
                    <div className="flex font-semibold uppercase text-white px-2 py-2 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                      <div className="min-w-[120px]">Date Début</div>
                      <div className="min-w-[120px]">Date Fin</div>
                      <div className="min-w-[180px] text-center">Nom Formation</div>
                      <div className="min-w-[80px] text-center">Hommes</div>
                      <div className="min-w-[80px] text-center">Femmes</div>
                      <div className="min-w-[80px] text-center text-orange-500 font-semibold">Total</div>
                      <div className="min-w-[120px] text-center">Actions</div>
                    </div>
                    {items.map((r) => {
                      const total = Number(r.hommes) + Number(r.femmes);
                      return (
                        <div
                          key={r.id}
                          className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
                        >
                          <div className="min-w-[120px] text-white">{formatDate(r.date_debut)}</div>
                          <div className="min-w-[120px] text-white">{formatDate(r.date_fin)}</div>
                          <div className="min-w-[180px] text-white text-center">{r.nom_formation}</div>
                          <div className="min-w-[80px] text-center text-white">{r.hommes}</div>
                          <div className="min-w-[80px] text-center text-white">{r.femmes}</div>
                          <div className="min-w-[80px] text-center text-orange-500 font-semibold">{total}</div>
                          <div className="min-w-[120px] text-center">
                            <button
                              onClick={() => handleEdit(r)}
                              className="text-orange-400 underline hover:text-orange-500 hover:no-underline px-2 py-1 rounded-xl"
                            >
                              Modifier
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .input::placeholder {
          color: #e0e0e0;
        }
      `}</style>
    </div>
  );
}
