"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";

function getRoles(profile) {
  if (!profile) return [];
  if (Array.isArray(profile.roles)) return profile.roles;
  if (typeof profile.roles === "string") {
    return profile.roles.replace("{", "").replace("}", "").split(",").map((r) => r.trim());
  }
  if (profile.role) return [profile.role];
  return [];
}

function formatDateFr(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBorderColor(type) {
  switch (type) {
    case "nouveau":       return "#fb923c";
    case "existant":      return "#4ade80";
    case "evangelise":    return "#a78bfa";
    case "new_in_cellule": return "#38bdf8";
    default:              return "#9ca3af";
  }
}

function TypeBadge({ type }) {
  const config = {
    nouveau:        { bg: "#fff7ed", text: "#ea580c", dot: "#fb923c",  label: "Nouveau membre" },
    existant:       { bg: "#f0fdf4", text: "#16a34a", dot: "#4ade80",  label: "Existant" },
    evangelise:     { bg: "#f5f3ff", text: "#7c3aed", dot: "#a78bfa",  label: "Évangélisé" },
    new_in_cellule: { bg: "#f0f9ff", text: "#0369a1", dot: "#38bdf8",  label: "Ajouté en cellule/famille" },
  };
  const c = config[type] || config.existant;
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: "11px", fontWeight: "700",
      borderRadius: "999px", padding: "2px 10px",
      display: "inline-flex", alignItems: "center", gap: "5px",
    }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.label}
    </span>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Conseiller", "ResponsableFamilles", "ResponsableCellule", "SuperviseurCellule", "ResponsableIntegration", "ResponsableEvangelisation"]}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const channelRef = useRef(null);

  // ─── Charger profil + notifications selon rôle ───────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, prenom, nom, eglise_id, roles, role")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      setUserProfile(profile);
      await fetchNotifications(profile);
      setLoading(false);
    };

    init();
  }, []);

  const fetchNotifications = async (profile) => {
    if (!profile) return;
    const roles = getRoles(profile);
    const isAdmin               = roles.includes("Administrateur");
    const isResponsableInteg    = roles.includes("ResponsableIntegration");
    const isResponsableEvang    = roles.includes("ResponsableEvangelisation");
    const isSuperviseurCellule  = roles.includes("SuperviseurCellule");
    const isResponsableCellule  = roles.includes("ResponsableCellule");
    const isConseiller          = roles.includes("Conseiller");

    let allNotifs = [];

    // ── 1. Nouveaux membres (etat_contact = "nouveau") ──
    // Administrateur, ResponsableIntegration, Conseiller, ResponsableCellule
    if (isAdmin || isResponsableInteg || isConseiller || isResponsableCellule) {
      let query = supabase
        .from("membres_complets")
        .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id")
        .eq("eglise_id", profile.eglise_id)
        .eq("etat_contact", "nouveau")
        .order("created_at", { ascending: false });

      // Conseiller → seulement ses membres assignés
      if (isConseiller && !isAdmin && !isResponsableInteg) {
        const { data: assignments } = await supabase
          .from("suivi_assignments")
          .select("membre_id")
          .eq("conseiller_id", profile.id);
        const ids = (assignments || []).map((a) => a.membre_id);
        if (ids.length === 0) {
          query = null;
        } else {
          query = query.in("id", ids);
        }
      }

      // ResponsableCellule → membres de ses cellules uniquement
      if (isResponsableCellule && !isAdmin && !isResponsableInteg && !isConseiller) {
        const { data: cellules } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", profile.id);
        const celluleIds = (cellules || []).map((c) => c.id);
        if (celluleIds.length === 0) {
          query = null;
        } else {
          query = query.in("cellule_id", celluleIds);
        }
      }

      if (query) {
        const { data } = await query;
        const mapped = (data || []).map((m) => ({
          ...m,
          _type: "nouveau",
          _date: m.created_at,
        }));
        allNotifs = [...allNotifs, ...mapped];
      }
    }

    // ── 2. Évangélisés non envoyés (status_suivi = "Non envoyé") ──
    // Administrateur, ResponsableEvangelisation
    if (isAdmin || isResponsableEvang) {
      const { data } = await supabase
        .from("evangelises")
        .select("id, prenom, nom, created_at, eglise_id")
        .eq("eglise_id", profile.eglise_id)
        .eq("status_suivi", "Non envoyé")
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((e) => ({
        ...e,
        _type: "evangelise",
        _date: e.created_at,
      }));
      allNotifs = [...allNotifs, ...mapped];
    }

    // ── 3. Membres ajoutés via cellule/famille (is_new_in_cellule = "true") ──
    // Administrateur, SuperviseurCellule
    if (isAdmin || isSuperviseurCellule) {
      const { data } = await supabase
        .from("membres_complets")
        .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id, is_new_in_cellule")
        .eq("eglise_id", profile.eglise_id)
        .eq("is_new_in_cellule", "true")
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((m) => ({
        ...m,
        _type: "new_in_cellule",
        _date: m.created_at,
      }));
      allNotifs = [...allNotifs, ...mapped];
    }

    // ── Trier par date décroissante ──
    allNotifs.sort((a, b) => new Date(b._date) - new Date(a._date));

    // ── Dédoublonner par id + type ──
    const seen = new Set();
    const deduped = allNotifs.filter((n) => {
      const key = `${n._type}-${n.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setNotifications(deduped);
  };

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile) return;

    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch (_) {}
    }

    const roles = getRoles(userProfile);
    const isAdmin              = roles.includes("Administrateur");
    const isResponsableEvang   = roles.includes("ResponsableEvangelisation");
    const isSuperviseurCellule = roles.includes("SuperviseurCellule");

    const channel = supabase.channel(`notifications-page-${userProfile.eglise_id}`);

    // Nouveaux membres
    channel
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "membres_complets" },
        (payload) => {
          const row = payload.new;
          if (row.eglise_id !== userProfile.eglise_id) return;

          if (row.etat_contact === "nouveau") {
            setNotifications((prev) => [{ ...row, _type: "nouveau", _date: row.created_at }, ...prev]);
          }
          if ((isAdmin || isSuperviseurCellule) && row.is_new_in_cellule === "true") {
            setNotifications((prev) => [{ ...row, _type: "new_in_cellule", _date: row.created_at }, ...prev]);
          }
        }
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "membres_complets" },
        (payload) => {
          const row = payload.new;
          if (row.etat_contact !== "nouveau") {
            setNotifications((prev) => prev.filter((n) => !(n._type === "nouveau" && n.id === row.id)));
          }
          if (row.is_new_in_cellule !== "true") {
            setNotifications((prev) => prev.filter((n) => !(n._type === "new_in_cellule" && n.id === row.id)));
          }
        }
      );

    // Évangélisés
    if (isAdmin || isResponsableEvang) {
      channel
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "evangelises" },
          (payload) => {
            const row = payload.new;
            if (row.eglise_id === userProfile.eglise_id && row.status_suivi === "Non envoyé") {
              setNotifications((prev) => [{ ...row, _type: "evangelise", _date: row.created_at }, ...prev]);
            }
          }
        )
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "evangelises" },
          (payload) => {
            const row = payload.new;
            if (row.status_suivi !== "Non envoyé") {
              setNotifications((prev) => prev.filter((n) => !(n._type === "evangelise" && n.id === row.id)));
            }
          }
        );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [userProfile]);

  // ─── Recherche ────────────────────────────────────────────────────────────
  const filtered = notifications.filter((n) =>
    `${n.prenom || ""} ${n.nom || ""} ${n.ville || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Navigation au clic ───────────────────────────────────────────────────
  const handleClick = (n) => {
    if (n._type === "evangelise") {
      router.push(`/evangelisation/suivis-evangelisation`);
    } else {
      router.push(`/ListMembers?search=${encodeURIComponent(`${n.prenom} ${n.nom}`)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4" style={{ background: "#333699" }}>
      <HeaderPages />

      <div className="w-full max-w-3xl mt-4 mb-6">

        {/* Titre */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🔔 <span>Notifications</span>
          </h1>
          <span style={{
            background: "#ef4444", color: "#fff",
            fontSize: "12px", fontWeight: "700",
            borderRadius: "999px", padding: "2px 12px",
          }}>
            {filtered.length} nouveau{filtered.length > 1 ? "x" : ""}
          </span>
        </div>

        <p className="text-white/60 text-sm mb-4">Toutes vos notifications</p>

        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-0 text-black text-sm mb-4"
          style={{ outline: "none" }}
        />

        {/* Liste */}
        {loading ? (
          <p className="text-white text-center py-10">Chargement...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div style={{ fontSize: "48px" }}>✅</div>
            <p className="text-white/70 mt-3 text-sm">Aucune nouvelle notification</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((n, i) => (
              <div
                key={`${n._type}-${n.id}-${i}`}
                onClick={() => handleClick(n)}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  borderLeft: `4px solid ${getBorderColor(n._type)}`,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.13)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "42px", height: "42px", borderRadius: "50%",
                  background: n._type === "evangelise" ? "#f5f3ff" : "#fff7ed",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", flexShrink: 0,
                }}>
                  {n._type === "evangelise" ? "💗" : "👤"}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <p style={{ fontWeight: "700", fontSize: "14px", color: "#111827", margin: 0 }}>
                      {n.prenom} {n.nom}
                    </p>
                    <TypeBadge type={n._type} />
                  </div>
                  {n.ville && (
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>
                      🏙️ {n.ville}
                    </p>
                  )}
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>
                    📅 {formatDateFr(n._date)}
                  </p>
                </div>

                {/* Flèche */}
                <span style={{ color: "#d1d5db", fontSize: "18px", flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
