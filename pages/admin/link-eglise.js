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

  // 🔹 Style bordure et bouton selon statut
  const getStatusStyle = (statut) => {
    switch (statut.toLowerCase()) {
      case "accepted":
        return { border: "border-l-4 border-green-500", button: null };
      case "refused":
        return { border: "border-l-4 border-red-500", button: "Renvoyer invitation" };
      case "pending":
        return { border: "border-l-4 border-gray-400", button: "Envoyer rappel" };
      default:
        return { border: "border-l-4 border-gray-300", button: null };
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        Envoyer une invitation pour relier une église
      </h4>

      {/* FORMULAIRE */}
      <div className="w-full max-w-5xl bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">

        {/* Responsable qui reçoit */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Église à superviser */}
        <div className="grid grid-cols-2 gap-4">
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

      {/* TITRE TABLE */}
      <h4 className="text-2xl font-bold mb-4 text-center w-full max-w-5xl">
        Liste des églises supervisées
      </h4>

      {/* TABLE */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-4 text-sm font-semibold uppercase border-b border-white/40 pb-2 text-left gap-2">
          <div>Église</div>
          <div>Branche</div>
          <div>Responsable</div>
          <div>Statut</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);

          return (
            <div
              key={inv.id}
              className={`grid grid-cols-4 gap-2 px-4 py-3 rounded-lg mt-2 bg-white/10 ${statusStyle.border} items-center`}
            >
              <div>{inv.eglise_nom}</div>
              <div>{inv.eglise_branche}</div>
              <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className="flex items-center justify-start">
                <span className="mr-2">{inv.statut}</span>
                {statusStyle.button && (
                  <button
                    className={`text-orange-500 font-semibold text-sm hover:opacity-80`}
                    onClick={() => alert(`${statusStyle.button} pour ${inv.responsable_prenom}`)}
                  >
                    {statusStyle.button}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
