"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function PresencePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "Conseiller"]}>
      <Presence />
    </ProtectedRoute>
  );
}

function Presence() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // 🔥 FETCH MEMBRES NON PRÉSENTS
  const fetchMembers = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // 1️⃣ récupérer église / branche
      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      // 2️⃣ récupérer présences du jour
      const { data: presencesToday } = await supabase
        .from("presences")
        .select("membre_id")
        .eq("date", today);

      const presentIds = presencesToday?.map(p => p.membre_id) || [];

      // 3️⃣ récupérer membres NON présents
      let query = supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

      if (presentIds.length > 0) {
        query = query.not("id", "in", `(${presentIds.join(",")})`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMembers(data || []);
    } catch (err) {
      console.error(err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    // 🔥 temps réel (update automatique)
    const channel = supabase
      .channel("presence-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "presences" },
        () => {
          fetchMembers(); // refresh auto
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔥 CLICK → MARQUER PRÉSENT
  const markPresent = async (memberId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("presences").insert({
        membre_id: memberId,
        date: today,
        checked_by: user.id,
      });

      // refresh local immédiat
      setMembers(prev => prev.filter(m => m.id !== memberId));

    } catch (err) {
      console.error("Erreur présence :", err);
    }
  };

  // 🔍 filtre recherche
  const filtered = members.filter(
    (m) =>
      m.prenom.toLowerCase().includes(search.toLowerCase()) ||
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      (m.telephone || "").includes(search)
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 text-white">
          📋 Présences du <span className="text-emerald-300">jour</span>
        </h1>
        <p className="text-white/80 mt-2">
          Cliquez sur une personne pour la marquer présente
        </p>
      </div>

      {/* SEARCH */}
      <div className="w-full max-w-4xl flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher nom ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* LIST */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-white text-center col-span-full">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white text-center col-span-full">✅ Tout le monde est déjà présent !</p>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => markPresent(m.id)}
              className="bg-white rounded-xl shadow p-4 cursor-pointer hover:bg-green-100 transition"
            >
              <h2 className="font-bold text-black text-lg">
                {m.prenom} {m.nom}
              </h2>
              <p className="text-gray-600 text-sm">
                📞 {m.telephone || "—"}
              </p>

              <div className="mt-2 text-sm text-green-600 font-semibold">
                ➕ Cliquer pour marquer présent
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
