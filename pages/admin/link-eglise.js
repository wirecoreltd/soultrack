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

  // =========================
  // Charger superviseur
  // =========================
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

  // =========================
  // Charger invitations
  // =========================
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

  // =========================
  // UPSERT (ANTI-DOUBLON)
  // =========================
  const sendInvitation = async () => {

    const newToken = crypto.randomUUID();

    const { error } = await supabase
      .from("eglise_supervisions")
      .upsert(
        {
          superviseur_eglise_id: superviseur.eglise_id,
          supervisee_eglise_id: eglise.nom, 
          supervisee_branche_id: eglise.branche,
          responsable_prenom: responsable.prenom,
          responsable_nom: responsable.nom,
          eglise_nom: eglise.nom,
          eglise_branche: eglise.branche,
          eglise_pays: eglise.pays,
          invitation_token: newToken,
          statut: "pending",
          last_sent_at: new Date()
        },
        {
          onConflict:
            "superviseur_eglise_id,supervisee_eglise_id,supervisee_branche_id"
        }
      );

    if (error) {
      console.error("Erreur UPSERT :", error);
      return;
    }

    loadInvitations();
  };

  // =========================
  // Gestion actions
  // =========================
  const handleActionClick = async (inv, type) => {

    if (type === "delete") {
      await supabase
        .from("eglise_supervisions")
        .update({ statut: "supprimee" })
        .eq("id", inv.id);

      loadInvitations();
      return;
    }

    if (type === "resend" || type === "reminder") {

      const newToken = crypto.randomUUID();

      await supabase
        .from("eglise_supervisions")
        .update({
          invitation_token: newToken,
          statut: "pending",
          last_sent_at: new Date()
        })
        .eq("id", inv.id);

      loadInvitations();
    }
  };

  // =========================
  // Menu dynamique
  // =========================
  const getActions = (inv) => {
    const statut = inv.statut?.toLowerCase();

    if (statut === "acceptee") return null;

    if (statut === "pending") {
      return (
        <select
          className="bg-white/20 text-black px-2 py-1 rounded-lg"
          onChange={(e) => {
            if (e.target.value === "reminder")
              handleActionClick(inv, "reminder");
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
            if (e.target.value === "resend")
              handleActionClick(inv, "resend");
            if (e.target.value === "delete")
              handleActionClick(inv, "delete");
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

      <h2 className="text-2xl font-bold mb-6">
        Invitations envoyées
      </h2>

      <div className="w-full max-w-5xl">

        <div className="grid grid-cols-6 font-semibold border-b pb-2">
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
            <div>{getActions(inv)}</div>

          </div>
        ))}

      </div>

      <Footer />
    </div>
  );
}
