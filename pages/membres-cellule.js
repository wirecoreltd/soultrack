"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import ProtectedRoute from "../components/ProtectedRoute";
import HeaderPages from "../components/HeaderPages";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";
import DetailsCelluleMemberPopup from "../components/DetailsCelluleMemberPopup";

export default function MembresCellule() {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Administrateur",
        "ResponsableCellule",
        "SuperviseurCellule",
      ]}
    >
      <MembresCelluleContent />
    </ProtectedRoute>
  );
}

function MembresCelluleContent() {
  const [loading, setLoading] = useState(true);
  const [errorScreen, setErrorScreen] = useState("");
  const [debug, setDebug] = useState(null);

  const [profile, setProfile] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [membres, setMembres] = useState([]);

  const [filterCellule, setFilterCellule] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("card");

  const [editMember, setEditMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handler = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= FETCH GLOBAL ================= */
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        /* -------- SESSION -------- */
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData?.session?.user) {
          throw new Error("Session introuvable");
        }

        const userId = sessionData.session.user.id;

        /* -------- PROFILE -------- */
        const { data: prof, error: profError } = await supabase
          .from("profiles")
          .select("id, role, eglise_id, branche_id")
          .eq("id", userId)
          .single();

        if (profError || !prof) {
          throw new Error("Profil introuvable");
        }

        setProfile(prof);

        if (!prof.eglise_id || !prof.branche_id) {
          throw new Error(
            "Compte non rattaché à une église ou une branche"
          );
        }

        /* -------- CELLULES -------- */
        let celluleQuery = supabase
          .from("cellules")
          .select("id, cellule_full, responsable_id")
          .eq("eglise_id", prof.eglise_id)
          .eq("branche_id", prof.branche_id);

        if (prof.role === "ResponsableCellule") {
          celluleQuery = celluleQuery.eq("responsable_id", prof.id);
        }

        const { data: cellulesData, error: celluleError } =
          await celluleQuery;

        if (celluleError) throw celluleError;

        setCellules(cellulesData || []);

        if (!cellulesData || cellulesData.length === 0) {
          setMembres([]);
          setLoading(false);
          return;
        }

        const celluleIds = cellulesData.map((c) => c.id);

        /* -------- MEMBRES -------- */
        const { data: membresData, error: membreError } = await supabase
          .from("membres_complets")
          .select("*")
          .in("cellule_id", celluleIds)
          .eq("eglise_id", prof.eglise_id)
          .eq("branche_id", prof.branche_id)
          .eq("statut_suivis", 3)
          .order("created_at", { ascending: false });

        if (membreError) throw membreError;

        setMembres(membresData || []);
        setDebug({
          cellules: cellulesData?.length,
          membres: membresData?.length,
        });
      } catch (err) {
        console.error("❌ ERREUR:", err);
        setErrorScreen(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  /* ================= HELPERS ================= */
  const getCelluleNom = (id) =>
    cellules.find((c) => c.id === id)?.cellule_full || "—";

  const filteredMembres = membres.filter((m) => {
    const matchCellule = !filterCellule || m.cellule_id === filterCellule;
    const matchSearch =
      !search ||
      `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      (m.telephone || "").includes(search);
    return matchCellule && matchSearch;
  });

  /* ================= ÉTATS ================= */
  if (loading)
    return (
      <p className="text-white text-center mt-10">Chargement…</p>
    );

  if (errorScreen)
    return (
      <div className="text-white text-center mt-10 space-y-4">
        <p className="text-red-400 font-bold">Erreur</p>
        <p>{errorScreen}</p>
        <pre className="text-xs opacity-70">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </div>
    );

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />

      <h1 className="text-white text-2xl font-bold text-center mb-4">
        Membres de mes cellules
      </h1>

      {/* Recherche + filtre */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <input
          className="px-3 py-2 rounded text-black w-full max-w-md"
          placeholder="Recherche…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-3 py-2 rounded text-black"
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
        >
          <option value="">Toutes les cellules</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule_full}
            </option>
          ))}
        </select>

        <span className="text-white text-sm">
          {filteredMembres.length} membres
        </span>
      </div>

      {/* Liste */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredMembres.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded-xl">
            <h2 className="font-bold text-center">
              {m.prenom} {m.nom}
            </h2>
            <p className="text-center text-sm">{m.telephone}</p>
            <p className="text-center text-sm">
              {getCelluleNom(m.cellule_id)}
            </p>

            <button
              onClick={() => setDetailsMember(m)}
              className="text-blue-600 underline block mx-auto mt-2 text-sm"
            >
              Détails
            </button>
          </div>
        ))}
      </div>

      {/* Popups */}
      <DetailsCelluleMemberPopup
        member={detailsMember}
        onClose={() => setDetailsMember(null)}
        getCelluleNom={getCelluleNom}
        onEdit={(m) => {
          setEditMember(m);
          setDetailsMember(null);
        }}
      />

      {editMember && (
        <EditMemberCellulePopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={(u) => {
            setMembres((prev) =>
              prev.map((m) => (m.id === u.id ? u : m))
            );
            setEditMember(null);
          }}
        />
      )}
    </div>
  );
}
