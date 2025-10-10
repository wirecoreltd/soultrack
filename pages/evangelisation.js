// pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card");
  const [popupContact, setPopupContact] = useState(null);

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (!error) setCellules(data || []);
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const sendWhatsapp = () => {
    const toSend = contacts.filter((c) => checkedContacts[c.id]);
    if (!selectedCellule) return alert("Sélectionne une cellule !");
    const cellule = cellules.find(
      (c) => c.id === parseInt(selectedCellule)
    );
    if (!cellule) return alert("Cellule introuvable !");

    toSend.forEach((member) => {
      const phone = cellule.telephone.replace(/\D/g, "");
      const message = `👋 Salut ${cellule.responsable},\n\n🙏 Dieu nous a envoyé une nouvelle âme à suivre.\nVoici ses infos :\n\n- 👤 Nom : ${member.prenom} ${member.nom}\n- 📱 Téléphone : ${member.telephone || "—"}\n- 📲 WhatsApp: ${checkedContacts[member.id] ? "Oui" : "Non"}\n- 🏙 Ville : ${member.ville || "—"}\n- 🙏 Besoin : ${member.besoin || "—"}\n- 📝 Infos supplémentaires : ${member.infos_supplementaires || "—"}\n\nMerci pour ton cœur ❤ et son amour ✨`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-blue-800 to-cyan-400">
      <button
        onClick={() => window.history.back()}
        className="self-start mb-3 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>
      <Image src="/logo.png" alt="Logo" width={70} height={70} className="mb-2"/>
      <h1 className="text-4xl sm:text-5xl font-handwriting text-white text-center mb-1">
        Évangélisation
      </h1>
      <p className="text-center text-white text-base sm:text-lg mb-3 font-handwriting-light">
        Chaque personne a une valeur infinie...
      </p>

      {/* Menu déroulant cellules */}
      <div className="mb-3 w-full max-w-md flex flex-col sm:flex-row gap-2">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>

        {selectedCellule && (
          <button
            onClick={sendWhatsapp}
            className="bg-green-500 text-white font-semibold px-3 py-2 rounded-lg w-full sm:w-auto text-center"
          >
            Envoyer par WhatsApp
          </button>
        )}
      </div>

      {/* Toggle card/table */}
      <p
        className="text-orange-500 cursor-pointer mb-3"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        Visuel
      </p>

      {/* --- CARDS VIEW --- */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div
                key={member.id}
                className={`bg-white rounded-lg shadow-md p-3 flex flex-col items-center transition-all duration-400 ease-in-out cursor-pointer overflow-hidden
                  ${isOpen ? "h-auto sm:col-span-2 md:col-span-3" : "h-48 w-full max-w-xs mx-auto"}`}
              >
                {/* Nom et téléphone */}
                <div className="flex flex-col items-center">
                  <h2 className="font-bold text-gray-800 text-base sm:text-lg mb-1">
                    {member.prenom} {member.nom}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    📱 {member.telephone || "—"}
                  </p>

                  {/* Case à cocher */}
                  <label className="flex items-center gap-2 text-sm mb-2">
                    <input
                      type="checkbox"
                      checked={checkedContacts[member.id] || false}
                      onChange={() => handleCheck(member.id)}
                    />
                    Envoyer par WhatsApp
                  </label>
                </div>

                {/* Bouton Détails */}
                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-blue-500 underline mb-2"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>

                {/* Section détails affichée uniquement quand ouverte */}
                {isOpen && (
                  <div className="text-sm text-gray-700 mt-2 w-full border-t pt-2">
                    <p>📲 WhatsApp: {checkedContacts[member.id] ? "Oui" : "Non"}</p>
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>🙏 Besoin: {member.besoin || "—"}</p>
                    <p>📝 Infos supplémentaires: {member.infos_supplementaires || "—"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-3">Prénom</th>
                <th className="py-2 px-3">Nom</th>
                <th className="py-2 px-3">Envoyer WhatsApp</th>
                <th className="py-2 px-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="py-2 px-3">{member.prenom}</td>
                  <td className="py-2 px-3">{member.nom}</td>
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      checked={checkedContacts[member.id] || false}
                      onChange={() => handleCheck(member.id)}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => setPopupContact(member)}
                      className="text-blue-500 underline"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pop-up details table */}
      {popupContact && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg p-5 max-w-md w-full relative">
            <button
              onClick={() => setPopupContact(null)}
              className="absolute top-2 right-2 font-bold text-gray-600"
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-2">
              {popupContact.prenom} {popupContact.nom}
            </h2>
            <p>📲 WhatsApp: {checkedContacts[popupContact.id] ? "Oui" : "Non"}</p>
            <p>🏙 Ville: {popupContact.ville || "—"}</p>
            <p>🙏 Besoin: {popupContact.besoin || "—"}</p>
            <p>📝 Infos supplémentaires: {popupContact.infos_supplementaires || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
