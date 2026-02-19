"use client";

import { useEffect, useState, useRef } from "react";
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
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showTable, setShowTable] = useState(false);

  const formRef = useRef(null); // Référence pour scroll automatique

  /* ================= USER ================= */

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

  /* ================= FETCH ================= */

  const fetchRapports = async () => {
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
    setShowTable(true); // Affiche la table uniquement après clic sur "Générer"
  };

  /* ================= CRUD ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editRapport) return handleUpdate();

    await supabase.from("formations").insert([formData]);

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

    // Scroll automatique vers le formulaire
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleUpdate = async () => {
    if (!editRapport) return;

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

  /* ================= UTIL ================= */

  const getMonthNameFR = (monthIndex) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[monthIndex] || "";
  };

  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const groupByMonth = (rapports) => {
    const map = {};
    rapports.forEach(r => {
      const d = new Date(r.date_debut);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const groupedReports = Object.entries(groupByMonth(rapports))
    .sort((a, b) => {
      const [yearA, monthA] = a[0].split("-").map(Number);
      const [yearB, monthB] = b[0].split("-").map(Number);
      return new Date(yearA, monthA) - new Date(yearB, monthB);
    });

  const totalGlobal = rapports.reduce((acc, r) => {
    acc.hommes += Number(r.hommes || 0);
    acc.femmes += Number(r.femmes || 0);
    return acc;
  }, { hommes: 0, femmes: 0 });

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-white mt-4 mb-2">
        Rapport Formation
      </h1>

      <p className="text-white/80 mb-6">
        Résumé des formations par mois
      </p>

      {/* ================= FORMULAIRE ================= */}

      <div ref={formRef} className="max-w-2xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
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
              className="w-full max-w-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              {editRapport ? "Modifier" : "Ajouter le rapport"}
            </button>
          </div>

        </form>
      </div>

      {/* ================= FILTRES ================= */}

      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
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

      {/* ================= TABLEAU ================= */}

      {showTable && (
        <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
          <div className="w-max space-y-2">

            <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
              <div className="min-w-[200px]">Date Début</div>
              <div className="min-w-[200px]">Date Fin</div>
              <div className="min-w-[200px] text-center">Nom Formation</div>
              <div className="min-w-[120px] text-center">Hommes</div>
              <div className="min-w-[120px] text-center">Femmes</div>
              <div className="min-w-[120px] text-center">Total</div>
              <div className="min-w-[150px] text-center">Actions</div>
            </div>

            {groupedReports.map(([monthKey, monthRapports], idx) => {
              const [year, monthIndex] = monthKey.split("-").map(Number);
              const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

              const totalMonth = monthRapports.reduce((acc, r) => {
                acc.hommes += Number(r.hommes || 0);
                acc.femmes += Number(r.femmes || 0);
                return acc;
              }, { hommes: 0, femmes: 0 });

              const isExpanded = expandedMonths[monthKey] || false;

              const borderColors = [
                "border-red-500",
                "border-green-500",
                "border-blue-500",
                "border-yellow-500",
                "border-purple-500"
              ];

              const borderColor = borderColors[idx % borderColors.length];

              return (
                <div key={monthKey} className="space-y-1">

                  <div
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer border-l-4 ${borderColor}`}
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div className="min-w-[200px] text-white font-semibold">
                      {isExpanded ? "➖ " : "➕ "} {monthLabel}
                    </div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[200px]"></div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.hommes}</div>
                    <div className="min-w-[120px] text-center text-white font-bold">{totalMonth.femmes}</div>
                    <div className="min-w-[120px] text-center text-orange-400 font-semibold">
                      {totalMonth.hommes + totalMonth.femmes}
                    </div>
                    <div className="min-w-[150px]"></div>
                  </div>

                  {(isExpanded || monthRapports.length === 1) &&
                    monthRapports.map(r => {
                      const total = Number(r.hommes) + Number(r.femmes);
                      return (
                        <div
                          key={r.id}
                          className={`flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}
                        >
                          <div className="min-w-[200px] text-white">{formatDateFR(r.date_debut)}</div>
                          <div className="min-w-[200px] text-white">{formatDateFR(r.date_fin)}</div>
                          <div className="min-w-[200px] text-center text-white">{r.nom_formation}</div>
                          <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                          <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                          <div className="min-w-[120px] text-center text-white font-bold">{total}</div>
                          <div className="min-w-[150px] text-center">
                            <button
                              onClick={() => handleEdit(r)}
                              className="text-orange-400 underline hover:text-orange-500 px-4 py-1 rounded-xl"
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

            <div className="flex items-center px-4 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl">
              <div className="min-w-[200px] text-white font-bold">TOTAL</div>
              <div className="min-w-[200px]"></div>
              <div className="min-w-[200px]"></div>
              <div className="min-w-[120px] text-center text-white font-bold">{totalGlobal.hommes}</div>
              <div className="min-w-[120px] text-center text-white font-bold">{totalGlobal.femmes}</div>
              <div className="min-w-[120px] text-center text-orange-400 font-semibold ml-2">{totalGlobal.hommes + totalGlobal.femmes}</div>
              <div className="min-w-[150px]"></div>
            </div>

          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
      `}</style>
    </div>
  );
}
