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
      case "accepted":
        return { border: "border-l-4 border-green-600", button: null };
      case "refused":
        return { border: "border-l-4 border-red-600", button: "Renvoyer invitation" };
      case "pending":
        return { border: "border-l-4 border-gray-400", button: "Envoyer rappel" };
      default:
        return { border: "border-l-4 border-gray-300", button: null };
    }
  };

  // 🔹 Envoyer rappel WhatsApp
  const sendReminder = (inv) => {
    const message = `
Bonjour ${inv.responsable_prenom} ${inv.responsable_nom},

Ceci est un rappel pour accepter l’invitation de ${superviseur.prenom} ${superviseur.nom} afin que votre église (${inv.eglise_nom}) soit sous supervision.

Lien : https://soultrack-three.vercel.app/accept-invitation?token=${inv.invitation_token}
    `.trim();

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  // 🔹 Supprimer invitation avec message personnalisé
  const deleteInvitation = async (inv) => {
    const defaultMessage = `
Bonjour ${inv.responsable_prenom} ${inv.responsable_nom},

Votre invitation pour que l’église ${inv.eglise_nom} soit sous supervision de ${superviseur.prenom} ${superviseur.nom} a été annulée.
    `.trim();

    const userMessage = prompt(
      "Écrivez votre message d'annulation pour le responsable :",
      defaultMessage
    );

    if (!userMessage) return;

    await supabase
      .from("eglise_supervisions")
      .delete()
      .eq("id", inv.id);

    window.open(
      `https://wa.me/?text=${encodeURIComponent(userMessage)}`,
      "_blank"
    );

    loadInvitations();
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* FORMULAIRE */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        Envoyer une invitation pour relier une église
      </h4>

      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">

        <div>
          <label className="font-semibold">Prénom du responsable *</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={responsable.prenom}
            onChange={(e) =>
              setResponsable({ ...responsable, prenom: e.target.value })
            }
          />
        </div>

        <div>
          <label className="font-semibold">Nom du responsable *</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={responsable.nom}
            onChange={(e) =>
              setResponsable({ ...responsable, nom: e.target.value })
            }
          />
        </div>

        <div>
          <label className="font-semibold">Nom de l'Église *</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.nom}
            onChange={(e) =>
              setEglise({ ...eglise, nom: e.target.value })
            }
          />
        </div>

        <div>
          <label className="font-semibold">Branche / Région *</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.branche}
            onChange={(e) =>
              setEglise({ ...eglise, branche: e.target.value })
            }
          />
        </div>

        <div>
          <label className="font-semibold">Pays *</label>
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
          label="Envoyer l'invitation"
          type={canal}
          superviseur={superviseur}
          responsable={responsable}
          eglise={eglise}
          onSuccess={loadInvitations}
        />
      </div>

      {/* TABLE DES INVITATIONS */}
      <h4 className="text-2xl font-bold mt-2 mb-10 text-center w-full max-w-5xl text-amber-300">
        Liste des églises supervisées
      </h4>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-6 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);

          return (
            <div
              key={inv.id}
              className={`grid grid-cols-6 px-3 py-2 mt-2 rounded-lg ${statusStyle.border} items-center`}
            >
              <div>{inv.eglise_nom}</div>
              <div>{inv.eglise_branche}</div>
              <div>{inv.eglise_pays}</div>
              <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div>{inv.statut}</div>
              <div className="flex items-center gap-2">
                {statusStyle.button === "Envoyer rappel" && (
                  <button
                    className="text-orange-500 font-semibold text-sm hover:opacity-80"
                    onClick={() => sendReminder(inv)}
                  >
                    Renvoyer invitation
                  </button>
                )}
                <button
                  className="text-red-500 font-semibold text-sm hover:opacity-80"
                  onClick={() => deleteInvitation(inv)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
