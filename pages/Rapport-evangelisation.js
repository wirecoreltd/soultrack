"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function RapportEvangelisation() {
  const [contacts, setContacts] = useState([]);

  // 🔹 Fetch des contacts depuis Supabase
  const fetchContacts = async () => {
    const { data } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data || []);
  };

  useEffect(() => {
    fetchContacts();

    // 🔹 Écoute en temps réel pour mise à jour automatique
    const subscription = supabase
      .channel('realtime-evangelises')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'evangelises' },
        (payload) => {
          console.log('Changement détecté :', payload);
          fetchContacts(); // reload dès qu'il y a une insertion/suppression
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // 🔹 Statistiques
  const total = contacts.length;
  const hommes = contacts.filter(c => c.sexe === "Homme").length;
  const femmes = contacts.filter(c => c.sexe === "Femme").length;
  const jeunes = contacts.filter(c => c.ageGroup === "Jeune").length;

  const villes = [...new Set(contacts.map(c => c.ville))];

  // 🔹 Graphique Sexe
  const sexeData = [
    { name: "Hommes", value: hommes },
    { name: "Femmes", value: femmes }
  ];

  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Rapport d'Évangélisation</h1>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="font-semibold">Total</h2>
          <p>{total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="font-semibold">Hommes</h2>
          <p>{hommes}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="font-semibold">Femmes</h2>
          <p>{femmes}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="font-semibold">Jeunes</h2>
          <p>{jeunes}</p>
        </div>
      </div>

      {/* Graphique Sexe */}
      <div className="flex justify-center mb-6">
        <PieChart width={200} height={200}>
          <Pie data={sexeData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
            {sexeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Répartition par ville */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Répartition par ville</h2>
        <ul className="bg-white rounded shadow p-4 space-y-1">
          {villes.map(v => {
            const count = contacts.filter(c => c.ville === v).length;
            return <li key={v}>{v} : {count}</li>;
          })}
        </ul>
      </div>

      {/* Liste détaillée */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Contacts récents</h2>
        <ul className="bg-white rounded shadow p-4 space-y-1">
          {contacts.map(c => (
            <li key={c.id}>
              {c.prenom} {c.nom} - {c.sexe} - {c.ageGroup} - {c.ville} - {new Date(c.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
