"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function EtatCellulePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule"]}>
      <EtatCellule />
    </ProtectedRoute>
  );
}

function EtatCellule() {
  const [reports, setReports] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // ================= FETCH DATA =================
  const fetchReports = async (currentUserId, currentUserRole) => {
    try {
      setShowTable(false);

      // Récupérer toutes les cellules avec leur responsable
      const { data: cellules } = await supabase
        .from("cellules")
        .select("id,responsable_id");

      // Récupérer etat_cellule
      const { data: dataCellule, error: errorCellule } = await supabase
        .from("etat_cellule")
        .select("*")
        .order("date_evangelise", { ascending: false });

      if (errorCellule) throw errorCellule;

      // Récupérer membres_venus_par_eglise
      const { data: dataEglise, error: errorEglise } = await supabase
        .from("membres_venus_par_eglise")
        .select("*")
        .order("date_evangelise", { ascending: false });

      if (errorEglise) throw errorEglise;

      // Ajouter responsable_cellule à chaque entrée
      const addResponsable = (arr) =>
        (arr || []).map((r) => {
          const cellule = cellules.find((c) => c.id === r.cellule_id);
          return { ...r, responsable_cellule: cellule?.responsable_id || null };
        });

      let normalizedCellule = addResponsable(dataCellule).map((r) => ({
        id: r.id,
        nom: r.nom,
        prenom: r.prenom,
        nom_complet: `${r.prenom} ${r.nom}`,
        type_evangelisation: r.type_evangelisation || "Evangélisation",
        status_suivis_evangelises: r.status_suivis_evangelises,
        date_evangelise: r.date_evangelise,
        date_suivi: r.date_suivi,
        date_integration: r.date_integration,
        date_baptise: r.date_baptise,
        ministere_date: r.ministere_date,
        cellule_full: r.cellule_full,
      }));

      let normalizedEglise = addResponsable(dataEglise).map((r) => ({
        id: r.id,
        nom: r.nom || "",
        prenom: r.prenom || "",
        nom_complet: r.nom_complet || `${r.prenom} ${r.nom}`,
        type_evangelisation: r.type_integration || "Integration",
        status_suivis_evangelises: r.statut || "Inconnu",
        date_evangelise: r.date_evangelise,
        date_suivi: r.envoyer_au_suivi_le,
        date_integration: r.date_integration,
        date_baptise: r.bapteme_date,
        ministere_date: r.debut_ministere,
        cellule_full: r.cellule_full,
      }));

      // Combiner datasets
      let combined = [...normalizedCellule, ...normalizedEglise];

      // Supprimer les doublons par id
      combined = combined.filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );

      // Filtrer contacts sans cellule
      combined = combined.filter((r) => r.cellule_full);

      // Filtrer selon le rôle
      if (currentUserRole !== "Administrateur") {
        combined = combined.filter((r) => r.responsable_cellule === currentUserId);
      }

      // Filtrer par date si besoin
      if (filterDebut) {
        combined = combined.filter(
          (r) => new Date(r.date_evangelise) >= new Date(filterDebut)
        );
      }
      if (filterFin) {
        combined = combined.filter(
          (r) => new Date(r.date_evangelise) <= new Date(filterFin)
        );
      }

      setReports(combined);
      setShowTable(true);
    } catch (error) {
      console.error("Erreur fetch :", error);
      setReports([]);
      setShowTable(false);
    }
  };

  // ================= INIT USER =================
  useEffect(() => {
    const init = async () => {
      try {
        // Récupérer utilisateur connecté
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Utilisateur non connecté");

        // Récupérer son profil pour avoir le rôle
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        setUserId(user.id);
        setUserRole(profile?.role);

        // Puis fetch les rapports
        fetchReports(user.id, profile?.role);
      } catch (err) {
        console.error("Erreur init :", err);
      }
    };

    init();
  }, []);

  // ================= UTIL =================
  const getStatusStyles = (status) => {
    if (!status) return { border: "border-gray-400", text: "text-gray-300" };
    const s = status.toLowerCase();
    if (s.includes("intégr") || s.includes("integre"))
      return { border: "border-green-500", text: "text-green-400" };
    if (s.includes("refus")) return { border: "border-red-500", text: "text-red-400" };
    if (s.includes("cours") || s.includes("suivi"))
      return { border: "border-orange-500", text: "text-orange-400" };
    return { border: "border-blue-500", text: "text-blue-400" };
  };

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

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach((r) => {
      const d = new Date(r.date_evangelise);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  const groupedReports = Object.entries(groupByMonth(reports))
    .sort((a, b) => {
      const [yearA, monthA] = a[0].split("-").map(Number);
      const [yearB, monthB] = b[0].split("-").map(Number);
      return new Date(yearB, monthB) - new Date(yearA, monthA);
    });

  // ================= RENDER =================
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        État de <span className="text-amber-300">Cellule</span>
      </h1>

      {/* FILTRES */}
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
          onClick={() => fetchReports(userId, userRole)}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* TABLEAU */}
      {showTable && (
        <div className="w-full flex justify-center mt-6 mb-6">
          <div className="w-full max-w-7xl">
            {/* Desktop */}
            <div className="hidden md:block w-full overflow-x-auto">
              <div className="w-max mx-auto space-y-2 bg-white/5 p-2 rounded-xl">
                <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                  <div className="min-w-[150px]">Date Evangelisé</div>
                  <div className="min-w-[200px] text-center">Nom Complet</div>
                  <div className="min-w-[200px] text-center">Type</div>
                  <div className="min-w-[200px] text-center">Statut</div>
                  <div className="min-w-[150px] text-center">Envoyer au Suivi Le</div>
                  <div className="min-w-[150px] text-center">Date Intégration</div>
                  <div className="min-w-[150px] text-center">Date Baptême</div>
                  <div className="min-w-[150px] text-center">Début Ministère</div>
                  <div className="min-w-[220px] text-center">Cellule</div>
                  <div className="min-w-[200px] text-center">Responsable</div>
                </div>

                {groupedReports.map(([monthKey, rows]) => {
                  const [year, monthIndex] = monthKey.split("-").map(Number);
                  const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                  const isExpanded = expandedMonths[monthKey] || false;

                  return (
                    <div key={monthKey} className="space-y-1">
                      <div
                        className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-amber-300 cursor-pointer"
                        onClick={() => toggleMonth(monthKey)}
                      >
                        <div className="min-w-[150px] text-white font-semibold">
                          {isExpanded ? "➖" : "➕"} {monthLabel} ({rows.length})
                        </div>
                      </div>

                      {isExpanded &&
                        rows.map((r, i) => {
                          const statusStyle = getStatusStyles(r.status_suivis_evangelises);
                          return (
                            <div
                              key={i}
                              className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${statusStyle.border}`}
                            >
                              <div className="min-w-[150px] text-white">{formatDateFR(r.date_evangelise)}</div>
                              <div className="min-w-[200px] text-center text-white">{r.nom_complet}</div>
                              <div className="min-w-[200px] text-center text-white">{r.type_evangelisation}</div>
                              <div className={`min-w-[200px] text-center font-semibold ${statusStyle.text}`}>{r.status_suivis_evangelises}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_suivi)}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_integration)}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_baptise)}</div>
                              <div className="min-w-[150px] text-center text-white">{formatDateFR(r.ministere_date)}</div>
                              <div className="min-w-[220px] text-center text-white">{r.cellule_full}</div>
                              <div className="min-w-[200px] text-center text-white">{r.responsable_cellule}</div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-4">
              {groupedReports.map(([monthKey, rows]) => {
                const [year, monthIndex] = monthKey.split("-").map(Number);
                const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                return (
                  <div key={monthKey} className="space-y-2">
                    <h3 className="text-white font-bold">{monthLabel}</h3>
                    {rows.map((r, i) => (
                      <div key={i} className="bg-white/10 rounded-xl p-4 text-white space-y-1">
                        <p><strong>Date:</strong> {formatDateFR(r.date_evangelise)}</p>
                        <p><strong>Nom:</strong> {r.nom_complet}</p>
                        <p><strong>Type:</strong> {r.type_evangelisation}</p>
                        <p><strong>Statut:</strong> {r.status_suivis_evangelises}</p>
                        <p><strong>Envoyé au suivi:</strong> {formatDateFR(r.date_suivi)}</p>
                        <p><strong>Date Intégration:</strong> {formatDateFR(r.date_integration)}</p>
                        <p><strong>Baptême:</strong> {formatDateFR(r.date_baptise)}</p>
                        <p><strong>Début Ministère:</strong> {formatDateFR(r.ministere_date)}</p>
                        <p><strong>Cellule:</strong> {r.cellule_full}</p>
                        <p><strong>Responsable:</strong> {r.responsable_cellule}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
