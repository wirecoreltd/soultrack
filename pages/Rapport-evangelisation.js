"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

// 🔹 Popup pour modifier un rapport
function EditRapportPopup({ isOpen, onClose, rapport, onSave }) {
  const [formData, setFormData] = useState(rapport);

  useEffect(() => {
    setFormData(rapport);
  }, [rapport]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Modifier le rapport</h2>

        <input
          type="date"
          className="input mb-2"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
        <input
          type="number"
          className="input mb-2"
          value={formData.hommes || 0}
          onChange={e => setFormData({ ...formData, hommes: parseInt(e.target.value) || 0 })}
          placeholder="Hommes"
        />
        <input
          type="number"
          className="input mb-2"
          value={formData.femmes || 0}
          onChange={e => setFormData({ ...formData, femmes: parseInt(e.target.value) || 0 })}
          placeholder="Femmes"
        />
        <input
          type="number"
          className="input mb-2"
          value={formData.priere || 0}
          onChange={e => setFormData({ ...formData, priere: parseInt(e.target.value) || 0 })}
          placeholder="Prière du salut"
        />
        <input
          type="number"
          className="input mb-2"
          value={formData.nouveau_converti || 0}
          onChange={e => setFormData({ ...formData, nouveau_converti: parseInt(e.target.value) || 0 })}
          placeholder="Nouveau converti"
        />
        <input
          type="number"
          className="input mb-2"
          value={formData.reconciliation || 0}
          onChange={e => setFormData({ ...formData, reconciliation: parseInt(e.target.value) || 0 })}
          placeholder="Réconciliation"
        />
        <input
          type="text"
          className="input mb-2"
          value={formData.moissonneurs || ""}
          onChange={e => setFormData({ ...formData, moissonneurs: e.target.value })}
          placeholder="Moissonneurs"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

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
    else setRapports(data);
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100">
      {/* 🔹 Logo + Titre */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Rapport Évangélisation</h1>
        <p className="text-gray-600 italic mt-1">Résumé des évangélisations par date</p>
      </div>

      {/* 🔹 Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow-lg">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Hommes</th>
              <th className="py-2 px-3">Femmes</th>
              <th className="py-2 px-3">Prière du salut</th>
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
                    onClick={() => { setSelectedRapport(r); setEditOpen(true); }}
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

      {/* 🔹 Popup */}
      {selectedRapport && (
        <EditRapportPopup
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          rapport={selectedRapport}
          onSave={handleSaveRapport}
        />
      )}
    </div>
  );
}
