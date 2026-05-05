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

function getBorderColor(etat) {
  switch ((etat || "").toLowerCase()) {
    case "nouveau":  return "#fb923c";
    case "existant": return "#4ade80";
    case "inactif":  return "#9ca3af";
    default:         return "#9ca3af";
  }
}

function EtatBadge({ etat }) {
  const colors = {
    nouveau:  { bg: "#fff7ed", text: "#ea580c", dot: "#fb923c" },
    existant: { bg: "#f0fdf4", text: "#16a34a", dot: "#4ade80" },
    inactif:  { bg: "#f9fafb", text: "#6b7280", dot: "#9ca3af" },
  };
  const c = colors[(etat || "").toLowerCase()] || colors.inactif;
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: "11px", fontWeight: "700",
      borderRadius: "999px", padding: "2px 10px",
      display: "inline-flex", alignItems: "center", gap: "5px",
    }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {etat || "—"}
    </span>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "Conseiller", "ResponsableFamilles", "ResponsableCellule", "ResponsableIntegration"]}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const channelRef = useRef(null);

  // ─── Charger profil + membres selon rôle ─────────────────────────────────
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

      await fetchMembres(profile);
      setLoading(false);
    };

    init();
  }, []);

  const fetchMembres = async (profile) => {
    if (!profile) return;
    const roles = getRoles(profile);
    const isAdmin = roles.includes("Administrateur") || roles.includes("ResponsableIntegration");
    const isConseiller = roles.includes("Conseiller");
    const isResponsableCellule = roles.includes("ResponsableCellule");

    let query = supabase
      .from("membres_complets")
      .select("id, prenom, nom, telephone, ville, etat_contact, created_at, cellule_id, eglise_id")
      .eq("eglise_id", profile.eglise_id)
      .eq("etat_contact", "nouveau")
      .order("created_at", { ascending: false });

    // Conseiller → seulement ses membres assignés
    if (isConseiller && !isAdmin) {
      const { data: assignments } = await supabase
        .from("suivi_assignments")
        .select("membre_id")
        .eq("conseiller_id", profile.id);

      const ids = (assignments || []).map((a) => a.membre_id);
      if (ids.length === 0) {
        setMembres([]);
        return;
      }
      query = query.in("id", ids);
    }

    // ResponsableCellule → membres de ses cellules
    if (isResponsableCellule && !isAdmin && !isConseiller) {
      const { data: cellules } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", profile.id);

      const celluleIds = (cellules || []).map((c) => c.id);
      if (celluleIds.length === 0) {
        setMembres([]);
        return;
      }
      query = query.in("cellule_id", celluleIds);
    }

    const { data } = await query;
    setMembres(data || []);
  };

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile) return;

    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch (_) {}
    }

    const channel = supabase
      .channel(`notifications-page-${userProfile.eglise_id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "membres_complets" },
        (payload) => {
          const row = payload.new;
          if (row.eglise_id === userProfile.eglise_id && row.etat_contact === "nouveau") {
            setMembres((prev) => [row, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "membres_complets" },
        (payload) => {
          const row = payload.new;
          if (row.etat_contact !== "nouveau") {
            setMembres((prev) => prev.filter((m) => m.id !== row.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [userProfile]);

  // ─── Recherche ────────────────────────────────────────────────────────────
  const filtered = membres.filter((m) =>
    `${m.prenom || ""} ${m.nom || ""} ${m.ville || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const roles = getRoles(userProfile);
  const isAdmin = roles.includes("Administrateur") || roles.includes("ResponsableIntegration");
  const isConseiller = roles.includes("Conseiller");
  const isResponsableCellule = roles.includes("ResponsableCellule");

  const roleLabel = isAdmin
    ? "Tous les nouveaux membres"
    : isConseiller
    ? "Vos membres assignés (nouveaux)"
    : isResponsableCellule
    ? "Nouveaux membres de vos cellules"
    : "Notifications";

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

        <p className="text-white/60 text-sm mb-4">{roleLabel}</p>

        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Rechercher un membre..."
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
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => router.push(`/ListMembers?search=${encodeURIComponent(`${m.prenom} ${m.nom}`)}`)}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  borderLeft: `4px solid ${getBorderColor(m.etat_contact)}`,
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
                  background: "#fff7ed", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", flexShrink: 0,
                }}>
                  👤
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <p style={{ fontWeight: "700", fontSize: "14px", color: "#111827", margin: 0 }}>
                      {m.prenom} {m.nom}
                    </p>
                    <EtatBadge etat={m.etat_contact} />
                  </div>
                  {m.ville && (
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>
                      🏙️ {m.ville}
                    </p>
                  )}
                  <p style={{ fontSize: "11px", color: "#d1d5db", margin: "2px 0 0" }}>
                    📅 {formatDateFr(m.created_at)}
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
