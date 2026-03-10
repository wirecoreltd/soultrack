"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RapportEtatTroupeauPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableFormation"]}>
      <RapportNouveauVenu />
    </ProtectedRoute>
  );
}

function RapportNouveauVenu() {
  const [rapports, setRapports] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const formRef = useRef(null);

  // fetch les données depuis Supabase
  useEffect(() => {
    const fetchRapports = async () => {
      const { data } = await supabase
        .from("membres_complets")
        .select(`
          id, nom, prenom, created_at, etat_contact, date_premiere_visite,
          venu, conseiller_id, cellule_id, statut_suivis, suivi_commentaire_suivis
        `)
        .order("created_at", { ascending: false });

      // fetch infos conseillers et cellules
      const rapportsWithResponsable = await Promise.all(
        (data || []).map(async (r) => {
          let responsable = "-";
          if (r.conseiller_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("prenom, nom")
              .eq("id", r.conseiller_id)
              .single();
            if (profile) responsable = `${profile.prenom} ${profile.nom}`;
          }
          if (r.cellule_id) {
            const { data: cellule } = await supabase
              .from("cellules")
              .select("cellule, ville")
              .eq("id", r.cellule_id)
              .single();
            if (cellule) responsable += ` - ${cellule.cellule}`;
          }
          return { ...r, responsable_suivi: responsable };
        })
      );

      setRapports(rapportsWithResponsable);
      setShowTable(true);
    };

    fetchRapports();
  }, []);

  const formatDateFR = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const statutMapping = {
    1: "en attente",
    2: "refus",
    3: "intégré"
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Rapport Nouveau-Venu
      </h1>

      {showTable && (
        <div className="w-full max-w-full overflow-x-auto mt-6 flex justify-center">
          <table className="min-w-max text-white border border-white/20">
            <thead>
              <tr className="bg-white/10 text-left">
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Prénom</th>
                <th className="px-4 py-2 border">Date d’arrivée</th>
                <th className="px-4 py-2 border">État contact</th>
                <th className="px-4 py-2 border">Envoyé vers suivi</th>
                <th className="px-4 py-2 border">Venu par</th>
                <th className="px-4 py-2 border">Responsable suivi</th>
                <th className="px-4 py-2 border">Statut suivi</th>
                <th className="px-4 py-2 border">Commentaire suivi</th>
              </tr>
            </thead>
            <tbody>
              {rapports.map((r) => (
                <tr key={r.id} className="hover:bg-white/20 transition">
                  <td className="px-4 py-2 border">{r.nom}</td>
                  <td className="px-4 py-2 border">{r.prenom}</td>
                  <td className="px-4 py-2 border">{formatDateFR(r.created_at)}</td>
                  <td className="px-4 py-2 border">{r.etat_contact}</td>
                  <td className="px-4 py-2 border">{formatDateFR(r.date_premiere_visite)}</td>
                  <td className="px-4 py-2 border">{r.venu}</td>
                  <td className="px-4 py-2 border">{r.responsable_suivi}</td>
                  <td className="px-4 py-2 border">{statutMapping[r.statut_suivis]}</td>
                  <td className="px-4 py-2 border">{r.suivi_commentaire_suivis || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Footer />
    </div>
  );
}
