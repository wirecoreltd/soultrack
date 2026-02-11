"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
import HeaderPages from "../../components/HeaderPages";

export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    eglise_id: null,
    branche_id: null,
    eglise_nom: "",
    branche_nom: ""
  });

  const [responsable, setResponsable] = useState({
    prenom: "",
    nom: ""
  });

  const [eglise, setEglise] = useState({
    nom: "",
    branche: ""
  });

  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);

  // 🔹 Charger superviseur connecté automatiquement
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          prenom,
          nom,
          eglise_id,
          branche_id,
          eglises ( nom ),
          branches ( nom )
        `)
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erreur superviseur:", error.message);
        return;
      }

      setSuperviseur({
        prenom: data.prenom,
        nom: data.nom,
        eglise_id: data.eglise_id,
        branche_id: data.branche_id,
        eglise_nom: data.eglises?.nom || "",
        branche_nom: data.branches?.nom || ""
      });
    };

    loadSuperviseur();
  }, []);

  // 🔹 Charger invitations du superviseur
  const loadInvitations = async () => {
    if (!superviseur.eglise_id) return;

    const { data, error } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", superviseur.eglise_id)
      .order("created_at", { ascending: false });

    if (!error) setInvitations(data || []);
  };

  useEffect(() => {
    loadInvitations();
  }, [superviseur.eglise_id]);

  // 🔹 Gestion bordure selon statut
  const getBorderClass = (statut) => {
    switch (statut.toLowerCase()) {
      case "accepté":
        return "border-l-4 border-green-500";
      case "refusé":
        return "border-l-4 border-red-500";
      case "pending":
      case "en attente":
        return "border-l-4 border-gray-400";
      default:
        return "border-l-4 border-gray-400";
    }
  };

  // 🔹 Actions boutons statut
  const handleAction = async (inv) => {
    if (inv.statut.toLowerCase() === "pending") {
      alert("Rappel envoyé à " + inv.responsable_prenom);
      // Ici tu peux ajouter ton code pour renvoyer le rappel
    } else if (inv.statut.toLowerCase() === "refusé") {
      alert("Invitation renvoyée à " + inv.responsable_prenom);
      // Ici tu peux ajouter ton code pour renvoyer l'invitation
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      <h1 className="text-4xl font-bold mb-6 text-center">Relier une Église</h1>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4">

        {/* Responsable qui reçoit */}
        <div>
          <label className="font-semibold">Prénom du responsable</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={responsable.prenom}
            onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Nom du responsable</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={responsable.nom}
            onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
          />
        </div>

        {/* Église à superviser */}
        <div>
          <label className="font-semibold">Nom de l'Église</label>
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

        {/* Mode d’envoi */}
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
        >
          <option value="">-- Sélectionnez le mode d’envoi --</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <SendEgliseLinkPopup
          label="Envoyer l'invitation"
          type={canal}
          superviseur={superviseur}
          responsable={responsable}
          eglise={eglise}
          onSuccess={loadInvitations}
        />
      </div>

      {/* TABLE */}
      <div className="w-full max-w-5xl mt-10">
        {/* Header */}
        <div className="hidden sm:flex text-sm font-semibold uppercase border-b border-white/40 pb-2">
          <div className="flex-[2]">Église</div>
          <div className="flex-[2]">Branche</div>
          <div className="flex-[2]">Responsable</div>
          <div className="flex-[2]">Statut</div>
        </div>

        {/* Rows */}
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className={`flex px-4 py-3 bg-white/10 rounded-lg mt-2 items-center ${getBorderClass(inv.statut)}`}
          >
            <div className="flex-[2]">{inv.eglise_nom}</div>
            <div className="flex-[2]">{inv.eglise_branche}</div>
            <div className="flex-[2]">{inv.responsable_prenom} {inv.responsable_nom}</div>
            <div className="flex-[2] flex items-center gap-2">
              <span>{inv.statut}</span>
              {(inv.statut.toLowerCase() === "pending" || inv.statut.toLowerCase() === "en attente") && (
                <button
                  onClick={() => handleAction(inv)}
                  className="px-3 py-1 bg-gray-500 text-white rounded-xl text-xs"
                >
                  Envoyer un rappel
                </button>
              )}
              {inv.statut.toLowerCase() === "refusé" && (
                <button
                  onClick={() => handleAction(inv)}
                  className="px-3 py-1 bg-red-500 text-white rounded-xl text-xs"
                >
                  Renvoyer l'invitation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
