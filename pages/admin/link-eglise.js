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

  const [responsable, setResponsable] = useState({
    prenom: "",
    nom: ""
  });

  const [eglise, setEglise] = useState({
    nom: "",
    branche: "",
    pays: ""
  });

  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

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

  // 🔹 Status style
  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee":
        return { text: "acceptee" };
      case "refus":
        return { text: "refus" };
      case "pending":
        return { text: "pending" };
      case "supprimee":
        return { text: "supprimee" };
      default:
        return { text: statut };
    }
  };

  // 🔹 Actions disponibles selon le statut
  const getActionsByStatus = (invitation) => {
    switch (invitation.statut.toLowerCase()) {
      case "refus":
      case "supprimee":
        return [{ label: "Renvoyer le lien", action: "resend" }];
      case "acceptee":
        return [];
      case "pending":
        return [
          { label: "Rappel", action: "rappel" },
          { label: "Supprimer", action: "supprimer" }
        ];
      default:
        return [];
    }
  };

  // 🔹 Sélection d'une action → préremplir le formulaire
  const handleSelectInvitation = (invitation, action) => {
    setSelectedAction({ invitation, action });
    setResponsable({
      prenom: invitation.responsable_prenom,
      nom: invitation.responsable_nom
    });
    setEglise({
      nom: invitation.eglise_nom,
      branche: invitation.eglise_branche,
      pays: invitation.eglise_pays || ""
    });

    // Définir le titre du formulaire
    let titre = "";
    if (action === "rappel") titre = "Envoyer un rappel";
    else if (action === "supprimer") titre = "Supprimer l’invitation";
    else if (action === "resend") titre = "Renvoyer le lien";
    setFormTitle(titre);
  };

  const [formTitle, setFormTitle] = useState("Envoyer une invitation pour relier une église");

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* TITRE FORMULAIRE */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        {formTitle}
      </h4>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-4 mb-10 bg-white/10">

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

        <div>
          <label className="font-semibold">Pays</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.pays}
            onChange={(e) =>
              setEglise({ ...eglise, pays: e.target.value })
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
          label={selectedAction?.action === "rappel" ? "Envoyer le rappel" : selectedAction?.action === "supprimer" ? "Envoyer message de suppression" : "Envoyer l'invitation"}
          type={canal}
          superviseur={superviseur}
          responsable={responsable}
          eglise={eglise}
          onSuccess={loadInvitations}
        />
      </div>

      {/* TABLE INVITATIONS */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="grid grid-cols-4 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Responsable</div>
          <div>Statut / Actions</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);
          const actions = getActionsByStatus(inv);

          return (
            <div
              key={inv.id}
              className="grid grid-cols-4 px-3 py-2 mt-2 items-center border-b border-white/20"
            >
              <div>{inv.eglise_nom}</div>
              <div>{inv.eglise_branche}</div>
              <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">{statusStyle.text}</span>
                <div className="flex gap-2">
                  {actions.map((btn) => (
                    <button
                      key={btn.action}
                      onClick={() => handleSelectInvitation(inv, btn.action)}
                      className={`text-sm font-semibold hover:opacity-80 ${
                        btn.action === "rappel" ? "text-orange-500" :
                        btn.action === "supprimer" ? "text-red-500" :
                        "text-blue-500"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
