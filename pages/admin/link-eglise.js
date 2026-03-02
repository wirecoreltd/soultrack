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

  const [actionContext, setActionContext] = useState({
    type: "send",
    label: "Envoyer l'invitation",
    currentId: null
  });

  // ===============================
  // 🔹 Charger superviseur connecté
  // ===============================
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select(`prenom, nom, eglise_id, branche_id, eglises(nom), branches(nom)`)
        .eq("id", user.id)
        .single();

      if (data) {
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

  // ===============================
  // 🔹 Charger invitations
  // ===============================
  const loadInvitations = async () => {
    if (!superviseur.eglise_id) return;

    const { data } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", superviseur.eglise_id)
      .order("created_at", { ascending: false });

    if (data) setInvitations(data);
  };

  useEffect(() => {
    loadInvitations();
  }, [superviseur.eglise_id]);

  // ===============================
  // 🔹 Gestion des actions
  // ===============================
  const handleActionClick = (invitation, type) => {

    setResponsable({
      prenom: invitation.responsable_prenom,
      nom: invitation.responsable_nom
    });

    setEglise({
      nom: invitation.eglise_nom,
      branche: invitation.eglise_branche,
      pays: invitation.eglise_pays
    });

    let label = "";

    if (type === "reminder") label = "Envoyer un rappel";
    if (type === "resend") label = "Renvoyer le lien";
    if (type === "delete") label = "Supprimer l'envoi";

    setActionContext({
      type,
      label,
      currentId: invitation.id
    });

    setCanal("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===============================
  // 🔹 Menu déroulant des actions
  // ===============================
  const getActionsForStatus = (inv) => {
    const statut = inv.statut?.toLowerCase();

    if (statut === "acceptee") return null;

    if (statut === "pending") {
      return (
        <select
          className="bg-white/20 text-black px-2 py-1 rounded-lg"
          onChange={(e) => {
            if (e.target.value === "reminder") handleActionClick(inv, "reminder");
          }}
        >
          <option value="">-- Action --</option>
          <option value="reminder">⏳ Rappel</option>
        </select>
      );
    }

    if (statut === "refusee" || statut === "supprimee") {
      return (
        <select
          className="bg-white/20 text-black px-2 py-1 rounded-lg"
          onChange={(e) => {
            if (e.target.value === "resend") handleActionClick(inv, "resend");
            if (e.target.value === "delete") handleActionClick(inv, "delete");
          }}
        >
          <option value="">-- Action --</option>
          <option value="resend">🔄 Renvoyer le lien</option>
          <option value="delete">❌ Supprimer l'envoi</option>
        </select>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">

      <HeaderPages />

      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        {actionContext.label}
      </h4>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4 mb-10 bg-white/10">

        <input
          className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
          placeholder="Prénom du responsable"
          value={responsable.prenom}
          onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
          placeholder="Nom du responsable"
          value={responsable.nom}
          onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
          placeholder="Nom de l'Église"
          value={eglise.nom}
          onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
          placeholder="Branche"
          value={eglise.branche}
          onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
          placeholder="Pays"
          value={eglise.pays}
          onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
        />

        <select
          className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
        >
          <option value="">-- Mode d’envoi --</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <SendEgliseLinkPopup
          label={actionContext.label}
          type={canal}
          superviseur={superviseur}
          responsable={responsable}
          eglise={eglise}
          actionContext={actionContext}
          onSuccess={loadInvitations}
        />

      </div>

      {/* TABLEAU */}
      <div className="w-full max-w-5xl">

        <div className="grid grid-cols-6 font-semibold border-b border-white/40 pb-2">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Action</div>
        </div>

        {invitations.map((inv) => (
          <div key={inv.id} className="grid grid-cols-6 py-3 border-b border-white/10">

            <div>{inv.eglise_nom}</div>
            <div>{inv.eglise_branche}</div>
            <div>{inv.eglise_pays}</div>
            <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
            <div className="capitalize">{inv.statut}</div>
            <div>{getActionsForStatus(inv)}</div>

          </div>
        ))}

      </div>

      <Footer />
    </div>
  );
}
