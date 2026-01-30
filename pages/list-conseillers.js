"use client";

import { useEffect, useState } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoutLink from "../components/LogoutLink";
import HeaderPages from "../components/HeaderPages";

export default function ListConseillers() {
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prenom, setPrenom] = useState("");
  const router = useRouter();

  const fetchConseillers = async () => {
    setLoading(true);
    try {
      // 1️⃣ Récupérer l'utilisateur pour bienvenue
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Utilisateur non connecté");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("prenom, role")
        .eq("id", user.id)
        .single();
      if (profileError || !profileData) throw profileError;

      setPrenom(profileData.prenom || "cher membre");

      // 2️⃣ Récupérer tous les conseillers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone, responsable_id")
        .eq("role", "Conseiller");
      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) {
        setConseillers([]);
        setLoading(false);
        return;
      }

      const conseillersIds = profiles.map((p) => p.id);

      // 3️⃣ Récupérer membres attribués à chaque conseiller
      const { data: membres, error: membresError } = await supabase
        .from("membres_complets") // source de vérité
        .select("id, conseiller_id")
        .in("conseiller_id", conseillersIds);
      if (membresError) throw membresError;

      // 4️⃣ Compter contacts attribués uniques par conseiller
      const contactSetMap = {};
      membres?.forEach((m) => {
        if (!m.conseiller_id) return;
        if (!contactSetMap[m.conseiller_id]) contactSetMap[m.conseiller_id] = new Set();
        contactSetMap[m.conseiller_id].add(m.id);
      });

      // 5️⃣ Récupérer responsables
      const responsablesIds = profiles.map((p) => p.responsable_id).filter(Boolean);
      let responsableMap = {};
      if (responsablesIds.length > 0) {
        const { data: responsables } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .in("id", responsablesIds);
        responsables?.forEach((r) => {
          responsableMap[r.id] = `${r.prenom} ${r.nom}`;
        });
      }

      // 6️⃣ Fusionner infos pour affichage
      const list = profiles.map((p) => ({
        ...p,
        responsable_nom: p.responsable_id ? (responsableMap[p.responsable_id] || "Aucun") : "Aucun",
        totalContacts: contactSetMap[p.id]?.size || 0, // 🔔 Contacts attribués exacts
      }));

      setConseillers(list);

    } catch (err) {
      console.error("Erreur fetchConseillers :", err);
      setConseillers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConseillers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
  
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📋 Liste des Conseillers</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

        {/* Bouton Ajouter un membre */}
                <button
                  onClick={() => router.push("/create-conseiller")}
                  className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
                >
                  ➕ Ajouter un Conseiller 
                </button>

      {/* Liste cartes */}
      <div className="w-full max-w-6xl">
        {loading ? (
          <p className="text-center text-white">Chargement...</p>
        ) : conseillers.length === 0 ? (
          <p className="text-center text-white">Aucun conseiller trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
            {conseillers.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-lg w-full overflow-hidden transition hover:shadow-2xl">
                <div className="w-full h-[6px] bg-blue-500 rounded-t-2xl" />
                <div className="p-4 flex flex-col items-center">
                  <h2 className="font-bold text-black text-base text-center mb-1">{c.prenom} {c.nom}</h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {c.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">✉️ {c.email || "—"}</p>
                  <p className="text-sm text-gray-700 mt-2">👤 Responsable : <span className="font-semibold">{c.responsable_nom}</span></p>
                  <p className="text-sm text-gray-800 mt-2 font-semibold">🔔 Contacts assignés : {c.totalContacts}</p>
                  <button
                    onClick={() => router.push(`/list-members?conseiller_id=${c.id}`)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Voir les contacts
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
