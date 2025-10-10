// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ListEvangelises() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [selectedContacts, setSelectedContacts] = useState({});

  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    try {
      const { data, error } = await supabase.from("evangelises").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setEvangelises(data || []);
    } catch (err) {
      console.error("Erreur fetch evangelises:", err.message);
      setEvangelises([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase.from("cellules").select("*");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetch cellules:", err.message);
      setCellules([]);
    }
  };

  const toggleSelectContact = (id) => {
    setSelectedContacts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsApp = async () => {
    if (!selectedCellule) return alert("Sélectionnez une cellule !");
    const cellule = cellules.find(c => String(c.id) === String(selectedCellule));
    if (!cellule) return alert("Cellule introuvable.");
    if (!cellule.telephone) return alert("Numéro de téléphone de la cellule introuvable.");

    const contactsToSend = evangelises.filter(e => selectedContacts[e.id]);
    if (contactsToSend.length === 0) return alert("Sélectionnez au moins un contact à envoyer.");

    for (let contact of contactsToSend) {
      const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${contact.prenom} ${contact.nom}
- 📱 Téléphone : ${contact.telephone || "—"}
- 🏙 Ville : ${contact.ville || "—"}
- 🙏 Besoin : ${contact.besoin || "—"}
- 📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}
- 💬 Comment est-il venu ? : ${contact.comment || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

      const waUrl = `https://wa.me/${cellule.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      // déplacer vers suivis_des_evangelises
      try {
        await supabase.from("suivis_des_evangelises").insert([{
          prenom: contact.prenom,
          nom: contact.nom,
          telephone: contact.telephone,
          is_whatsapp: contact.is_whatsapp,
          ville: contact.ville,
          besoin: contact.besoin,
          infos_supplementaires: contact.infos_supplementaires,
          comment: contact.comment,
          cellule_id: cellule.id,
          responsable_cellule: cellule.responsable
        }]);
        await supabase.from("evangelises").delete().eq("id", contact.id);
      } catch (err) {
        console.error("Erreur déplacement contact:", err.message);
      }
    }

    // rafraîchir la liste
    fetchEvangelises();
    setSelectedContacts({});
    alert("Contacts envoyés !");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-indigo-200 to-indigo-50 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4">Évangélisés</h1>

      {/* Filtre cellule */}
      <div className="mb-4 w-full max-w-md flex justify-center">
        <select
          className="border px-4 py-2 rounded-lg w-full text-center"
          value={selectedCellule}
          onChange={e => setSelectedCellule(e.target.value)}
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map(c => (
            <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>
          ))}
        </select>
      </div>

      {/* Bouton WhatsApp */}
      <button
        className="mb-6 px-6 py-2 bg-green-600 text-white rounded-lg"
        onClick={sendWhatsApp}
        disabled={!selectedCellule || Object.values(selectedContacts).every(v => !v)}
      >
        Envoyer WhatsApp
      </button>

      {/* Liste des contacts */}
      <div className="w-full max-w-4xl">
        {evangelises.length === 0 ? (
          <p>Aucune personne évangélisée enregistrée pour le moment.</p>
        ) : (
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4">Sélection</th>
                <th className="py-2 px-4">Prénom</th>
                <th className="py-2 px-4">Nom</th>
                <th className="py-2 px-4">Téléphone</th>
                <th className="py-2 px-4">WhatsApp</th>
                <th className="py-2 px-4">Ville</th>
                <th className="py-2 px-4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {evangelises.map(contact => (
                <tr key={contact.id} className="border-b">
                  <td className="py-2 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!selectedContacts[contact.id]}
                      onChange={() => toggleSelectContact(contact.id)}
                    />
                  </td>
                  <td className="py-2 px-4">{contact.prenom}</td>
                  <td className="py-2 px-4">{contact.nom}</td>
                  <td className="py-2 px-4">{contact.telephone || "—"}</td>
                  <td className="py-2 px-4">{contact.is_whatsapp ? "Oui" : "Non"}</td>
                  <td className="py-2 px-4">{contact.ville || "—"}</td>
                  <td className="py-2 px-4">
                    <details>
                      <summary className="cursor-pointer text-blue-600">Voir détails</summary>
                      <p>Besoin: {contact.besoin || "—"}</p>
                      <p>Infos supplémentaires: {contact.infos_supplementaires || "—"}</p>
                      <p>Comment est-il venu ? {contact.comment || "—"}</p>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

