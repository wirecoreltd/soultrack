"use client";

import { useState } from "react";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function LinkEglise() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <LinkEgliseContent />
    </ProtectedRoute>
  );
}

function LinkEgliseContent() {
  const [responsable, setResponsable] = useState("");
  const [eglise, setEglise] = useState("");
  const [branche, setBranche] = useState("");

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />
      <h1 className="text-4xl font-bold mb-6 text-center">Relier une Église</h1>

      <p className="text-center max-w-2xl mb-6">
        Ici vous pouvez envoyer des invitations pour relier les églises que vous supervisez. 
        Les églises enfants ne voient aucune autre église sur la plateforme. 
        Seul le superviseur peut envoyer l’invitation.
      </p>

      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 flex flex-col gap-4">
        {/* Champs à saisir */}
        <input
          type="text"
          placeholder="Responsable : Prénom Nom"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Église : Nom de l'église"
          value={eglise}
          onChange={(e) => setEglise(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Branche / Région"
          value={branche}
          onChange={(e) => setBranche(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* Bouton pour envoyer l'invitation */}
        <SendEgliseLinkPopup
          label="Envoyer l'invitation"
          type="relier_eglise"
          buttonColor="from-[#09203F] to-[#537895]"
          superviseur={{ prenom: responsable.split(" ")[0] || "", nom: responsable.split(" ")[1] || "" }}
          eglise={{ nom: eglise }}
          branche={branche}
        />
      </div>
    </div>
  );
}
