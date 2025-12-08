"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Image from "next/image";

export default function RapportEvangelisation() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [evangelises, setEvangelises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Récupération du nom de l'utilisateur
  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    const prenom = name.split(" ")[0];
    setUserName(prenom);
  }, []);

  // 🔹 Fetch des données
  useEffect(() => {
    const fetchEvangelises = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setError("Impossible de récupérer les données.");
      } else {
        setEvangelises(data || []);
      }
      setLoading(false);
    };
    fetchEvangelises();
  }, []);

  // 🔹 Calculs pour le rapport
  const hommes = (evangelises || []).filter(e => e.sexe === "Homme").length;
  const femmes = (evangelises || []).filter(e => e.sexe === "Femme").length;
  const priereOui = (evangelises || []).filter(e => e.priere_salut).length;
  const nouveauConverti = (evangelises || []).filter(e => e.type_conversion === true).length;
  const reconciliation = priereOui - nouveauConverti;

  if (loading) return <p className="text-center mt-10 text-white">Chargement des données...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 space-y-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* 🔹 Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      {/* 🔹 Logo */}
      <div className="mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} className="mx-auto" />
      </div>

      {/* 🔹 Titre */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Rapport Évangélisation</h1>
        <p className="text-white text-lg max-w-xl mx-auto leading-relaxed tracking-wide font-light italic">
          Suivi détaillé des personnes évangélisées.
        </p>
      </div>

      {/* 🔹 Statistiques */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-500 font-semibold">Hommes</p>
          <p className="text-2xl font-bold">{hommes}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-500 font-semibold">Femmes</p>
          <p className="text-2xl font-bold">{femmes}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-500 font-semibold">Prières du salut</p>
          <p className="text-2xl font-bold">{priereOui}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-500 font-semibold">Nouveaux convertis</p>
          <p className="text-2xl font-bold">{nouveauConverti}</p>
        </div>
      </div>

      {/* 🔹 Tableau des évangélisés */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Prénom</th>
              <th className="p-2 border">Sexe</th>
              <th className="p-2 border">Ville</th>
              <th className="p-2 border">Prière du salut</th>
              <th className="p-2 border">Type conversion</th>
              <th className="p-2 border">Besoin</th>
              <th className="p-2 border">Infos supplémentaires</th>
            </tr>
          </thead>
          <tbody>
            {(evangelises.length > 0 ? evangelises : []).map(ev => (
              <tr key={ev.id} className="hover:bg-gray-50">
                <td className="p-2 border">{new Date(ev.created_at).toLocaleDateString()}</td>
                <td className="p-2 border">{ev.nom || "-"}</td>
                <td className="p-2 border">{ev.prenom || "-"}</td>
                <td className="p-2 border">{ev.sexe || "-"}</td>
                <td className="p-2 border">{ev.ville || "-"}</td>
                <td className="p-2 border">{ev.priere_salut ? "Oui" : "Non"}</td>
                <td className="p-2 border">
                  {ev.priere_salut
                    ? ev.type_conversion
                      ? "Nouveau converti"
                      : "Réconciliation"
                    : "-"}
                </td>
                <td className="p-2 border">{ev.besoin || "-"}</td>
                <td className="p-2 border">{ev.infos_supplementaires || "-"}</td>
              </tr>
            ))}
            {evangelises.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center p-4">
                  Aucune donnée disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
