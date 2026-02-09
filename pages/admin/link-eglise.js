"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute";
import SendLinkPopup from "../../components/SendLinkPopup";

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

  useEffect(() => {
    fetchEglises();
  }, []);

  const fetchEglises = async () => {
    try {
      const { data, error } = await supabase
        .from("eglises")
        .select("id, nom, status_invitation") // status_invitation = 'non_reliee' | 'en_attente' | 'refus' | 'reliee'
        .eq("superviseur_id", supabase.auth.user()?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEglises(data || []);
    } catch (err) {
      console.error("Erreur fetchEglises:", err.message);
      setEglises([]);
    }
  };

  const handleInvitationSent = async (egliseId) => {
    // Met à jour le statut en attente après envoi
    await supabase
      .from("eglises")
      .update({ status_invitation: "en_attente" })
      .eq("id", egliseId);
    fetchEglises();
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />
      <h1 className="text-4xl font-bold mb-4 text-center">Relier une Église</h1>

      <p className="text-center max-w-2xl mb-6">
        Ici vous pouvez envoyer des invitations pour relier les églises que vous supervisez.
        Les églises enfants ne voient aucune autre église sur la plateforme. Seul le superviseur peut envoyer l’invitation.
      </p>

      <div className="w-full max-w-4xl bg-white text-black rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Églises sous votre supervision</h2>

        {/* Table des églises */}
        <div className="w-full max-w-6xl overflow-x-auto py-2">
          <div className="min-w-[700px] space-y-2">
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
              <div className="flex-[3]">Église</div>
              <div className="flex-[1]">Statut</div>
              <div className="flex-[2] flex justify-center items-center">Action</div>
            </div>

            {eglises.map((eglise) => (
              <div
                key={eglise.id}
                className="flex flex-col sm:flex-row items-start sm:items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
                style={{ borderLeftColor: "#0EA5E9" }}
              >
                <div className="flex-[3] text-white font-semibold">{eglise.nom}</div>
                <div className="flex-[1] text-white capitalize">{eglise.status_invitation.replace("_", " ")}</div>
                <div className="flex-[2] flex gap-2">
                  {(eglise.status_invitation === "non_reliee" ||
                    eglise.status_invitation === "en_attente" ||
                    eglise.status_invitation === "refus") && (
                    <SendLinkPopup
                      label={
                        eglise.status_invitation === "non_reliee"
                          ? "📤 Envoyer invitation"
                          : eglise.status_invitation === "en_attente"
                          ? "⏳ Renvoyer invitation"
                          : "❌ Relancer invitation"
                      }
                      type={`link_eglise_${eglise.id}`}
                      buttonColor={
                        eglise.status_invitation === "non_reliee"
                          ? "from-blue-600 to-blue-400"
                          : eglise.status_invitation === "en_attente"
                          ? "from-yellow-500 to-yellow-400"
                          : "from-red-500 to-red-400"
                      }
                      onSend={() => handleInvitationSent(eglise.id)}
                    />
                  )}
                  {eglise.status_invitation === "reliee" && (
                    <span className="text-green-400 font-semibold">✅ Relié</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
