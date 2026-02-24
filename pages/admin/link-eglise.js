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

  // 🔹 Charger superviseur connecté
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

      if (!error) {
        setSuperviseur({
          prenom: data.prenom,
          nom: data.nom,
          eglise_id: data.eglise_id,
          branche_id: data.branche_id,
          eglise_nom: data.eglises?.nom || "",
          branche_nom: data.branches?.nom || ""
        });
      }
    };

    loadSuperviseur();
  }, []);

  // 🔹 Charger invitations
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

  // 🔹 Style selon statut
  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee":
        return { border: "border-l-4 border-green-600", button: null };
      case "refusee":
        return { border: "border-l-4 border-red-600", button: "Renvoyer invitation" };
      case "pending":
        return { border: "border-l-4 border-gray-400", button: "Envoyer rappel" };
      default:
        return { border: "border-l-4 border-gray-300", button: null };
    }
  };

  // 🔹 Regrouper les invitations par superviseur d'église
  const groupBySuperviseur = (invitations) => {
    const map = {};

    invitations.forEach(inv => {
      const key = inv.superviseur_eglise_id || inv.id;

      if (!map[key]) {
        map[key] = { parent: inv, enfants: [] };
      }

      if (inv.id !== map[key].parent.id) {
        map[key].enfants.push(inv);
      }
    });

    return Object.values(map);
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* TITRE FORMULAIRE */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        Envoyer une invitation pour relier une église
      </h4>

      {/* FORMULAIRE (vertical) */}
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">
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

      <div className="h-10" />

      {/* TITRE TABLE */}
      <h4 className="text-2xl font-bold mt-2 mb-10 text-center w-full max-w-5xl text-amber-300">
        Liste des églises supervisées
      </h4>

      {/* TABLE ALIGNÉE PARFAITEMENT */}
      <div className="w-full max-w-5xl">
        {groupBySuperviseur(invitations).map(group => (
          <div key={group.parent.id} className="mb-4">
            <div className="font-semibold">
              {group.parent.eglise_nom} {group.parent.eglise_branche}
            </div>
            {group.enfants.map(child => (
              <div key={child.id} className="ml-6 text-sm">
                - {child.eglise_nom} {child.eglise_branche}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
