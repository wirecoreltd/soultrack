// pages/evangelisation.js

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [evangelises, setEvangelises] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [openDetailId, setOpenDetailId] = useState(null);

  useEffect(() => {
    fetchEvangelises();
  }, []);

  async function fetchEvangelises() {
    const { data, error } = await supabase.from("evangelises").select("*");
    if (error) console.error(error);
    else setEvangelises(data || []);
  }

  const toggleDetails = (id) => {
    setOpenDetailId(openDetailId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Évangélisation</h1>
        <button
          onClick={() =>
            setViewMode(viewMode === "cards" ? "table" : "cards")
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Voir en {viewMode === "cards" ? "Table" : "Cards"}
        </button>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {evangelises.map((e) => (
            <div
              key={e.id}
              className={`${
                openDetailId === e.id
                  ? "h-auto p-4"
                  : "aspect-square p-3"
              } bg-white shadow rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between`}
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {e.prenom} {e.nom}
                </h2>
                <p className="text-sm text-gray-600">📱 {e.telephone}</p>
              </div>

              {openDetailId === e.id && (
                <div className="mt-3 border-t pt-2 text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>WhatsApp:</strong> {e.is_whatsapp ? "Oui" : "Non"}
                  </p>
                  <p>
                    <strong>Ville:</strong> {e.ville || "—"}
                  </p>
                  <p>
                    <strong>Besoin:</strong> {e.besoin || "—"}
                  </p>
                  <p>
                    <strong>Infos supplémentaires:</strong>{" "}
                    {e.infos_supplementaires || "—"}
                  </p>
                </div>
              )}

              <button
                onClick={() => toggleDetails(e.id)}
                className="mt-4 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {openDetailId === e.id ? "Fermer les détails" : "Détails"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl border border-gray-200 p-4">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {evangelises.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{e.prenom}</td>
                  <td className="px-4 py-2">{e.nom}</td>
                  <td className="px-4 py-2">{e.telephone}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(e.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      {openDetailId === e.id ? "Fermer" : "Détails"}
                    </button>
                    {openDetailId === e.id && (
                      <div className="mt-2 text-gray-700 text-xs border-t pt-1">
                        <p>📲 WhatsApp: {e.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>🏙 Ville: {e.ville || "—"}</p>
                        <p>🙏 Besoin: {e.besoin || "—"}</p>
                        <p>📝 Infos supplémentaires: {e.infos_supplementaires || "—"}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
