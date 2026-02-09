"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
import HeaderPages from "../../components/HeaderPages";

export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({ prenom: "", nom: "" });
  const [eglise, setEglise] = useState({ nom: "", branche: "" });
  const [canal, setCanal] = useState("whatsapp");
  const [invitations, setInvitations] = useState([]);
  const [superviseurEgliseId, setSuperviseurEgliseId] = useState(null);

  // Charger l'église du superviseur connecté
  useEffect(() => {
    const fetchSuperviseurEglise = async () => {
      const user = supabase.auth.user();
      if (!user) return;

      const { data, error } = await supabase
        .from("eglises")
        .select("id")
        .eq("responsable_id", user.id) // adapter selon ton schéma utilisateur → église
        .single();

      if (error) {
        console.error("Erreur récupération église superviseur :", error);
        return;
      }

      setSuperviseurEgliseId(data.id);
      loadInvitations(data.id);
    };

    fetchSuperviseurEglise();
  }, []);

  // Charger les invitations existantes
  const loadInvitations = async (egliseId = superviseurEgliseId) => {
    if (!egliseId) return;

    const { data, error } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", egliseId)
      .order("created_at", { ascending: false });

    if (error) console.error("Erreur load invitations :", error);
    else setInvitations(data || []);
  };

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

        {/* Responsable */}
        <div>
          <label className="block font-semibold mb-1">Prénom</label>
          <input
            type="text"
            placeholder="Prénom"
            value={superviseur.prenom}
            onChange={(e) => setSuperviseur({ ...superviseur, prenom: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Nom</label>
          <input
            type="text"
            placeholder="Nom"
            value={superviseur.nom}
            onChange={(e) => setSuperviseur({ ...superviseur, nom: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        {/* Église */}
        <div>
          <label className="block font-semibold mb-1">Église</label>
          <input
            type="text"
            placeholder="Nom de l'Église"
            value={eglise.nom}
            onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Branche / Région</label>
          <input
            type="text"
            placeholder="Branche / Région"
            value={eglise.branche}
            onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2"
          />
        </div>

        {/* Canal d'envoi */}
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

        {/* Bouton */}
        {superviseurEgliseId && (
          <SendEgliseLinkPopup
            label="Envoyer l'invitation"
            type={canal}
            superviseur={superviseur}
            eglise={eglise}
            superviseurEgliseId={superviseurEgliseId}
            onSuccess={() => loadInvitations(superviseurEgliseId)}
          />
        )}

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
