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
  const [actionMode, setActionMode] = useState(""); // "rappel" ou "supprimer"
  const [selectedInvitation, setSelectedInvitation] = useState(null);

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
          eglises(nom),
          branches(nom)
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

  // 🔹 Style des statuts
  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee":
        return { border: "border-l-4 border-green-600", label: "acceptee" };
      case "refuse":
      case "refusee":
        return { border: "border-l-4 border-red-600", label: "refus" };
      case "pending":
        return { border: "border-l-4 border-gray-400", label: "pending" };
      case "lien_casse":
        return { border: "border-l-4 border-orange-600", label: "lien cassé" };
      default:
        return { border: "border-l-4 border-gray-300", label: statut || "" };
    }
  };

  // 🔹 Préparer message rappel / suppression
  const prepareMessage = (inv, type) => {
    if(type === "rappel") {
      return `🙏 Rappel : Bonjour ${inv.responsable_prenom} ${inv.responsable_nom},

${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_nom} - ${superviseur.branche_nom}
vous a envoyé une invitation pour que votre église soit supervisée.

Cliquez ici pour accepter, refuser ou laisser en attente :
https://soultrack-three.vercel.app/accept-invitation?token=${inv.invitation_token}

⏳ Ceci est un rappel.`;
    }
    if(type === "supprimer") {
      return `📌 L’invitation de votre église a été annulée. 
Vous n’êtes plus supervisé(e) par : 
${superviseur.prenom} ${superviseur.nom} - ${superviseur.eglise_nom} - ${superviseur.branche_nom} - ${superviseur.branche_nom}.
Pour plus d’informations, contactez votre superviseur.`;
    }
  };

  const handleAction = (inv, type) => {
    setSelectedInvitation(inv);
    setActionMode(type);
  };

  // 🔹 Confirmer rappel ou suppression
  const handleConfirmAction = async (message) => {
    if(actionMode === "rappel") {
      // Envoi message
      sendMessage(message);
      alert("Rappel envoyé !");
    }
    if(actionMode === "supprimer") {
      // Update base
      await supabase
        .from("eglise_supervisions")
        .update({
          superviseur_eglise_id: null,
          superviseur_branche_id: null,
          statut: "lien_casse"
        })
        .eq("id", selectedInvitation.id);
      sendMessage(message);
      alert("Lien cassé et notification envoyée !");
      loadInvitations();
    }

    // Reset formulaire
    setActionMode("");
    setSelectedInvitation(null);
  };

  // 🔹 Envoi WhatsApp ou Email
  const sendMessage = (message) => {
    if(canal === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    }
    if(canal === "email") {
      window.location.href = `mailto:?subject=Notification SoulTrack&body=${encodeURIComponent(message)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* TITRE FORMULAIRE */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        {actionMode === "rappel" ? "Envoyer un rappel" : actionMode === "supprimer" ? "Supprimer l'invitation" : "Envoyer une invitation pour relier une église"}
      </h4>

      {/* FORMULAIRE */}
      <div className="w-full max-w-md text-black rounded-2xl p-6 space-y-4 mb-10">
        <div>
          <label className="font-semibold">Prénom du responsable</label>
          <input className="w-full border rounded-xl px-3 py-2" value={responsable.prenom} onChange={e => setResponsable({...responsable, prenom:e.target.value})} />
        </div>
        <div>
          <label className="font-semibold">Nom du responsable</label>
          <input className="w-full border rounded-xl px-3 py-2" value={responsable.nom} onChange={e => setResponsable({...responsable, nom:e.target.value})} />
        </div>
        <div>
          <label className="font-semibold">Nom de l'Église</label>
          <input className="w-full border rounded-xl px-3 py-2" value={eglise.nom} onChange={e => setEglise({...eglise, nom:e.target.value})} />
        </div>
        <div>
          <label className="font-semibold">Branche *</label>
          <input className="w-full border rounded-xl px-3 py-2" value={eglise.branche} onChange={e => setEglise({...eglise, branche:e.target.value})} />
        </div>
        <div>
          <label className="font-semibold">Pays *</label>
          <input className="w-full border rounded-xl px-3 py-2" value={eglise.pays} onChange={e => setEglise({...eglise, pays:e.target.value})} />
        </div>
        <select className="w-full border rounded-xl px-3 py-2" value={canal} onChange={e=>setCanal(e.target.value)}>
          <option value="">-- Sélectionnez le mode d’envoi --</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        {/* Bouton envoyer si pas action */}
        {!actionMode && (
          <SendEgliseLinkPopup
            label="Envoyer l'invitation"
            type={canal}
            superviseur={superviseur}
            responsable={responsable}
            eglise={eglise}
            onSuccess={loadInvitations}
          />
        )}

        {/* Formulaire action rappel/supprimer */}
        {actionMode && selectedInvitation && (
          <button
            onClick={() => handleConfirmAction(prepareMessage(selectedInvitation, actionMode))}
            disabled={!canal}
            className={`w-full py-2 rounded-xl text-white font-semibold ${!canal ? "bg-gray-400 cursor-not-allowed" : "bg-[#333699] hover:bg-[#2a2f85]"}`}
          >
            {actionMode === "rappel" ? "Envoyer le rappel" : "Envoyer notification de suppression"}
          </button>
        )}
      </div>

      {/* TABLE DES INVITATIONS */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-5 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3 text-center">
          <div>Église</div>
          <div>Branche</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Action</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);

          return (
            <div key={inv.id} className={`grid grid-cols-5 px-3 py-2 mt-2 ${statusStyle.border} items-center`}>
              <div className="text-center">{inv.eglise_nom}</div>
              <div className="text-center">{inv.eglise_branche}</div>
              <div className="text-center">{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className="text-center">{statusStyle.label}</div>
              <div className="text-center flex justify-center gap-2">
                {inv.statut.toLowerCase() === "pending" && (
                  <>
                    <button className="text-orange-500 font-semibold text-sm hover:opacity-80" onClick={()=>handleAction(inv,"rappel")}>Rappel</button>
                    <button className="text-red-500 font-semibold text-sm hover:opacity-80" onClick={()=>handleAction(inv,"supprimer")}>🗑️</button>
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
