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
    case "nouveau":              return "#fb923c";
    case "existant":             return "#4ade80";
    case "evangelise":           return "#a78bfa";
    case "new_in_cellule":       return "#38bdf8";
    case "membre_assigne":       return "#f59e0b"; // or/jaune — suivi membre
    case "membre_assigne_evang": return "#10b981"; // vert émeraude — évangélisé
    default:                     return "#9ca3af";
  }
}

function TypeBadge({ type }) {
  const config = {
    nouveau:              { bg: "#fff7ed", text: "#ea580c", dot: "#fb923c", label: "Nouveau membre" },
    existant:             { bg: "#f0fdf4", text: "#16a34a", dot: "#4ade80", label: "Existant" },
    evangelise:           { bg: "#f5f3ff", text: "#7c3aed", dot: "#a78bfa", label: "Évangélisé" },
    new_in_cellule:       { bg: "#f0f9ff", text: "#0369a1", dot: "#38bdf8", label: "Ajouté en cellule/famille" },
    membre_assigne:       { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b", label: "Membre assigné" },
    membre_assigne_evang: { bg: "#ecfdf5", text: "#065f46", dot: "#10b981", label: "Évangélisé assigné" }, // ✅ NOUVEAU
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
  const [userProfile,    setUserProfile]    = useState(null);
  const [notifications,  setNotifications]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const channelRef = useRef(null);

  // ─── Charger profil + notifications ──────────────────────────────────────
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
    const isResponsableFamilles = roles.includes("ResponsableFamilles");

    let allNotifs = [];

    // ── 1. Nouveaux membres (etat_contact = "nouveau") ──
    if (isAdmin || isResponsableInteg || isConseiller || isResponsableCellule) {
      let query = supabase
        .from("membres_complets")
        .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id")
        .eq("eglise_id", profile.eglise_id)
        .eq("etat_contact", "nouveau")
        .order("created_at", { ascending: false });

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

    // ── 2. Évangélisés non envoyés ──
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

    // ── 3. Ajoutés en cellule/famille ──
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

    // ── 4. Membres assignés (membres_complets) ──
    {
      let assignesNotifs = [];

      // 4a. Conseiller
      const { data: parConseiller } = await supabase
        .from("membres_complets")
        .select("id, prenom, nom, ville, created_at, date_envoi_suivi, eglise_id, suivi_cellule_nom, famille_id, cellule_id")
        .eq("suivi_responsable_id", profile.id)
        .eq("notification_responsable", true)
        .order("date_envoi_suivi", { ascending: false });
      assignesNotifs = [...assignesNotifs, ...(parConseiller || [])];

      // 4b. ResponsableCellule
      const { data: cellulesDuResp } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", profile.id);
      const idsCellules = (cellulesDuResp || []).map((c) => c.id);

      if (idsCellules.length > 0) {
        const { data: parCellule } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, ville, created_at, date_envoi_suivi, eglise_id, suivi_cellule_nom, famille_id, cellule_id")
          .in("cellule_id", idsCellules)
          .eq("notification_responsable", true)
          .order("date_envoi_suivi", { ascending: false });
        assignesNotifs = [...assignesNotifs, ...(parCellule || [])];
      }

      // 4c. ResponsableFamilles
      const { data: famillesDuResp } = await supabase
        .from("familles")
        .select("id")
        .eq("responsable_id", profile.id);
      const idsFamilles = (famillesDuResp || []).map((f) => f.id);

      if (idsFamilles.length > 0) {
        const { data: parFamille } = await supabase
          .from("membres_complets")
          .select("id, prenom, nom, ville, created_at, date_envoi_suivi, eglise_id, suivi_cellule_nom, famille_id, cellule_id")
          .in("famille_id", idsFamilles)
          .eq("notification_responsable", true)
          .order("date_envoi_suivi", { ascending: false });
        assignesNotifs = [...assignesNotifs, ...(parFamille || [])];
      }

      const mapped = assignesNotifs.map((m) => ({
        ...m,
        _type: "membre_assigne",
        _date: m.date_envoi_suivi || m.created_at,
      }));
      allNotifs = [...allNotifs, ...mapped];
    }

    // ── 5. ✅ Évangélisés assignés (suivis_des_evangelises) ──
    {
      let assignesEvangNotifs = [];

      // 5a. Conseiller
      const { data: parConseiller } = await supabase
        .from("suivis_des_evangelises")
        .select("id, prenom, nom, ville, date_suivi, date_evangelise, eglise_id, conseiller_id, cellule_id, famille_id")
        .eq("conseiller_id", profile.id)
        .eq("notification_responsable", true)
        .order("date_suivi", { ascending: false });
      assignesEvangNotifs = [...assignesEvangNotifs, ...(parConseiller || [])];

      // 5b. ResponsableCellule
      const { data: cellulesDuResp } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", profile.id);
      const idsCellules = (cellulesDuResp || []).map((c) => c.id);

      if (idsCellules.length > 0) {
        const { data: parCellule } = await supabase
          .from("suivis_des_evangelises")
          .select("id, prenom, nom, ville, date_suivi, date_evangelise, eglise_id, conseiller_id, cellule_id, famille_id")
          .in("cellule_id", idsCellules)
          .eq("notification_responsable", true)
          .order("date_suivi", { ascending: false });
        assignesEvangNotifs = [...assignesEvangNotifs, ...(parCellule || [])];
      }

      // 5c. ResponsableFamilles
      const { data: famillesDuResp } = await supabase
        .from("familles")
        .select("id")
        .eq("responsable_id", profile.id);
      const idsFamilles = (famillesDuResp || []).map((f) => f.id);

      if (idsFamilles.length > 0) {
        const { data: parFamille } = await supabase
          .from("suivis_des_evangelises")
          .select("id, prenom, nom, ville, date_suivi, date_evangelise, eglise_id, conseiller_id, cellule_id, famille_id")
          .in("famille_id", idsFamilles)
          .eq("notification_responsable", true)
          .order("date_suivi", { ascending: false });
        assignesEvangNotifs = [...assignesEvangNotifs, ...(parFamille || [])];
      }

      const mapped = assignesEvangNotifs.map((m) => ({
        ...m,
        _type: "membre_assigne_evang",
        _date: m.date_suivi || m.date_evangelise,
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

    const channel = supabase.channel(`notifications-page-${userProfile.eglise_id}-${userProfile.id}`);

    // ── membres_complets : nouveaux membres + new_in_cellule + membres assignés ──
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

          // Membre assigné → ajout
          if (row.suivi_responsable_id === userProfile.id && row.notification_responsable === true) {
            setNotifications((prev) => {
              const exists = prev.some((n) => n._type === "membre_assigne" && n.id === row.id);
              if (exists) return prev;
              return [{ ...row, _type: "membre_assigne", _date: row.date_envoi_suivi || row.created_at }, ...prev];
            });
          }

          // Membre assigné → suppression (lu)
          if (row.suivi_responsable_id === userProfile.id && row.notification_responsable === false) {
            setNotifications((prev) => prev.filter((n) => !(n._type === "membre_assigne" && n.id === row.id)));
          }
        }
      );

    // ── evangelises ──
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

    // ── ✅ suivis_des_evangelises : évangélisés assignés ──
    channel.on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "suivis_des_evangelises" },
      (payload) => {
        const row = payload.new;

        // Ajout si notification activée
        if (row.notification_responsable === true) {
          setNotifications((prev) => {
            const exists = prev.some((n) => n._type === "membre_assigne_evang" && n.id === row.id);
            if (exists) return prev;
            return [{ ...row, _type: "membre_assigne_evang", _date: row.date_suivi || row.date_evangelise }, ...prev];
          });
        }

        // Suppression si marqué comme lu
        if (row.notification_responsable === false) {
          setNotifications((prev) =>
            prev.filter((n) => !(n._type === "membre_assigne_evang" && n.id === row.id))
          );
        }
      }
    );

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
  const handleClick = async (n) => {
    // ✅ Membre assigné suivi → marquer lu + rediriger ListMembers
    if (n._type === "membre_assigne") {
      await supabase
        .from("membres_complets")
        .update({ notification_responsable: false })
        .eq("id", n.id);

      setNotifications((prev) => prev.filter((notif) => !(notif._type === "membre_assigne" && notif.id === n.id)));
      router.push(`/cellule/membres-cellule?search=${encodeURIComponent(`${n.prenom} ${n.nom}`)}`);
      return;
    }

    // ✅ Évangélisé assigné → marquer lu + rediriger suivis-evangelisation
    if (n._type === "membre_assigne_evang") {
      await supabase
        .from("suivis_des_evangelises")
        .update({ notification_responsable: false })
        .eq("id", n.id);

      setNotifications((prev) => prev.filter((notif) => !(notif._type === "membre_assigne_evang" && notif.id === n.id)));
      router.push(`/evangelisation/suivis-evangelisation`);
      return;
    }

    if (n._type === "evangelise") {
      router.push(`/evangelisation/suivis-evangelisation`);
    } else {
      router.push(`/ListMembers?search=${encodeURIComponent(`${n.prenom} ${n.nom}`)}`);
    }
  };

  // ─── Icône selon le type ──────────────────────────────────────────────────
  const getIcon = (type) => {
    switch (type) {
      case "evangelise":           return "💗";
      case "membre_assigne":       return "🤝";
      case "membre_assigne_evang": return "📣";
      default:                     return "👤";
    }
  };

  // ─── Couleur avatar selon le type ────────────────────────────────────────
  const getAvatarBg = (type) => {
    switch (type) {
      case "evangelise":           return "#f5f3ff";
      case "membre_assigne":       return "#fffbeb";
      case "membre_assigne_evang": return "#ecfdf5";
      default:                     return "#fff7ed";
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
                  background: getAvatarBg(n._type),
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", flexShrink: 0,
                }}>
                  {getIcon(n._type)}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <p style={{ fontWeight: "700", fontSize: "14px", color: "#111827", margin: 0 }}>
                      {n.prenom} {n.nom}
                    </p>
                    <TypeBadge type={n._type} />
                  </div>

                  {/* Info spécifique : membre_assigne */}
                  {n._type === "membre_assigne" && n.suivi_cellule_nom && (
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>
                      🏠 {n.suivi_cellule_nom}
                    </p>
                  )}

                  {/* Info spécifique : membre_assigne_evang — source évangélisation */}
                  {n._type === "membre_assigne_evang" && (
                    <p style={{ fontSize: "12px", color: "#059669", margin: "2px 0 0" }}>
                      📣 Vient de l'évangélisation
                    </p>
                  )}

                  {n.ville && n._type !== "membre_assigne" && n._type !== "membre_assigne_evang" && (
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
