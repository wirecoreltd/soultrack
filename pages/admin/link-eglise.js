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

    if (!error) setSuperviseur(data);
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

      {/* ================== SECTION BOUTON PRINCIPAL ================== */}
      {superviseur && eglises.length > 0 && (
        <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 mb-8">
          {eglises.map((eglise) => (
            <div key={eglise.id} className="space-y-2 mb-6 border-b border-gray-300 pb-4">
              <p>⛪ Église : <span className="font-semibold">{eglise.nom}</span></p>
              <p>📖 Responsable : <span className="font-semibold">{superviseur.prenom} {superviseur.nom}</span></p>
              <p>🌍 Branche / Région : <span className="font-semibold">{eglise.branche || "—"}</span></p>

              <SendEgliseLinkPopup
                label="Envoyer l'invitation"
                type="ajouter_membre"
                buttonColor="from-[#09203F] to-[#537895]"
                eglise={eglise}
                superviseur={superviseur}
              />
            </div>
          ))}
        </div>
      )}

      {/* ================== TABLE DES ÉGLISES SOUS SUPERVISION ================== */}
      {/* Ici on pourra ajouter la table après, pour voir les statuts et gérer les relances */}
    </div>
  );
}
