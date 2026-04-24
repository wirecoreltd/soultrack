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
  const [presentList, setPresentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents"); // ✅ FIX 3: toggle entre "absents" et "presents"

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const today = selectedDate;

  const fetchMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      const { data: presencesToday } = await supabase
        .from("presences")
        .select("membre_id")
        .eq("date", today);

      const presentIds = presencesToday?.map(p => p.membre_id) || [];

      let query = supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

      if (presentIds.length > 0) {
        query = query.not("id", "in", `(${presentIds.join(",")})`);
      }

      const { data } = await query;
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPresentMembers = async () => {
    try {
      const { data } = await supabase
        .from("presences")
        .select(`
          membre_id,
          checked_by,
          membres_complets (prenom, nom)
        `)
        .eq("date", today);

      setPresentList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await fetchMembers();
    await fetchPresentMembers();
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("presence-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "presences",
          filter: `date=eq.${selectedDate}`,
        },
        () => fetchAll()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedDate]);

  // ✅ FIX 1 & 2 : markPresent met à jour members ET presentList immédiatement
  const markPresent = async (membre) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("presences").insert({
        membre_id: membre.id,
        date: today,
        checked_by: user.id,
      });

      // Retirer de la liste absents
      setMembers(prev => prev.filter(m => m.id !== membre.id));

      // Ajouter à la liste présents → compteur augmente ✅ FIX 2
      setPresentList(prev => [
        ...prev,
        {
          membre_id: membre.id,
          checked_by: user.id,
          membres_complets: { prenom: membre.prenom, nom: membre.nom },
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FIX 4 : markAbsent retire de presentList et remet dans members
  const markAbsent = async (memberId) => {
    try {
      await supabase
        .from("presences")
        .delete()
        .eq("membre_id", memberId)
        .eq("date", today);

      // Trouver le membre dans presentList
      const found = presentList.find(p => p.membre_id === memberId);

      // Retirer de présents
      setPresentList(prev => prev.filter(p => p.membre_id !== memberId));

      // Remettre dans absents
      if (found?.membres_complets) {
        setMembers(prev => [
          ...prev,
          {
            id: memberId,
            prenom: found.membres_complets.prenom,
            nom: found.membres_complets.nom,
            telephone: "",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAbsents = members.filter(
    (m) =>
      m.prenom.toLowerCase().includes(search.toLowerCase()) ||
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      (m.telephone || "").includes(search)
  );

  const filteredPresents = presentList.filter(
    (p) =>
      p.membres_complets?.prenom.toLowerCase().includes(search.toLowerCase()) ||
      p.membres_complets?.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 text-white">
          Présences du <span className="text-emerald-300">jour</span>
        </h1>

        <div className="flex justify-center mt-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-md text-black"
          />
        </div>

        {/* ✅ FIX 2 : compteur présents mis à jour en temps réel */}
        <div className="flex gap-4 justify-center mt-3 text-sm">
          <span className="text-green-300">✔ Présents : {presentList.length}</span>
          <span className="text-white">⚪ Restants : {members.length}</span>
        </div>
      </div>

      {/* ✅ FIX 3 : Toggle entre Absents et Présents */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setView("absents")}
          className={`px-4 py-2 rounded ${
            view === "absents" ? "bg-white text-[#333699] font-bold" : "bg-white/20 text-white"
          }`}
        >
          ⚪ Absents ({members.length})
        </button>
        <button
          onClick={() => setView("presents")}
          className={`px-4 py-2 rounded ${
            view === "presents" ? "bg-green-400 text-black font-bold" : "bg-white/20 text-white"
          }`}
        >
          ✔ Présents ({presentList.length})
        </button>
      </div>

      <div className="w-full max-w-4xl flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black"
        />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-white text-center col-span-full">Chargement...</p>
        ) : view === "absents" ? (
          filteredAbsents.length === 0 ? (
            <p className="text-white text-center col-span-full">✅ Tout le monde est présent</p>
          ) : (
            filteredAbsents.map((m) => (
              <div
                key={m.id}
                onClick={() => markPresent(m)} // ✅ FIX 1 : passe l'objet complet
                className="bg-white rounded-xl shadow p-4 cursor-pointer hover:bg-green-100 transition"
              >
                <h2 className="font-bold text-black text-lg">
                  {m.prenom} {m.nom}
                </h2>
                {/* ✅ FIX 1 : texte mis à jour après clic (disparaît car carte retirée) */}
                <div className="mt-2 text-green-600 font-semibold text-sm">
                  ➕ Marquer comme présent
                </div>
              </div>
            ))
          )
        ) : (
          filteredPresents.length === 0 ? (
            <p className="text-white text-center col-span-full">Aucune présence</p>
          ) : (
            filteredPresents.map((p) => (
              <div
                key={p.membre_id}
                className="bg-white rounded-xl shadow p-4"
              >
                <h2 className="font-bold text-black text-lg">
                  ✔ {p.membres_complets?.prenom} {p.membres_complets?.nom}
                </h2>
                {/* ✅ FIX 4 : bouton absent remet le contact dans la liste principale */}
                <button
                  onClick={() => markAbsent(p.membre_id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  − Marquer absent
                </button>
              </div>
            ))
          )
        )}
      </div>

      <Footer />
    </div>
  );
}
