// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Evangelisation() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [selectedContacts, setSelectedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [view, setView] = useState("card"); // 'card' ou 'table'

  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    try {
      const { data, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEvangelises(data || []);
    } catch (err) {
      console.error("Erreur fetchEvangelises:", err.message);
      setEvangelises([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase.from("cellules").select("*");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  const handleToggleContact = (id) => {
    setSelectedContacts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sendWhatsapp = async () => {
    if (!selectedCellule) return alert("Veuillez sélectionner une cellule !");
    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule || !cellule.telephone) return alert("Cellule introuvable ou téléphone manquant.");

    const contactsToSend = evangelises.filter((e) => selectedContacts[e.id]);
    if (contactsToSend.length === 0) return alert("Veuillez cocher au moins un contact à envoyer.");

    for (const contact of contactsToSend) {
      const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${contact.prenom} ${contact.nom}
- 📱 Téléphone : ${contact.telephone || "—"}
- 🏙 Ville : ${contact.ville || "—"}
- 🙏 Besoin : ${contact.besoin || "—"}
- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

      const waUrl = `https://wa.me/${cellule.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(
        message
      )}`;
      window.open(waUrl, "_blank");

      // Déplacer le contact dans la table suivis_des_evangelises
      await supabase.from("suivis_des_evangelises").insert([
        {
          evangelise_id: contact.id,
          cellule_id: cellule.id,
          prenom: contact.prenom,
          nom: contact.nom,
          telephone: contact.telephone,
          ville: contact.ville,
          is_whatsapp: contact.is_whatsapp,
          besoin: contact.besoin,
          infos_supplementaires: contact.infos_supplementaires,
        },
      ]);

      // Supprimer de la liste evangelises
      await supabase.from("evangelises").delete().eq("id", contact.id);
    }

    // Mettre à jour l'affichage local
    setEvangelises((prev) => prev.filter((e) => !selectedContacts[e.id]));
    setSelectedContacts({});
    setSelectedCellule("");
  };

  const filteredEvangelises = evangelises;

  const getBorderColor = (evangelise) => {
    return evangelise.is_whatsapp ? "#34A853" : "#ccc";
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <h1 className="text-5xl font-handwriting text-white text-center mb-3">Évangélisation</h1>

      {/* Menu déroulant cellule */}
      <div className="mb-4 w-full max-w-md flex justify-center">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))}
        </select>
      </div>

      {/* Bouton envoyer WhatsApp */}
      {selectedCellule && Object.values(selectedContacts).some((v) => v) && (
        <button
          onClick={sendWhatsapp}
          className="mb-6 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
        >
          Envoyer WhatsApp
        </button>
      )}

      {/* Toggle Visuel */}
      <p className="self-end text-orange-500 cursor-pointer mb-4" onClick={() => setView(view === "card" ? "table" : "card")}>
        Visuel
      </p>

      {view === "card" ? (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvangelises.map((e) => (
            <div
              key={e.id}
              className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between border-t-4 relative"
              style={{ borderTopColor: getBorderColor(e), minHeight: "180px" }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-2 flex justify-between items-center">
                {e.prenom} {e.nom}
                <input
                  type="checkbox"
                  checked={!!selectedContacts[e.id]}
                  onChange={() => handleToggleContact(e.id)}
                  className="h-5 w-5"
                />
              </h2>

              <p
                className="mt-2 text-blue-500 underline cursor-pointer"
                onClick={() => setDetailsOpen((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
              >
                {detailsOpen[e.id] ? "Fermer détails" : "Détails"}
              </p>

              {detailsOpen[e.id] && (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p><strong>Téléphone:</strong> {e.telephone || "—"}</p>
                  <p><strong>WhatsApp:</strong> {e.is_whatsapp ? "Oui" : "Non"}</p>
                  <p><strong>Ville:</strong> {e.ville || "—"}</p>
                  <p><strong>Besoin:</strong> {e.besoin || "—"}</p>
                  <p><strong>Infos supplémentaires:</strong> {e.infos_supplementaires || "—"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Table
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Téléphone</th>
                <th className="py-2 px-4">WhatsApp</th>
                <th className="py-2 px-4">Ville</th>
                <th className="py-2 px-4">Besoin</th>
                <th className="py-2 px-4">Infos</th>
                <th className="py-2 px-4">Envoyer</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvangelises.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 px-4">{e.prenom}</td>
                  <td className="py-2 px-4">{e.nom}</td>
                  <td className="py-2 px-4">{e.telephone || "—"}</td>
                  <td className="py-2 px-4">{e.is_whatsapp ? "Oui" : "Non"}</td>
                  <td className="py-2 px-4">{e.ville || "—"}</td>
                  <td className="py-2 px-4">{e.besoin || "—"}</td>
                  <td className="py-2 px-4">{e.infos_supplementaires || "—"}</td>
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={!!selectedContacts[e.id]}
                      onChange={() => handleToggleContact(e.id)}
                    />
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
