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

  // 🔹 Fonction pour obtenir le style de la bordure et le bouton selon statut
  const getStatusStyle = (statut) => {
    switch (statut.toLowerCase()) {
      case "accepted":
        return { border: "border-l-4 border-green-500", bg: "bg-green-100", button: null };
      case "refused":
        return { border: "border-l-4 border-red-500", bg: "bg-red-100", button: "Renvoyer invitation" };
      case "pending":
        return { border: "border-l-4 border-gray-500", bg: "bg-orange-100", button: "Envoyer rappel" };
      default:
        return { border: "border-l-4 border-gray-300", bg: "bg-gray-100", button: null };
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      <h1 className="text-4xl font-bold mb-6 text-center">
        Relier une Église
      </h1>

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

      {/* TABLE */}
      <div className="w-full max-w-5xl mt-10">
        <div className="flex text-sm font-semibold uppercase border-b border-white/40 pb-2">
          <div className="flex-[2]">Église</div>
          <div className="flex-[2]">Branche</div>
          <div className="flex-[2]">Responsable</div>
          <div className="flex-[2]">Statut</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);

          return (
            <div
              key={inv.id}
              className={`flex px-4 py-3 rounded-lg mt-2 bg-white/10 ${statusStyle.bg} ${statusStyle.border}`}
            >
              <div className="flex-[2]">{inv.eglise_nom}</div>
              <div className="flex-[2]">{inv.eglise_branche}</div>
              <div className="flex-[2]">{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className="flex-[2] flex items-center justify-between">
                <span>{inv.statut}</span>
                {statusStyle.button && (
                  <button
                    className="ml-2 px-3 py-1 rounded bg-white text-black text-sm font-semibold hover:opacity-80"
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
