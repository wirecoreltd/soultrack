"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function LinkEglisePage() {
  const [invitations, setInvitations] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formTitle, setFormTitle] = useState("Envoyer une invitation");
  const [formData, setFormData] = useState({
    responsable_prenom: "",
    responsable_nom: "",
    eglise_nom: "",
    eglise_branche: "",
    eglise_pays: "",
    type: "",
    invitationId: null, // pour rappel ou suppression
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .order("created_at", { ascending: false });
    setInvitations(data || []);
  };

  const handleSend = async () => {
    if (!formData.responsable_prenom || !formData.responsable_nom ||
        !formData.eglise_nom || !formData.eglise_branche ||
        !formData.eglise_pays || !formData.type) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    let messageText = "";
    if (formTitle.includes("rappel")) {
      messageText = `🔔 Rappel !\n\nBonjour ${formData.responsable_prenom} ${formData.responsable_nom},\n\nCeci est un rappel pour votre invitation concernant ${formData.eglise_nom} - ${formData.eglise_branche} (${formData.eglise_pays}).\nVeuillez cliquer sur le lien pour accepter/refuser :\nhttps://soultrack-three.vercel.app/accept-invitation?token=${invitations.find(i => i.id === formData.invitationId)?.invitation_token}`;
    } else if (formTitle.includes("supprimer")) {
      messageText = `❌ L'invitation pour ${formData.eglise_nom} - ${formData.eglise_branche} (${formData.eglise_pays}) a été supprimée. Veuillez contacter ${formData.responsable_prenom} ${formData.responsable_nom} pour plus d'informations.`;
    } else {
      // envoi initial
      const { data, error } = await supabase
        .from("eglise_supervisions")
        .insert([{
          superviseur_eglise_id: null, // backend remplit automatiquement
          superviseur_branche_id: null,
          responsable_prenom: formData.responsable_prenom,
          responsable_nom: formData.responsable_nom,
          eglise_nom: formData.eglise_nom,
          eglise_branche: formData.eglise_branche,
          eglise_pays: formData.eglise_pays,
          statut: "pending"
        }])
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }
      formData.invitationId = data.id;
      messageText = `🙏 Bonjour ${formData.responsable_prenom} ${formData.responsable_nom},\n\nVous avez reçu une invitation pour que votre église (${formData.eglise_nom} - ${formData.eglise_branche}, ${formData.eglise_pays}) soit supervisée.\nLien : https://soultrack-three.vercel.app/accept-invitation?token=${data.invitation_token}`;
    }

    // envoi message
    if (formData.type === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(messageText)}`, "_blank");
    }
    if (formData.type === "email") {
      window.location.href = `mailto:?subject=Invitation SoulTrack&body=${encodeURIComponent(messageText)}`;
    }

    setMessage("✅ Message envoyé !");
    setTimeout(() => setMessage(""), 3000);
    setFormVisible(false);
    fetchInvitations();
  };

  const handleRappel = (inv) => {
    setFormData({
      responsable_prenom: inv.responsable_prenom,
      responsable_nom: inv.responsable_nom,
      eglise_nom: inv.eglise_nom,
      eglise_branche: inv.eglise_branche,
      eglise_pays: inv.eglise_pays,
      type: "",
      invitationId: inv.id,
    });
    setFormTitle("Envoyer un rappel");
    setFormVisible(true);
  };

  const handleSupprimer = (inv) => {
    setFormData({
      responsable_prenom: inv.responsable_prenom,
      responsable_nom: inv.responsable_nom,
      eglise_nom: inv.eglise_nom,
      eglise_branche: inv.eglise_branche,
      eglise_pays: inv.eglise_pays,
      type: "",
      invitationId: inv.id,
    });
    setFormTitle("Supprimer l'envoi");
    setFormVisible(true);
  };

  const statusColors = {
    acceptee: "border-green-500 text-green-500",
    pending: "border-yellow-500 text-yellow-500",
    refus: "border-red-500 text-red-500"
  };

  return (
    <div className="min-h-screen bg-[#333699] flex flex-col items-center p-6">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-white text-center">Link Église</h1>

      {/* Formulaire */}
      {formVisible && (
        <div className="w-full max-w-md mb-6 p-6 rounded-3xl bg-white/10 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">{formTitle}</h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Prénom du responsable"
              value={formData.responsable_prenom}
              onChange={e => setFormData({...formData, responsable_prenom: e.target.value})}
              className="input bg-white text-black placeholder-black px-3 py-2 rounded-lg"
            />
            <input
              type="text"
              placeholder="Nom du responsable"
              value={formData.responsable_nom}
              onChange={e => setFormData({...formData, responsable_nom: e.target.value})}
              className="input bg-white text-black placeholder-black px-3 py-2 rounded-lg"
            />
            <input
              type="text"
              placeholder="Nom de l'église"
              value={formData.eglise_nom}
              onChange={e => setFormData({...formData, eglise_nom: e.target.value})}
              className="input bg-white text-black placeholder-black px-3 py-2 rounded-lg"
            />
            <input
              type="text"
              placeholder="Branche"
              value={formData.eglise_branche}
              onChange={e => setFormData({...formData, eglise_branche: e.target.value})}
              className="input bg-white text-black placeholder-black px-3 py-2 rounded-lg"
            />
            <input
              type="text"
              placeholder="Pays"
              value={formData.eglise_pays}
              onChange={e => setFormData({...formData, eglise_pays: e.target.value})}
              className="input bg-white text-black placeholder-black px-3 py-2 rounded-lg"
            />
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="input bg-white text-black px-3 py-2 rounded-lg"
            >
              <option value="">-- Mode d'envoi --</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>

            <button
              onClick={handleSend}
              className="bg-[#333699] text-white py-2 rounded-xl font-semibold hover:bg-[#2a2f85]"
            >
              Envoyer
            </button>
          </div>
          {message && <p className="text-white mt-2">{message}</p>}
        </div>
      )}

      {/* Tableau */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="grid grid-cols-6 text-white font-semibold uppercase px-4 py-2 border-b border-white/30">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {invitations.map(inv => (
          <div key={inv.id} className={`flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 ${statusColors[inv.statut] || "border-gray-500"}`}>
            <div className="flex-1">{inv.eglise_nom}</div>
            <div className="flex-1">{inv.eglise_branche}</div>
            <div className="flex-1">{inv.eglise_pays}</div>
            <div className="flex-1">{inv.responsable_prenom} {inv.responsable_nom}</div>
            <div className="flex-1 font-semibold">{inv.statut}</div>
            <div className="flex-1 flex gap-2 justify-center">
              <button className="text-yellow-400 hover:text-yellow-600" onClick={()=>handleRappel(inv)}>⏳ Rappel</button>
              <button className="text-red-400 hover:text-red-600" onClick={()=>handleSupprimer(inv)}>🗑️ Supprimer</button>
            </div>
          </div>
        ))}
        {invitations.length === 0 && (
          <div className="text-white/70 px-4 py-6 text-center">Aucune invitation</div>
        )}
      </div>

      <Footer />
    </div>
  );
}
