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
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* 🔹 Logo + Titre */}
      <div className="flex flex-col items-center mb-8">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Rapport Évangélisation</h1>
        <p className="text-gray-600 italic mt-1">Résumé des évangélisations par date</p>
      </div>

      {/* 🔹 Liste des rapports sous forme de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rapports.map((r) => (
          <div key={r.date} className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-indigo-500">
            <h2 className="font-semibold text-lg mb-2">{new Date(r.date).toLocaleDateString()}</h2>
            <div className="space-y-1 text-gray-700">
              <p>👨 Hommes : {r.hommes}</p>
              <p>👩 Femmes : {r.femmes}</p>
              <p>🙏 Prière : {r.priere}</p>
              <p>✝️ Nouveau converti : {r.nouveau_converti}</p>
              <p>🔄 Réconciliation : {r.reconciliation}</p>
              <p>🌾 Moissonneurs : {r.moissonneurs || "-"}</p>
            </div>
            <button
              onClick={() => { setSelectedRapport(r); setEditOpen(true); }}
              className="mt-3 w-full py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
            >
              Modifier
            </button>
          </div>
        ))}
      </div>

      {/* 🔹 Popup pour modification */}
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
