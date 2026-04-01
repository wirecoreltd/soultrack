"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import DetailsEtatConsEvangePopup from "../components/DetailsEtatConsEvangePopup";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";
import DetailsEtatConseillerPopup from "../components/DetailsEtatConseillerPopup";

export default function EtatCellulePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "SuperviseurCellule", "ResponsableCellule"]}>
      <EtatCellule />
    </ProtectedRoute>
  );
}

function EtatCellule() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [membres, setMembres] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [selectedEvangelise, setSelectedEvangelise] = useState(null);
  const [selectedEvangeliseId, setSelectedEvangeliseId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [filterDebut, setFilterDebut] = useState("");
  const [filterFin, setFilterFin] = useState("");
  const [filterCellule, setFilterCellule] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [Cellules, setCellules] = useState([]);

  const [kpis, setKpis] = useState({
    totalEvangelises: 0,
    totalVenus: 0,
    totalIntegration: 0,
    totalBapteme: 0,
    totalMinistere: 0,
    totalRefus: 0,
    totalEncours: 0,
    totalAttente: 0,
  });

  // ================= USER PROFILE =================
  useEffect(() => {
    fetchUserProfile();
    fetchCellules();
  }, []);

  const fetchUserProfile = async () => {
    const userRes = await supabase.auth.getUser();
    const user = userRes.data?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) return console.error("Erreur fetch user profile:", error);
    setUserProfile(data);
  };

  // ================= FETCH CelluleS =================
const fetchCellules = async () => {
  try {
    // On veut tous les profils qui ont au moins un rôle "Cellule" ou "ResponsableIntegration"
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or("roles.cs.{Cellule},roles.cs.{ResponsableIntegration}"); 

    if (error) {
      console.error("Erreur fetch Cellules:", error);
      return;
    }

    // Mettre dans le state
    setCellules(data || []);
  } catch (err) {
    console.error("Erreur fetch Cellules:", err);
  }
};

  // ================= FETCH REPORTS =================
  const fetchReports = async () => {
    if (!userProfile) return;
    setShowTable(false);

    try {
      let query = supabase
        .from("vue_flow_personnes")
        .select("*")
        .order("date_depart", { ascending: false });

      if (!userProfile.roles?.includes("Administrateur")) {
        query = query.ilike("responsable", `%${userProfile.prenom}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data;

      if (filterDebut) filtered = filtered.filter(r => new Date(r.date_depart) >= new Date(filterDebut));
      if (filterFin) filtered = filtered.filter(r => new Date(r.date_depart) <= new Date(filterFin));
      if (filterCellule) filtered = filtered.filter(r =>
        r.Cellule_full?.toLowerCase().includes(filterCellule.toLowerCase())
      );

      // ================= KPI =================
      const normalize = (text) => text?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";

      setKpis({
        totalEvangelises: filtered.filter(r =>
          ["individuel","sortie de groupe","campagne d’evangelisation","evangelisation de rue","evangelisation maison","evangelisation stade","evangelisation"]
            .some(t => normalize(r.type_evangelisation).includes(normalize(t)))
        ).length,
        totalVenus: filtered.filter(r => normalize(r.type_evangelisation).includes("integration")).length,
        totalIntegration: filtered.filter(r => {
          const s = normalize(r.statut);
          return s === "integre";
        }).length,
        totalBapteme: filtered.filter(r => r.date_baptise).length,
        totalMinistere: filtered.filter(r => r.debut_ministere).length,
        totalRefus: filtered.filter(r => normalize(r.statut) === "refus").length,
        totalEncours: filtered.filter(r => normalize(r.statut).includes("cours")).length,
        totalAttente: filtered.filter(r => {
          const s = normalize(r.statut);
          return s.includes("attente") || s.includes("envoye");
        }).length,
      });

      setReports(filtered);
      setShowTable(true);
    } catch (err) {
      console.error("Erreur fetch:", err);
      setReports([]);
      setShowTable(false);
    }
  };

  // ================= UTILITIES =================
  const getMonthNameFR = (monthIndex) => [
    "Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"
  ][monthIndex] || "";

  const formatDateFR = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const getStatutNormalise = (statut) => {
    if (!statut) return "";
    const s = statut.toLowerCase();
    if (s.includes("envoy")) return "en attente";
    return s;
  };

  const formatStatut = (statut) => {
    if (!statut) return "—";
    const s = statut.toLowerCase();
    if (s.includes("envoy")) return "En attente";
    return statut;
  };

  const groupByMonth = (reports) => {
    const map = {};
    reports.forEach(r => {
      const d = new Date(r.date_depart);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  };

  const toggleMonth = (monthKey) => setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));

  const handleUpdateMember = (updated) => {
    setMembres(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleDetailsClick = async (row) => {
  try {
    if (!row) return;

    // Protection critique
    if (!row.personne_id) {
      console.warn("personne_id est NULL", row);
      alert("Impossible d'ouvrir : donnée incomplète");
      return;
    }

    let data = null;
    let celluleData = null;

    if (row.type_evangelisation && row.type_evangelisation.toLowerCase() !== "integration") {
      const evangeliseId = row.evangelise_id;
      if (!evangeliseId) {
        console.warn("evangelise_id est undefined pour cette personne", row);
        alert("Aucun suivi disponible pour cette personne.");
        return;
      }

      const { data: suivi, error } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .eq("evangelise_id", evangeliseId)
        .maybeSingle();

      if (error) throw error;
      if (!suivi) {
        alert("Aucun suivi disponible pour cette personne.");
        return;
      }
      data = suivi;

      // Récup cellule + responsable depuis cellules
      if (suivi.cellule_id) {
        const { data: cellule } = await supabase
          .from("cellules")
          .select("cellule_full, responsable")
          .eq("id", suivi.cellule_id)
          .maybeSingle();
        celluleData = cellule;
      }

    } else if (row.type_evangelisation?.toLowerCase() === "integration") {
      const { data: membre } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", row.personne_id)
        .maybeSingle();
      data = membre;

      if (membre?.cellule_id) {
        const { data: cellule } = await supabase
          .from("cellules")
          .select("cellule_full, responsable")
          .eq("id", membre.cellule_id)
          .maybeSingle();
        celluleData = cellule;
      }
    }

    const enriched = {
      ...row,
      ...data,
      Cellule: celluleData?.cellule_full ?? data?.cellule_full ?? "—",
      Responsable: celluleData?.responsable ?? "—",
    };

    setSelectedEvangelise(enriched);

  } catch (err) {
    console.error("Erreur fetch details:", err);
    alert("Une erreur est survenue lors de la récupération des détails");
  }
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
        Suivis de l'évolution <span className="text-amber-300">des Ames</span>
      </h1>

      {/* FILTRES */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-2 flex justify-center gap-4 flex-wrap text-white">
        <input type="date" value={filterDebut} onChange={(e)=>setFilterDebut(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <input type="date" value={filterFin} onChange={(e)=>setFilterFin(e.target.value)} className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"/>
        <button onClick={fetchReports} className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]">Générer</button>
      </div>


      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 w-full max-w-6xl">
        {/* Total évangélisés */}
        <div className="p-4 rounded-2xl bg-blue-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalEvangelises}</div>
          <div className="text-sm">Total Évangélisés</div>
        </div>
        {/* Total venus */}
        <div className="p-4 rounded-2xl bg-purple-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalVenus}</div>
          <div className="text-sm">Total Venus Église</div>
        </div>
        {/* Intégration */}
        <div className="p-4 rounded-2xl bg-green-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalIntegration}</div>
          <div className="text-sm">Intégrés</div>
          <div className="text-sm">
            {kpis.totalEvangelises > 0
              ? Math.round((kpis.totalIntegration / kpis.totalEvangelises) * 100)
              : 0}%
          </div>
        </div>
        {/* Baptême */}
        <div className="p-4 rounded-2xl bg-indigo-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalBapteme}</div>
          <div className="text-sm">Baptêmes</div>
          <div className="text-sm">
            {kpis.totalEvangelises + kpis.totalVenus > 0
              ? Math.round((kpis.totalBapteme / (kpis.totalEvangelises + kpis.totalVenus)) * 100)
              : 0}%
          </div>
        </div>
        {/* Ministère */}
        <div className="p-4 rounded-2xl bg-pink-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalMinistere}</div>
          <div className="text-sm">Ministère</div>
        </div>
        {/* Refus */}
        <div className="p-4 rounded-2xl bg-red-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalRefus}</div>
          <div className="text-sm">Refus</div>
        </div>
        {/* En cours */}
        <div className="p-4 rounded-2xl bg-yellow-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalEncours}</div>
          <div className="text-sm">En cours</div>
        </div>
        {/* En attente */}
        <div className="p-4 rounded-2xl bg-gray-500 text-white text-center">
          <div className="text-2xl font-bold">{kpis.totalAttente}</div>
          <div className="text-sm">En attente</div>
        </div>
      </div>

      {/* TABLEAU */}
        {showTable && (
          <div className="w-full flex justify-center mt-6 mb-6">
            <div className="w-full max-w-7xl">
        
              {/* DESKTOP */}
              <div className="hidden md:block w-full overflow-x-auto">
                <div className="w-max mx-auto space-y-2 bg-white/5 p-2 rounded-xl">
        
                  {/* HEADER */}
                  <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
                    <div className="min-w-[150px] ml-6">Date Depart</div>
                    <div className="min-w-[200px] text-center ml-2">Nom Complet</div>
                    <div className="min-w-[200px] text-center">Type</div>
                    <div className="min-w-[200px] text-center">Statut</div>
                    <div className="min-w-[150px] text-center">Assigné le</div>
                    <div className="min-w-[150px] text-center">Date évolution</div>
                    <div className="min-w-[150px] text-center">Date Baptême</div>
                    <div className="min-w-[150px] text-center">Début Ministère</div>
                    <div className="min-w-[220px] text-center">Cellule</div>
                    <div className="min-w-[220px] text-center">Responsable</div>  
                    <div className="min-w-[200px] text-center">Action</div>
                  </div>
        
                  {/* MONTHS */}
                  {groupedReports.map(([monthKey, rows]) => {
                    const [year, monthIndex] = monthKey.split("-").map(Number);
                    const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
                    const isExpanded = expandedMonths[monthKey] || false;
        
                    return (
                      <div key={monthKey} className="w-full">
        
                        {/* LIGNE MOIS */}
                        <div
                          className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-amber-300 cursor-pointer"
                          onClick={() => toggleMonth(monthKey)}
                        >
                          <div className="text-white font-semibold">
                            {isExpanded ? "➖" : "➕"} {monthLabel} ({rows.length})
                          </div>
                        </div>
        
                        {/* CONTENU */}
                        {isExpanded && (
                          <div className="ml-6 mt-2 space-y-2">
                            {rows.map((r, i) => {
        
                              const statutNormalise = getStatutNormalise(r.statut);
        
                              let borderColor = "";
                              let textColor = "";
        
                              switch (statutNormalise) {
                                case "intégré":
                                case "integre":
                                  borderColor = "border-green-500";
                                  textColor = "text-green-400";
                                  break;
                                case "en attente":
                                  borderColor = "border-gray-500";
                                  textColor = "text-gray-400";
                                  break;
                                case "refus":
                                  borderColor = "border-red-500";
                                  textColor = "text-red-400";
                                  break;
                                case "en cours":
                                case "en suivis":
                                  borderColor = "border-orange-500";
                                  textColor = "text-orange-400";
                                  break;
                                default:
                                  borderColor = "border-white/30";
                                  textColor = "text-white";
                              }
        
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${borderColor}`}
                                >
                                  <div className="min-w-[150px] text-white">{formatDateFR(r.date_depart)}</div>
                                  <div className="min-w-[200px] text-center text-white">{r.nom_complet}</div>
                                  <div className="min-w-[200px] text-center text-white">{r.type_evangelisation}</div>
                                  <div className={`min-w-[200px] text-center font-semibold ${textColor}`}>
                                    {formatStatut(r.statut)}
                                  </div>
                                  <div className="min-w-[150px] text-center text-white">{formatDateFR(r.envoyer_au_suivi_le)}</div>
                                  <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_integration)}</div>
                                  <div className="min-w-[150px] text-center text-white">{formatDateFR(r.date_baptise)}</div>
                                  <div className="min-w-[150px] text-center text-white">{formatDateFR(r.debut_ministere)}</div>                          
                                  <div className="min-w-[200px] text-center text-white">{r.cellule_full}</div>
                                  <div className="min-w-[200px] text-center text-white">{r.reponsable}</div>  
                                  <div className="min-w-[100px] text-center">
                                    <button className="text-orange-500 underline text-sm" onClick={() => handleDetailsClick(r)}>Détails</button>
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
        
            </div>
          </div>
        )}
        
        {/* MOBILE */}
        <div className="md:hidden space-y-4">
          {groupedReports.map(([monthKey, rows]) => {
            const [year, monthIndex] = monthKey.split("-").map(Number);
            const monthLabel = `${getMonthNameFR(monthIndex)} ${year}`;
        
            return (
              <div key={monthKey} className="space-y-2">
                <h3 className="text-white font-bold">{monthLabel}</h3>
        
                {rows.map((r, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 text-white space-y-1">
                    <p><strong>Date:</strong> {formatDateFR(r.date_depart)}</p>
                    <p><strong>Nom:</strong> {r.nom_complet}</p>
                    <p><strong>Type:</strong> {r.type_evangelisation}</p>
                    <p><strong>Statut:</strong> {formatStatut(r.statut)}</p>
                    <p><strong>Envoyé au suivi:</strong> {formatDateFR(r.envoyer_au_suivi_le)}</p>
                    <p><strong>Date Intégration:</strong> {formatDateFR(r.date_integration)}</p>
                    <p><strong>Baptême:</strong> {formatDateFR(r.date_baptise)}</p>
                    <p><strong>Début Ministère:</strong> {formatDateFR(r.debut_ministere)}</p>            
                    <p><strong>Cellule:</strong> {r.cellule_full}</p>
                    <p><strong>Responsable:</strong> {r.responsable}</p>         
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
          {/* POPUPS */}
      {selectedEvangelise && (
        <DetailsEtatConseillerPopup
          member={selectedEvangelise}
          onClose={() => setSelectedEvangelise(null)}
          onUpdate={(id, updates) => {
            setReports((prev) =>
              prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
            );
          }}
        />
      )}

       {/* INTEGRATION */}
      {selectedMember && (
        <DetailsEtatConsEvangePopup
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(member) => setEditMember(member)} // ouvre popup édition
        />
      )}           

      <Footer />
    </div>
  );
}
