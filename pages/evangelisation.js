// pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EvangelisationPage() {
  const [contacts, setContacts] = useState([]);
  const [checkedContacts, setCheckedContacts] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [responsableCellule, setResponsableCellule] = useState("");

  // Charger les contacts et les cellules
  useEffect(() => {
    const fetchData = async () => {
      const { data: contactsData, error: contactsError } = await supabase
        .from("evangelisation")
        .select("*");

      const { data: cellulesData, error: cellulesError } = await supabase
        .from("cellules")
        .select("*");

      if (contactsError) console.error("Erreur chargement contacts:", contactsError.message);
      else setContacts(contactsData || []);

      if (cellulesError) console.error("Erreur chargement cellules:", cellulesError.message);
      else setCellules(cellulesData || []);
    };
    fetchData();
  }, []);

  // Mettre à jour le responsable de la cellule choisie
  useEffect(() => {
    if (selectedCellule) {
      const cellule = cellules.find((c) => c.id === selectedCellule);
      setResponsableCellule(cellule ? cellule.responsable : "");
    } else {
      setResponsableCellule("");
    }
  }, [selectedCellule, cellules]);

  // Gestion des cases à cocher
  const handleCheck = (id) => {
    setCheckedContacts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Envoi WhatsApp et enregistrement dans suivis
  const sendWhatsapp = async () => {
    const toSend = contacts.filter((c) => checkedContacts[c.id]);
    if (toSend.length === 0) {
      alert("Veuillez sélectionner au moins un contact.");
      return;
    }

    if (!selectedCellule) {
      alert("Veuillez choisir une cellule avant d’envoyer.");
      return;
    }

    const celluleChoisie = cellules.find((c) => c.id === selectedCellule);
    if (!celluleChoisie) {
      alert("Cellule introuvable.");
      return;
    }

    const message = encodeURIComponent(
      `Bonjour 👋 Je suis ${celluleChoisie.responsable} de la cellule ${celluleChoisie.nom}. Nous voulions prendre de vos nouvelles et vous inviter à nos prochaines rencontres 🙏.`
    );

    // Ouvrir WhatsApp avec le premier contact
    const firstPhone = toSend[0].telephone.replace(/\D/g, "");
    const whatsappLink = `https://wa.me/${firstPhone}?text=${message}`;
    window.open(whatsappLink, "_blank");

    // Enregistrer les suivis dans Supabase
    const now = new Date().toISOString();
    const suivisData = toSend.map((member) => ({
      prenom: member.prenom,
      nom: member.nom,
      telephone: member.telephone,
      is_whatsapp: true,
      ville: member.ville,
      besoin: member.besoin,
      infos_supplementaires: member.infos_supplementaires,
      cellule_id: celluleChoisie.id, // UUID correct
      responsable_cellule: celluleChoisie.responsable,
      date_suivi: now,
    }));

    const { error: insertError } = await supabase
      .from("suivis_des_evangelises")
      .insert(suivisData);

    if (insertError) {
      console.error("Erreur insertion suivis :", insertError);
      alert("Erreur lors de l’enregistrement dans la table suivis.");
      return;
    } else {
      console.log("✅ Suivis enregistrés avec succès !");
    }

    // Supprimer les contacts envoyés
    const { error: deleteError } = await supabase
      .from("evangelisation")
      .delete()
      .in("id", toSend.map((c) => c.id));

    if (deleteError) {
      console.error("Erreur suppression contacts :", deleteError);
    } else {
      console.log("Contacts supprimés de la table evangelisation");
    }

    // Mettre à jour l'affichage local
    setContacts((prev) => prev.filter((c) => !checkedContacts[c.id]));
    setCheckedContacts({});
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Évangélisation</h1>

      {/* Sélection cellule */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Choisir une cellule :</label>
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">-- Sélectionner --</option>
          {cellules.map((cellule) => (
            <option key={cellule.id} value={cellule.id}>
              {cellule.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des contacts */}
      {contacts.length === 0 ? (
        <p>Aucun contact à afficher.</p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center border p-2 rounded-lg">
              <input
                type="checkbox"
                checked={!!checkedContacts[contact.id]}
                onChange={() => handleCheck(contact.id)}
                className="mr-2"
              />
              <div>
                <p className="font-semibold">
                  {contact.prenom} {contact.nom}
                </p>
                <p className="text-sm text-gray-600">{contact.telephone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton d'envoi */}
      <button
        onClick={sendWhatsapp}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Envoyer par WhatsApp
      </button>
    </div>
  );
}

