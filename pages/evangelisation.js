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
    if (!selectedCellule) return alert("Sélectionne une cellule !");
    const cellule = cellules.find((c) => c.id === parseInt(selectedCellule));
    if (!cellule) return alert("Cellule introuvable !");

    const toSend = contacts.filter((c) => checkedContacts[c.id]);

    toSend.forEach((member) => {
      const phone = cellule.telephone.replace(/\D/g, "");
      const message = `👋 Salut ${cellule.responsable},\n\n🙏 Dieu nous a envoyé une nouvelle âme à suivre.\nVoici ses infos :\n\n- 👤 Nom : ${member.prenom} ${member.nom}\n- 📱 Téléphone : ${member.telephone || "—"}\n- 📲 WhatsApp: ${checkedContacts[member.id] ? "Oui" : "Non"}\n- 🏙 Ville : ${member.ville || "—"}\n- 🙏 Besoin: ${member.besoin || "—"}\n- 📝 Infos supplémentaires: ${member.infos_supplementaires || "—"}\n\nMerci pour ton cœur ❤ et son amour ✨`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-blue-800 to-cyan-400">
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>
      <Image src="/soul.logo.png" alt="Logo" width={80} height={80} className="mb-3" />
      <h1 className="text-5xl font-handwriting text-white text-center mb-2">
        Évangélisation
      </h1>
      <p className="text-center text-white text-lg mb-4 font-handwriting-light">
        Chaque personne a une valeur infinie...
      </p>

      {/* Menu déroulant cellules */}
      <div className="mb-4 w-full max-w-md flex flex-col sm:flex-row gap-2">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
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
            className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg"
          >
            Envoyer par WhatsApp
          </button>
        )}
      </div>

      {/* Toggle card/table */}
      <p
        className="text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        Visuel
      </p>

      {/* --- CARDS VIEW --- */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-5xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div
                key={member.id}
                className={`bg-white rounded-lg shadow-md p-3 flex flex-col items-center transition-all duration-500 ease-in-out cursor-pointer overflow-hidden w-full max-w-xs mx-auto`}
              >
                <div className="flex flex-col items-center">
                  <h2 className="font-bold text-gray-800 text-base sm:text-lg mb-1 text-center">
                    {member.prenom} {member.nom}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-1 text-center">
                    📱 {member.telephone || "—"}
                  </p>
                  <label className="flex items-center gap-2 text-sm mb-1">
                    <input
                      type="checkbox"
                      checked={checkedContacts[member.id] || false}
                      onChange={() => handleCheck(member.id)}
                    />
                    WhatsApp
                  </label>
                </div>

                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-blue-500 underline mb-1"
                >
                  {isOpen ? "Fermer" : "Détails"}
                </button>

                {/* Section détails centrée et compacte */}
                <div
                  className={`text-sm text-gray-700 mt-1 w-full text-center transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-96" : "max-h-0"
                  } overflow-hidden`}
                >
                  {isOpen && (
                    <>
                      <p>📲 WhatsApp: {checkedContacts[member.id] ? "Oui" : "Non"}</p>                      
                      <p>🏙 Ville: {member.ville || "—"}</p>
                      <p>🙏 Besoin: {member.besoin || "—"}</p>
                      <p>📝 Infos supplémentaires: {member.infos_supplementaires || "—"}</p>
                    </>
                  )}
                </div>
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
          <div className="bg-white rounded-lg p-5 max-w-md w-full relative text-center transition-all duration-500 ease-in-out">
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
            <p>📱 Téléphone: {popupContact.telephone || "—"}</p>
            <p>🏙 Ville: {popupContact.ville || "—"}</p>
            <p>🙏 Besoin: {popupContact.besoin || "—"}</p>
            <p>📝 Infos supplémentaires: {popupContact.infos_supplementaires || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
