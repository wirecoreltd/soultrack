"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
import HeaderPages from "../../components/HeaderPages";

export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    eglise_id: null,
    branche_id: null
  });

  const [eglise, setEglise] = useState({
    nom: "",
    branche: "",
  });

  const [canal, setCanal] = useState("whatsapp");
  const [invitations, setInvitations] = useState([]);

  // 🔹 Charger les infos du superviseur connecté
  const loadSuperviseur = async () => {
    const user = supabase.auth.user(); // utilisateur connecté
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("prenom, nom, email, telephone, eglise_id, branche_id")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erreur récupération superviseur :", error.message);
      return;
    }

    setSuperviseur(data);
  };

  // 🔹 Charger les invitations pour l’église du superviseur
  const loadInvitations = async () => {
    if (!superviseur.eglise_id) return;

    const { data, error } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", superviseur.eglise_id)
      .order("created_at", { ascending: false });

    if (error) console.error("Erreur chargement invitations :", error.message);
    else setInvitations(data || []);
  };

  useEffect(() => {
    loadSuperviseur();
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [superviseur.eglise_id]);

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      <h1 className="text-4xl font-bold mb-4 text-center">Relier une Église</h1>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4">
        {/* ...champs prénom, nom, email, téléphone comme avant... */}

        <SendEgliseLinkPopup
          label="Envoyer l'invitation"
          type={canal}
          superviseur={superviseur}
          eglise={eglise}
          superviseurEgliseId={superviseur.eglise_id}
          superviseurBrancheId={superviseur.branche_id}
          onSuccess={loadInvitations}
        />
      </div>

      {/* TABLE INVITATIONS */}
      {/* ...comme avant */}
    </div>
  );
}
