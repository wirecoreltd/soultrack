// pages/evangelisation-table.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EvangelisationTable() {
  const [contacts, setContacts] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedContacts, setSelectedContacts] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setContacts(data);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("*");
    if (!error) setCellules(data);
  };

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckbox = (id) => {
    setSelectedContacts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sendWhatsapp = () => {
    if (!selectedCellule) return alert("Sélectionnez une cellule d'abord!");
    const cellule = cellules.find((c) => c.id === Number(selectedCellule));
    if (!cellule || !cellule.telephone) return alert("Numéro cellule introuvable.");

    const contactsToSend = contacts.filter(c => selectedContacts[c.id]);
    if (contactsToSend.length === 0) return alert("Cochez au moins un contact!");

    contactsToSend.forEach(contact => {
      const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${contact.nom} ${contact.prenom}
- 📱 Téléphone : ${contact.telephone || "—"}
- 📲 WhatsApp: ${contact.whatsapp || "Non"}
- 🏙 Ville : ${contact.ville || "—"}
- 🙏 Besoin : ${contact.besoin || "—"}
- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

      window.open(`https://wa.me/${cellule.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    });

    setSelectedContacts({});
    setSelectedCellule("");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-blue-900 to-blue-400 flex flex-col items-center">
      <h1 className="text-4xl text-white font-bold mb-4">Évangélisation - Table</h1>

      {/* Menu Cellule */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 w-full max-w-md">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 w-full"
        >
          <option value="">-- Sélectionnez une cellule --</option>
          {cellules.map(c => (
            <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>
          ))}
        </select>
        {selectedCellule && (
          <button
            onClick={sendWhatsapp}
            className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Envoyer par WhatsApp
          </button>
        )}
      </div>

      {/* Table */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-left">Prénom</th>
              <th className="py-2 px-4 text-left">Nom</th>
              <th className="py-2 px-4 text-left">Téléphone</th>
              <th className="py-2 px-4 text-left">Détails</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.id} className="border-b">
                <td className="py-2 px-4">{contact.prenom}</td>
                <td className="py-2 px-4">{contact.nom}</td>
                <td className="py-2 px-4">{contact.telephone || "—"}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => toggleDetails(contact.id)}
                    className="text-blue-500 underline"
                  >
                    {detailsOpen[contact.id] ? "Fermer détails" : "Détails"}
                  </button>

                  {detailsOpen[contact.id] && (
                    <div className="mt-2 text-center space-y-2 bg-gray-50 p-2 rounded-md">
                      <p>📲 WhatsApp: {contact.whatsapp || "Non"}</p>
                      <p>🏙 Ville: {contact.ville || "—"}</p>
                      <p>🙏 Besoin: {contact.besoin || "—"}</p>
                      <p>📝 Infos supplémentaires: {contact.infos_supplementaires || "—"}</p>
                      <label className="flex items-center justify-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          checked={!!selectedContacts[contact.id]}
                          onChange={() => handleCheckbox(contact.id)}
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
    </div>
  );
}
