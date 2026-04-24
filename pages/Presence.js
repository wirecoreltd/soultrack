"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function PresencePage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableIntegration", "Conseiller", "ResponsableCellule"]}>
      <Presence />
    </ProtectedRoute>
  );
}

function Presence() {
  const [members, setMembers] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents");
  const [userRole, setUserRole] = useState(null);
  const profileRef = useRef(null); // cache du profil
  const myIdsRef = useRef(null);   // cache des IDs du périmètre

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 🔥 INIT PROFIL + IDs DU PÉRIMÈTRE (une seule fois)
  const initProfile = useCallback(async () => {
    if (profileRef.current && myIdsRef.current !== undefined) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id, role, roles")
      .eq("id", user.id)
      .single();

    profileRef.current = { ...profile, uid: user.id };
    setUserRole(profile.role);

    // Admin = null (pas de filtre)
    if (profile.roles?.includes("Administrateur") || profile.roles?.includes("ResponsableIntegration")) {
      myIdsRef.current = null;
      return;
    }

    let ids = new Set();

    // Lancer les deux requêtes en parallèle
    const [assignmentsResult, celluleResult] = await Promise.all([
      profile.roles?.includes("Conseiller")
        ? supabase.from("suivi_assignments").select("membre_id").eq("conseiller_id", user.id).eq("statut", "actif")
        : Promise.resolve({ data: [] }),

      profile.roles?.includes("ResponsableCellule")
        ? supabase.from("cellules").select("id").eq("responsable_id", user.id).single()
        : Promise.resolve({ data: null }),
    ]);

    assignmentsResult.data?.forEach(a => ids.add(a.membre_id));

    if (celluleResult.data?.id) {
      const { data: cellulesMembers } = await supabase
        .from("membres_complets")
        .select("id")
        .eq("cellule_id", celluleResult.data.id);
      cellulesMembers?.forEach(m => ids.add(m.id));
    }

    myIdsRef.current = [...ids];
  }, []);

  // 🔥 FETCH TOUT EN PARALLÈLE
  const fetchAll = useCallback(async (date) => {
    try {
      await initProfile();
      const profile = profileRef.current;
      const myIds = myIdsRef.current;
      const today = date || selectedDate;

      // Lancer présences + membres en parallèle
      const [presencesResult, membresResult] = await Promise.all([
        supabase
          .from("presences")
          .select("membre_id, checked_by, membres_complets(prenom, nom)")
          .eq("date", today),

        (() => {
          let q = supabase
            .from("membres_complets")
            .select("id, prenom, nom, telephone")
            .eq("eglise_id", profile.eglise_id)
            .eq("branche_id", profile.branche_id);

          if (myIds !== null) {
            if (myIds.length === 0) return Promise.resolve({ data: [] });
            q = q.in("id", myIds);
          }
          return q;
        })(),
      ]);

      const allPresences = presencesResult.data || [];
      const allMembers = membresResult.data || [];

      // IDs présents aujourd'hui (tous, pas filtrés)
      const presentIds = new Set(allPresences.map(p => p.membre_id));

      // Absents = membres du périmètre PAS dans présences
      const absents = allMembers.filter(m => !presentIds.has(m.id));

      // Présents = présences filtrées par périmètre
      const presents = myIds !== null
        ? allPresences.filter(p => myIds.includes(p.membre_id))
        : allPresences;

      setMembers(absents);
      setPresentList(presents);
    } catch (err) {
      console.error(err);
    }
  }, [selectedDate, initProfile]);

  useEffect(() => {
    setLoading(true);
    fetchAll(selectedDate).finally(() => setLoading(false));

    const channel = supabase
      .channel("presence-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presences" },
        () => fetchAll(selectedDate)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedDate]);

  // ✅ MARQUER PRÉSENT
  const markPresent = async (membre) => {
    try {
      const { uid } = profileRef.current;
      await supabase.from("presences").insert({
        membre_id: membre.id,
        date: selectedDate,
        checked_by: uid,
      });
      await fetchAll(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ MARQUER ABSENT
  const markAbsent = async (memberId) => {
    try {
      await supabase
        .from("presences")
        .delete()
        .eq("membre_id", memberId)
        .eq("date", selectedDate);
      await fetchAll(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAbsents = members.filter(
    (m) =>
      m.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      m.nom?.toLowerCase().includes(search.toLowerCase()) ||
      (m.telephone || "").includes(search)
  );

  const filteredPresents = presentList.filter(
    (p) =>
      p.membres_complets?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      p.membres_complets?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleLabel = () => {
    if (userRole === "Conseiller") return "👤 Vos membres suivis";
    if (userRole === "ResponsableCellule") return "🏠 Membres de votre cellule";
    return "🏢 Tous les membres de la branche";
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mt-4 text-white">
          Présences du <span className="text-emerald-300">jour</span>
        </h1>

        {userRole && (
          <p className="text-white/70 text-sm mt-1">{getRoleLabel()}</p>
        )}

        <div className="flex justify-center mt-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-md text-black"
          />
        </div>

        <div className="flex gap-4 justify-center mt-3 text-sm">
          <span className="text-green-300">✔ Présents : {presentList.length}</span>
          <span className="text-white">⚪ Restants : {members.length}</span>
        </div>
      </div>

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
                onClick={() => markPresent(m)}
                className="bg-white rounded-xl shadow p-4 cursor-pointer hover:bg-green-100 transition"
              >
                <h2 className="font-bold text-black text-lg">
                  {m.prenom} {m.nom}
                </h2>
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
