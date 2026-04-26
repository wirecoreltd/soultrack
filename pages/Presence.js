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

// ─── FORMULAIRE SESSION ────────────────────────────────────────
function FormulaireSession({
  isEdit,
  selectedDate, setSelectedDate,
  typeTemps, setTypeTemps,
  nouveauTemps, setNouveauTemps,
  enregistrerTemps, setEnregistrerTemps,
  numeroCulte, setNumeroCulte,
  tempsOptions,
  savingSession,
  onSubmit,
  onCancel,
}) {
  const typeFinalLabel = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;

  // Culte si le type contient "culte" (insensible à la casse)
  const isCulte = typeFinalLabel?.toLowerCase().includes("culte");

  const isDisabled = savingSession
    || !typeTemps
    || (typeTemps === "AUTRE" && !nouveauTemps.trim());

  return (
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
  <label className="block text-sm font-semibold text-gray-700 mb-1">⛪ Type de temps *</label>
  {/* ✅ MESSAGE ICI */}
  <p className="text-xs text-gray-400 mb-2">
    Le type sélectionné sera visible dans le rapport <span className="font-medium text-[#333699]">Présences & Statistiques</span>.
  </p>
  <div className="grid grid-cols-2 gap-2">
          {tempsOptions.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setTypeTemps(t); setNouveauTemps(""); setNumeroCulte(""); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${
                typeTemps === t
                  ? "border-[#333699] bg-[#333699] text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#333699]"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setTypeTemps("AUTRE"); setNumeroCulte(""); }}
            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition text-left ${
              typeTemps === "AUTRE"
                ? "border-[#333699] bg-[#333699] text-white"
                : "border-dashed border-gray-300 bg-white text-gray-500 hover:border-[#333699]"
            }`}
          >
            ➕ Nouveau type...
          </button>
        </div>
      </div>

      {/* NOUVEAU TYPE */}
      {typeTemps === "AUTRE" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ✏️ Nom du nouveau type
            </label>
            <input
              type="text"
              placeholder="Ex: Tour de Prière, Camp..."
              value={nouveauTemps}
              onChange={(e) => setNouveauTemps(e.target.value.slice(0, 30))}
              maxLength={30}
              autoFocus
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
            />
            <p className="text-xs text-gray-400 mt-1">{nouveauTemps.length}/30 caractères</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-amber-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enregistrerTemps}
              onChange={e => setEnregistrerTemps(e.target.checked)}
            />
            Enregistrer ce type pour une prochaine fois
          </label>
        </div>
      )}

      {/* NUMÉRO CULTE — visible si le type contient "culte" */}
      {isCulte && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            🔢 Numéro de culte
          </label>
          <select
            value={numeroCulte}
            onChange={e => setNumeroCulte(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
          >
            <option value="">--- Sélectionner ---</option>
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <option key={n} value={n}>
                {n}{n === 1 ? "er" : "ème"} Culte
              </option>
            ))}
          </select>
        </div>
      )}      

      {/* BOUTON */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className={`w-full py-3 rounded-xl font-bold text-white text-base transition ${
          isDisabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-[#333699] hover:bg-[#2a2d80]"
        }`}
      >
        {savingSession
          ? "..."
          : isEdit
            ? "💾 Enregistrer les modifications"
            : "▶ Démarrer la prise de présence"
        }
      </button>

      {isEdit && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 rounded-xl font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 text-sm"
        >
          Annuler
        </button>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────
function Presence() {
  const [sessionReady, setSessionReady] = useState(false);
  const [attendanceId, setAttendanceId] = useState(null);
  const [editingSession, setEditingSession] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [typeTemps, setTypeTemps] = useState("");
  const [nouveauTemps, setNouveauTemps] = useState("");
  const [enregistrerTemps, setEnregistrerTemps] = useState(false);
  const [numeroCulte, setNumeroCulte] = useState("");
  const [tempsOptions, setTempsOptions] = useState([]);
  const [savingSession, setSavingSession] = useState(false);

  const [members, setMembers] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("absents");
  const [userRole, setUserRole] = useState(null);

  const profileRef = useRef(null);
  const myIdsRef = useRef(null);

  // ─── INIT PROFIL ──────────────────────────────────────────────
  const initProfile = useCallback(async () => {
    if (profileRef.current) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("eglise_id, branche_id, role, roles")
      .eq("id", user.id)
      .single();

    profileRef.current = { ...profile, uid: user.id };
    setUserRole(profile.role);

    if (
      profile.roles?.includes("Administrateur") ||
      profile.roles?.includes("ResponsableIntegration")
    ) {
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
        .from("membres_complets").select("id").eq("cellule_id", celluleResult.data.id);
      cellulesMembers?.forEach(m => ids.add(m.id));
    }
    myIdsRef.current = [...ids];
  }, []);

  // ─── CHARGER TYPES DE TEMPS ───────────────────────────────────
  const loadTempsOptions = useCallback(async () => {
    await initProfile();
    const profile = profileRef.current;

    const { data, error } = await supabase
      .from("attendance")
      .select("typeTemps")
      .eq("eglise_id", profile.eglise_id)
      .eq("branche_id", profile.branche_id)
      .not("typeTemps", "is", null);

    if (error) { console.error(error); return; }

    const unique = [
      ...new Set(
        (data || [])
          .map(t => t.typeTemps?.trim())
          .filter(t => t && t !== "")
      )
    ];

    // Culte Dominical toujours en premier
    const hasCulteDominical = unique.includes("Culte Dominical");
    const sorted = hasCulteDominical
      ? ["Culte Dominical", ...unique.filter(t => t !== "Culte Dominical")]
      : ["Culte Dominical", ...unique];

    setTempsOptions(sorted);
  }, [initProfile]);

  useEffect(() => {
    loadTempsOptions();
  }, [loadTempsOptions]);

  // ─── FETCH MEMBRES + PRÉSENCES ────────────────────────────────
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
    if (!sessionReady) return;
    setLoading(true);
    fetchAll(selectedDate).finally(() => setLoading(false));

    const channel = supabase
      .channel("presence-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "presences" }, () => fetchAll(selectedDate))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedDate, sessionReady]);

  // ─── DÉMARRER SESSION ─────────────────────────────────────────
  const demarrerSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal) return alert("Veuillez choisir un type de temps.");
    if (!selectedDate) return alert("Veuillez choisir une date.");

    setSavingSession(true);
    try {
      const profile = profileRef.current;

      if (typeTemps === "AUTRE" && enregistrerTemps && !tempsOptions.includes(typeFinal)) {
        setTempsOptions(prev => [...prev, typeFinal]);
      }

      const isCulte = typeFinal.toLowerCase().includes("culte");

      const payload = {
        date: selectedDate,
        typeTemps: typeFinal,
        temps_nom: typeFinal,
        branche_id: profile.branche_id,
        eglise_id: profile.eglise_id,
        ...(isCulte && numeroCulte ? { numero_culte: Number(numeroCulte) } : {}),
      };

      const { data, error } = await supabase
        .from("attendance")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;

      setAttendanceId(data.id);
      setSessionReady(true);
      setEditingSession(false);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ─── MODIFIER SESSION ─────────────────────────────────────────
  const modifierSession = async () => {
    const typeFinal = typeTemps === "AUTRE" ? nouveauTemps.trim() : typeTemps;
    if (!typeFinal || !attendanceId) return;

    setSavingSession(true);
    try {
      const isCulte = typeFinal.toLowerCase().includes("culte");

      const payload = {
        date: selectedDate,
        typeTemps: typeFinal,
        temps_nom: typeFinal,
        ...(isCulte && numeroCulte
          ? { numero_culte: Number(numeroCulte) }
          : { numero_culte: null }),
      };

      const { error } = await supabase
        .from("attendance")
        .update(payload)
        .eq("id", attendanceId);

      if (error) throw error;
      setEditingSession(false);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ─── PRÉSENCE ─────────────────────────────────────────────────
  const markPresent = async (membre) => {
    try {
      const { uid } = profileRef.current;
      await supabase.from("presences").insert({
        membre_id: membre.id,
        date: selectedDate,
        checked_by: uid,
        attendance_id: attendanceId,
      });
      await fetchAll(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

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

  // ─── FILTRES ──────────────────────────────────────────────────
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

  const typeFinalLabel = typeTemps === "AUTRE" ? nouveauTemps : typeTemps;

  // ━━━ ÉCRAN CONFIG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
        <HeaderPages />
        <div className="w-full max-w-lg mt-6">
          <h1 className="text-2xl font-bold text-white text-center mb-2">📋 Nouvelle Session</h1>
          <p className="text-white/70 text-center text-sm mb-6">
            Configurez la session avant de commencer
          </p>
          <FormulaireSession
            isEdit={false}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
            tempsOptions={tempsOptions}
            savingSession={savingSession}
            onSubmit={demarrerSession}
            onCancel={null}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // ━━━ ÉCRAN PRÉSENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="text-center mb-4 mt-4">
        <h1 className="text-2xl font-bold text-white">
          Présences du <span className="text-emerald-300">jour</span>
        </h1>

        {/* RÉSUMÉ SESSION cliquable */}
        <div
          className="inline-flex flex-col items-center mt-3 px-4 py-2 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition group"
          onClick={() => setEditingSession(v => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">
              {typeFinalLabel}
              {numeroCulte
                ? ` — ${numeroCulte}${Number(numeroCulte) === 1 ? "er" : "ème"} culte`
                : ""}
            </span>
            <span className="text-white/50 text-xs group-hover:text-white transition">✏️</span>
          </div>
          <span className="text-white/60 text-xs mt-0.5">
            📅 {new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-FR", {
              day: "2-digit", month: "long", year: "numeric"
            })}
          </span>
          <span className="text-white/40 text-xs mt-0.5">Cliquer pour modifier</span>
        </div>

        {userRole && <p className="text-white/70 text-sm mt-2">{getRoleLabel()}</p>}

        <div className="flex gap-4 justify-center mt-3 text-sm">
          <span className="text-green-300">✔ Présents : {presentList.length}</span>
          <span className="text-white">⚪ Restants : {members.length}</span>
        </div>
      </div>

      {/* MODIFICATION SESSION INLINE */}
      {editingSession && (
        <div className="w-full max-w-lg mb-6">
          <h2 className="text-white font-semibold text-center mb-3">✏️ Modifier la session</h2>
          <FormulaireSession
            isEdit={true}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            typeTemps={typeTemps} setTypeTemps={setTypeTemps}
            nouveauTemps={nouveauTemps} setNouveauTemps={setNouveauTemps}
            enregistrerTemps={enregistrerTemps} setEnregistrerTemps={setEnregistrerTemps}
            numeroCulte={numeroCulte} setNumeroCulte={setNumeroCulte}
            tempsOptions={tempsOptions}
            savingSession={savingSession}
            onSubmit={modifierSession}
            onCancel={() => setEditingSession(false)}
          />
        </div>
      )}

      {/* LISTE */}
      {!editingSession && (
        <>
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
                filteredAbsents.map(m => (
                  <div
                    key={m.id}
                    onClick={() => markPresent(m)}
                    className="bg-white rounded-xl shadow p-4 cursor-pointer hover:bg-green-100 transition"
                  >
                    <h2 className="font-bold text-black text-lg">{m.prenom} {m.nom}</h2>
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
                filteredPresents.map(p => (
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

          <button
            onClick={() => {
              setSessionReady(false);
              setAttendanceId(null);
              setTypeTemps("");
              setNouveauTemps("");
              setNumeroCulte("");
              setEnregistrerTemps(false);
            }}
            className="mt-8 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm"
          >
            ↩ Nouvelle session
          </button>
        </>
      )}

      <Footer />
    </div>
  );
}
