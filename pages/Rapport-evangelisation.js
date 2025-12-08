"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Image from "next/image";

export default function RapportEvangelisation() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [rapport, setRapport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Nom utilisateur
  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    const prenom = name.split(" ")[0];
    setUserName(prenom);
  }, []);

  // 🔹 Fetch et calcul du rapport par date
  useEffect(() => {
    const fetchRapport = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        setError("Impossible de récupérer les données.");
        setLoading(false);
        return;
      }

      // Grouper par date
      const grouped = {};
      (data || []).forEach(ev => {
        const date = new Date(ev.created_at).toLocaleDateString();
        if (!grouped[date]) {
          grouped[date] = {
            hommes: 0,
            femmes: 0,
            priere: 0,
            nouveauConverti: 0,
            reconciliation: 0,
            moissonneurs: ""
          };
        }
        if (ev.sexe === "Homme") grouped[date].hommes += 1;
        if (ev.sexe === "Femme") grouped[date].femmes += 1;
        if (ev.priere_salut) {
          grouped[date].priere += 1;
          if (ev.type_conversion) grouped[date].nouveauConverti += 1;
          else grouped[date].reconciliation += 1;
        }
        if (ev.moissonneur) grouped[date].moissonneurs = ev.moissonneur; // champ libre
      });

      // Transformer en tableau
      const rapportArray = Object.keys(grouped).map(date => ({
        date,
        ...grouped[date]
      }));

      setRapport(rapportArray);
      setLoading(false);
    };

    fetchRapport();
  }, []);

  if (loading) return <p className="text-center mt-10 text-white">Chargement du rapport...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 space-y-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center text-white hover:text-gray-200 transition-colors">← Retour</button>
        <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
      </div>

      {/* 🔹 Logo et titre */}
      <div className="text-center mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} className="mx-auto" />
        <h1 className="text-3xl font-bold text-white mt-4">Rapport Évangélisation</h1>
        <p className="text-white text-lg italic max-w-xl mx-auto">Total par date des évangélisés et conversions.</p>
      </div>

      {/* 🔹 Tableau du rapport */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Hommes</th>
              <th className="p-2 border">Femmes</th>
              <th className="p-2 border">Prière du salut</th>
              <th className="p-2 border">Nouveau converti</th>
              <th className="p-2 border">Réconciliation</th>
              <th className="p-2 border">Moissonneur</th>
            </tr>
          </thead>
          <tbody>
            {rapport.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4">Aucune donnée disponible</td>
              </tr>
            )}
            {rapport.map(r => (
              <tr key={r.date} className="hover:bg-gray-50">
                <td className="p-2 border">{r.date}</td>
                <td className="p-2 border">{r.hommes}</td>
                <td className="p-2 border">{r.femmes}</td>
                <td className="p-2 border">{r.priere}</td>
                <td className="p-2 border">{r.nouveauConverti}</td>
                <td className="p-2 border">{r.reconciliation}</td>
                <td className="p-2 border">{r.moissonneurs || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
