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
      const user = supabase.auth.user();
      if (!user) return;

      const { data, error } = await supabase
        .from("eglises")
        .select("id, nom, status_invitation, sousSupervision(id, nom, status_invitation)")
        .eq("superviseur_id", user.id)
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
      const token = crypto.randomUUID();
      const link = `${window.location.origin}/accept-invitation?token=${token}`;

      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Bonjour 🙏\nVous êtes invité(e) à être relié(e) à votre superviseur.\nCliquez ici pour accepter/refuser : ${link}`
        )}`,
        "_blank"
      );

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

        {/* ================== TABLE DES ÉGLISES ================== */}
        {eglises.length > 0 ? (
          <div className="w-full overflow-x-auto py-2">
            <div className="min-w-[700px] space-y-2">
              {/* Header */}
              <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
                <div className="flex-[3]">Église</div>
                <div className="flex-[1]">Statut</div>
                <div className="flex-[2] flex justify-center items-center">Action</div>
              </div>

              {/* Rows */}
              {eglises.map((eglise) => (
                <div
                  key={eglise.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
                  style={{ borderLeftColor: "#0EA5E9" }}
                >
                  <div className="flex-[3] text-white font-semibold">{eglise.nom}</div>
                  <div className="flex-[1] text-white">{eglise.status_invitation || "Non reliée"}</div>
                  <div className="flex-[2] flex gap-2">
                    <button
                      onClick={() => sendInvitation(eglise.id)}
                      disabled={sendingId === eglise.id}
                      className={`px-3 py-1 rounded font-semibold ${
                        eglise.status_invitation === "en_attente"
                          ? "bg-yellow-500 text-white"
                          : eglise.status_invitation === "refus"
                          ? "bg-red-500 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {sendingId === eglise.id
                        ? "Envoi..."
                        : eglise.status_invitation === "en_attente"
                        ? "⏳ En attente - Renvoyer"
                        : eglise.status_invitation === "refus"
                        ? "❌ Refus - Relancer"
                        : "📤 Relier"}
                    </button>
                  </div>

                  {/* Liste des églises déjà sous supervision */}
                  {eglise.sousSupervision && eglise.sousSupervision.length > 0 && (
                    <ul className="mt-2 ml-4 list-disc list-inside text-white text-sm">
                      {eglise.sousSupervision.map((sub) => (
                        <li key={sub.id}>
                          {sub.nom} {sub.status_invitation === "relier" ? "✅ Lecture seule" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Aucune église sous supervision pour le moment.</p>
        )}
      </div>
    </div>
  );
}

