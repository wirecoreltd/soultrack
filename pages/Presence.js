"use client";

import { useEffect, useState } from "react";
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

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const today = selectedDate;

  // 🔥 FETCH MEMBRES SELON LE RÔLE (liste unifiée)
  const fetchMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("profiles")
        .select("eglise_id, branche_id, role, roles")
        .eq("id", user.id)
        .single();

      setUserRole(profile.role);

      // IDs déjà présents aujourd'hui
      const { data: presencesToday } = await supabase
        .from("presences")
        .select("membre_id")
        .eq("date", today);

      const presentIds = presencesToday?.map(p => p.membre_id) || [];

      let allMemberIds = null; // null = admin (pas de filtre)

      if (!profile.roles?.includes("Administrateur")) {
        let ids = new Set();

        // 👤 Membres via suivi_assignments (Conseiller)
        if (profile.roles?.includes("Conseiller")) {
          const { data: assignments } = await supabase
            .from("suivi_assignments")
            .select("membre_id")
            .eq("conseiller_id", user.id)
            .eq("statut", "actif");

          assignments?.forEach(a => ids.add(a.membre_id));
        }

        // 🏠 Membres via cellule (ResponsableCellule)
        if (profile.roles?.includes("ResponsableCellule")) {
          const { data: cellule } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", user.id)
            .single();

          if (cellule) {
            const { data: cellulesMembers } = await supabase
              .from("membres_complets")
              .select("id")
              .eq("cellule_id", cellule.id);

            cellulesMembers?.forEach(m => ids.add(m.id));
          }
        }

        allMemberIds = [...ids];
      }

      // 🔍 REQUÊTE
      let query = supabase
        .from("membres_complets")
        .select("id, prenom, nom, telephone")
        .eq("eglise_id", profile.eglise_id)
        .eq("branche_id", profile.branche_id);

      if (allMemberIds !== null) {
        if (allMemberIds.length === 0) {
          setMembers([]);
          return;
        }
        query = query.in("id", allMemberIds);
      }

      // Exclure les présents
      if (presentIds.length > 0) {
        query = query.not("id", "in", `(${presentIds.join(",")})`);
      }

      const { data } = await query;
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FETCH PRÉSENTS (même périmètre que fetchMembers)
  const fetchPresentMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, roles, eglise_id, branche_id")
        .eq("id", user.id)
        .single();

      const { data: allPresences } = await supabase
        .from("presences")
        .select(`
          membre_id,
          checked_by,
          membres_complets (prenom, nom)
        `)
        .eq("date", today);

      let filtered = allPresences || [];

      if (!profile.roles?.includes("Administrateur")) {
        let ids = new Set();

        if (profile.roles?.includes("Conseiller")) {
          const { data: assignments } = await supabase
            .from("suivi_assignments")
            .select("membre_id")
            .eq("conseiller_id", user.id)
            .eq("statut", "actif");

          assignments?.forEach(a => ids.add(a.membre_id));
        }

        if (profile.roles?.includes("ResponsableCellule")) {
          const { data: cellule } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", user.id)
            .single();

          if (cellule) {
            const { data: cellulesMembers } = await supabase
              .from("membres_complets")
              .select("id")
              .eq("cellule_id", cellule.id);

            cellulesMembers?.forEach(m => ids.add(m.id));
          }
        }

        filtered = filtered.filter(p => ids.has(p.membre_id));
      }

      setPresentList(filtered);
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

  // 🔄 LOAD INITIAL + REALTIME
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

  // ✅ MARQUER PRÉSENT — source de vérité = DB, realtime + fetchAll sync tout
  const markPresent = async (membre) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("presences").insert({
        membre_id: membre.id,
        date: today,
        checked_by: user.id,
      });

      // fetchAll resync toutes les listes (église + cellule + conseiller)
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ MARQUER ABSENT — idem, fetchAll resync tout
  const markAbsent = async (memberId) => {
    try {
      await supabase
        .from("presences")
        .delete()
        .eq("membre_id", memberId)
        .eq("date", today);

      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 FILTRES
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

  // 🏷️ LABEL selon le rôle
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

        {/* 🏷️ LABEL RÔLE */}
        {userRole && (
          <p className="text-white/70 text-sm mt-1">{getRoleLabel()}</p>
        )}

        {/* 📅 DATE PICKER */}
        <div className="flex justify-center mt-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-md text-black"
          />
        </div>

        {/* COMPTEURS */}
        <div className="flex gap-4 justify-center mt-3 text-sm">
          <span className="text-green-300">✔ Présents : {presentList.length}</span>
          <span className="text-white">⚪ Restants : {members.length}</span>
        </div>
      </div>

      {/* TOGGLE */}
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

      {/* SEARCH */}
      <div className="w-full max-w-4xl flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 px-3 py-2 rounded-md border text-black"
        />
      </div>

      {/* LIST */}
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
