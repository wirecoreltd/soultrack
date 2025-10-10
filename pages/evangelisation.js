// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
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
      .select("*")
      .order("ville");
    if (error) console.error(error);
    else setCellules(data || []);
  };

  const toggleCheck = (id) => {
    setCheckedContacts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sendWhatsApp = async () => {
    if (!selectedCellule) return;
    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule) return;

    const contactsToSend = contacts.filter((c) => checkedContacts[c.id]);
    contactsToSend.forEach((c) => {
      const waUrl = `https://wa.me/${cellule.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${c.prenom} ${c.nom}
- 📱 Téléphone : ${c.telephone || "—"}
- 📲 WhatsApp : ${c.is_whatsapp ? "Oui" : "Non"}
- 🏙 Ville : ${c.ville || "—"}
- 🙏 Besoin : ${c.besoin || "—"}
- 📝 Infos supplémentaires : ${c.infos_supplementaires || "—"}

Merci pour ton cœur ❤ et son amour ✨`
      )}`;
      window.open(waUrl, "_blank");
    });

    // Optionnel: décocher après envoi
    setCheckedContacts({});
  };

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-sky-300 p-4">
      <h1 className="text-4xl text-white font-bold text-center mb-4">Évangélisation</h1>

      {/* Menu déroulant cellule */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            onClick={sendWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            Envoyer WhatsApp
          </button>
        )}

        <button
          className="text-white underline"
          onClick={() => setView(view === "card" ? "table" : "card")}
        >
          Voir {view === "card" ? "Table" : "Cards"}
        </button>
      </div>

      {/* Cards */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl shadow-md p-4 w-64 transition-all ${
                detailsOpen[c.id] ? "h-auto" : "aspect-square"
              }`}
            >
              <p className="font-semibold text-lg">{c.prenom} {c.nom}</p>
              <p>📱 {c.telephone || "—"}</p>
              <button
                className="text-blue-500 underline mt-2"
                onClick={() => toggleDetails(c.id)}
              >
                {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[c.id] && (
                <div className="mt-2 space-y-1">
                  <p>📲 WhatsApp: {c.is_whatsapp ? "Oui" : "Non"}</p>
                  <p>🏙 Ville: {c.ville || "—"}</p>
                  <p>🙏 Besoin: {c.besoin || "—"}</p>
                  <p>📝 Infos supplémentaires: {c.infos_supplementaires || "—"}</p>
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
      ) : (
        // Table
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl text-center">
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
                      className="text-blue-500 underline"
                      onClick={() => toggleDetails(c.id)}
                    >
                      {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[c.id] && (
                      <div className="mt-2 text-left space-y-1">
                        <p>📲 WhatsApp: {c.is_whatsapp ? "Oui" : "Non"}</p>
                        <p>🏙 Ville: {c.ville || "—"}</p>
                        <p>🙏 Besoin: {c.besoin || "—"}</p>
                        <p>📝 Infos supplémentaires: {c.infos_supplementaires || "—"}</p>
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
