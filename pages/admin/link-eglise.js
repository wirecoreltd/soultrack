"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function LinkEglisePage() {
  const [invitations, setInvitations] = useState([]);
  const [formData, setFormData] = useState({
    responsable_prenom: "",
    responsable_nom: "",
    eglise_nom: "",
    eglise_branche: "",
    eglise_pays: "",
    mode_envoi: "",
  });
  const [editInvitation, setEditInvitation] = useState(null);
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

  const handleSubmit = async () => {
    if (
      !formData.responsable_prenom ||
      !formData.responsable_nom ||
      !formData.eglise_nom ||
      !formData.eglise_branche ||
      !formData.eglise_pays ||
      !formData.mode_envoi
    ) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      let data, error;
      if (editInvitation) {
        // mise à jour pour rappel ou suppression
        data = await supabase
          .from("eglise_supervisions")
          .update({
            statut: editInvitation.actionType === "supprimer" ? "supprimee" : "pending",
          })
          .eq("id", editInvitation.id);
      } else {
        // nouvel envoi
        ({ data, error } = await supabase
          .from("eglise_supervisions")
          .insert([
            {
              responsable_prenom: formData.responsable_prenom,
              responsable_nom: formData.responsable_nom,
              eglise_nom: formData.eglise_nom,
              eglise_branche: formData.eglise_branche,
              eglise_pays: formData.eglise_pays,
              statut: "pending",
            },
          ])
          .select()
          .single());
      }

      if (error) throw error;

      const invitationToken = data?.invitation_token || editInvitation?.invitation_token;

      // message WhatsApp / email
      let textMessage = "";
      if (editInvitation?.actionType === "rappel") {
        textMessage = `⏳ Rappel : Bonjour ${formData.responsable_prenom} ${formData.responsable_nom}, votre invitation pour ${formData.eglise_nom} - ${formData.eglise_branche} est toujours en attente. 🙏`;
      } else if (editInvitation?.actionType === "supprimer") {
        textMessage = `❌ L'invitation pour ${formData.eglise_nom} - ${formData.eglise_branche} (${formData.eglise_pays}) a été supprimée. Veuillez contacter ${formData.responsable_prenom} ${formData.responsable_nom} pour plus d'informations.`;
      } else {
        textMessage = `🙏 Bonjour ${formData.responsable_prenom} ${formData.responsable_nom},\nVous avez reçu une invitation pour que votre église ${formData.eglise_nom} - ${formData.eglise_branche} soit placée sous supervision.\nLien : https://soultrack-three.vercel.app/accept-invitation?token=${invitationToken}`;
      }

      if (formData.mode_envoi === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(textMessage)}`, "_blank");
      } else if (formData.mode_envoi === "email") {
        window.location.href = `mailto:?subject=Invitation SoulTrack&body=${encodeURIComponent(
          textMessage
        )}`;
      }

      setMessage(editInvitation ? "✅ Action effectuée !" : "✅ Invitation envoyée !");
      setFormData({
        responsable_prenom: "",
        responsable_nom: "",
        eglise_nom: "",
        eglise_branche: "",
        eglise_pays: "",
        mode_envoi: "",
      });
      setEditInvitation(null);
      fetchInvitations();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    }
  };

  const handleEdit = (inv, actionType) => {
    setEditInvitation({ ...inv, actionType });
    setFormData({
      responsable_prenom: inv.responsable_prenom,
      responsable_nom: inv.responsable_nom,
      eglise_nom: inv.eglise_nom,
      eglise_branche: inv.eglise_branche,
      eglise_pays: inv.eglise_pays,
      mode_envoi: inv.mode_envoi || "whatsapp",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusColor = (status) => {
    if (status === "acceptee") return "border-green-500 text-green-500";
    if (status === "pending") return "border-yellow-500 text-yellow-400";
    if (status === "refusee") return "border-red-500 text-red-500";
    if (status === "supprimee") return "border-gray-500 text-gray-500";
    return "border-white text-white";
  };

  return (
    <div className="min-h-screen bg-[#333699] flex flex-col items-center p-6">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Gestion des Invitations Églises
      </h1>

      {/* Formulaire */}
      <div className="max-w-2xl w-full rounded-3xl p-6 shadow-lg mb-6 bg-white/10">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Prénom du responsable"
            value={formData.responsable_prenom}
            onChange={(e) => setFormData({ ...formData, responsable_prenom: e.target.value })}
            className="input bg-white text-black"
          />
          <input
            type="text"
            placeholder="Nom du responsable"
            value={formData.responsable_nom}
            onChange={(e) => setFormData({ ...formData, responsable_nom: e.target.value })}
            className="input bg-white text-black"
          />
          <input
            type="text"
            placeholder="Nom de l'Église"
            value={formData.eglise_nom}
            onChange={(e) => setFormData({ ...formData, eglise_nom: e.target.value })}
            className="input bg-white text-black"
          />
          <input
            type="text"
            placeholder="Branche"
            value={formData.eglise_branche}
            onChange={(e) => setFormData({ ...formData, eglise_branche: e.target.value })}
            className="input bg-white text-black"
          />
          <input
            type="text"
            placeholder="Pays"
            value={formData.eglise_pays}
            onChange={(e) => setFormData({ ...formData, eglise_pays: e.target.value })}
            className="input bg-white text-black"
          />
          <select
            value={formData.mode_envoi}
            onChange={(e) => setFormData({ ...formData, mode_envoi: e.target.value })}
            className="input bg-white text-black"
          >
            <option value="">-- Sélectionnez le mode d'envoi --</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>

          <button
            onClick={handleSubmit}
            className="bg-[#333699] text-white py-2 rounded-xl font-semibold hover:bg-[#2a2f85]"
          >
            {editInvitation?.actionType === "rappel"
              ? "Envoyer un rappel"
              : editInvitation?.actionType === "supprimer"
              ? "Supprimer l'envoi"
              : "Envoyer l'invitation"}
          </button>

          {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
        </div>
      </div>

      {/* Table Invitations */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="flex text-sm font-semibold uppercase text-white px-4 py-2 border-b border-white/30 bg-white/5 rounded-t-xl">
          <div className="min-w-[150px]">Église</div>
          <div className="min-w-[120px]">Branche</div>
          <div className="min-w-[120px]">Pays</div>
          <div className="min-w-[180px]">Responsable</div>
          <div className="min-w-[120px]">Statut</div>
          <div className="min-w-[180px]">Actions</div>
        </div>

        {invitations.map((inv) => {
          const statusClass = getStatusColor(inv.statut);
          return (
            <div
              key={inv.id}
              className={`flex items-center px-4 py-2 hover:bg-white/20 transition border-l-4 ${statusClass} rounded-lg`}
            >
              <div className="min-w-[150px] text-white">{inv.eglise_nom}</div>
              <div className="min-w-[120px] text-white">{inv.eglise_branche}</div>
              <div className="min-w-[120px] text-white">{inv.eglise_pays}</div>
              <div className="min-w-[180px] text-white">
                {inv.responsable_prenom} {inv.responsable_nom}
              </div>
              <div className={`min-w-[120px] font-semibold ${statusClass}`}>
                {inv.statut === "acceptee"
                  ? "acceptee"
                  : inv.statut === "pending"
                  ? "pending"
                  : inv.statut === "refusee"
                  ? "refuse"
                  : inv.statut === "supprimee"
                  ? "supprime"
                  : inv.statut}
              </div>
              <div className="min-w-[180px] flex gap-2">
                <button
                  className="text-yellow-400 hover:text-yellow-500"
                  onClick={() => handleEdit(inv, "rappel")}
                >
                  ⏳ Rappel
                </button>
                <button
                  className="text-red-400 hover:text-red-500"
                  onClick={() => handleEdit(inv, "supprimer")}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 10px;
        }
      `}</style>
    </div>
  );
}
