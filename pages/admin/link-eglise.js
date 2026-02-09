"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import SendEgliseLinkPopup from "../components/SendEgliseLinkPopup";
import HeaderPages from "../components/HeaderPages";

// ⚠️ Remplace cet ID par l'ID réel de ton église superviseur
const SUPERVISEUR_EGLISE_ID = "5e0baaf8-8f86-4ba6-92fc-c4f361d77eae";

export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: ""
  });
  const [eglise, setEglise] = useState({ nom: "", branche: "" });
  const [canal, setCanal] = useState("whatsapp");
  const [invitations, setInvitations] = useState([]);

  // 🔹 Charger les invitations existantes pour ce superviseur
  const loadInvitations = async () => {
    const { data } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", SUPERVISEUR_EGLISE_ID)
      .order("created_at", { ascending: false });

    setInvitations(data || []);
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      <h1 className="text-4xl font-bold mb-4 text-center">Relier une Église</h1>
      <p className="text-center max-w-2xl mb-6">
        Ici vous pouvez envoyer des invitations pour relier les églises que vous supervisez.
        Les églises enfants ne voient aucune autre église sur la plateforme. Seul le superviseur peut envoyer l’invitation.
      </p>

      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4">
        {/* Responsable */}
        <div>
          <label className="font-semibold">Responsable Prénom</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={superviseur.prenom}
            onChange={(e) => setSuperviseur({ ...superviseur, prenom: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Responsable Nom</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={superviseur.nom}
            onChange={(e) => setSuperviseur({ ...superviseur, nom: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Email</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={superviseur.email}
            onChange={(e) => setSuperviseur({ ...superviseur, email: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Téléphone</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={superviseur.telephone}
            onChange={(e) => setSuperviseur({ ...superviseur, telephone: e.target.value })}
          />
        </div>

        {/* Église */}
        <div>
          <label className="font-semibold">Église</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.nom}
            onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Branche / Région</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.branche}
            onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
          />
        </div>

        {/* Canal d'envoi */}
        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          className="w-full border rounded-xl px-3 py-2"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        {/* Bouton principal */}
        <SendEgliseLinkPopup
          label="Envoyer l'invitation"
          type={canal}
          superviseur={superviseur}
          eglise={eglise}
          superviseurEgliseId={SUPERVISEUR_EGLISE_ID}
          onSuccess={loadInvitations} // 🔹 recharge la table après envoi
        />
      </div>

      {/* Table des invitations */}
      <div className="w-full max-w-5xl mt-10">
        <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400">
          <div className="flex-[2]">Église</div>
          <div className="flex-[2]">Branche / Région</div>
          <div className="flex-[2]">Responsable / Statut</div>
        </div>

        {invitations.map((inv) => (
          <div key={inv.id} className="flex px-2 py-2 bg-white/10 rounded-lg mt-2">
            <div className="flex-[2]">{inv.eglise_nom || "—"}</div>
            <div className="flex-[2]">{inv.eglise_branche || "—"}</div>
            <div className="flex-[2]">
              {inv.responsable_prenom} {inv.responsable_nom}
              <span className="ml-2 text-xs bg-black/30 px-2 py-1 rounded">{inv.statut}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
