"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/router";
import EditEvanRapportLine from "../components/EditEvanRapportLine";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

// Wrapper sécurisé
export default function RapportEvangelisationPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <RapportEvangelisation />
    </ProtectedRoute>
  );
}

// Composant enfant avec la logique complète
function RapportEvangelisation() {
  const router = useRouter();
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);

  const fetchRapports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rapport_evangelisation")
      .select("*")
      .order("date", { ascending: true });
    if (error) console.error(error);
    else setRapports(data || []);
    setLoading(false);
  };

  const handleSaveRapport = async (updated) => {
    const { data, error } = await supabase
      .from("rapport_evangelisation")
      .upsert(updated, { onConflict: ["date"] });
    if (error) console.error("Erreur mise à jour rapport :", error);
    else fetchRapports();
  };

  useEffect(() => {
    fetchRapports();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement des rapports...</p>;

  return (
   <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">

    <HeaderPages />

    <h1 className="text-3xl font-bold text-gray-800 mt-2">Rapport Évangélisation</h1>
    <p className="text-gray-600 italic mt-1">Résumé des évangélisations par date</p>

    {/* Tableau moderne */}
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border-separate border-spacing-0 shadow-lg rounded-2xl overflow-hidden">
        <thead className="bg-orange-500 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4">Hommes</th>
            <th className="py-3 px-4">Femmes</th>
            <th className="py-3 px-4">Prière</th>
            <th className="py-3 px-4">Nouveau converti</th>
            <th className="py-3 px-4">Réconciliation</th>
            <th className="py-3 px-4">Moissonneurs</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rapports.map((r, index) => (
            <tr key={r.date} className={`text-center ${index % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}>
              <td className="py-2 px-4 text-left font-medium">{new Date(r.date).toLocaleDateString()}</td>
              <td className="py-2 px-4">{r.hommes}</td>
              <td className="py-2 px-4">{r.femmes}</td>
              <td className="py-2 px-4">{r.priere}</td>
              <td className="py-2 px-4">{r.nouveau_converti}</td>
              <td className="py-2 px-4">{r.reconciliation}</td>
              <td className="py-2 px-4">{r.moissonneurs || "-"}</td>
              <td className="py-2 px-4">
                <button onClick={() => { setSelectedRapport(r); setEditOpen(true); }} className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all">Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Popup pour modification */}
    {selectedRapport && (
      <EditEvanRapportLine
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        rapport={selectedRapport}
        onSave={handleSaveRapport}
      />
    )}
          <Footer />
  </div>
);
    }
