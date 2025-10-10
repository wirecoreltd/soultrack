// pages/evangelisation.js
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Evangelisation() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [view, setView] = useState("table");

  // 🔹 Charger les données au montage
  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  async function fetchEvangelises() {
    const { data, error } = await supabase.from("evangelises").select("*");
    if (error) console.error("Erreur récupération évangélisés :", error);
    else setEvangelises(data || []);
  }

  async function fetchCellules() {
    const { data, error } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    if (error) console.error("Erreur récupération cellules :", error);
    else setCellules(data || []);
  }

  function toggleContactSelection(id) {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSendWhatsApp() {
    if (!selectedCellule) {
      alert("Sélectionne d’abord une cellule.");
      return;
    }

    const cellule = cellules.find((c) => c.id === selectedCellule);
    if (!cellule) {
      alert("Cellule introuvable.");
      return;
    }

    const contactsToSend = evangelises.filter((e) =>
      selectedContacts.includes(e.id)
    );

    if (contactsToSend.length === 0) {
      alert("Aucun contact sélectionné.");
      return;
    }

    // 🔹 Envoi vers suivis_des_evangelises
    const inserts = contactsToSend.map((contact) => ({
      prenom: contact.prenom,
      nom: contact.nom,
      telephone: contact.telephone,
      is_whatsapp: contact.is_whatsapp,
      ville: contact.ville,
      besoin: contact.besoin,
      infos_supplementaires: contact.infos_supplementaires,
      cellule_id: cellule.id,
      responsable_cellule: cellule.responsable,
    }));

    const { error: insertError } = await supabase
      .from("suivis_des_evangelises")
      .insert(inserts);

    if (insertError) {
      console.error("Erreur insertion suivis :", insertError);
      alert("Erreur lors de l’envoi vers la table suivis.");
      return;
    }

    // 🔹 Suppression de la table evangelises
    const { error: deleteError } = await supabase
      .from("evangelises")
      .delete()
      .in("id", selectedContacts);

    if (deleteError) {
      console.error("Erreur suppression :", deleteError);
      alert("Erreur lors de la suppression des contacts.");
      return;
    }

    // 🔹 Message WhatsApp automatique
    const baseUrl = "https://wa.me/";
    contactsToSend.forEach((contact) => {
      const message = encodeURIComponent(
        `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

👤 Nom : ${contact.prenom} ${contact.nom}
📱 Téléphone : ${contact.telephone}
🏙 Ville : ${contact.ville || "—"}
🙏 Besoin : ${contact.besoin || "—"}
📝 Infos supplémentaires : ${contact.infos_supplementaires || "—"}

Merci pour ton cœur ❤ et ton amour ✨`
      );

      window.open(`${baseUrl}${cellule.telephone}?text=${message}`, "_blank");
    });

    // 🔹 Nettoyage local
    setEvangelises((prev) =>
      prev.filter((e) => !selectedContacts.includes(e.id))
    );
    setSelectedContacts([]);
    alert("Contacts envoyés avec succès !");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Liste des Évangélisés
      </h1>

      {/* 🔹 Sélecteur de cellule */}
      <div className="flex justify-center mb-6">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border border-gray-400 rounded p-2 w-72 text-center"
        >
          <option value="">— Sélectionner une cellule —</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Bouton WhatsApp visible seulement si une cellule est sélectionnée */}
      {selectedCellule && (
        <div className="flex justify-center mb-6">
          <Button
            onClick={handleSendWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white px-6"
          >
            📤 Envoyer par WhatsApp
          </Button>
        </div>
      )}

      {/* 🔹 Boutons de vue */}
      <div className="flex justify-center gap-4 mb-4">
        <Button
          variant={view === "card" ? "default" : "outline"}
          onClick={() => setView("card")}
        >
          Vue carte
        </Button>
        <Button
          variant={view === "table" ? "default" : "outline"}
          onClick={() => setView("table")}
        >
          Vue tableau
        </Button>
      </div>

      {/* 🔹 Vue table */}
      {view === "table" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-center">
            <thead className="bg-gray-200">
              <tr>
                <th></th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>WhatsApp</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {evangelises.map((e) => (
                <tr key={e.id} className="border-b">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(e.id)}
                      onChange={() => toggleContactSelection(e.id)}
                    />
                  </td>
                  <td>{e.prenom}</td>
                  <td>{e.nom}</td>
                  <td>{e.telephone}</td>
                  <td>{e.is_whatsapp ? "Oui" : "Non"}</td>
                  <td className="text-left p-2">
                    <div className="text-sm leading-tight">
                      <strong>Ville :</strong> {e.ville || "—"} <br />
                      <strong>Besoin :</strong> {e.besoin || "—"} <br />
                      <strong>Infos :</strong> {e.infos_supplementaires || "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Vue card */}
      {view === "card" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evangelises.map((e) => (
            <Card
              key={e.id}
              className={`p-4 border ${
                selectedContacts.includes(e.id)
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(e.id)}
                    onChange={() => toggleContactSelection(e.id)}
                  />
                  <h3 className="text-lg font-bold">
                    {e.prenom} {e.nom}
                  </h3>
                </div>
                <p className="text-sm">
                  📞 {e.telephone} <br />
                  💬 WhatsApp : {e.is_whatsapp ? "Oui" : "Non"} <br />
                  🏙 Ville : {e.ville || "—"} <br />
                  🙏 Besoin : {e.besoin || "—"} <br />
                  📝 Infos : {e.infos_supplementaires || "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

