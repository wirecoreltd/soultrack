// pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [contacts, setContacts] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card");

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .order("date_suivi", { ascending: false });
      if (!error) setContacts(data || []);
    } catch (err) {
      console.error("Erreur fetchContacts:", err.message);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase.from("cellules").select("*");
      if (!error) setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
    }
  };

  const toggleDetail = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheck = (id) => {
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsapp = () => {
    const cellule = cellules.find((c) => String(c.id) === String(selectedCellule));
    if (!cellule) return alert("Cellule introuvable.");

    const contactsToSend = contacts.filter((c) => checkedContacts[c.id]);
    if (contactsToSend.length === 0) return alert("Aucun contact sélectionné.");

    contactsToSend.forEach((c) => {
      const phone = cellule.telephone.replace(/\D/g, "");
      const message = `Salut ${cellule.responsable},

Nom: ${c.nom}
Prénom: ${c.prenom}
📱 Téléphone: ${c.telephone || "—"}
WhatsApp: ${c.is_whatsapp ? "Oui" : "Non"}
Ville: ${c.ville || "—"}
Besoin: ${c.besoin || "—"}
Infos supplémentaires: ${c.infos_supplementaires || "—"}`;

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-6">
        Évangélisation
      </h1>

      {/* MENU CELLULE + BOUTON WHATSAPP */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-md mb-6">
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
        <button
          onClick={sendWhatsapp}
          className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold w-full md:w-auto"
        >
          Envoyer WhatsApp
        </button>
      </div>

      {/* TOGGLE CARD / TABLE */}
      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        Voir en {view === "card" ? "Table" : "Card"}
      </p>

      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <p className="font-bold text-gray-800">{c.prenom} {c.nom}</p>
              <p>📱 {c.telephone || "—"}</p>
              <button
                className="text-blue-500 underline mt-2"
                onClick={() => toggleDetail(c.id)}
              >
                {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
              </button>

              {detailsOpen[c.id] && (
                <div className="mt-2 text-gray-700">
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
      ) : (
        <table className="min-w-full bg-white rounded-xl overflow-x-auto">
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
              <React.Fragment key={c.id}>
                <tr className="border-b">
                  <td className="py-2 px-4">{c.prenom}</td>
                  <td className="py-2 px-4">{c.nom}</td>
                  <td className="py-2 px-4">{c.telephone || "—"}</td>
                  <td className="py-2 px-4">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => toggleDetail(c.id)}
                    >
                      {detailsOpen[c.id] ? "Fermer détails" : "Détails"}
                    </button>
                  </td>
                </tr>
                {detailsOpen[c.id] && (
                  <tr>
                    <td colSpan={4} className="bg-gray-50 p-4 text-gray-700">
                      <p>WhatsApp: {c.is_whatsapp ? "Oui" : "Non"} | Ville: {c.ville || "—"}</p>
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
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
