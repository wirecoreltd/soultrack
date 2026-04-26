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

// 🕐 TYPES DE TEMPS DISPONIBLES
const TYPES_TEMPS = [
  { value: "Culte Dominical", label: "⛪ Culte Dominical" },
  { value: "Culte Semaine", label: "📅 Culte Semaine" },
  { value: "Cellule", label: "🏠 Réunion de Cellule" },
  { value: "Jeunesse", label: "🔥 Réunion Jeunesse" },
  { value: "Prière", label: "🙏 Réunion de Prière" },
  { value: "Évangélisation", label: "📢 Sortie Évangélisation" },
  { value: "Spécial", label: "⭐ Temps Spécial" },
];

function Presence() {
  // --- ÉTAT SESSION ATTENDANCE ---
  const [sessionReady, setSessionReady] = useState(false); // false = écran de config
  const [attendanceId, setAttendanceId] = useState(null);
  const [typeTemps, setTypeTemps] = useState("");
  const [tempsNom, setTempsNom] = useState("");
  const [compteurs, setCompteurs] = useState({
    hommes: 0,
    femmes: 0,
    jeunes: 0,
    enfants: 0,
    evangelises: 0,
    nouveauxVenus: 0,
    nouveauxConvertis: 0,
    connectes: 0,
  });
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // --- ÉTAT PRÉSENCE ---
  const [members, setMembers] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents");
  const [userRole, setUserRole] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const profileRef = useRef(null);
  const myIdsRef = useRef(null);

  // 🔥 INIT PROFIL
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

    if (profile.roles?.includes("Administrateur") || profile.roles?.includes("ResponsableIntegration")) {
      myIdsRef.current = null;
      return;
    }

    let ids = new Set();

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

  // 🔥 FETCH MEMBRES + PRÉSENCES
  const fetchAll = useCallback(async (date) => {
    try {
      await initProfile();
      const profile = profileRef.current;
      const myIds = myIdsRef.current;
      const today = date || selectedDate;

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
      const presentIds = new Set(allPresences.map(p => p.membre_id));

      setMembers(allMembers.filter(m => !presentIds.has(m.id)));
      setPresentList(
        myIds !== null
          ? allPresences.filter(p => myIds.includes(p.membre_id))
          : allPresences
      );
    } catch (err) {
      console.error(err);
    }
  }, [selectedDate, initProfile]);

  useEffect(() => {
    setLoading(true);
    fetchAll(selectedDate).finally(() => setLoading(false));

    const channel = supabase
      .channel("presence-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "presences" }, () => fetchAll(selectedDate))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedDate]);

  // ✅ DÉMARRER SESSION — crée l'entrée attendance
  const demarrerSession = async () => {
    if (!typeTemps) return;
    setSavingAttendance(true);
    try {
      const profile = profileRef.current;

      const { data, error } = await supabase
        .from("attendance")
        .insert({
          date: selectedDate,
          typeTemps: typeTemps,
          temps_nom: tempsNom || typeTemps,
          branche_id: profile.branche_id,
          eglise_id: profile.eglise_id,
          ...compteurs,
        })
        .select("id")
        .single();

      if (error) throw error;

      setAttendanceId(data.id);
      setSessionReady(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de la session");
    } finally {
      setSavingAttendance(false);
    }
  };

  // 💾 SAUVEGARDER COMPTEURS (mise à jour)
  const sauvegarderCompteurs = async () => {
    if (!attendanceId) return;
    setSavingAttendance(true);
    try {
      await supabase
        .from("attendance")
        .update({ ...compteurs })
        .eq("id", attendanceId);
      setAttendanceSaved(true);
      setTimeout(() => setAttendanceSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAttendance(false);
    }
  };

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
      await supabase.from("presences").delete()
        .eq("membre_id", memberId)
        .eq("date", selectedDate);
      await fetchAll(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const updateCompteur = (key, delta) => {
    setCompteurs(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const filteredAbsents = members.filter(m =>
    m.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    m.nom?.toLowerCase().includes(search.toLowerCase()) ||
    (m.telephone || "").includes(search)
  );

  const filteredPresents = presentList.filter(p =>
    p.membres_complets?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    p.membres_complets?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleLabel = () => {
    if (userRole === "Conseiller") return "👤 Vos membres suivis";
    if (userRole === "ResponsableCellule") return "🏠 Membres de votre cellule";
    return "🏢 Tous les membres de la branche";
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📋 ÉCRAN DE CONFIGURATION DE SESSION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />

        <div className="w-full max-w-lg mt-6">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            📋 Nouvelle Session de Présence
          </h1>
          <p className="text-white/70 text-center text-sm mb-8">
            Configurez la session avant de commencer
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">

            {/* DATE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">📅 Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
              />
            </div>

            {/* TYPE DE TEMPS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">⛪ Type de temps *</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_TEMPS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTypeTemps(t.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${
                      typeTemps === t.value
                        ? "border-[#333699] bg-[#333699] text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#333699]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* NOM PERSONNALISÉ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ✏️ Nom du temps <span className="font-normal text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text"
                placeholder={typeTemps || "Ex: Culte de Pâques"}
                value={tempsNom}
                onChange={(e) => setTempsNom(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
              />
            </div>

            {/* COMPTEURS INITIAUX */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔢 Compteurs manuels
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "hommes", label: "👨 Hommes" },
                  { key: "femmes", label: "👩 Femmes" },
                  { key: "jeunes", label: "🧑 Jeunes" },
                  { key: "enfants", label: "👶 Enfants" },
                  { key: "evangelises", label: "📢 Évangélisés" },
                  { key: "nouveauxVenus", label: "🆕 Nouveaux venus" },
                  { key: "nouveauxConvertis", label: "✝️ Nouveaux convertis" },
                  { key: "connectes", label: "📱 Connectés" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-600 font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCompteur(key, -1)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-200 text-gray-700 font-bold text-sm flex items-center justify-center"
                      >−</button>
                      <span className="w-6 text-center font-bold text-gray-800 text-sm">
                        {compteurs[key]}
                      </span>
                      <button
                        onClick={() => updateCompteur(key, 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-green-200 text-gray-700 font-bold text-sm flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOUTON DÉMARRER */}
            <button
              onClick={demarrerSession}
              disabled={!typeTemps || savingAttendance}
              className={`w-full py-3 rounded-xl font-bold text-white text-lg transition ${
                typeTemps
                  ? "bg-[#333699] hover:bg-[#2a2d80]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {savingAttendance ? "Démarrage..." : "▶ Démarrer la prise de présence"}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ ÉCRAN PRINCIPAL DE PRÉSENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mt-4 text-white">
          Présences du <span className="text-emerald-300">jour</span>
        </h1>
        {/* BADGE TYPE TEMPS */}
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
          {TYPES_TEMPS.find(t => t.value === typeTemps)?.label || typeTemps}
          {tempsNom && tempsNom !== typeTemps && ` — ${tempsNom}`}
        </span>

        {userRole && (
          <p className="text-white/70 text-sm mt-1">{getRoleLabel()}</p>
        )}

        <div className="flex justify-center mt-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-md text-black text-sm"
          />
        </div>

        <div className="flex gap-4 justify-center mt-3 text-sm">
          <span className="text-green-300">✔ Présents : {presentList.length}</span>
          <span className="text-white">⚪ Restants : {members.length}</span>
        </div>
      </div>

      {/* COMPTEURS RAPIDES (modifiables pendant la session) */}
      <div className="w-full max-w-4xl bg-white/10 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">🔢 Compteurs manuels</h3>
          <button
            onClick={sauvegarderCompteurs}
            disabled={savingAttendance}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-semibold"
          >
            {attendanceSaved ? "✔ Sauvegardé !" : savingAttendance ? "..." : "💾 Sauvegarder"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: "hommes", label: "👨 Hommes" },
            { key: "femmes", label: "👩 Femmes" },
            { key: "jeunes", label: "🧑 Jeunes" },
            { key: "enfants", label: "👶 Enfants" },
            { key: "evangelises", label: "📢 Évangélisés" },
            { key: "nouveauxVenus", label: "🆕 Nouveaux" },
            { key: "nouveauxConvertis", label: "✝️ Convertis" },
            { key: "connectes", label: "📱 Connectés" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between bg-white/10 rounded-lg px-2 py-2">
              <span className="text-xs text-white/80">{label}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateCompteur(key, -1)}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-red-400 text-white font-bold text-xs flex items-center justify-center"
                >−</button>
                <span className="w-5 text-center font-bold text-white text-sm">
                  {compteurs[key]}
                </span>
                <button
                  onClick={() => updateCompteur(key, 1)}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-green-400 text-white font-bold text-xs flex items-center justify-center"
                >+</button>
              </div>
            </div>
          ))}
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
                <h2 className="font-bold text-black text-lg">{m.prenom} {m.nom}</h2>
                <div className="mt-2 text-green-600 font-semibold text-sm">➕ Marquer comme présent</div>
              </div>
            ))
          )
        ) : (
          filteredPresents.length === 0 ? (
            <p className="text-white text-center col-span-full">Aucune présence</p>
          ) : (
            filteredPresents.map((p) => (
              <div key={p.membre_id} className="bg-white rounded-xl shadow p-4">
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

      {/* BOUTON NOUVELLE SESSION */}
      <button
        onClick={() => {
          setSessionReady(false);
          setAttendanceId(null);
          setTypeTemps("");
          setTempsNom("");
          setCompteurs({ hommes: 0, femmes: 0, jeunes: 0, enfants: 0, evangelises: 0, nouveauxVenus: 0, nouveauxConvertis: 0, connectes: 0 });
        }}
        className="mt-8 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm"
      >
        ↩ Nouvelle session
      </button>

      <Footer />
    </div>
  );
}
