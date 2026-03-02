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
  const [actionForm, setActionForm] = useState(null); // rappel / supprimer

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

  // 🔹 Styles statut
  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee":
        return { border: "border-l-green-500", text: "text-green-500" };
      case "refusee":
        return { border: "border-l-red-500", text: "text-red-500" };
      case "pending":
        return { border: "border-l-gray-400", text: "text-gray-400" };
      case "supprimee":
        return { border: "border-l-orange-500", text: "text-orange-500" };
      default:
        return { border: "border-l-blue-500", text: "text-blue-500" };
    }
  };

  // 🔹 Actions rappel / supprimer
  const handleRappel = (inv) => {
    setActionForm({
      type: "rappel",
      invitation: inv,
      titre: "Envoyer un rappel"
    });
    setResponsable({
      prenom: inv.responsable_prenom,
      nom: inv.responsable_nom
    });
    setEglise({
      nom: inv.eglise_nom,
      branche: inv.eglise_branche,
      pays: inv.eglise_pays
    });
  };

  const handleSupprimer = (inv) => {
    setActionForm({
      type: "supprimer",
      invitation: inv,
      titre: "Supprimer l'envoi"
    });
    setResponsable({
      prenom: inv.responsable_prenom,
      nom: inv.responsable_nom
    });
    setEglise({
      nom: inv.eglise_nom,
      branche: inv.eglise_branche,
      pays: inv.eglise_pays
    });
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* TITRE FORMULAIRE */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        {actionForm?.titre || "Envoyer une invitation pour relier une église"}
      </h4>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-4 mb-10 bg-white/5">

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
          label={
            actionForm?.type === "rappel"
              ? "Envoyer un rappel"
              : actionForm?.type === "supprimer"
              ? "Supprimer l'invitation"
              : "Envoyer l'invitation"
          }
          type={canal}
          superviseur={superviseur}
          responsable={responsable}
          eglise={eglise}
          actionForm={actionForm}
          onSuccess={() => {
            loadInvitations();
            setActionForm(null);
          }}
        />
      </div>

      {/* TITRE TABLE */}
      <h4 className="text-2xl font-bold mt-2 mb-6 text-center w-full max-w-5xl text-amber-300">
        Liste des églises supervisées
      </h4>

      {/* TABLE INVITATIONS */}
      <div className="w-full max-w-5xl space-y-2">
        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);

          return (
            <div
              key={inv.id}
              className={`flex flex-col sm:flex-row items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${statusStyle.border}`}
            >
              <div className="w-full sm:w-1/5">{inv.eglise_nom}</div>
              <div className="w-full sm:w-1/5">{inv.eglise_branche}</div>
              <div className="w-full sm:w-1/5">{inv.eglise_pays}</div>
              <div className="w-full sm:w-1/5">{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className={`w-full sm:w-1/5 ${statusStyle.text} font-normal`}>
                {inv.statut === "refusee" ? "refus" : inv.statut}
              </div>

              {/* ACTIONS */}
              {inv.statut?.toLowerCase() === "pending" && (
                <div className="flex gap-4 mt-2 sm:mt-0 ml-0 sm:ml-4">
                  <button
                    className="text-orange-400 text-sm hover:opacity-80"
                    onClick={() => handleRappel(inv)}
                  >
                    Rappel
                  </button>

                  <button
                    className="text-red-400 text-sm hover:opacity-80"
                    onClick={() => handleSupprimer(inv)}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
