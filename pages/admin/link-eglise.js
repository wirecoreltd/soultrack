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
  const [superviseur, setSuperviseur] = useState(null);

  // Champs à saisir avant envoi
  const [prenomResponsable, setPrenomResponsable] = useState("");
  const [nomResponsable, setNomResponsable] = useState("");
  const [branche, setBranche] = useState("");

  useEffect(() => {
    fetchSuperviseur();
    fetchEglises();
  }, []);

  const fetchSuperviseur = async () => {
    const user = supabase.auth.user();
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("id, prenom, nom")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setSuperviseur(data);
      setPrenomResponsable(data.prenom);
      setNomResponsable(data.nom);
    }
  };

  const fetchEglises = async () => {
    const user = supabase.auth.user();
    if (!user) return;

    const { data, error } = await supabase
      .from("eglises")
      .select("*")
      .eq("superviseur_id", user.id)
      .order("created_at", { ascending: true });

    if (!error) setEglises(data || []);
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

      {/* ================== FORMULAIRE AVANT ENVOI ================== */}
      {superviseur && eglises.length > 0 && (
        <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 mb-8 space-y-4">
          {eglises.map((eglise) => (
            <div key={eglise.id} className="space-y-3 border-b border-gray-300 pb-4">
              <h2 className="text-xl font-semibold">Église : {eglise.nom}</h2>

              {/* Champs à saisir */}
              <div className="space-y-2">
                <div>
                  <label className="block font-semibold mb-1">Prénom du Responsable</label>
                  <input
                    type="text"
                    value={prenomResponsable}
                    onChange={(e) => setPrenomResponsable(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nom du Responsable</label>
                  <input
                    type="text"
                    value={nomResponsable}
                    onChange={(e) => setNomResponsable(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Branche / Région</label>
                  <input
                    type="text"
                    value={branche}
                    onChange={(e) => setBranche(e.target.value)}
                    placeholder="Optionnel"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Bouton pour envoyer invitation */}
              <SendEgliseLinkPopup
                label="Envoyer l'invitation"
                type="ajouter_membre"
                buttonColor="from-[#09203F] to-[#537895]"
                eglise={eglise}
                superviseur={{
                  prenom: prenomResponsable,
                  nom: nomResponsable,
                }}
                branche={branche}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
