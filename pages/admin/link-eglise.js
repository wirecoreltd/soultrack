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
      case "acceptee": return { border: "border-l-4 border-green-500", color: "text-green-500" };
      case "refusee": return { border: "border-l-4 border-red-500", color: "text-red-500" };
      case "pending": return { border: "border-l-4 border-yellow-500", color: "text-yellow-400" };
      case "supprimee": return { border: "border-l-4 border-gray-400", color: "text-gray-400" };
      default: return { border: "border-l-4 border-gray-300", color: "text-gray-300" };
    }
  };

  // 🔹 Pré-remplissage formulaire pour Rappel / Supprimer / Renvoyer
  const handleActionClick = (invitation, type) => {
    setResponsable({ prenom: invitation.responsable_prenom, nom: invitation.responsable_nom });
    setEglise({ nom: invitation.eglise_nom, branche: invitation.eglise_branche, pays: invitation.eglise_pays });
    setActionContext({
      type,
      label:
        type === "reminder" ? "Envoyer un rappel" :
        type === "resend" ? "🔄 Renvoyer le lien" :
        "Supprimer l'envoi",
      currentId: invitation.id
    });
    setCanal(""); // reset le mode d'envoi
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 Envoyer ou renvoyer l'invitation (UPSERT)
  const sendInvitation = async () => {
    if (!responsable.prenom || !responsable.nom || !eglise.nom || !eglise.branche || !eglise.pays) {
      alert("Veuillez remplir tous les champs obligatoires (Prénom, Nom, Église, Branche, Pays).");
      return;
    }

    const newToken = crypto.randomUUID();

    const { error } = await supabase
      .from("eglise_supervisions")
      .upsert({
        superviseur_eglise_id: superviseur.eglise_id,
        supervisee_eglise_nom: eglise.nom,
        supervisee_branche_nom: eglise.branche,
        supervisee_pays: eglise.pays,
        responsable_prenom: responsable.prenom,
        responsable_nom: responsable.nom,
        invitation_token: newToken,
        statut: "pending",
        created_at: new Date(),
        last_sent_at: new Date()
      }, { onConflict: "unique_superviseur_eglise_branch" });

    if (error) {
      console.error("Erreur UPSERT :", error);
      alert("Erreur lors de l'envoi de l'invitation.");
      return;
    }

    // Réinitialiser le formulaire
    setResponsable({ prenom: "", nom: "" });
    setEglise({ nom: "", branche: "", pays: "" });
    setCanal("");
    loadInvitations();
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
            className="w-full border px-3 py-2 bg-white/20 text-black"
            value={responsable.prenom}
            onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Nom du responsable</label>
          <input
            className="w-full border px-3 py-2 bg-white/20 text-black"
            value={responsable.nom}
            onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Nom de l'Église</label>
          <input
            className="w-full border px-3 py-2 bg-white/20 text-black"
            value={eglise.nom}
            onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Branche</label>
          <input
            className="w-full border px-3 py-2 bg-white/20 text-black"
            value={eglise.branche}
            onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold">Pays</label>
          <input
            className="w-full border px-3 py-2 bg-white/20 text-black"
            value={eglise.pays}
            onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
          />
        </div>

        <select
          className="w-full border px-3 py-2 bg-white/20 text-black"
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
        >
          <option value="">-- Sélectionnez le mode d’envoi --</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <button
          className="w-full bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded font-semibold"
          onClick={sendInvitation}
        >
          {actionContext.label}
        </button>
      </div>

      {/* TABLE */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="grid grid-cols-6 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Responsable</div>
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
              <div className="flex-1">{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className={`flex-1 font-semibold ${statusStyle.color} border-l-4 border-l-transparent md:border-l-0`}>{inv.statut.toLowerCase()}</div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                {/* Logique actions */}
                {inv.statut.toLowerCase() === "acceptee" && null}
                {inv.statut.toLowerCase() === "supprimee" && (
                  <>
                    <button className="text-blue-400 hover:text-blue-600 font-semibold" onClick={() => handleActionClick(inv,"resend")}>🔄 Renvoyer le lien</button>
                    <button className="text-red-400 hover:text-red-600 font-semibold" onClick={() => handleActionClick(inv,"delete")}>❌ Supprimer l'envoi</button>
                  </>
                )}
                {inv.statut.toLowerCase() === "refusee" && (
                  <>
                    <button className="text-blue-400 hover:text-blue-600 font-semibold" onClick={() => handleActionClick(inv,"resend")}>🔄 Renvoyer le lien</button>
                    <button className="text-red-400 hover:text-red-600 font-semibold" onClick={() => handleActionClick(inv,"delete")}>❌ Supprimer l'envoi</button>
                  </>
                )}
                {inv.statut.toLowerCase() === "pending" && (
                  <>
                    <button className="text-yellow-400 hover:text-yellow-600 font-semibold" onClick={() => handleActionClick(inv,"reminder")}>⏳ Rappel</button>
                    <button className="text-red-400 hover:text-red-600 font-semibold" onClick={() => handleActionClick(inv,"delete")}>❌ Supprimer l'envoi</button>
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
