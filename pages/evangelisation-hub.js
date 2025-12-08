"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function RapportEvangelisation() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [rapport, setRapport] = useState([]);

  // Champs libres
  const [gagneurAme, setGagneurAme] = useState("");
  const [nombreGagneurs, setNombreGagneurs] = useState("");
  const [nombreMoissonneurs, setNombreMoissonneurs] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    setUserName(name.split(" ")[0]);
    fetchRapport();
  }, []);

  async function fetchRapport() {
    setLoading(true);

    const { data, error } = await supabase
      .from("evangelises")
      .select("*");

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    // Groupement par date
    const grouped = {};

    data.forEach((item) => {
      const date = item.created_at?.split("T")[0];

      if (!grouped[date]) {
        grouped[date] = {
          hommes: 0,
          femmes: 0,
          priere_salut: 0,
          nouveau_converti: 0,
          reconciliation: 0,
        };
      }

      if (item.sexe === "Homme") grouped[date].hommes++;
      if (item.sexe === "Femme") grouped[date].femmes++;

      if (item.priere_salut) grouped[date].priere_salut++;

      if (item.type_conversion === "nouveau_converti")
        grouped[date].nouveau_converti++;

      if (item.type_conversion === "reconciliation")
        grouped[date].reconciliation++;
    });

    const finalArray = Object.entries(grouped).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    setRapport(finalArray);
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition"
          >
            ← Retour
          </button>

          <LogoutLink />
        </div>

        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" width={80} height={80} alt="Logo" />
      </div>

      {/* Title */}
      <h1 className="text-3xl text-white font-bold text-center mb-4">
        📊 Rapport Évangélisation
      </h1>

      {/* Subtitle */}
      <p className="text-white text-center italic mb-6 max-w-xl mx-auto">
        “Chaque âme rencontrée est un miracle en devenir.” ✨
      </p>

      {/* 🔹 Champs libres dans card blanche */}
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-5xl mx-auto w-full mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Champs libres</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Gagneur d'âme */}
          <div>
            <label className="font-semibold">Gagneur d’âme (Nom)</label>
            <input
              type="text"
              className="w-full p-3 mt-1 border rounded-xl shadow-sm"
              value={gagneurAme}
              onChange={(e) => setGagneurAme(e.target.value)}
              placeholder="Ex : Jean Louis"
            />
          </div>

          {/* Nombre de gagneurs */}
          <div>
            <label className="font-semibold">Nombre de gagneurs d’âme</label>
            <input
              type="number"
              className="w-full p-3 mt-1 border rounded-xl shadow-sm"
              value={nombreGagneurs}
              onChange={(e) => setNombreGagneurs(e.target.value)}
              placeholder="Ex : 4"
            />
          </div>

          {/* Nombre de moissonneurs */}
          <div>
            <label className="font-semibold">Nombre de moissonneurs</label>
            <input
              type="number"
              className="w-full p-3 mt-1 border rounded-xl shadow-sm"
              value={nombreMoissonneurs}
              onChange={(e) => setNombreMoissonneurs(e.target.value)}
              placeholder="Ex : 3"
            />
          </div>
        </div>
      </div>

      {/* 🔹 Tableau du rapport */}
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-5xl mx-auto overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 text-gray-700 rounded-xl">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Hommes</th>
              <th className="p-3 text-center">Femmes</th>
              <th className="p-3 text-center">Prière du salut</th>
              <th className="p-3 text-center">Nouveau Converti</th>
              <th className="p-3 text-center">Réconciliation</th>
              <th className="p-3 text-center">Gagneur d’âme</th>
              <th className="p-3 text-center">Nb. Gagneurs</th>
              <th className="p-3 text-center">Nb. Moissonneurs</th>
            </tr>
          </thead>

          <tbody>
            {rapport.map((r) => (
              <tr key={r.date} className="border-b">
                <td className="p-3">{r.date}</td>
                <td className="p-3 text-center">{r.hommes}</td>
                <td className="p-3 text-center">{r.femmes}</td>
                <td className="p-3 text-center">{r.priere_salut}</td>
                <td className="p-3 text-center">{r.nouveau_converti}</td>
                <td className="p-3 text-center">{r.reconciliation}</td>
                <td className="p-3 text-center">{gagneurAme || "-"}</td>
                <td className="p-3 text-center">{nombreGagneurs || "-"}</td>
                <td className="p-3 text-center">{nombreMoissonneurs || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <p className="text-center text-gray-500 mt-4">Chargement…</p>
        )}
      </div>

      {/* Footer verse */}
      <p className="text-white text-center mt-10 italic">
        “Celui qui gagne des âmes est sage.” – Proverbes 11:30 ❤️
      </p>
    </div>
  );
}
