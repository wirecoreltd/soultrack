"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function LinkEglisePage() {
  const [invitations, setInvitations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    responsable_prenom: "",
    responsable_nom: "",
    eglise_nom: "",
    eglise_branche: "",
    eglise_pays: "",
    type: "whatsapp",
  });
  const [modeAction, setModeAction] = useState(""); // rappel ou supprimer
  const [message, setMessage] = useState("");

  // ⚡ Récupère l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      setCurrentUser(session.session.user);
      fetchInvitations(session.session.user.id);
    };
    fetchUser();
  }, []);

  // ⚡ Récupère uniquement les invitations envoyées par l'utilisateur
  const fetchInvitations = async (userId) => {
    const { data } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("invited_by", userId)
      .order("created_at", { ascending: false });
    setInvitations(data || []);
  };

  const handleSelectAction = (invitation, actionType) => {
    setFormData({
      id: invitation.id,
      responsable_prenom: invitation.responsable_prenom,
      responsable_nom: invitation.responsable_nom,
      eglise_nom: invitation.eglise_nom,
      eglise_branche: invitation.eglise_branche,
      eglise_pays: invitation.eglise_pays,
      type: "whatsapp",
    });
    setModeAction(actionType);
    setMessage("");
  };

  const handleSend = async () => {
    if (!formData.type) {
      alert("Veuillez sélectionner un mode d’envoi.");
      return;
    }

    const invitation = invitations.find((i) => i.id === formData.id);
    if (!invitation) return;

    let msg = "";
    if (modeAction === "rappel") {
      msg = `🙏 Ceci est un rappel 🙏

Bonjour ${formData.responsable_prenom} ${formData.responsable_nom},

${currentUser?.email || "Votre superviseur"} a envoyé une invitation pour que votre église soit placée sous sa supervision.

Lien : https://soultrack-three.vercel.app/accept-invitation?token=${invitation.invitation_token}`;
    }

    if (modeAction === "supprimer") {
      msg = `❌ Invitation supprimée ❌

Bonjour ${formData.responsable_prenom} ${formData.responsable_nom},

L'invitation pour ${formData.eglise_nom} - ${formData.eglise_branche}, ${formData.eglise_pays} a été supprimée. 
Pour plus d'informations, veuillez contacter ${currentUser?.email || "votre superviseur"}.`;
    }

    // Envoi WhatsApp
    if (formData.type === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    }

    // Envoi Email
    if (formData.type === "email") {
      window.location.href = `mailto:?subject=Invitation SoulTrack&body=${encodeURIComponent(msg)}`;
    }

    setMessage(
      modeAction === "rappel" ? "✅ Rappel envoyé !" : "✅ Invitation supprimée !"
    );
    setModeAction("");
    setFormData({
      id: null,
      responsable_prenom: "",
      responsable_nom: "",
      eglise_nom: "",
      eglise_branche: "",
      eglise_pays: "",
      type: "whatsapp",
    });
    fetchInvitations(currentUser.id);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "acceptee":
        return { text: "text-green-400", label: "acceptee" };
      case "pending":
        return { text: "text-yellow-400", label: "pending" };
      case "refus":
        return { text: "text-red-400", label: "refus" };
      default:
        return { text: "text-white", label: status };
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
        Gestion des invitations
      </h1>

      {/* Formulaire Pré-remplissage */}
      {modeAction && (
        <div className="max-w-md w-full p-6 mb-6 rounded-3xl shadow-lg bg-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            {modeAction === "rappel" ? "Envoyer un rappel" : "Supprimer une invitation"}
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Prénom"
              value={formData.responsable_prenom}
              onChange={(e) =>
                setFormData({ ...formData, responsable_prenom: e.target.value })
              }
              className="input bg-white text-black"
              required
            />
            <input
              type="text"
              placeholder="Nom"
              value={formData.responsable_nom}
              onChange={(e) =>
                setFormData({ ...formData, responsable_nom: e.target.value })
              }
              className="input bg-white text-black"
              required
            />
            <input
              type="text"
              placeholder="Église"
              value={formData.eglise_nom}
              onChange={(e) =>
                setFormData({ ...formData, eglise_nom: e.target.value })
              }
              className="input bg-white text-black"
              required
            />
            <input
              type="text"
              placeholder="Branche"
              value={formData.eglise_branche}
              onChange={(e) =>
                setFormData({ ...formData, eglise_branche: e.target.value })
              }
              className="input bg-white text-black"
              required
            />
            <input
              type="text"
              placeholder="Pays"
              value={formData.eglise_pays}
              onChange={(e) =>
                setFormData({ ...formData, eglise_pays: e.target.value })
              }
              className="input bg-white text-black"
              required
            />

            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input bg-white text-black"
              required
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>

            <button
              onClick={handleSend}
              className="bg-[#333699] text-white py-2 rounded-xl font-semibold hover:bg-[#2a2f85]"
            >
              {modeAction === "rappel" ? "Envoyer le rappel" : "Envoyer la suppression"}
            </button>

            {message && <p className="text-white mt-2">{message}</p>}
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="grid grid-cols-6 px-4 py-2 text-white font-semibold uppercase border-b border-white/30">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>

        {invitations.length === 0 && (
          <div className="text-white/70 px-4 py-6 text-center">Aucune invitation trouvée</div>
        )}

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);
          return (
            <div
              key={inv.id}
              className="flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-blue-500"
            >
              <div className="flex-1">{inv.eglise_nom}</div>
              <div className="flex-1">{inv.eglise_branche}</div>
              <div className="flex-1">{inv.eglise_pays}</div>
              <div className="flex-1">{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className={`flex-1 ${statusStyle.text}`}>{statusStyle.label}</div>
              <div className="flex-1 flex justify-center gap-2">
                <button
                  onClick={() => handleSelectAction(inv, "rappel")}
                  className="text-yellow-400 hover:text-yellow-500"
                >
                  ⏳ Rappel
                </button>
                <button
                  onClick={() => handleSelectAction(inv, "supprimer")}
                  className="text-red-400 hover:text-red-500"
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
