"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ListConseillers() {
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchConseillers = async () => {
    setLoading(true);
    try {
      // 1️⃣ Récupérer tous les conseillers
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

      // 2️⃣ Récupérer tous les membres assignés via membres.conseiller_id
      const { data: membres } = await supabase
        .from("membres")
        .select("id, conseiller_id")
        .in("conseiller_id", conseillersIds);

      // 3️⃣ Récupérer tous les membres assignés via suivis_membres.conseiller_id
      const { data: suivis } = await supabase
        .from("suivis_membres")
        .select("membre_id, conseiller_id")
        .in("conseiller_id", conseillersIds);

      // 4️⃣ Compter les contacts par conseiller (membres + suivis)
      const countMap = {};

      // Membres
      membres?.forEach((m) => {
        if (m.conseiller_id) {
          countMap[m.conseiller_id] = (countMap[m.conseiller_id] || 0) + 1;
        }
      });

      // Suivis
      suivis?.forEach((s) => {
        if (s.conseiller_id) {
          countMap[s.conseiller_id] = (countMap[s.conseiller_id] || 0) + 1;
        }
      });

      // 5️⃣ Récupérer les responsables
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

      // 6️⃣ Fusionner les données
      const list = profiles.map((p) => ({
        ...p,
        responsable_nom: p.responsable_id ? (responsableMap[p.responsable_id] || "Aucun") : "Aucun",
        totalContacts: countMap[p.id] || 0,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 p-6">
      {/* TOP BAR */}
      <div className="w-full max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-black font-semibold hover:text-gray-700"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-bold text-center">
          Liste des Conseillers
        </h1>

        <button
          onClick={() => router.push("/create-conseiller")}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
        >
          + Ajouter
        </button>
      </div>

      {/* LISTE */}
      <div className="w-full max-w-4xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">Chargement...</p>
        ) : conseillers.length === 0 ? (
          <p className="text-center text-gray-600">Aucun conseiller trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conseillers.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-200"
              >
                <h2 className="text-xl font-bold mb-1">
                  {c.prenom} {c.nom}
                </h2>

                <p className="text-gray-700">📞 {c.telephone || "—"}</p>
                <p className="text-gray-700">✉️ {c.email || "—"}</p>

                <p className="text-gray-700 mt-2">
                  👤 Responsable :
                  <span className="font-semibold"> {c.responsable_nom}</span>
                </p>

                <p className="text-gray-800 mt-2 font-semibold">
                  🔔 Contacts assignés : {c.totalContacts}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
