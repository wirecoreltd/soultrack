/* ✅ pages/admin/link-eglise.js */
"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute"; 

export default function LinkEglise() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <LinkEgliseContent />
    </ProtectedRoute>
  );
}

function LinkEgliseContent() {
  const [eglises, setEglises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchEglises();
  }, []);

  const fetchEglises = async () => {
    try {
      // On récupère les églises enfants sous supervision du superviseur actuel
      const { data, error } = await supabase
        .from("eglises")
        .select("id, nom, status_invitation") // status_invitation = 'relier' | 'en_attente' | 'refus'
        .eq("superviseur_id", supabase.auth.user()?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEglises(data || []);
    } catch (err) {
      console.error("Erreur fetchEglises:", err.message);
      setEglises([]);
    }
  };

  const sendInvitation = async (egliseId) => {
    setSendingId(egliseId);
    try {
      // Génération d'un token unique pour l'invitation
      const token = crypto.randomUUID();

      const link = `${window.location.origin}/accept-invitation?token=${token}`;

      // Ici tu peux intégrer l'envoi WhatsApp / Email via ton back ou via window.open pour WhatsApp
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Bonjour 🙏\nVous êtes invité(e) à être relié(e) à votre superviseur.\nCliquez ici pour accepter/refuser : ${link}`
        )}`,
        "_blank"
      );

      // Update Supabase pour marquer l'invitation en attente
      const { error } = await supabase
        .from("eglises")
        .update({ status_invitation: "en_attente", invitation_token: token })
        .eq("id", egliseId);
      if (error) throw error;

      fetchEglises();
    } catch (err) {
      console.error("Erreur sendInvitation:", err.message);
      alert("❌ Erreur lors de l'envoi de l'invitation");
    } finally {
      setSendingId(null);
    }
  };

  const statusActions = (eglise) => {
    switch (eglise.status_invitation) {
      case "relier":
        return <span className="text-green-600 font-semibold">✅ Relié</span>;
      case "en_attente":
        return (
          <button
            onClick={() => sendInvitation(eglise.id)}
            disabled={sendingId === eglise.id}
            className="bg-yellow-500 text-white px-3 py-1 rounded font-semibold"
          >
            {sendingId === eglise.id ? "Envoi..." : "⏳ En attente - Renvoyer"}
          </button>
        );
      case "refus":
        return (
          <button
            onClick={() => sendInvitation(eglise.id)}
            disabled={sendingId === eglise.id}
            className="bg-red-500 text-white px-3 py-1 rounded font-semibold"
          >
            {sendingId === eglise.id ? "Envoi..." : "❌ Refus - Relancer"}
          </button>
        );
      default:
        return (
          <button
            onClick={() => sendInvitation(eglise.id)}
            disabled={sendingId === eglise.id}
            className="bg-blue-600 text-white px-3 py-1 rounded font-semibold"
          >
            {sendingId === eglise.id ? "Envoi..." : "📤 Relier"}
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />
      <h1 className="text-4xl font-bold mb-4 text-center">Relier une Église</h1>

      <p className="text-center max-w-2xl mb-6">
        Ici vous pouvez envoyer des invitations pour relier les églises que vous supervisez. 
        Les églises enfants ne voient aucune autre église sur la plateforme. 
        Seul le superviseur peut envoyer l’invitation.
      </p>

      <div className="w-full max-w-4xl bg-white text-black rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Églises sous votre supervision</h2>

        {eglises.length === 0 ? (
          <p>Aucune église à superviser pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {eglises.map((e) => (
              <li key={e.id} className="flex justify-between items-center bg-gray-100 rounded p-3">
                <span className="font-medium">{e.nom}</span>
                {statusActions(e)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
