"use client";

import { useEffect, useState } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function ListConseillersPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration"]}>
      <ListConseillers />
    </ProtectedRoute>
  );
}

function ListConseillers() {
  const [conseillers, setConseillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchConseillers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone, role, eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      if (!currentUserProfile) throw new Error("Profil introuvable");

      const eglise_id = String(currentUserProfile.eglise_id);
      const branche_id = String(currentUserProfile.branche_id);

      const { data: profiles, error: errConseillers } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone, role, responsable_id")
        .eq("role", "Conseiller")
        .eq("eglise_id", eglise_id)
        .eq("branche_id", branche_id);

      if (errConseillers) throw errConseillers;
      if (!profiles || profiles.length === 0) {
        setConseillers([]);
        setLoading(false);
        return;
      }

      const conseillersIds = profiles.map((p) => p.id);
      const { data: membres } = await supabase
        .from("membres_complets")
        .select("id, conseiller_id")
        .in("conseiller_id", conseillersIds);

      const contactSetMap = {};
      membres?.forEach((m) => {
        if (!m.conseiller_id) return;
        if (!contactSetMap[m.conseiller_id]) contactSetMap[m.conseiller_id] = new Set();
        contactSetMap[m.conseiller_id].add(m.id);
      });

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

      const list = profiles.map((p) => ({
        ...p,
        responsable_nom: p.responsable_id ? (responsableMap[p.responsable_id] || "Aucun") : "Aucun",
        totalContacts: contactSetMap[p.id]?.size || 0,
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

  const filteredConseillers = conseillers.filter(
    (c) =>
      c.prenom.toLowerCase().includes(search.toLowerCase()) ||
      c.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Liste des Conseillers</h1>
        <p className="text-white text-sm sm:text-lg max-w-xl mx-auto italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="w-full max-w-4xl flex justify-center mb-4">
        <input
          type="text"
          placeholder="Recherche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Bouton Ajouter un conseiller */}
      <div className="w-full max-w-6xl flex justify-end mb-6 px-2 sm:px-0">
        <button
          onClick={() => router.push("/create-conseiller")}
          className="text-white font-semibold px-4 py-2 rounded shadow text-sm sm:text-base hover:shadow-lg transition"
        >
          ➕ Ajouter un Conseiller
        </button>
      </div>

      {/* Liste cartes */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
        {loading ? (
          <p className="text-center text-white col-span-full">Chargement...</p>
        ) : filteredConseillers.length === 0 ? (
          <p className="text-center text-white col-span-full">Aucun conseiller trouvé pour votre église et votre branche.</p>
        ) : (
          filteredConseillers.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden transition hover:shadow-2xl">
              <div className="w-full h-[6px] bg-blue-500 rounded-t-2xl" />
              <div className="p-4 flex flex-col items-center">
                <h2 className="font-bold text-black text-base sm:text-lg text-center mb-1">{c.prenom} {c.nom}</h2>
                <p className="text-sm sm:text-base text-gray-700 mb-1">📞 {c.telephone || "—"}</p>
                <p className="text-sm sm:text-base text-gray-700 mb-1">✉️ {c.email || "—"}</p>
                <p className="text-sm sm:text-base text-gray-700 mt-2">👤 Responsable : <span className="font-semibold">{c.responsable_nom}</span></p>
                <p className="text-sm sm:text-base text-gray-800 mt-2 font-semibold">🔔 Contacts assignés : {c.totalContacts}</p>
                <button
                  onClick={() => router.push(`/list-members?conseiller_id=${c.id}`)}
                  className="mt-2 px-3 py-1 bg-[#333699] text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
                >
                  Voir les contacts
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
