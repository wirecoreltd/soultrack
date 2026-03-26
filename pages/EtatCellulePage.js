import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useUserProfile } from "../hooks/useUserProfile";

export default function EtatCellulePage() {
  const [reports, setReports] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [kpis, setKpis] = useState({});
  const [filterDebut, setFilterDebut] = useState(null);
  const [filterFin, setFilterFin] = useState(null);

  const { userProfile } = useUserProfile();

  const fetchReports = async () => {
    try {
      setShowTable(false);
      const responsableNom = `${userProfile.prenom} ${userProfile.nom}`;

      // ================= FETCH DATA =================
      const [
        { data: cellules, error: cellulesError },
        { data: profiles, error: profilesError },
        { data: etatCellule, error: etatCelluleError },
        { data: venusEglise, error: venusEgliseError }
      ] = await Promise.all([
        supabase.from("cellules").select("id, cellule_full, responsable_id"),
        supabase.from("profiles").select("id, prenom, nom"),
        supabase.from("etat_cellule").select("*"),
        supabase.from("membres_venus_par_eglise").select("*")
      ]);

      if (cellulesError) throw cellulesError;
      if (profilesError) throw profilesError;
      if (etatCelluleError) throw etatCelluleError;
      if (venusEgliseError) throw venusEgliseError;

      // ================= NORMALIZE =================
      const addResponsableName = (arr) =>
        (arr || []).map((r) => {
          const cellule = cellules.find((c) => c.id === r.cellule_id);
          const responsable = profiles.find((p) => p.id === cellule?.responsable_id);
          return {
            ...r,
            responsable_cellule: responsable
              ? `${responsable.prenom} ${responsable.nom}`
              : "Inconnu",
            cellule_full: cellule?.cellule_full || r.cellule_full,
          };
        });

      const normalizedCellule = addResponsableName(etatCellule).map((r) => ({
        ...r,
        nom_complet: `${r.prenom} ${r.nom}`,
        type_evangelisation: r.type_evangelisation || "Evangélisation",
      }));

      const normalizedEglise = addResponsableName(venusEglise).map((r) => ({
        ...r,
        nom_complet: r.nom_complet || `${r.prenom} ${r.nom}`,
        type_evangelisation: r.type_integration || "Integration",
        status_suivis_evangelises: r.statut || "Inconnu",
      }));

      // ================= COMBINE & FILTER =================
      let combined = [...normalizedCellule, ...normalizedEglise];
      combined = combined.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
      combined = combined.filter((r) => r.cellule_full);

      if (!userProfile.roles?.includes("Administrateur")) {
        combined = combined.filter(
          (r) =>
            cellules.find((c) => c.cellule_full === r.cellule_full)?.responsable_id ===
            userProfile.id
        );
      }

      if (filterDebut)
        combined = combined.filter((r) => new Date(r.date_evangelise) >= new Date(filterDebut));
      if (filterFin)
        combined = combined.filter((r) => new Date(r.date_evangelise) <= new Date(filterFin));

      setReports(combined);

      // ================= KPI =================
      const totalEvangelises = normalizedCellule.filter(r => {
        if (!userProfile.roles?.includes("Administrateur") && r.responsable_cellule !== responsableNom) return false;
        if (filterDebut && new Date(r.date_evangelise) < new Date(filterDebut)) return false;
        if (filterFin && new Date(r.date_evangelise) > new Date(filterFin)) return false;
        return true;
      }).length;

      const totalVenus = normalizedEglise.filter(r => {
        if (!userProfile.roles?.includes("Administrateur") && r.responsable_cellule !== responsableNom) return false;
        if (filterDebut && new Date(r.date_evangelise) < new Date(filterDebut)) return false;
        if (filterFin && new Date(r.date_evangelise) > new Date(filterFin)) return false;
        return true;
      }).length;

      const totalIntegration = normalizedCellule.filter(r => r.date_integration).length;
      const totalBapteme = normalizedCellule.filter(r => r.date_baptise).length;
      const totalMinistere = normalizedCellule.filter(r => r.ministere_date).length;
      const totalRefus = normalizedCellule.filter(r => r.status_suivis_evangelises?.toLowerCase().includes("refus")).length;
      const totalEncours = normalizedCellule.filter(r => r.status_suivis_evangelises?.toLowerCase().includes("cours")).length;
      const totalAttente = normalizedCellule.filter(r => r.status_suivis_evangelises?.toLowerCase().includes("attente")).length;

      setKpis({
        totalEvangelises,
        totalVenus,
        totalIntegration,
        totalBapteme,
        totalMinistere,
        totalRefus,
        totalEncours,
        totalAttente,
      });

      setShowTable(true);
    } catch (error) {
      console.error("Erreur fetch :", error);
      setReports([]);
      setShowTable(false);
    }
  };

  useEffect(() => {
    if (userProfile) fetchReports();
  }, [userProfile, filterDebut, filterFin]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard des Cellules</h1>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(kpis).map(([key, value]) => (
          <div key={key} className="bg-white shadow rounded p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{value}</div>
            <div className="text-gray-600 mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
          </div>
        ))}
      </div>

      {/* ===== TABLE ===== */}
      {showTable ? (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Nom Complet</th>
                <th className="p-2 border">Prénom</th>
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Cellule</th>
                <th className="p-2 border">Responsable</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Date Evangelisation</th>
                <th className="p-2 border">Date Suivi</th>
                <th className="p-2 border">Date Integration</th>
                <th className="p-2 border">Date Baptême</th>
                <th className="p-2 border">Date Ministère</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{r.nom_complet}</td>
                  <td className="p-2 border">{r.prenom}</td>
                  <td className="p-2 border">{r.nom}</td>
                  <td className="p-2 border">{r.cellule_full}</td>
                  <td className="p-2 border">{r.responsable_cellule}</td>
                  <td className="p-2 border">{r.type_evangelisation}</td>
                  <td className="p-2 border">{r.date_evangelise}</td>
                  <td className="p-2 border">{r.date_suivi}</td>
                  <td className="p-2 border">{r.date_integration}</td>
                  <td className="p-2 border">{r.date_baptise}</td>
                  <td className="p-2 border">{r.ministere_date}</td>
                  <td className="p-2 border">{r.status_suivis_evangelises}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Chargement des données...</p>
      )}
    </div>
  );
}
