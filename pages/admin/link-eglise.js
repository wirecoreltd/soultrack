/* pages/admin/link-eglise.js */
"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import ProtectedRoute from "../../components/ProtectedRoute"; 
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";

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

  // Récupérer le superviseur connecté
  const [superviseur, setSuperviseur] = useState(null);

  useEffect(() => {
    fetchSuperviseur();
    fetchEglises();
  }, []);

  const fetchSuperviseur = async () => {
    const user = supabase.auth.user();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erreur fetchSuperviseur:", error.message);
      return;
    }
    setSuperviseur(data);
  };

  const fetchEglises = async () => {
    setLoading(true);
    try {
      const user = supabase.auth.user();
      if (!user) return;

      // Récupérer les églises sous supervision
      const { data, error } = await supabase
        .from("eglises")
        .select("id, nom, branche, status_invitation")
        .eq("superviseur_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEglises(data || []);
    } catch (err) {
      console.error("Erreur fetchEglises:", err.message);
      setEglises([]);
    } finally {
      setLoading(false);
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

        {loading && <p>Chargement...</p>}

        {!loading && eglises.length === 0 && (
          <p>Aucune église sous supervision pour le moment.</p>
        )}

        {!loading && eglises.length > 0 && (
          <div className="space-y-4">
            {eglises.map((eglise) => (
              <div
                key={eglise.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#09203F]/40 p-4 rounded-lg"
              >
                <div className="flex-1 mb-2 sm:mb-0">
                  <p className="text-white font-semibold">{eglise.nom}</p>
                  <p className="text-gray-200 text-sm">{eglise.branche || "—"}</p>
                  <p className="text-sm mt-1">
                    Statut :{" "}
                    {eglise.status_invitation === "relier" && <span className="text-green-500">✅ Relié</span>}
                    {eglise.status_invitation === "en_attente" && <span className="text-yellow-400">⏳ En attente</span>}
                    {eglise.status_invitation === "refus" && <span className="text-red-500">❌ Refus</span>}
                    {!eglise.status_invitation && <span className="text-blue-400">Non reliée</span>}
                  </p>
                </div>

                <div className="flex-1 flex justify-end">
                  {superviseur && (
                    <SendEgliseLinkPopup
                      label="Envoyer l’invitation"
                      type="ajouter_membre"
                      buttonColor="from-[#09203F] to-[#537895]"
                      eglise={eglise}
                      superviseur={superviseur}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
