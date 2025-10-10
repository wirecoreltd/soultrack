// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [view, setView] = useState("card"); // card ou table
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedContacts, setSelectedContacts] = useState({});

  // Fetch contacts
  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase.from("evangelises").select("*").order("created_at", { ascending: false });
    if (error) console.error(error);
    else setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("*");
    if (error) console.error(error);
    else setCellules(data || []);
  };

  // Toggle selection pour multi-send
  const toggleSelectContact = (id) => {
    setSelectedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Envoyer WhatsApp à responsable
  const sendWhatsapp = async () => {
    if (!selectedCellule) return alert("Sélectionnez une cellule d'abord.");
    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule || !cellule.telephone) return alert("Numéro de la cellule introuvable.");

    const contactsToSend = contacts.filter((c) => selectedContacts[c.id]);
    if (!contactsToSend.length) return alert("Sélectionnez au moins un contact.");

    contactsToSend.forEach(async (contact) => {
      const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${contact.prenom} ${contact.nom}
- 📱 Téléphone : ${contact.telephone || "—"}
- 📲 WhatsApp: ${contact.whatsapp || "—"}
- 🏙 Ville : ${contact.ville || "—"}
- 🙏 Besoin : ${contact.besoin || "—"}
- 📝 Infos supplémentaires : ${contact.infos || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

      const phone = cellule.telephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      // Supprimer le contact après envoi
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      setSelectedContacts((prev) => {
        const copy = { ...prev };
        delete copy[contact.id];
        return copy;
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-700 to-blue-300">
      <h1 className="text-4xl font-bold text-white mb-4">Évangélisation</h1>

      {/* Menu cellule */}
      <div className="w-full max-w-md flex flex-col items-center gap-4 mb-4">
        <select
          className="w-full p-2 rounded-lg text-gray-700"
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
        >
          <option value="">-- Sélectionner une cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>
          ))}
        </select>

        {selectedCellule && (
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg"
            onClick={sendWhatsapp}
          >
            Envoyer WhatsApp au responsable
          </button>
        )}
      </div>

      {/* Toggle view */}
      <button
        className="mb-4 px-4 py-2 bg-orange-400 rounded-lg text-white font-semibold"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Voir Table" : "Voir Cards"}
      </button>

      {/* Affichage */}
      {view === "card" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-center w-full max-w-5xl">
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 ${detailsOpen[c.id] ? "w-full col-span-3" : ""}`}
            >
              <div className="flex justify-between items-center">
                <h2 className="font-bold">{c.prenom} {c.nom}</h2>
                <button onClick={() => setDetailsOpen((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}>
                  {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                </button>
              </div>
              <p>📱 {c.telephone}</p>

              {detailsOpen[c.id] && (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p><strong>Nom:</strong> {c.nom}</p>
                  <p><strong>Prénom:</strong> {c.prenom}</p>
                  <p>📱 {c.telephone}</p>
                  <p>📲 WhatsApp: {c.whatsapp || "—"}</p>
                  <p>🏙 Ville: {c.ville || "—"}</p>
                  <p>🙏 Besoin: {c.besoin || "—"}</p>
                  <p>📝 Infos supplémentaires: {c.infos || "—"}</p>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={!!selectedContacts[c.id]}
                      onChange={() => toggleSelectContact(c.id)}
                    />
                    Envoyer par WhatsApp
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto w-full max-w-5xl">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Téléphone</th>
                <th className="py-2 px-4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b text-center">
                  <td>{c.prenom}</td>
                  <td>{c.nom}</td>
                  <td>{c.telephone}</td>
                  <td>
                    <button
                      className="text-blue-500 underline mb-2"
                      onClick={() => setDetailsOpen((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                    >
                      {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[c.id] && (
                      <div className="text-left mt-2">
                        <p>📲 WhatsApp: {c.whatsapp || "—"}</p>
                        <p>🏙 Ville: {c.ville || "—"}</p>
                        <p>🙏 Besoin: {c.besoin || "—"}</p>
                        <p>📝 Infos supplémentaires: {c.infos || "—"}</p>
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={!!selectedContacts[c.id]}
                            onChange={() => toggleSelectContact(c.id)}
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
