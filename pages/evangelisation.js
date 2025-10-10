//pages//liste-evangelises
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function ListEvangelises() {
  const [evangelises, setEvangelises] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");
  const [view, setView] = useState("card");

  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    try {
      const { data, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEvangelises(data || []);
    } catch (err) {
      console.error("Erreur fetchEvangelises:", err.message);
      setEvangelises([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  const filteredEvangelises = evangelises.filter((e) => {
    if (!filterCellule) return true;
    return e.cellule_id === parseInt(filterCellule);
  });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 flex items-center text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        SoulTrack
      </h1>
      <p className="text-center text-white text-lg mb-4 font-handwriting-light">
        Liste des personnes évangélisées ✨
      </p>

      {/* 🎯 Filtre Cellule */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4 w-full max-w-md">
        <select
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Filtrer par cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule}
            </option>
          ))}
        </select>
        <span className="text-white italic text-opacity-80">
          Résultats: {filteredEvangelises.length}
        </span>
      </div>

      {/* 🎨 Vue toggle */}
      <p
        className="self-end text-orange-400 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        Vue : {view === "card" ? "Carte" : "Table"}
      </p>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {filteredEvangelises.map((person) => (
            <div
              key={person.id}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between border-t-4 border-blue-400"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {person.prenom} {person.nom}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                📱 {person.telephone || "—"}
              </p>
              <p
                className="text-blue-500 underline cursor-pointer"
                onClick={() =>
                  setDetailsOpen((prev) => ({
                    ...prev,
                    [person.id]: !prev[person.id],
                  }))
                }
              >
                {detailsOpen[person.id] ? "Fermer détails" : "Détails"}
              </p>

              {detailsOpen[person.id] && (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p>🏙️ Ville : {person.ville || "—"}</p>
                  <p>🙏 Besoin : {person.besoin || "—"}</p>
                  <p>💬 Comment : {person.comment || "—"}</p>
                  <p>📝 Infos : {person.infos_supplementaires || "—"}</p>
                  <p>
                    🧩 Cellule :{" "}
                    {cellules.find((c) => c.id === person.cellule_id)?.cellule ||
                      "—"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvangelises.map((person) => (
                <tr key={person.id} className="border-b">
                  <td className="py-2 px-4">{person.prenom}</td>
                  <td className="py-2 px-4">{person.nom}</td>
                  <td className="py-2 px-4">
                    <p
                      className="text-blue-500 underline cursor-pointer"
                      onClick={() =>
                        setDetailsOpen((prev) => ({
                          ...prev,
                          [person.id]: !prev[person.id],
                        }))
                      }
                    >
                      {detailsOpen[person.id] ? "Fermer" : "Détails"}
                    </p>

                    {detailsOpen[person.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>📱 Téléphone : {person.telephone || "—"}</p>
                        <p>🏙️ Ville : {person.ville || "—"}</p>
                        <p>🙏 Besoin : {person.besoin || "—"}</p>
                        <p>💬 Comment : {person.comment || "—"}</p>
                        <p>📝 Infos : {person.infos_supplementaires || "—"}</p>
                        <p>
                          🧩 Cellule :{" "}
                          {cellules.find((c) => c.id === person.cellule_id)
                            ?.cellule || "—"}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 text-white text-2xl font-bold"
      >
        ↑
      </button>

      <p className="mt-6 mb-6 text-center text-white text-lg font-handwriting-light">
        “Car le corps ne se compose pas d’un seul membre, mais de plusieurs.”
        <br />– 1 Corinthiens 12:14 ❤️
      </p>
    </div>
  );
}
