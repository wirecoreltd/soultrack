// pages/evangelisation.js
"use client";
import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("date_suivi", { ascending: false });
    if (!error) setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("*");
    if (!error) setCellules(data || []);
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
    if (!cellule) return alert("Cellule introuvable.");

    const contactsToSend = contacts.filter(
      (c) => checkedContacts[c.id] && c.telephone
    );

    if (contactsToSend.length === 0) return alert("Cochez au moins un contact avec téléphone.");

    contactsToSend.forEach((contact) => {
      const waUrl = `https://wa.me/${cellule.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `👋 Salut ${cellule.responsable},\n\n🙏 Dieu nous a envoyé une nouvelle âme à suivre.\nVoici ses infos :\n\n- 👤 Nom : ${contact.nom} ${contact.prenom}\n- 📱 Téléphone : ${contact.telephone || "—"}\n- 💬 WhatsApp: ${contact.is_whatsapp ? "Oui" : "Non"}\n- 🏙 Ville : ${contact.ville || "—"}\n- 🙏 Besoin : ${contact.besoin || "—"}\n- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}\n\nMerci pour ton cœur ❤ et son amour ✨`
      )}`;
      window.open(waUrl, "_blank");
    });
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gradient-to-r from-indigo-700 to-cyan-400">
      <h1 className="text-4xl text-white mb-4 font-bold">Évangélisation</h1>

      {/* Menu cellule */}
      <div className="mb-4 w-full max-w-md flex flex-col md:flex-row gap-2">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border px-3 py-2 rounded-md w-full md:w-2/3"
        >
          <option value="">-- Sélectionner une cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>
        {selectedCellule && (
          <button
            onClick={sendWhatsapp}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md md:w-1/3"
          >
            Envoyer par WhatsApp
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {contacts.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
              detailsOpen[c.id] ? "h-auto p-4" : "h-40 p-6 flex flex-col justify-center"
            }`}
          >
            <p className="font-semibold text-lg">{c.prenom} {c.nom}</p>
            <p className="text-gray-700">📱 {c.telephone || "—"}</p>
            <button
              onClick={() => toggleDetails(c.id)}
              className="mt-2 text-blue-500 hover:underline"
            >
              {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
            </button>

            {detailsOpen[c.id] && (
              <div className="mt-2 text-gray-800 text-sm space-y-1">
                <p>Nom : {c.nom}</p>
                <p>Prénom : {c.prenom}</p>
                <p>📱 {c.telephone || "—"}</p>
                <p>💬 WhatsApp: {c.is_whatsapp ? "Oui" : "Non"}</p>
                <p>🏙 Ville : {c.ville || "—"}</p>
                <p>🙏 Besoin : {c.besoin || "—"}</p>
                <p>📝 Infos supplémentaires : {c.infos_supplementaires || "—"}</p>
                <label className="flex items-center space-x-2 mt-1">
                  <input
                    type="checkbox"
                    checked={checkedContacts[c.id] || false}
                    onChange={() => toggleCheck(c.id)}
                  />
                  <span>Envoyer par WhatsApp</span>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
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
                <td className="py-2 px-4">
                  <button
                    onClick={() => toggleDetails(c.id)}
                    className="text-blue-500 hover:underline mb-2"
                  >
                    {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                  </button>
                  {detailsOpen[c.id] && (
                    <div className="text-center text-gray-800 text-sm space-y-1">
                      <p>📲 WhatsApp: {c.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>🏙 Ville : {c.ville || "—"}</p>
                      <p>🙏 Besoin : {c.besoin || "—"}</p>
                      <p>📝 Infos supplémentaires : {c.infos_supplementaires || "—"}</p>
                      <label className="flex justify-center items-center space-x-2 mt-1">
                        <input
                          type="checkbox"
                          checked={checkedContacts[c.id] || false}
                          onChange={() => toggleCheck(c.id)}
                        />
                        <span>Envoyer par WhatsApp</span>
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
