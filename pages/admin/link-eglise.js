"use client";

import { useState } from "react";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
import HeaderPages from "../../components/HeaderPages";

export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({ prenom: "", nom: "" });
  const [eglise, setEglise] = useState({ nom: "", branche: "" });
  const [canal, setCanal] = useState("whatsapp"); // "whatsapp" | "email"

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />
      <h1 className="text-4xl font-bold mb-4 text-center">Relier une Église</h1>
      <p className="text-center max-w-2xl mb-6">
        Ici vous pouvez envoyer des invitations pour relier les églises que vous supervisez. 
        Les églises enfants ne voient aucune autre église sur la plateforme. 
        Seul le superviseur peut envoyer l’invitation.
      </p>

      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4">
        {/* Champs à saisir */}
        <div>
          <label className="block font-semibold mb-1">📖 Responsable :</label>
          <input
            type="text"
            placeholder="Prénom Nom"
            value={`${superviseur.prenom} ${superviseur.nom}`}
            onChange={(e) =>
              setSuperviseur({ ...superviseur, nom: e.target.value }) // simple exemple
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">⛪ Église :</label>
          <input
            type="text"
            placeholder="Nom de l'Église"
            value={eglise.nom}
            onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">🌍 Branche / Région :</label>
          <input
            type="text"
            placeholder="Branche / Région"
            value={eglise.branche}
            onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        {/* Choix du canal */}
        <div>
          <label className="block font-semibold mb-1">Envoyer par :</label>
          <select
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>

        {/* Bouton principal */}
        <SendEgliseLinkPopup
          label="Envoyer l'invitation"
          type={canal} // popup saura si c'est WhatsApp ou Email
          superviseur={superviseur}
          eglise={eglise}
        />
      </div>
    </div>
  );
}
