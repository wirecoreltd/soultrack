"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function LinkEglise() {

  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    eglise_id: null
  });

  const [responsable, setResponsable] = useState({ prenom: "", nom: "" });
  const [eglise, setEglise] = useState({ nom: "", branche: "", pays: "" });
  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);

  // =========================
  // Charger superviseur
  // =========================
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("prenom, nom, eglise_id")
        .eq("id", user.id)
        .single();

      if (data) setSuperviseur(data);
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
  // ENVOI INVITATION (UPSERT)
  // =========================
  const sendInvitation = async () => {

    if (!responsable.prenom || !responsable.nom || !eglise.nom || !eglise.branche || !eglise.pays || !canal) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const token = crypto.randomUUID();

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
          invitation_token: token,
          statut: "pending",
          last_sent_at: new Date()
        },
        {
          onConflict:
            "superviseur_eglise_id,supervisee_eglise_id,supervisee_branche_id"
        }
      );

    if (error) {
      console.error(error);
      return;
    }

    alert("Invitation envoyée !");
    setResponsable({ prenom: "", nom: "" });
    setEglise({ nom: "", branche: "", pays: "" });
    setCanal("");

    loadInvitations();
  };

  // =========================
  // ACTIONS
  // =========================
  const handleAction = async (inv, type) => {

    if (type === "delete") {
      await supabase
        .from("eglise_supervisions")
        .update({ statut: "supprimee" })
        .eq("id", inv.id);
    }

    if (type === "resend" || type === "reminder") {
      await supabase
        .from("eglise_supervisions")
        .update({
          statut: "pending",
          last_sent_at: new Date(),
          invitation_token: crypto.randomUUID()
        })
        .eq("id", inv.id);
    }

    loadInvitations();
  };

  const getActions = (inv) => {
    const s = inv.statut?.toLowerCase();

    if (s === "acceptee") return null;

    if (s === "pending") {
      return (
        <select onChange={(e) => handleAction(inv, e.target.value)}>
          <option value="">-- Action --</option>
          <option value="reminder">⏳ Rappel</option>
        </select>
      );
    }

    if (s === "refusee" || s === "supprimee") {
      return (
        <select onChange={(e) => handleAction(inv, e.target.value)}>
          <option value="">-- Action --</option>
          <option value="resend">🔄 Renvoyer</option>
          <option value="delete">❌ Supprimer</option>
        </select>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6">

      <HeaderPages />

      {/* FORMULAIRE */}
      <div className="max-w-md mx-auto bg-white/10 p-6 rounded-2xl space-y-3 mb-10">

        <input
          placeholder="Prénom responsable"
          value={responsable.prenom}
          onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
        />

        <input
          placeholder="Nom responsable"
          value={responsable.nom}
          onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
        />

        <input
          placeholder="Nom Église"
          value={eglise.nom}
          onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
        />

        <input
          placeholder="Branche"
          value={eglise.branche}
          onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
        />

        <input
          placeholder="Pays"
          value={eglise.pays}
          onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
        />

        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          className="w-full px-3 py-2 rounded text-black"
        >
          <option value="">-- Mode d'envoi --</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <button
          onClick={sendInvitation}
          className="w-full bg-green-500 py-2 rounded font-bold"
        >
          Envoyer le lien
        </button>
      </div>

      {/* TABLE */}
      <div className="max-w-5xl mx-auto">

        {invitations.map((inv) => (
          <div key={inv.id} className="grid grid-cols-6 py-3 border-b border-white/20">

            <div>{inv.eglise_nom}</div>
            <div>{inv.eglise_branche}</div>
            <div>{inv.eglise_pays}</div>
            <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
            <div>{inv.statut}</div>
            <div>{getActions(inv)}</div>

          </div>
        ))}

      </div>

      <Footer />
    </div>
  );
}
