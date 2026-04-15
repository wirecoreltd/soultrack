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

             <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        Rapport <span className="text-emerald-300">Formation</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">          
            <span className="text-blue-300 font-semibold">Créez et pilotez</span> les rapports de formation.  <span className="text-blue-300 font-semibold">Centralisez</span> les données, suivez la participation (hommes/femmes) 
          et analysez l’impact des formations pour accompagner la <span className="text-blue-300 font-semibold">croissance spirituelle et le développement des membres</span>.
        </p>
      </div>

      {/* ================= FORMULAIRE ================= */}

      <div ref={formRef} className="bg-white/10 rounded-3xl p-6 shadow-lg w-full max-w-lg mx-auto mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col">
            <label className="text-white mb-1 text-center">Date Début</label>
            <input
              type="date"
              required
              value={formData.date_debut}
              onChange={(e) =>
                setFormData({ ...formData, date_debut: e.target.value })
              }
              className="input w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-1 text-center">Date Fin</label>
            <input
              type="date"
              required
              value={formData.date_fin}
              onChange={(e) =>
                setFormData({ ...formData, date_fin: e.target.value })
              }
              className="input w-full"
            />
          </div>

          <div className="flex flex-col">
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

         <div className="flex gap-4">
            <div className="flex flex-col w-1/2">
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
          
            <div className="flex flex-col w-1/2">
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
          </div>

          <div className="col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl hover:scale-[1.02] transition"
            >
              {editRapport ? "Modifier" : "Ajouter le rapport"}
            </button>
          </div>

        </form>
      </div>

      {/* ================= FILTRES ================= */}

       {/* FILTRES */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 md:p-6 mt-2 w-full max-w-lg mx-auto flex flex-col text-white">
        <p className="text-base text-red-400 font-semibold text-center mb-4">
          Choisissez les paramètres pour générer le rapport
        </p>
        <div className="flex flex-col w-full">
          <label className="text-center text-base mb-1">Date de Début</label>
          <input
            type="date"
            value={filterDebut}
            onChange={e => setFilterDebut(e.target.value)}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>
        
        <div className="flex flex-col w-full mt-2">
          <label className="text-center text-base mb-1">Date de Fin</label>
          <input
            type="date"
            value={filterFin}
            onChange={e => setFilterFin(e.target.value)}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
          />
        </div>
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-base text-center mb-1 opacity-0">btn</label>
          <button
            onClick={fetchRapports}
            className="w-full md:w-auto h-10 bg-amber-300 text-white font-semibold px-6 rounded-lg hover:bg-amber-400 transition"
          >
            Générer
          </button>
        </div>
      </div>  

     {/* ================= TALE DESKTOP ================= */}
{showTable && (
  <div className="hidden md:block w-full overflow-x-auto mt-4">

    <div className="w-max mx-auto">

      {/* ================= HEADER ================= */}
      <div className="flex text-sm font-semibold uppercase text-white px-3 py-2 border-b border-white/20 bg-white/5 rounded-t-lg whitespace-nowrap">
        <div className="min-w-[180px]">Date Début</div>
        <div className="min-w-[180px]">Date Fin</div>
        <div className="min-w-[180px] text-center">Nom Formation</div>
        <div className="min-w-[100px] text-center">Hommes</div>
        <div className="min-w-[100px] text-center">Femmes</div>
        <div className="min-w-[100px] text-center">Total</div>
        <div className="min-w-[140px] text-center">Actions</div>
      </div>

      {/* ================= GROUPES MOIS ================= */}
      {groupedReports.map(([monthKey, monthRapports], idx) => {
        const [year, monthIndex] = monthKey.split("-").map(Number);
        const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

        const isExpanded = expandedMonths[monthKey];

        const totalMonth = monthRapports.reduce(
          (acc, r) => {
            acc.hommes += Number(r.hommes || 0);
            acc.femmes += Number(r.femmes || 0);
            return acc;
          },
          { hommes: 0, femmes: 0 }
        );

        const borderColors = [
          "border-red-500",
          "border-green-500",
          "border-blue-500",
          "border-yellow-500",
          "border-purple-500",
        ];

        const borderColor = borderColors[idx % borderColors.length];

        return (
          <div key={monthKey} className="space-y-1">

            {/* ================= ROW MOIS (COLLAPSE HEADER) ================= */}
            <div
              className={`flex items-center px-4 py-2 rounded-lg bg-white/20 cursor-pointer pl-3 mt-2 border-l-4 ${borderColor}`}
              onClick={() => toggleMonth(monthKey)}
            >
              <div className="min-w-[180px] text-white font-semibold">
                {isExpanded ? "➖ " : "➕ "} {monthLabel}
              </div>

              <div className="min-w-[180px]"></div>
              <div className="min-w-[180px]"></div>

              <div className="min-w-[100px] text-center text-white font-bold">
                {totalMonth.hommes}
              </div>

              <div className="min-w-[100px] text-center text-white font-bold">
                {totalMonth.femmes}
              </div>

              <div className="min-w-[100px] text-center text-orange-400 font-semibold">
                {totalMonth.hommes + totalMonth.femmes}
              </div>

              <div className="min-w-[140px]"></div>
            </div>

            {/* ================= DETAILS ================= */}
            {isExpanded &&
              monthRapports.map((r) => {
                const total = Number(r.hommes) + Number(r.femmes);

                return (
                  <div
                    key={r.id}
                    className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 ml-4 transition border-l-4 ${borderColor}`}
                  >
                    <div className="min-w-[180px] text-white">
                      {formatDateFR(r.date_debut)}
                    </div>

                    <div className="min-w-[180px] text-white">
                      {formatDateFR(r.date_fin)}
                    </div>

                    <div className="min-w-[180px] text-center text-white">
                      {r.nom_formation}
                    </div>

                    <div className="min-w-[100px] text-center text-white">
                      {r.hommes}
                    </div>

                    <div className="min-w-[100px] text-center text-white">
                      {r.femmes}
                    </div>

                    <div className="min-w-[100px] text-center text-white font-bold">
                      {total}
                    </div>

                    <div className="min-w-[140px] text-center">
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

      {/* ================= TOTAL GLOBAL ================= */}
      <div className="flex items-center px-4 py-3 mt-2 border-t border-white/50 bg-white/10 rounded-b-xl">
        <div className="min-w-[180px] text-white font-bold">TOTAL</div>
        <div className="min-w-[180px]"></div>
        <div className="min-w-[180px]"></div>

        <div className="min-w-[100px] text-center text-orange-400 font-semibold">
          {totalGlobal.hommes}
        </div>

        <div className="min-w-[100px] text-center text-orange-400 font-semibold">
          {totalGlobal.femmes}
        </div>

        <div className="min-w-[100px] text-center text-orange-400 font-semibold">
          {totalGlobal.hommes + totalGlobal.femmes}
        </div>

        <div className="min-w-[140px]"></div>
      </div>

    </div>
  </div>
)}

  {/* ================= MOBILE================= */}
            {showTable && (
  <div className="md:hidden w-full mt-4 space-y-4">

    {groupedReports.map(([monthKey, monthRapports], idx) => {
      const [year, monthIndex] = monthKey.split("-").map(Number);
      const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;

      const isExpanded = expandedMonths[monthKey];

      return (
        <div key={monthKey} className="bg-red/50 rounded-xl p-3 text-white">         

          {/* TOTAL MOIS */}
           <div
      onClick={() => toggleMonth(monthKey)}
    className="flex items-center justify-between w-full mt-1 px-3 py-2 rounded-lg bg-white/10 border-l-4">
  
    {/* LEFT */}
  <div className="font-semibold">
    {isExpanded ? "➖" : "➕"} {monthLabel}
  </div>

  {/* RIGHT (ALL STATS INLINE) */}
  <div className="flex gap-3 text-sm text-orange-400 font-medium">
    <span>
      H: {monthRapports.reduce((a,r)=>a+Number(r.hommes||0),0)}
    </span>

    <span>
      F: {monthRapports.reduce((a,r)=>a+Number(r.femmes||0),0)}
    </span>

    <span className="text-orange-400 font-semibold">
      Total: {monthRapports.reduce((a,r)=>a+Number(r.hommes||0)+Number(r.femmes||0),0)}
    </span>
  </div>
</div>

          {/* LISTE RAPPORTS */}
          {isExpanded &&
  monthRapports.map((r) => {
    const total = Number(r.hommes) + Number(r.femmes);

    return (
      <div
        key={r.id}
        className="mt-1 p-4 bg-white/5 rounded-lg border border-white/10"
      >

        {/* ================= DATE (RIGHT) ================= */}
        <div className="text-right text-amber-300 text-sm font-medium">
          📅 {formatDateFR(r.date_debut)} → {formatDateFR(r.date_fin)}
        </div>

        {/* ================= FORMATION ================= */}
        <div className="mt-2 text-white font-semibold">
          Formation :{" "}
          <span className="font-semibold">
            {r.nom_formation}
          </span>
        </div>

        {/* ================= STATS ================= */}
        <div className="mt-3 flex gap-4">
          <span>
            Hommes : <span className="text-white">{r.hommes}</span>
          </span>
          <span>
            Femmes : <span className="text-white">{r.femmes}</span>
          </span>
        </div>

        {/* ================= TOTAL ================= */}
        <div className="mt-2 text-orange-400 font-semibold">
          Total : {total}
        </div>

        {/* ================= ACTION ================= */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => handleEdit(r)}
            className="text-amber-300 underline hover:text-amber-300 text-sm"
          >
            ✏️
          </button>
        </div>

      </div>
    );
  })}
        </div>
      );
    })}
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
