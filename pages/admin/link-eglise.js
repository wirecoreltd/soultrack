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
  const [actionContext, setActionContext] = useState({type: "send", label: "Envoyer l'invitation", currentId: null});

  // 🔹 Charger superviseur connecté
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(`prenom, nom, eglise_id, branche_id, eglises(nom), branches(nom)`)
        .eq("id", user.id)
        .single();

      if (!error && data) {
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
      case "acceptee": return { border: "border-l-4 border-green-500", color: "text-green-500" };
      case "refusee": return { border: "border-l-4 border-red-500", color: "text-red-500" };
      case "pending": return { border: "border-l-4 border-yellow-500", color: "text-yellow-400" };
      default: return { border: "border-l-4 border-gray-300", color: "text-gray-300" };
    }
  };

  // 🔹 Pré-remplissage formulaire pour Rappel ou Supprimer / Renvoyer le lien
  const handleActionClick = (invitation, type) => {
    setResponsable({ prenom: invitation.responsable_prenom, nom: invitation.responsable_nom });
    setEglise({ nom: invitation.eglise_nom, branche: invitation.eglise_branche, pays: invitation.eglise_pays });
    setActionContext({
      type,
      label: type === "reminder" ? "Envoyer un rappel" : type === "resend" ? "Renvoyer le lien" : "Supprimer l'envoi",
      currentId: invitation.id
    });
    setCanal(""); // reset le mode d'envoi
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* TITRE FORMULAIRE */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        {actionContext.label}
      </h4>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4 mb-10 bg-white/10">

        <div>
          <label className="font-semibold">Prénom du responsable</label>
          <input
            className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
            value={responsable.prenom}
            onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-semibold">Nom du responsable</label>
          <input
            className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
            value={responsable.nom}
            onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-semibold">Nom de l'Église</label>
          <input
            className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
            value={eglise.nom}
            onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-semibold">Branche</label>
          <input
            className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
            value={eglise.branche}
            onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="font-semibold">Pays</label>
          <input
            className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
            value={eglise.pays}
            onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
            required
          />
        </div>

        <select
          className="w-full border rounded-xl px-3 py-2 bg-white/20 text-black"
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          required
        >
          <option value="">-- Sélectionnez le mode d’envoi --</option>
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

      {/* TABLE */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="grid grid-cols-5 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Statut</div>
          <div>Action</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);
          return (
            <div key={inv.id} className={`flex flex-col md:flex-row md:items-center px-4 py-2 mt-2 hover:bg-white/20 transition`}>
              <div className="flex-1">{inv.eglise_nom}</div>
              <div className="flex-1">{inv.eglise_branche}</div>
              <div className="flex-1">{inv.eglise_pays}</div>
              <div className="flex-1"><span className={`${statusStyle.color} font-semibold`}>{inv.statut.toLowerCase()}</span></div>
              <div className="flex-1 flex gap-2">
                {inv.statut.toLowerCase() === "pending" || inv.statut.toLowerCase() === "refusee" ? (
                  <>
                    <button
                      className="text-yellow-400 hover:text-yellow-600 font-semibold"
                      onClick={() => handleActionClick(inv, "reminder")}
                    >⏳ Rappel</button>
                    <button
                      className="text-red-400 hover:text-red-600 font-semibold"
                      onClick={() => handleActionClick(inv, "delete")}
                    >❌ Supprimer</button>
                  </>
                ) : inv.statut.toLowerCase() === "acceptee" ? (
                  <button
                    className="text-red-400 hover:text-red-600 font-semibold"
                    onClick={() => handleActionClick(inv, "resend")}
                  >❌ Renvoyer le lien</button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
