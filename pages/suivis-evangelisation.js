// pages/suivis-evangelises.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function SuivisEvangelises() {
  const [contacts, setContacts] = useState([]);
  const [editedContacts, setEditedContacts] = useState({});
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setContacts(data || []);
    setLoading(false);
  };

  const handleChange = (id, field, value) => {
    setEditedContacts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));

    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleUpdate = async (id) => {
    const updated = editedContacts[id];
    if (!updated) return;

    setUpdating(true);

    const { error } = await supabase
      .from("suivis_des_evangelises")
      .update(updated)
      .eq("id", id);

    if (!error) {
      setEditedContacts((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }

    setUpdating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-600 p-6 text-white flex flex-col items-center">
      {/* Retour */}
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      {/* Logo */}
      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-4" />

      {/* Titre */}
      <h1 className="text-4xl font-bold mb-2 text-center">Suivis des Évangélisés</h1>
      <p className="text-center text-lg mb-6 text-blue-100">
        Mets à jour les informations et les suivis spirituels 🌿
      </p>

      {/* Table */}
      <div className="w-full max-w-6xl bg-white text-gray-900 rounded-lg shadow-lg overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Prénom</th>
              <th className="py-3 px-4 text-left">Nom</th>
              <th className="py-3 px-4 text-left">Téléphone</th>
              <th className="py-3 px-4 text-center">Statut du suivi</th>
              <th className="py-3 px-4 text-center">Commentaire</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  Chargement...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  Aucun contact pour le moment.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className={`border-b hover:bg-gray-100 ${
                    editedContacts[contact.id] ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="py-3 px-4">{contact.prenom}</td>
                  <td className="py-3 px-4">{contact.nom}</td>
                  <td className="py-3 px-4">{contact.telephone}</td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={contact.status_suivis_evangelise || ""}
                      onChange={(e) =>
                        handleChange(
                          contact.id,
                          "status_suivis_evangelise",
                          e.target.value
                        )
                      }
                      className="border rounded-md px-2 py-1 w-48 text-sm"
                    >
                      <option value="">-- Choisir statut --</option>
                      <option value="En cours">🕊 En cours</option>
                      <option value="Actif">🔥 Actif</option>
                      <option value="Veut venir à l’église">⛪ Veut venir à l’église</option>
                      <option value="Veut venir à la famille d’impact">
                        👨‍👩‍👧‍👦 Veut venir à la famille d’impact
                      </option>
                      <option value="Veut être visité">🏡 Veut être visité</option>
                      <option value="Ne souhaite pas continuer">
                        🚫 Ne souhaite pas continuer
                      </option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <textarea
                      value={contact.commentaire_evangelises || ""}
                      onChange={(e) =>
                        handleChange(
                          contact.id,
                          "commentaire_evangelises",
                          e.target.value
                        )
                      }
                      className="border rounded-md px-2 py-1 text-sm w-56 h-16 resize-none"
                      placeholder="Écris un commentaire..."
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleUpdate(contact.id)}
                      disabled={!editedContacts[contact.id] || updating}
                      className={`px-4 py-2 rounded-md text-white font-semibold ${
                        editedContacts[contact.id]
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {updating ? "⏳" : "💾 Mettre à jour"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
