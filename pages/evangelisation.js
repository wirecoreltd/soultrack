// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [selectedContacts, setSelectedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [view, setView] = useState("card"); // card ou table

  // Fetch contacts et cellules
  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("date_suivi", { ascending: false });
    if (error) return console.error(error);
    setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("*");
    if (error) return console.error(error);
    setCellules(data || []);
  };

  const toggleContactSelection = (id) => {
    setSelectedContacts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsapp = async () => {
    if (!selectedCellule) return alert("Sélectionnez une cellule !");
    const cellule = cellules.find(c => c.id === selectedCellule);
    if (!cellule) return alert("Cellule introuvable !");
    const contactsToSend = contacts.filter(c => selectedContacts[c.id]);
    if (contactsToSend.length === 0) return alert("Aucun contact sélectionné !");
    
    contactsToSend.forEach(async contact => {
      const phone = cellule.telephone.replace(/\D/g, "");
      const message = `👋 Salut ${cellule.responsable},
Voici les infos du contact à suivre :
- Prénom: ${contact.prenom}
- Nom: ${contact.nom}
- Téléphone: ${contact.telephone || "—"}
- WhatsApp: ${contact.is_whatsapp ? "Oui" : "Non"}
- Ville: ${contact.ville || "—"}
- Besoin: ${contact.besoin || "—"}
- Infos supplémentaires: ${contact.infos_supplementaires || "—"}`;

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    });

    // Supprimer contacts cochés de l'affichage
    setContacts(prev => prev.filter(c => !selectedContacts[c.id]));
    setSelectedContacts({});
  };

  const ContactCard = ({ contact }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border-t-4 mb-4" style={{ borderTopColor: "#4285F4" }}>
      <div className="flex justify-between items-center">
        <div>
          <strong>{contact.prenom} {contact.nom}</strong>
        </div>
        <button onClick={() => setDetailsOpen(prev => ({ ...prev, [contact.id]: !prev[contact.id] }))} className="text-blue-500 underline">
          {detailsOpen[contact.id] ? "Fermer détails" : "Détails"}
        </button>
      </div>
      <p>📱 {contact.telephone || "—"}</p>

      {detailsOpen[contact.id] && (
        <div className="mt-2 text-sm space-y-1">
          <p>Nom: {contact.nom}</p>
          <p>Prénom: {contact.prenom}</p>
          <p>WhatsApp: {contact.is_whatsapp ? "Oui" : "Non"}</p>
          <p>Ville: {contact.ville || "—"}</p>
          <p>Besoin: {contact.besoin || "—"}</p>
          <p>Infos supplémentaires: {contact.infos_supplementaires || "—"}</p>
          <label className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={!!selectedContacts[contact.id]}
              onChange={() => toggleContactSelection(contact.id)}
              className="mr-2"
            />
            Sélectionner pour envoyer par WhatsApp
          </label>
        </div>
      )}
    </div>
  );

  const ContactRow = ({ contact }) => (
    <>
      <tr className="border-b">
        <td className="py-2 px-4">{contact.prenom}</td>
        <td className="py-2 px-4">{contact.nom}</td>
        <td className="py-2 px-4">{contact.telephone || "—"}</td>
        <td className="py-2 px-4">
          <button onClick={() => setDetailsOpen(prev => ({ ...prev, [contact.id]: !prev[contact.id] }))} className="text-blue-500 underline">
            {detailsOpen[contact.id] ? "Fermer détails" : "Détails"}
          </button>
        </td>
      </tr>
      {detailsOpen[contact.id] && (
        <tr>
          <td colSpan="4" className="bg-gray-50 p-4">
            <p>WhatsApp: {contact.is_whatsapp ? "Oui" : "Non"} | Ville: {contact.ville || "—"}</p>
            <p>Besoin: {contact.besoin || "—"}</p>
            <p>Infos supplémentaires: {contact.infos_supplementaires || "—"}</p>
            <label className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={!!selectedContacts[contact.id]}
                onChange={() => toggleContactSelection(contact.id)}
                className="mr-2"
              />
              Sélectionner pour envoyer par WhatsApp
            </label>
          </td>
        </tr>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-cyan-400 p-6">
      <h1 className="text-4xl font-bold text-white mb-4">Évangélisation</h1>

      {/* Cellule + Bouton */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="px-4 py-2 rounded-lg"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map(c => (
            <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>
          ))}
        </select>
        {selectedCellule && (
          <button onClick={sendWhatsapp} className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Envoyer WhatsApp aux contacts cochés
          </button>
        )}
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Voir en {view === "card" ? "Table" : "Card"}
        </button>
      </div>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(contact => <ContactCard key={contact.id} contact={contact} />)}
        </div>
      ) : (
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
            {contacts.map(contact => <ContactRow key={contact.id} contact={contact} />)}
          </tbody>
        </table>
      )}
    </div>
  );
}
