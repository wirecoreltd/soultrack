// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [members, setMembers] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedContacts, setSelectedContacts] = useState({});

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("membres")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error(err);
      setMembers([]);
    }
  };

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckbox = (id) => {
    setSelectedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsapp = () => {
    const contactsToSend = members.filter((m) => selectedContacts[m.id]);
    contactsToSend.forEach((member) => {
      const message = `👋 Salut Charlotte Bavajee,

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${member.prenom} ${member.nom}
- 📱 Téléphone : ${member.telephone || "—"}
- 📲 WhatsApp: Oui
- 🏙 Ville : ${member.ville || "—"}
- 🙏 Besoin : ${member.besoin || "—"}
- 📝 Infos supplémentaires : ${member.infos_supplementaires || "—"}

Merci pour ton cœur ❤ et son amour ✨`;
      const waUrl = `https://wa.me/${member.telephone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-700 to-blue-300">
      <h1 className="text-5xl font-bold text-white mb-6">Évangélisation</h1>

      {/* Bouton WhatsApp si au moins un contact sélectionné */}
      {Object.values(selectedContacts).some((v) => v) && (
        <button
          onClick={sendWhatsapp}
          className="mb-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md"
        >
          Envoyer WhatsApp
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
        {members.map((member) => (
          <div
            key={member.id}
            className={`bg-white rounded-xl shadow-md transition-all duration-300 cursor-pointer relative`}
            style={{
              minHeight: detailsOpen[member.id] ? "300px" : "150px",
              padding: "16px",
            }}
          >
            <h2 className="text-lg font-bold mb-2">{member.prenom} {member.nom}</h2>
            <p className="text-sm mb-2">📱 {member.telephone || "—"}</p>

            {/* Case à cocher pour envoyer par WhatsApp */}
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedContacts[member.id] || false}
                onChange={() => handleCheckbox(member.id)}
                className="mr-2"
              />
              Envoyer par WhatsApp
            </label>

            <button
              onClick={() => toggleDetails(member.id)}
              className="text-blue-500 underline mb-2"
            >
              {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
            </button>

            {/* Détails */}
            {detailsOpen[member.id] && (
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <p>📲 WhatsApp: Oui/Non</p>
                <p>🏙 Ville: {member.ville || "—"}</p>
                <p>🙏 Besoin: {member.besoin || "—"}</p>
                <p>📝 Infos supplémentaires: {member.infos_supplementaires || "—"}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
