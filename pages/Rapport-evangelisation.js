"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import EditEvanRapportLine from "../components/EditEvanRapportLine";

export default function RapportEvangelisation() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);

  // 🔹 Récupérer les rapports
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

  // 🔹 Sauvegarder les modifications
  const handleSaveRapport = async (updated) => {
    const { data, error } = await supabase
      .from("rapport_evangelisation")
      .upsert(updated, { onConflict: ["date"] }); // Mise à jour si date existante

    if (error) console.error("Erreur mise à jour rapport :", error);
    else fetchRapports();
  };

  useEffect(() => {
    fetchRapports();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement des rapports...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100">
      {/* Logo + Titre */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Rapport Évangélisation</h1>
        <p className="text-gray-600 italic mt-1">Résumé des évangélisations par date</p>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow-lg">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Hommes</th>
              <th className="py-2 px-3">Femmes</th>
              <th className="py-2 px-3">Prière</th>
              <th className="py-2 px-3">Nouveau converti</th>
              <th className="py-2 px-3">Réconciliation</th>
              <th className="py-2 px-3">Moissonneurs</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rapports.map(r => (
              <tr key={r.date} className="text-center border-b">
                <td className="py-2 px-3">{r.date}</td>
                <td className="py-2 px-3">{r.hommes}</td>
                <td className="py-2 px-3">{r.femmes}</td>
                <td className="py-2 px-3">{r.priere}</td>
                <td className="py-2 px-3">{r.nouveau_converti}</td>
                <td className="py-2 px-3">{r.reconciliation}</td>
                <td className="py-2 px-3">{r.moissonneurs}</td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => {
                      setSelectedRapport(r);
                      setEditOpen(true);
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup pour modifier une ligne */}
      {selectedRapport && (
        <EditEvanRapportLine
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          rapport={selectedRapport}
          onSave={handleSaveRapport}
        />
      )}
    </div>
  );
}
