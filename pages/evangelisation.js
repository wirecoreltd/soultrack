// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card"); // 'card' ou 'table'

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

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheck = (id) => {
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsapp = async () => {
    if (!selectedCellule) return alert("Sélectionnez une cellule !");
    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule) return alert("Cellule introuvable !");
    const toSend = contacts.filter((c) => checkedContacts[c.id]);
    if (toSend.length === 0) return alert("Cochez au moins un contact !");

    for (const contact of toSend) {
      const message = `👋 Salut ${cellule.responsable},

Nom: ${contact.nom}
Prénom: ${contact.prenom}
📱 ${contact.telephone || "—"}
WhatsApp: ${contact.is_whatsapp ? "Oui" : "Non"}
Ville: ${contact.ville || "—"}
Besoin: ${contact.besoin || "—"}
Infos: ${contact.infos_supplementaires || "—"}`;

      const phone = cellule.telephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    }

    // Retirer les contacts envoyés de la liste
    setContacts((prev) => prev.filter((c) => !checkedContacts[c.id]));
    setCheckedContacts({});
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gradient-to-r from-indigo-500 to-blue-300">
      <h1 className="text-5xl text-white font-bold mb-4">Évangélisation</h1>

      {/* Menu Cellule + Bouton WhatsApp */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full max-w-md">
        <select
          className="border rounded-lg px-4 py-2 w-full sm:w-auto"
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
        >
          <option value="">-- Sélectionnez une cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>

        {selectedCellule && (
          <button
            onClick={sendWhatsapp}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            Envoyer par WhatsApp
          </button>
        )}
      </div>

      {/* Toggle Card/Table */}
      <p
        className="self-end text-orange-400 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        Voir en {view === "card" ? "Table" : "Card"}
      </p>

      {/* CARDS */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-xl aspect-square shadow-md flex flex-col justify-between"
            >
              <div>
                <p className="font-bold">{c.prenom} {c.nom}</p>
                <p>📱 {c.telephone || "—"}</p>
              </div>

              <button
                className="text-blue-500 mt-2 underline"
                onClick={() => toggleDetails(c.id)}
              >
                {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[c.id] && (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p>Nom: {c.nom}</p>
                  <p>Prénom: {c.prenom}</p>
                  <p>📱 {c.telephone || "—"}</p>
                  <p>WhatsApp: {c.is_whatsapp ? "Oui" : "Non"}</p>
                  <p>Ville: {c.ville || "—"}</p>
                  <p>Besoin: {c.besoin || "—"}</p>
                  <p>Infos supplémentaires: {c.infos_supplementaires || "—"}</p>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={checkedContacts[c.id] || false}
                      onChange={() => toggleCheck(c.id)}
                    />
                    Envoyer par WhatsApp
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      {view === "table" && (
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
              {contacts.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 px-4">{c.prenom}</td>
                  <td className="py-2 px-4">{c.nom}</td>
                  <td className="py-2 px-4">{c.telephone || "—"}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      className="text-blue-500 underline mb-2"
                      onClick={() => toggleDetails(c.id)}
                    >
                      {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[c.id] && (
                      <div className="text-left mt-2 text-sm text-gray-700 space-y-1">
                        <p>WhatsApp: {c.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>Ville: {c.ville || "—"}</p>
                        <p>Besoin: {c.besoin || "—"}</p>
                        <p>Infos supplémentaires: {c.infos_supplementaires || "—"}</p>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={checkedContacts[c.id] || false}
                            onChange={() => toggleCheck(c.id)}
                          />
                          Envoyer par WhatsApp
                        </label>
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
