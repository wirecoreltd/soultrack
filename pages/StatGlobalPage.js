"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function StatGlobalPage() {
  const [rapportType, setRapportType] = useState("Tous");
  const [rapportsCulte, setRapportsCulte] = useState([]);
  const [rapportsEvang, setRapportsEvang] = useState([]);
  const [rapportsBapteme, setRapportsBapteme] = useState([]);
  const [rapportsFormation, setRapportsFormation] = useState([]);
  const [nbCellules, setNbCellules] = useState(0);
  const [loading, setLoading] = useState(true);

  const [egliseId, setEgliseId] = useState(null);
  const [brancheId, setBrancheId] = useState(null);

  // Dates de filtre
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", session.session.user.id)
        .single();

      if (!error && profile) {
        setEgliseId(profile.eglise_id);
        setBrancheId(profile.branche_id);
      } else console.error(error);
    };
    fetchProfile();
  }, []);

  const fetchRapports = async () => {
    if (!egliseId || !brancheId) return;
    setLoading(true);

    const dateFilter = (col) => {
      const filters = {};
      if (dateDebut) filters[`${col}`] = { gte: dateDebut };
      if (dateFin) filters[`${col}`] = { lte: dateFin };
      return filters;
    };

    try {
      // Culte
      const { data: culte } = await supabase
        .from("rapport_culte")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .gte("date", dateDebut || "1900-01-01")
        .lte("date", dateFin || "3000-01-01")
        .order("date", { ascending: true });
      setRapportsCulte(culte || []);

      // Évangélisation
      const { data: evang } = await supabase
        .from("rapport_evangelisation")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .gte("date", dateDebut || "1900-01-01")
        .lte("date", dateFin || "3000-01-01")
        .order("date", { ascending: true });
      setRapportsEvang(evang || []);

      // Baptême
      const { data: bapteme } = await supabase
        .from("rapport_bapteme")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .gte("date", dateDebut || "1900-01-01")
        .lte("date", dateFin || "3000-01-01")
        .order("date", { ascending: true });
      setRapportsBapteme(bapteme || []);

      // Formation
      const { data: formation } = await supabase
        .from("rapport_formation")
        .select("*")
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId)
        .gte("date", dateDebut || "1900-01-01")
        .lte("date", dateFin || "3000-01-01")
        .order("date", { ascending: true });
      setRapportsFormation(formation || []);

      // Nombre de cellules
      const { count: cellulesCount } = await supabase
        .from("cellules")
        .select("*", { count: "exact", head: true })
        .eq("eglise_id", egliseId)
        .eq("branche_id", brancheId);
      setNbCellules(cellulesCount || 0);
    } catch (err) {
      console.error("Erreur fetch stats globales :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapports();
  }, [egliseId, brancheId, dateDebut, dateFin]);

  if (loading) return <p className="text-center mt-10">Chargement des statistiques...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-3xl font-bold text-gray-800 mt-2">Statistiques Globales</h1>
      <p className="text-gray-600 italic mt-1 mb-4">
        Données combinées par église et branche
      </p>

      {/* Filtres */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          className="input"
          value={rapportType}
          onChange={(e) => setRapportType(e.target.value)}
        >
          <option value="Tous">Tous les rapports</option>
          <option value="Culte">Rapport Culte</option>
          <option value="Evangelisation">Rapport Évangélisation</option>
          <option value="Bapteme">Rapport Baptême</option>
          <option value="Formation">Rapport Formation</option>
        </select>

        <input
          type="date"
          className="input"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />
        <input
          type="date"
          className="input"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
        />
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4">Hommes</th>
              <th className="py-3 px-4">Femmes</th>
              <th className="py-3 px-4">Jeunes</th>
              <th className="py-3 px-4">Enfants</th>
              <th className="py-3 px-4">Connectés</th>
              <th className="py-3 px-4">Prière du salut</th>
              <th className="py-3 px-4">Nouveaux venus</th>
              <th className="py-3 px-4">Nouveaux convertis</th>
              <th className="py-3 px-4">Réconciliation</th>
              <th className="py-3 px-4">Moissonneurs</th>
            </tr>
          </thead>
          <tbody>
            {/* Culte */}
            {["Tous", "Culte"].includes(rapportType) &&
              rapportsCulte.map((r, idx) => (
                <tr key={`culte-${idx}`} className={`text-center ${idx % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100`}>
                  <td className="py-2 px-4 text-left">Culte</td>
                  <td className="py-2 px-4 text-left">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{r.hommes}</td>
                  <td className="py-2 px-4">{r.femmes}</td>
                  <td className="py-2 px-4">{r.jeunes || "-"}</td>
                  <td className="py-2 px-4">{r.enfants || "-"}</td>
                  <td className="py-2 px-4">{r.connectes || "-"}</td>
                  <td className="py-2 px-4">{r.priere_salut || "-"}</td>
                  <td className="py-2 px-4">{r.nouveauxVenus || "-"}</td>
                  <td className="py-2 px-4">{r.nouveauxConvertis || "-"}</td>
                  <td className="py-2 px-4">{r.reconciliation || "-"}</td>
                  <td className="py-2 px-4">{r.moissonneurs || "-"}</td>
                </tr>
              ))}

            {/* Évangélisation */}
            {["Tous", "Evangelisation"].includes(rapportType) &&
              rapportsEvang.map((r, idx) => (
                <tr key={`evang-${idx}`} className={`text-center ${idx % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100`}>
                  <td className="py-2 px-4 text-left">Évangélisation</td>
                  <td className="py-2 px-4 text-left">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{r.hommes}</td>
                  <td className="py-2 px-4">{r.femmes}</td>
                  <td className="py-2 px-4">{r.jeunes || "-"}</td>
                  <td className="py-2 px-4">{r.enfants || "-"}</td>
                  <td className="py-2 px-4">{r.connectes || "-"}</td>
                  <td className="py-2 px-4">{r.priere || "-"}</td>
                  <td className="py-2 px-4">{r.nouveauxVenus || "-"}</td>
                  <td className="py-2 px-4">{r.nouveau_converti || "-"}</td>
                  <td className="py-2 px-4">{r.reconciliation || "-"}</td>
                  <td className="py-2 px-4">{r.moissonneurs || "-"}</td>
                </tr>
              ))}

            {/* Baptême */}
            {["Tous", "Bapteme"].includes(rapportType) &&
              rapportsBapteme.map((r, idx) => (
                <tr key={`bap-${idx}`} className={`text-center ${idx % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100`}>
                  <td className="py-2 px-4 text-left">Baptême</td>
                  <td className="py-2 px-4 text-left">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{r.hommes}</td>
                  <td className="py-2 px-4">{r.femmes}</td>
                  <td className="py-2 px-4 col-span-6">-</td>
                </tr>
              ))}

            {/* Formation */}
            {["Tous", "Formation"].includes(rapportType) &&
              rapportsFormation.map((r, idx) => (
                <tr key={`form-${idx}`} className={`text-center ${idx % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100`}>
                  <td className="py-2 px-4 text-left">Formation</td>
                  <td className="py-2 px-4 text-left">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{r.hommes}</td>
                  <td className="py-2 px-4">{r.femmes}</td>
                  <td className="py-2 px-4 col-span-6">{r.nom_formation || "-"}</td>
                </tr>
              ))}

            {/* Nombre de cellules */}
            <tr className="bg-gray-300 font-bold text-center">
              <td colSpan={12} className="py-2 px-4">Nombre de cellules : {nbCellules}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          padding: 10px;
          border-radius: 12px;
          border: 1px solid #ccc;
          min-width: 200px;
        }
      `}</style>
    </div>
  );
}
