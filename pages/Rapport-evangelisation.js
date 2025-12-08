"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function RapportEvangelisation() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    hommes: 0,
    femmes: 0,
    villes: {},
  });

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#AA00FF", "#FF00AA"];

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    
    setContacts(data || []);
    computeStats(data || []);
  };

  const computeStats = (data) => {
    const hommes = data.filter(c => c.sexe === "Homme").length;
    const femmes = data.filter(c => c.sexe === "Femme").length;

    const villes = {};
    data.forEach(c => {
      const ville = c.ville || "Inconnu";
      villes[ville] = (villes[ville] || 0) + 1;
    });

    setStats({ hommes, femmes, villes });
  };

  useEffect(() => {
    fetchContacts();

    // Mise à jour automatique toutes les 5 secondes
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  const sexeData = [
    { name: "Hommes", value: stats.hommes },
    { name: "Femmes", value: stats.femmes },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100">
      <h1 className="text-4xl font-bold text-center mb-6">📊 Rapport Évangélisation</h1>

      {/* Statistiques Sexe */}
      <div className="w-full max-w-3xl mb-10 bg-white p-6 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Répartition Hommes / Femmes</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={sexeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {sexeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <p className="mt-4 text-center">Hommes: {stats.hommes} | Femmes: {stats.femmes}</p>
      </div>

      {/* Statistiques Ville */}
      <div className="w-full max-w-3xl mb-10 bg-white p-6 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Contacts par Ville</h2>
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(stats.villes).map(([ville, count]) => (
            <li key={ville}><span className="font-semibold">{ville}</span>: {count}</li>
          ))}
        </ul>
      </div>

      {/* Liste complète */}
      <div className="w-full max-w-5xl bg-white p-6 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Liste des contacts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {contacts.map(c => (
            <div key={c.id} className="bg-gray-50 p-4 rounded-2xl shadow-md border-l-4 border-blue-400">
              <p className="font-bold">{c.prenom} {c.nom}</p>
              <p>Sexe: {c.sexe || "—"}</p>
              <p>Ville: {c.ville || "—"}</p>
              <p>Téléphone: {c.telephone || "—"}</p>
              <p>Besoins: {c.besoin ? c.besoin.join(", ") : "—"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
