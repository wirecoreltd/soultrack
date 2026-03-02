"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    eglise_id: null,
    branche_id: null,
    eglise_nom: "",
    branche_nom: ""
  });

  const [responsable, setResponsable] = useState({ prenom: "", nom: "" });
  const [eglise, setEglise] = useState({ nom: "", branche: "", pays: "" });
  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);

  const [formAction, setFormAction] = useState(""); // rappel, supprimer, renvoyer
  const [selectedInvitation, setSelectedInvitation] = useState(null);

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

  // 🔹 Définir les actions possibles par statut
  const getActions = (statut) => {
    switch (statut?.toLowerCase()) {
      case "pending":
        return ["rappel", "supprimer"];
      case "refus":
      case "supprimee":
        return ["renvoyer"];
      case "acceptee":
      default:
        return [];
    }
  };

  const handleSelectAction = (inv, action) => {
    setSelectedInvitation(inv);
    setFormAction(action);

    // Pré-remplir le formulaire
    setResponsable({
      prenom: inv.responsable_prenom,
      nom: inv.responsable_nom
    });
    setEglise({
      nom: inv.eglise_nom,
      branche: inv.eglise_branche,
      pays: inv.eglise_pays || ""
    });
  };

  const getFormTitle = () => {
    switch (formAction) {
      case "rappel":
        return "Envoyer un rappel";
      case "supprimer":
        return "Supprimer l’invitation";
      case "renvoyer":
        return "Renvoyer le lien d’invitation";
      default:
        return "Envoyer une invitation pour relier une église";
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white flex flex-col items-center p-6">
      <HeaderPages />

      {/* FORMULAIRE */}
      <div className="w-full max-w-md p-6 space-y-4 mb-10">
        <h4 className="text-2xl font-bold mb-6 text-center">
          {getFormTitle()}
        </h4>

        <div className="space-y-4">
          <div>
            <label className="font-semibold">Prénom du responsable</label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-black"
              value={responsable.prenom}
              onChange={(e) =>
                setResponsable({ ...responsable, prenom: e.target.value })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Nom du responsable</label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-black"
              value={responsable.nom}
              onChange={(e) =>
                setResponsable({ ...responsable, nom: e.target.value })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Nom de l'Église</label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-black"
              value={eglise.nom}
              onChange={(e) =>
                setEglise({ ...eglise, nom: e.target.value })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Branche</label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-black"
              value={eglise.branche}
              onChange={(e) =>
                setEglise({ ...eglise, branche: e.target.value })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Pays</label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-black"
              value={eglise.pays}
              onChange={(e) =>
                setEglise({ ...eglise, pays: e.target.value })
              }
            />
          </div>

          <select
            className="w-full border rounded-xl px-3 py-2 text-black"
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
          >
            <option value="">-- Sélectionnez le mode d’envoi --</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>

          <SendEgliseLinkPopup
            label={
              formAction === "rappel"
                ? "Envoyer le rappel"
                : formAction === "supprimer"
                ? "Envoyer message de suppression"
                : formAction === "renvoyer"
                ? "Renvoyer le lien"
                : "Envoyer l'invitation"
            }
            type={canal}
            superviseur={superviseur}
            responsable={responsable}
            eglise={eglise}
            onSuccess={loadInvitations}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="grid grid-cols-5 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>

        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="grid grid-cols-5 px-3 py-2 mt-2 items-center border-b border-white/20"
          >
            <div>{inv.eglise_nom}</div>
            <div>{inv.eglise_branche}</div>
            <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
            <div className="capitalize">{inv.statut}</div>
            <div className="flex items-center gap-2">
              {getActions(inv.statut).map((action) => (
                <button
                  key={action}
                  className="bg-orange-500 px-3 py-1 rounded text-sm hover:opacity-80"
                  onClick={() => handleSelectAction(inv, action)}
                >
                  {action === "rappel" ? "Rappel" : action === "supprimer" ? "Supprimer" : "Renvoyer le lien"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
