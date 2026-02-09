"use client";

import { useState, useEffect } from "react";
import supabase from "../../../pages/lib/supabaseClient";
import SendEgliseLinkPopup from "../../../pages/components/SendEgliseLinkPopup";
import HeaderPages from "../../../pages/components/HeaderPages";


export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({ prenom: "", nom: "" });
  const [eglise, setEglise] = useState({ nom: "", branche: "" });
  const [canal, setCanal] = useState("whatsapp");
  const [invitations, setInvitations] = useState([]);

  // À remplacer par l'ID de l'église du superviseur connecté
  const SUPERVISEUR_EGLISE_ID = "00000000-0000-0000-0000-000000000000";

  // Charger les invitations existantes
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

        {/* Bouton d'envoi */}
        <SendEgliseLinkPopup
          label="Envoyer l'invitation"
          type={canal}
          superviseur={superviseur}
          eglise={eglise}
          superviseurEgliseId={SUPERVISEUR_EGLISE_ID}
          onSuccess={loadInvitations}
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
          <div
            key={inv.id}
            className="flex px-2 py-2 bg-white/10 rounded-lg mt-2"
          >
            <div className="flex-[2]">{inv.eglise_nom || "—"}</div>
            <div className="flex-[2]">{inv.eglise_branche || "—"}</div>
            <div className="flex-[2]">
              {inv.responsable_prenom} {inv.responsable_nom}
              <span className="ml-2 text-xs bg-black/30 px-2 py-1 rounded">
                {inv.statut}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
