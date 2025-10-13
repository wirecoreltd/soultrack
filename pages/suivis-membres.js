"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les suivis existants
  const fetchSuivis = async () => {
    try {
      const { data, error } = await supabase
        .from("suivis_membres")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuivis(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des suivis :", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Abonnement en temps réel
  useEffect(() => {
    fetchSuivis();

    // 🔥 Abonnement Supabase Realtime
    const channel = supabase
      .channel("suivis-membres-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "suivis_membres" },
        (payload) => {
          console.log("📡 Nouveau suivi reçu :", payload.new);
          setSuivis((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-cyan-300 text-white">
        <p>Chargement des suivis...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 flex items-center text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <h1 className="text-4xl sm:text-5xl font-handwriting text-white mb-6">
        Suivis Membres 📋
      </h1>

      {suivis.length === 0 ? (
        <p className="text-white text-lg">Aucun suivi pour le moment.</p>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800 text-left">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Téléphone</th>
                <th className="py-2 px-4">Cellule</th>
                <th className="py-2 px-4">Responsable</th>
                <th className="py-2 px-4">Besoin</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-500">
                    {new Date(s.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2 px-4">{s.prenom}</td>
                  <td className="py-2 px-4">{s.nom}</td>
                  <td className="py-2 px-4">{s.telephone}</td>
                  <td className="py-2 px-4">{s.cellule_nom}</td>
                  <td className="py-2 px-4">{s.responsable}</td>
                  <td className="py-2 px-4">{s.besoin || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
