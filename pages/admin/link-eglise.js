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
          eglises(nom),
          branches(nom)
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
      .order("created_at", { ascending: true });

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
      case "refused":
        return { border: "border-l-4 border-red-600", button: "Renvoyer invitation" };
      case "pending":
        return { border: "border-l-4 border-gray-400", button: "Envoyer rappel" };
      default:
        return { border: "border-l-4 border-gray-300", button: null };
    }
  };

  // 🔹 Regrouper par superviseur_branche_id
  const groupBySuperviseur = (invitations) => {
    const map = {};

    invitations.forEach(inv => {
      const key = inv.superviseur_branche_id || inv.id;

      if (!map[key]) {
        map[key] = { parent: inv, enfants: [] };
      } else if (inv.id !== map[key].parent.id) {
        map[key].enfants.push(inv);
      }
    });

    return Object.values(map);
  };

  const groupedInvitations = groupBySuperviseur(invitations);

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* FORMULAIRE D'INVITATION */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        Envoyer une invitation pour relier une église
      </h4>

      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">
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

      {/* TABLE DES ÉGLISES SUPERVISÉES */}
      <h4 className="text-2xl font-bold mt-2 mb-10 text-center w-full max-w-5xl text-amber-300">
        Liste des églises supervisées
      </h4>

      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <div className="grid grid-cols-4 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Responsable</div>
          <div>Statut</div>
        </div>

        {/* LIGNES */}
        {groupedInvitations.map(({ parent, enfants }) => {
          const parentStyle = getStatusStyle(parent.statut);

          return (
            <div key={parent.id} className="space-y-1">
              {/* Parent */}
              <div
                className={`grid grid-cols-4 px-3 py-2 mt-2 rounded-lg ${parentStyle.border} items-center`}
              >
                <div>{parent.eglise_nom}</div>
                <div>{parent.eglise_branche}</div>
                <div>{parent.responsable_prenom} {parent.responsable_nom}</div>
                <div className="flex items-center gap-3">
                  <span>{parent.statut}</span>
                  {parentStyle.button && (
                    <button
                      className="text-orange-500 font-semibold text-sm hover:opacity-80"
                      onClick={() => alert(`${parentStyle.button}`)}
                    >
                      {parentStyle.button}
                    </button>
                  )}
                </div>
              </div>

              {/* Enfants */}
              {enfants.map(child => {
                const childStyle = getStatusStyle(child.statut);
                return (
                  <div
                    key={child.id}
                    className={`grid grid-cols-4 px-8 py-2 rounded-lg ${childStyle.border} items-center bg-white/5`}
                  >
                    <div>{child.eglise_nom}</div>
                    <div>{child.eglise_branche}</div>
                    <div>{child.responsable_prenom} {child.responsable_nom}</div>
                    <div className="flex items-center gap-3">
                      <span>{child.statut}</span>
                      {childStyle.button && (
                        <button
                          className="text-orange-500 font-semibold text-sm hover:opacity-80"
                          onClick={() => alert(`${childStyle.button}`)}
                        >
                          {childStyle.button}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
