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
  const [modeAction, setModeAction] = useState(null); // null, "rappel", "supprimer"
  const [actionInvitation, setActionInvitation] = useState(null);

  // 🔹 Charger superviseur connecté
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

  useEffect(() => { loadInvitations(); }, [superviseur.eglise_id]);

  // 🔹 Style selon statut
  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "accepted":
      case "acceptee":
        return { border: "border-l-4 border-green-600", label: "acceptee" };
      case "refused":
      case "refus":
        return { border: "border-l-4 border-red-600", label: "refus" };
      case "pending":
      case "en attente":
        return { border: "border-l-4 border-gray-400", label: "pending" };
      default:
        return { border: "border-l-4 border-gray-300", label: statut };
    }
  };

  // 🔹 Préparer action (rappel ou supprimer)
  const startAction = (inv, type) => {
    setModeAction(type);
    setActionInvitation(inv);
    setResponsable({ prenom: inv.responsable_prenom, nom: inv.responsable_nom });
    setEglise({ nom: inv.eglise_nom, branche: inv.eglise_branche, pays: inv.eglise_pays });
    setCanal("");
  };

  // 🔹 Réinitialiser formulaire
  const resetForm = () => {
    setModeAction(null);
    setActionInvitation(null);
    setResponsable({ prenom: "", nom: "" });
    setEglise({ nom: "", branche: "", pays: "" });
    setCanal("");
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        {modeAction === "rappel" ? "Envoyer un rappel" :
         modeAction === "supprimer" ? "Supprimer une invitation" :
         "Envoyer une invitation pour relier une église"}
      </h4>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md bg-white/10 text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">

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

        <div>
          <label className="font-semibold">Pays</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={eglise.pays}
            onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
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

        {/* 🔹 BOUTON ENVOYER LORSQUE FORMULAIRE VIERGE */}
        {!modeAction && (
          <SendEgliseLinkPopup
            label="Envoyer"
            type={canal}
            superviseur={superviseur}
            responsable={responsable}
            eglise={eglise}
            onSuccess={() => { loadInvitations(); resetForm(); }}
          />
        )}

        {/* Ici viendra le composant pour rappel/supprimer dans les prochaines étapes */}

      </div>

      {/* TABLE INVITATIONS */}
      <div className="w-full max-w-5xl overflow-x-auto">

        {/* HEADER */}
        <div className="grid grid-cols-5 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3 gap-2">
          <div>Église</div>
          <div>Branche</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Action</div>
        </div>

        {/* LIGNES */}
{invitations.map((inv) => {
  const statusStyle = getStatusStyle(inv.statut);

  return (
    <div
      key={inv.id}
      className={`grid grid-cols-5 px-3 py-2 mt-2 items-center gap-2`}
    >
      <div>{inv.eglise_nom}</div>
      <div>{inv.eglise_branche}</div>
      <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
      <div className="capitalize">{statusStyle.label}</div>
      <div className="flex gap-2">
        {/* 🔹 Action vide si statut = acceptee */}
        {statusStyle.label !== "acceptee" && (
          <>
            <button
              className="text-orange-500 font-semibold text-sm hover:opacity-80"
              onClick={() => startAction(inv, "rappel")}
            >
              Rappeler
            </button>
            <button
              className="text-red-500 font-semibold text-sm hover:opacity-80"
              onClick={() => startAction(inv, "supprimer")}
            >
              Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  );
})}
      </div>

      <Footer />
    </div>
  );
}
