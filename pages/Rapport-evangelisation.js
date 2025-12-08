"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function RapportEvangelisation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totaux, setTotaux] = useState({
    hommes: 0,
    femmes: 0,
    priere: 0,
    nouveauxConvertis: 0,
    reconciliations: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: evangelises, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setData(evangelises);

      // Calcul des totaux
      const hommes = evangelises.filter(d => d.sexe === "Homme").length;
      const femmes = evangelises.filter(d => d.sexe === "Femme").length;
      const priere = evangelises.filter(d => d.priere_salut).length;
      const nouveauxConvertis = evangelises.filter(d => d.type_conversion).length;
      const reconciliations = priere - nouveauxConvertis;

      setTotaux({ hommes, femmes, priere, nouveauxConvertis, reconciliations });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement des rapports...</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 space-y-6"
      style={{ background: "linear-gradient(135deg, #1D2671 0%, #C33764 100%)" }}
    >
      {/* 🔹 Header */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">📊 Rapport Évangélisation</h1>
          <Image src="/logo.png" alt="SoulTrack Logo" width={60} height={60} />
        </div>
        <p className="text-white text-sm mt-2 italic">
          Suivi complet des évangélisés et des conversions
        </p>
      </div>

      {/* 🔹 Totaux principaux */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-6xl mb-6 text-center">
        <div className="bg-white bg-opacity-80 p-4 rounded-2xl shadow">
          <p className="text-gray-700 font-semibold">Hommes</p>
          <p className="font-bold text-2xl">{totaux.hommes}</p>
        </div>
        <div className="bg-white bg-opacity-80 p-4 rounded-2xl shadow">
          <p className="text-gray-700 font-semibold">Femmes</p>
          <p className="font-bold text-2xl">{totaux.femmes}</p>
        </div>
        <div className="bg-white bg-opacity-80 p-4 rounded-2xl shadow">
          <p className="text-gray-700 font-semibold">Prières du salut</p>
          <p className="font-bold text-2xl">{totaux.priere}</p>
        </div>
        <div className="bg-white bg-opacity-80 p-4 rounded-2xl shadow">
          <p className="text-gray-700 font-semibold">Nouveaux convertis</p>
          <p className="font-bold text-2xl">{totaux.nouveauxConvertis}</p>
        </div>
        <div className="bg-white bg-opacity-80 p-4 rounded-2xl shadow">
          <p className="text-gray-700 font-semibold">Réconciliations</p>
          <p className="font-bold text-2xl">{totaux.reconciliations}</p>
        </div>
      </div>

      {/* 🔹 Tableau des évangélisés */}
      <div className="overflow-x-auto w-full max-w-6xl bg-white rounded-3xl shadow-lg p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Prénom</th>
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Sexe</th>
              <th className="p-2 border">Ville</th>
              <th className="p-2 border">Prière du salut</th>
              <th className="p-2 border">Type conversion</th>
              <th className="p-2 border">Besoin</th>
              <th className="p-2 border">Infos sup.</th>
              <th className="p-2 border">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {data.map(ev => (
              <tr key={ev.id} className="hover:bg-gray-50">
                <td className="p-2 border">{new Date(ev.created_at).toLocaleDateString()}</td>
                <td className="p-2 border">{ev.prenom}</td>
                <td className="p-2 border">{ev.nom}</td>
                <td className="p-2 border">{ev.sexe}</td>
                <td className="p-2 border">{ev.ville}</td>
                <td className="p-2 border">{ev.priere_salut ? "Oui" : "Non"}</td>
                <td className="p-2 border">
                  {ev.priere_salut ? (ev.type_conversion ? "Nouveau converti" : "Réconciliation") : "-"}
                </td>
                <td className="p-2 border">{ev.besoin.join(", ")}</td>
                <td className="p-2 border">{ev.infos_supplementaires}</td>
                <td className="p-2 border">{ev.is_whatsapp ? "Oui" : "Non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Verset biblique */}
      <div className="mt-auto text-center text-white text-lg italic max-w-2xl leading-relaxed tracking-wide font-light">
        “Chaque âme compte et chaque conversion est précieuse.”  
      </div>
    </div>
  );
}
