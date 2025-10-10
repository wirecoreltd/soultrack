// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [cellules, setCellules] = useState([]);
  const [viewMode, setViewMode] = useState("cards");

  useEffect(() => {
    fetchCellules();
    fetchContacts();
  }, []);

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("*");
    if (!error) setCellules(data);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase.from("contacts").select("*");
    if (!error) setContacts(data);
  };

  const filteredContacts = selectedCellule
    ? contacts.filter((c) => c.cellule === selectedCellule)
    : contacts;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold text-gray-700">
          Gestion d’Évangélisation
        </h1>
        <div className="flex gap-2">
          <select
            value={selectedCellule}
            onChange={(e) => setSelectedCellule(e.target.value)}
            className="border rounded-md px-2 py-1 text-gray-600"
          >
            <option value="">Toutes les Cellules</option>
            {cellules.map((cell) => (
              <option key={cell.id} value={cell.nom}>
                {cell.nom}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              setViewMode(viewMode === "cards" ? "table" : "cards")
            }
            className="bg-blue-500 text-white rounded-md px-3 py-1 hover:bg-blue-600 transition"
          >
            {viewMode === "cards" ? "Vue Table" : "Vue Cartes"}
          </button>
        </div>
      </div>

      {/* === MODE CARTES === */}
      {viewMode === "cards" ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredContacts.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition relative"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {c.prenom} {c.nom}
              </h2>
              <p className="text-sm text-gray-600">📞 {c.telephone}</p>
              <label className="flex items-center gap-2 mt-1 text-sm text-gray-700">
                <input type="checkbox" />
                Envoyer par WhatsApp
              </label>

              <button
                onClick={() => setSelectedContact(c)}
                className="mt-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600 transition"
              >
                Détails
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* === MODE TABLE === */
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-2 border">Prénom</th>
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Envoyer par WhatsApp</th>
                <th className="p-2 border">Détails</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredContacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{c.prenom}</td>
                  <td className="p-2 border">{c.nom}</td>
                  <td className="p-2 border text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => setSelectedContact(c)}
                      className="text-blue-500 underline text-sm"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === POP-UP DETAILS === */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-5 relative animate-fadeIn">
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {selectedContact.prenom} {selectedContact.nom}
            </h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p>📲 WhatsApp: {selectedContact.whatsapp ? "Oui" : "Non"}</p>
              <p>🏙 Ville : {selectedContact.ville || "—"}</p>
              <p>🙏 Besoin : {selectedContact.besoin || "—"}</p>
              <p>📝 Infos supplémentaires : {selectedContact.infos || "—"}</p>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => alert("Message WhatsApp envoyé ✅")}
                className="bg-green-500 text-white px-4 py-1.5 rounded-md hover:bg-green-600 transition"
              >
                📩 Envoyer par WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
