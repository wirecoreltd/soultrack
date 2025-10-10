// pages/evangelisation-cards.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EvangelisationCards() {
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

  const sendWhatsapp = async () => {
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

    // Reset sélection
    setSelectedContacts({});
    setSelectedCellule("");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-blue-900 to-blue-400 flex flex-col items-center">
      <h1 className="text-4xl text-white font-bold mb-4">Évangélisation - Cards</h1>

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

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className={`bg-white shadow-md rounded-lg cursor-pointer flex flex-col p-4 transition-all duration-300
              ${detailsOpen[contact.id] ? "w-full sm:col-span-2 md:col-span-3" : ""}`}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">{contact.prenom} {contact.nom}</h2>
              <button onClick={() => toggleDetails(contact.id)} className="text-blue-500 underline">
                {detailsOpen[contact.id] ? "Fermer détails" : "Détails"}
              </button>
            </div>
            <p className="text-gray-600">📱 {contact.telephone || "—"}</p>

            {detailsOpen[contact.id] && (
              <div className="mt-2 space-y-2">
                <p>Nom : {contact.nom}</p>
                <p>Prénom : {contact.prenom}</p>
                <p>📱 {contact.telephone || "—"}</p>
                <p>📲 WhatsApp : {contact.whatsapp || "Non"}</p>
                <p>🏙 Ville : {contact.ville || "—"}</p>
                <p>🙏 Besoin : {contact.besoin || "—"}</p>
                <p>📝 Infos supplémentaires : {contact.infos_supplementaires || "—"}</p>
                <label className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={!!selectedContacts[contact.id]}
                    onChange={() => handleCheckbox(contact.id)}
                  />
                  Envoyer par WhatsApp
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
