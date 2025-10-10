// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [view, setView] = useState("card"); // 'card' ou 'table'
  const [checkboxes, setCheckboxes] = useState({});

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("date_suivi", { ascending: false });
    if (error) console.error(error);
    else setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (error) console.error(error);
    else setCellules(data || []);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        Évangélisation
      </h1>

      {/* Toggle view */}
      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Voir en Table" : "Voir en Card"}
      </p>

      {/* Menu déroulant cellule */}
      <div className="mb-4 w-full max-w-md">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>
      </div>

      {/* Card View */}
      {view === "card" ? (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {contact.prenom} {contact.nom}
              </h2>
              <p className="text-sm text-gray-600 mb-2">📱 {contact.telephone || "—"}</p>

              <button
                className="text-blue-500 underline text-sm mb-2"
                onClick={() =>
                  setDetailsOpen((prev) => ({ ...prev, [contact.id]: !prev[contact.id] }))
                }
              >
                {detailsOpen[contact.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[contact.id] && (
                <div className="text-sm text-gray-700 space-y-1 mt-2">
                  <p><strong>Nom:</strong> {contact.nom}</p>
                  <p><strong>Prénom:</strong> {contact.prenom}</p>
                  <p><strong>📱 Téléphone:</strong> {contact.telephone || "—"}</p>
                  <p><strong>WhatsApp:</strong> {contact.is_whatsapp ? "Oui" : "Non"}</p>
                  <p><strong>Ville:</strong> {contact.ville || "—"}</p>
                  <p><strong>Besoin:</strong> {contact.besoin || "—"}</p>
                  <p><strong>Infos supplémentaires:</strong> {contact.infos_supplementaires || "—"}</p>

                  {/* Case à cocher envoyer WhatsApp */}
                  {selectedCellule && (
                    <div className="mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checkboxes[contact.id] || false}
                          onChange={(e) =>
                            setCheckboxes((prev) => ({ ...prev, [contact.id]: e.target.checked }))
                          }
                        />
                        Envoyer par WhatsApp
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Table view
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Téléphone</th>
                <th className="py-2 px-4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b">
                  <td className="py-2 px-4">{contact.prenom}</td>
                  <td className="py-2 px-4">{contact.nom}</td>
                  <td className="py-2 px-4">{contact.telephone || "—"}</td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-500 underline text-sm"
                      onClick={() =>
                        setDetailsOpen((prev) => ({ ...prev, [contact.id]: !prev[contact.id] }))
                      }
                    >
                      {detailsOpen[contact.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[contact.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p><strong>WhatsApp:</strong> {contact.is_whatsapp ? "Oui" : "Non"}</p>
                        <p><strong>Ville:</strong> {contact.ville || "—"}</p>
                        <p><strong>Besoin:</strong> {contact.besoin || "—"}</p>
                        <p><strong>Infos supplémentaires:</strong> {contact.infos_supplementaires || "—"}</p>

                        {/* Case à cocher envoyer WhatsApp */}
                        {selectedCellule && (
                          <div className="mt-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checkboxes[contact.id] || false}
                                onChange={(e) =>
                                  setCheckboxes((prev) => ({ ...prev, [contact.id]: e.target.checked }))
                                }
                              />
                              Envoyer par WhatsApp
                            </label>
                          </div>
                        )}
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
    </div>
  );
}
