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
      const {
        data: { user }
      } = await supabase.auth.getUser();

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

  // 🔹 Charger invitations du superviseur uniquement pour ses églises
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

  // 🔹 Renvoyer invitation ou rappel avec confirmation
  const handleResend = async (invitation) => {
    const actionText =
      invitation.statut === "refusé" ? "renvoyer cette invitation" : "envoyer un rappel";

    const confirmed = window.confirm(
      `Voulez-vous vraiment ${actionText} pour ${invitation.responsable_prenom} ${invitation.responsable_nom} ?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("eglise_supervisions")
        .update({ statut: "pending" })
        .eq("id", invitation.id);

      if (error) throw error;

      alert("Action effectuée avec succès !");
      loadInvitations();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'action.");
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      <h4 className="text-2xl font-semibold text-white text-center mt-6 mb-3">
        Envoyer ne inviation pour relier une eglise    
      </h4> 
  
      {/* FORMULAIRE */}
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4">

        {/* Responsable qui reçoit */}
        <div>
          <label className="font-semibold">Prénom du responsable</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={responsable.prenom}
            onChange={(e) =>
              setResponsable({ ...responsable, prenom: e.target.value })
            }
          />
        </div>

        <div>
          <label className="font-semibold">Nom du responsable</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={responsable.nom}
            onChange={(e) =>
              setResponsable({ ...responsable, nom: e.target.value })
            }
          />
        </div>

        {/* Église à superviser */}
        <div>
          <label className="font-semibold">Nom de l'Église</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.nom}
            onChange={(e) =>
              setEglise({ ...eglise, nom: e.target.value })
            }
          />
        </div>

        <div>
          <label className="font-semibold">Branche / Région</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.branche}
            onChange={(e) =>
              setEglise({ ...eglise, branche: e.target.value })
            }
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

        <h4 className="text-2xl font-semibold text-white mt-14 mb-2 text-center">
          Liste des Églises Supervisées
        </h4>

      {/* TABLE DES INVITATIONS */}
      <div className="w-full max-w-5xl mt-10">
        <div className="hidden sm:flex text-sm font-semibold uppercase border-b border-white/40 pb-2">
          <div className="flex-[2]">Église</div>
          <div className="flex-[2]">Branche</div>
          <div className="flex-[2]">Responsable</div>
          <div className="flex-[2]">Statut</div>
        </div>

        {invitations.map((inv) => {
          let borderColor = "border-gray-400";
          let actionButton = null;

          if (inv.statut === "accepté") borderColor = "border-green-500";
          if (inv.statut === "refusé") {
            borderColor = "border-red-500";
            actionButton = (
              <button
                onClick={() => handleResend(inv)}
                className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Renvoyer invitation
              </button>
            );
          }
          if (inv.statut === "pending") {
            borderColor = "border-gray-400";
            actionButton = (
              <button
                onClick={() => handleResend(inv)}
                className="ml-4 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
              >
                Envoyer rappel
              </button>
            );
          }

          return (
            <div
              key={inv.id}
              className={`flex px-4 py-3 bg-white/10 rounded-lg mt-2 border-l-4 ${borderColor}`}
            >
              <div className="flex-[2]">{inv.eglise_nom}</div>
              <div className="flex-[2]">{inv.eglise_branche}</div>
              <div className="flex-[2]">{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className="flex-[2] flex items-center">
                <span className="ml-0 text-xs bg-black/40 px-2 py-1 rounded">
                  {inv.statut}
                </span>
                {actionButton}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
