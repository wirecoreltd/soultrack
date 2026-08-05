// ═══════════════════════════════════════════════════════════════
// PAGE : Notifications (NotificationsPage)
// ═══════════════════════════════════════════════════════════════
// Description : Centralise et affiche toutes les notifications de
// l'utilisateur connecté selon son rôle : nouveaux membres, évangélisés
// non envoyés, membres ajoutés en cellule/famille, membres et
// évangélisés assignés à un responsable, et invitations de supervision
// en attente. Chaque notification redirige vers la page correspondante
// et marque l'élément comme vu/traité. Mise à jour en temps réel via
// Supabase Realtime.
//
// Tables Supabase utilisées :
// - profiles                (lecture)             → profil utilisateur (rôles, eglise_id)
// - membres_complets        (lecture + écriture)  → nouveaux membres, ajouts en cellule, assignations
// - suivi_assignments       (lecture)             → membres assignés à un Conseiller
// - cellules                (lecture)             → cellules gérées (filtrage des notifications)
// - familles                (lecture)             → familles gérées (filtrage des notifications)
// - evangelises             (lecture + écriture)  → évangélisés non envoyés / vus
// - suivis_des_evangelises  (lecture + écriture)  → évangélisés assignés à un responsable
// - eglise_supervisions     (lecture)             → invitations de supervision en attente
//
// Realtime : membres_complets, evangelises, suivis_des_evangelises,
// eglise_supervisions (INSERT/UPDATE)
//
// Perf : les 6 sections de fetchNotifications sont exécutées en
// parallèle via Promise.all (au lieu d'un enchaînement séquentiel
// d'await), et les sous-requêtes internes (cellules/familles du
// responsable) sont elles aussi parallélisées.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useNotificationsContext } from "../../context/NotificationsContext";
import { useLang } from "../../hooks/useLang";

const translations = {
  fr: {
    title: "Notifications",
    subtitle: "Toutes vos notifications",
    searchPlaceholder: "🔍 Rechercher...",
    loading: "Chargement...",
    empty: "Aucune nouvelle notification",
    newLabel: (count) => `${count} nouveau${count > 1 ? "x" : ""}`,
    clickInvitation: "📩 Cliquez pour répondre à l'invitation",
    fromEvang: "📣 Vient de l'évangélisation",
    markAllRead: "✓ Tout marquer comme lu",
    markingAll: "Traitement...",
    confirmMarkAll: "Marquer toutes les notifications comme lues ? Les invitations en attente resteront visibles car elles nécessitent une réponse.",
    badges: {
      nouveau:              "Nouveau membre",
      existant:             "Existant",
      evangelise:           "Évangélisé",
      new_in_cellule:       "Ajouté en cellule/famille",
      membre_assigne:       "Membre assigné",
      membre_assigne_evang: "Évangélisé assigné",
      invitation:           "Invitation en attente",
    },
  },
  en: {
    title: "Notifications",
    subtitle: "All your notifications",
    searchPlaceholder: "🔍 Search...",
    loading: "Loading...",
    empty: "No new notifications",
    newLabel: (count) => `${count} new`,
    clickInvitation: "📩 Click to respond to the invitation",
    fromEvang: "📣 From evangelisation",
    markAllRead: "✓ Mark all as read",
    markingAll: "Processing...",
    confirmMarkAll: "Mark all notifications as read? Pending invitations will remain visible since they require a response.",
    badges: {
      nouveau:              "New member",
      existant:             "Existing",
      evangelise:           "Evangelised",
      new_in_cellule:       "Added to cell/family",
      membre_assigne:       "Assigned member",
      membre_assigne_evang: "Assigned evangelised",
      invitation:           "Pending invitation",
    },
  },
};

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
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getBorderColor(type) {
  switch (type) {
    case "nouveau":              return "#fb923c";
    case "existant":             return "#4ade80";
    case "evangelise":           return "#a78bfa";
    case "new_in_cellule":       return "#38bdf8";
    case "membre_assigne":       return "#f59e0b";
    case "membre_assigne_evang": return "#10b981";
    case "invitation":           return "#818cf8";
    default:                     return "#9ca3af";
  }
}

function TypeBadge({ type, lang = "fr" }) {
  const labels = translations[lang]?.badges || translations.fr.badges;
  const config = {
    nouveau:              { bg: "#fff7ed", text: "#ea580c", dot: "#fb923c", label: labels.nouveau },
    existant:             { bg: "#f0fdf4", text: "#16a34a", dot: "#4ade80", label: labels.existant },
    evangelise:           { bg: "#f5f3ff", text: "#7c3aed", dot: "#a78bfa", label: labels.evangelise },
    new_in_cellule:       { bg: "#f0f9ff", text: "#0369a1", dot: "#38bdf8", label: labels.new_in_cellule },
    membre_assigne:       { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b", label: labels.membre_assigne },
    membre_assigne_evang: { bg: "#ecfdf5", text: "#065f46", dot: "#10b981", label: labels.membre_assigne_evang },
    invitation:           { bg: "#eef2ff", text: "#4338ca", dot: "#818cf8", label: labels.invitation },
  };
  const c = config[type] || config.existant;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: "11px", fontWeight: "700", borderRadius: "999px", padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
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
  const { markAsSeen } = useNotificationsContext();
  const { lang } = useLang();
  const t = translations[lang];
  const [userProfile,   setUserProfile]   = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [markingAll,    setMarkingAll]    = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("id, prenom, nom, eglise_id, roles, role").eq("id", user.id).single();
      if (!profile) return;
      setUserProfile(profile);
      await fetchNotifications(profile);
      setLoading(false);
    };
    init();
  }, []);

  // ─── fetchNotifications : les 6 sections tournent en parallèle ───────────
  const fetchNotifications = async (profile) => {
    if (!profile) return;
    const roles = getRoles(profile);
    const isAdmin              = roles.includes("Administrateur");
    const isResponsableInteg   = roles.includes("ResponsableIntegration");
    const isResponsableEvang   = roles.includes("ResponsableEvangelisation");
    const isSuperviseurCellule = roles.includes("SuperviseurCellule");
    const isResponsableCellule = roles.includes("ResponsableCellule");
    const isConseiller         = roles.includes("Conseiller");

    // ── 1. Nouveaux membres ──
    const fetchNouveaux = async () => {
      if (!(isAdmin || isResponsableInteg || isConseiller || isResponsableCellule)) return [];

      if (isConseiller && !isAdmin && !isResponsableInteg) {
        const { data: assignments } = await supabase.from("suivi_assignments").select("membre_id").eq("conseiller_id", profile.id);
        const ids = (assignments || []).map((a) => a.membre_id);
        if (ids.length === 0) return [];
        const { data } = await supabase.from("membres_complets")
          .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id")
          .eq("eglise_id", profile.eglise_id).eq("etat_contact", "nouveau").in("id", ids).order("created_at", { ascending: false });
        return (data || []).map((m) => ({ ...m, _type: "nouveau", _date: m.created_at }));
      }

      if (isResponsableCellule && !isAdmin && !isResponsableInteg && !isConseiller) {
        const { data: cellules } = await supabase.from("cellules").select("id").eq("responsable_id", profile.id);
        const celluleIds = (cellules || []).map((c) => c.id);
        if (celluleIds.length === 0) return [];
        const { data } = await supabase.from("membres_complets")
          .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id")
          .eq("eglise_id", profile.eglise_id).eq("etat_contact", "nouveau").in("cellule_id", celluleIds).order("created_at", { ascending: false });
        return (data || []).map((m) => ({ ...m, _type: "nouveau", _date: m.created_at }));
      }

      const { data } = await supabase.from("membres_complets")
        .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id")
        .eq("eglise_id", profile.eglise_id).eq("etat_contact", "nouveau").order("created_at", { ascending: false });
      return (data || []).map((m) => ({ ...m, _type: "nouveau", _date: m.created_at }));
    };

    // ── 2. Évangélisés non envoyés ──
    const fetchEvangelises = async () => {
      if (!(isAdmin || isResponsableEvang)) return [];
      const { data } = await supabase.from("evangelises")
        .select("id, prenom, nom, created_at, eglise_id")
        .eq("eglise_id", profile.eglise_id).eq("status_suivi", "Non envoyé").order("created_at", { ascending: false });
      return (data || []).map((e) => ({ ...e, _type: "evangelise", _date: e.created_at }));
    };

    // ── 3. Ajoutés en cellule/famille ──
    const fetchNewInCellule = async () => {
      if (isAdmin || isSuperviseurCellule) {
        const { data } = await supabase.from("membres_complets")
          .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id, is_new_in_cellule")
          .eq("eglise_id", profile.eglise_id).eq("is_new_in_cellule", "true").order("created_at", { ascending: false });
        return (data || []).map((m) => ({ ...m, _type: "new_in_cellule", _date: m.created_at }));
      }
      if (isResponsableCellule) {
        const { data: cellulesResp } = await supabase.from("cellules").select("id").eq("responsable_id", profile.id);
        const idsResp = (cellulesResp || []).map((c) => c.id);
        if (idsResp.length === 0) return [];
        const { data } = await supabase.from("membres_complets")
          .select("id, prenom, nom, ville, etat_contact, created_at, cellule_id, eglise_id, is_new_in_cellule")
          .in("cellule_id", idsResp).eq("is_new_in_cellule", "true").order("created_at", { ascending: false });
        return (data || []).map((m) => ({ ...m, _type: "new_in_cellule", _date: m.created_at }));
      }
      return [];
    };

    // ── 4. Membres assignés ──
    const fetchAssignes = async () => {
      const [parConseillerRes, cellulesDuResp, famillesDuResp] = await Promise.all([
        supabase.from("membres_complets")
          .select("id, prenom, nom, ville, created_at, date_envoi_suivi, eglise_id, suivi_cellule_nom, famille_id, cellule_id")
          .eq("suivi_responsable_id", profile.id).eq("notification_responsable", true).order("date_envoi_suivi", { ascending: false }),
        supabase.from("cellules").select("id").eq("responsable_id", profile.id),
        supabase.from("familles").select("id").eq("responsable_id", profile.id),
      ]);

      const idsCellules = (cellulesDuResp.data || []).map((c) => c.id);
      const idsFamilles = (famillesDuResp.data || []).map((f) => f.id);

      const [parCelluleRes, parFamilleRes] = await Promise.all([
        idsCellules.length > 0
          ? supabase.from("membres_complets")
              .select("id, prenom, nom, ville, created_at, date_envoi_suivi, eglise_id, suivi_cellule_nom, famille_id, cellule_id")
              .in("cellule_id", idsCellules).eq("notification_responsable", true).order("date_envoi_suivi", { ascending: false })
          : Promise.resolve({ data: [] }),
        idsFamilles.length > 0
          ? supabase.from("membres_complets")
              .select("id, prenom, nom, ville, created_at, date_envoi_suivi, eglise_id, suivi_cellule_nom, famille_id, cellule_id")
              .in("famille_id", idsFamilles).eq("notification_responsable", true).order("date_envoi_suivi", { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      const assignesNotifs = [
        ...(parConseillerRes.data || []),
        ...(parCelluleRes.data || []),
        ...(parFamilleRes.data || []),
      ];
      return assignesNotifs.map((m) => ({ ...m, _type: "membre_assigne", _date: m.date_envoi_suivi || m.created_at }));
    };

    // ── 5. Évangélisés assignés ──
    const fetchAssignesEvang = async () => {
      const [parConseillerRes, cellulesDuResp, famillesDuResp] = await Promise.all([
        supabase.from("suivis_des_evangelises")
          .select("id, prenom, nom, ville, date_suivi, date_evangelise, eglise_id, conseiller_id, cellule_id, famille_id")
          .eq("conseiller_id", profile.id).eq("notification_responsable", true).order("date_suivi", { ascending: false }),
        supabase.from("cellules").select("id").eq("responsable_id", profile.id),
        supabase.from("familles").select("id").eq("responsable_id", profile.id),
      ]);

      const idsCellules = (cellulesDuResp.data || []).map((c) => c.id);
      const idsFamilles = (famillesDuResp.data || []).map((f) => f.id);

      const [parCelluleRes, parFamilleRes] = await Promise.all([
        idsCellules.length > 0
          ? supabase.from("suivis_des_evangelises")
              .select("id, prenom, nom, ville, date_suivi, date_evangelise, eglise_id, conseiller_id, cellule_id, famille_id")
              .in("cellule_id", idsCellules).eq("notification_responsable", true).order("date_suivi", { ascending: false })
          : Promise.resolve({ data: [] }),
        idsFamilles.length > 0
          ? supabase.from("suivis_des_evangelises")
              .select("id, prenom, nom, ville, date_suivi, date_evangelise, eglise_id, conseiller_id, cellule_id, famille_id")
              .in("famille_id", idsFamilles).eq("notification_responsable", true).order("date_suivi", { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      const assignesEvangNotifs = [
        ...(parConseillerRes.data || []),
        ...(parCelluleRes.data || []),
        ...(parFamilleRes.data || []),
      ];
      return assignesEvangNotifs.map((m) => ({ ...m, _type: "membre_assigne_evang", _date: m.date_suivi || m.date_evangelise }));
    };

    // ── 6. Invitations en attente ──
    const fetchInvitations = async () => {
      const { data } = await supabase.from("eglise_supervisions")
        .select("id, eglise_nom, eglise_denomination, eglise_ville, eglise_pays, invitation_token, created_at, statut, superviseur_eglise_id")
        .eq("supervisee_eglise_id", profile.eglise_id).eq("statut", "pending").order("created_at", { ascending: false });
      return (data || []).map((inv) => ({
        ...inv, prenom: inv.eglise_denomination || "", nom: inv.eglise_nom || "",
        ville: inv.eglise_ville || "", _type: "invitation", _date: inv.created_at, _token: inv.invitation_token,
      }));
    };

    // Les 6 sections partent en même temps au lieu de s'enchaîner
    const results = await Promise.all([
      fetchNouveaux(),
      fetchEvangelises(),
      fetchNewInCellule(),
      fetchAssignes(),
      fetchAssignesEvang(),
      fetchInvitations(),
    ]);

    const allNotifs = results.flat();

    allNotifs.sort((a, b) => new Date(b._date) - new Date(a._date));
    const seen = new Set();
    setNotifications(allNotifs.filter((n) => {
      const key = `${n._type}-${n.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }));
  };

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile) return;
    if (channelRef.current) { try { supabase.removeChannel(channelRef.current); } catch (_) {} }

    const roles = getRoles(userProfile);
    const isAdmin              = roles.includes("Administrateur");
    const isResponsableEvang   = roles.includes("ResponsableEvangelisation");
    const isSuperviseurCellule = roles.includes("SuperviseurCellule");

    const channel = supabase.channel(`notifications-page-${userProfile.eglise_id}-${userProfile.id}`);

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "membres_complets" }, (payload) => {
        const row = payload.new;
        if (row.eglise_id !== userProfile.eglise_id) return;
        if (row.etat_contact === "nouveau")
          setNotifications((prev) => [{ ...row, _type: "nouveau", _date: row.created_at }, ...prev]);
        if ((isAdmin || isSuperviseurCellule) && row.is_new_in_cellule === "true")
          setNotifications((prev) => [{ ...row, _type: "new_in_cellule", _date: row.created_at }, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "membres_complets" }, (payload) => {
        const row = payload.new;
        if (row.etat_contact !== "nouveau")
          setNotifications((prev) => prev.filter((n) => !(n._type === "nouveau" && n.id === row.id)));
        if (row.is_new_in_cellule !== "true")
          setNotifications((prev) => prev.filter((n) => !(n._type === "new_in_cellule" && n.id === row.id)));
        if (row.suivi_responsable_id === userProfile.id && row.notification_responsable === true) {
          setNotifications((prev) => {
            if (prev.some((n) => n._type === "membre_assigne" && n.id === row.id)) return prev;
            return [{ ...row, _type: "membre_assigne", _date: row.date_envoi_suivi || row.created_at }, ...prev];
          });
        }
        if (row.suivi_responsable_id === userProfile.id && row.notification_responsable === false)
          setNotifications((prev) => prev.filter((n) => !(n._type === "membre_assigne" && n.id === row.id)));
      });

    if (isAdmin || isResponsableEvang) {
      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "evangelises" }, (payload) => {
          const row = payload.new;
          if (row.eglise_id === userProfile.eglise_id && row.status_suivi === "Non envoyé")
            setNotifications((prev) => [{ ...row, _type: "evangelise", _date: row.created_at }, ...prev]);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "evangelises" }, (payload) => {
          const row = payload.new;
          if (row.status_suivi !== "Non envoyé")
            setNotifications((prev) => prev.filter((n) => !(n._type === "evangelise" && n.id === row.id)));
        });
    }

    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "suivis_des_evangelises" }, (payload) => {
      const row = payload.new;
      if (row.notification_responsable === true) {
        setNotifications((prev) => {
          if (prev.some((n) => n._type === "membre_assigne_evang" && n.id === row.id)) return prev;
          return [{ ...row, _type: "membre_assigne_evang", _date: row.date_suivi || row.date_evangelise }, ...prev];
        });
      }
      if (row.notification_responsable === false)
        setNotifications((prev) => prev.filter((n) => !(n._type === "membre_assigne_evang" && n.id === row.id)));
    });

    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "eglise_supervisions" }, (payload) => {
      const row = payload.new;
      if (row.supervisee_eglise_id === userProfile.eglise_id && row.statut === "pending") {
        setNotifications((prev) => {
          if (prev.some((n) => n._type === "invitation" && n.id === row.id)) return prev;
          return [{ ...row, prenom: row.eglise_denomination || "", nom: row.eglise_nom || "",
            ville: row.eglise_ville || "", _type: "invitation", _date: row.created_at, _token: row.invitation_token }, ...prev];
        });
      }
      if (row.supervisee_eglise_id === userProfile.eglise_id && row.statut !== "pending")
        setNotifications((prev) => prev.filter((n) => !(n._type === "invitation" && n.id === row.id)));
    });

    channel.subscribe();
    channelRef.current = channel;
    return () => { try { supabase.removeChannel(channel); } catch (_) {} };
  }, [userProfile]);

  const filtered = notifications.filter((n) =>
    `${n.prenom || ""} ${n.nom || ""} ${n.ville || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Marquage individuel (partagé entre le clic-navigation et le bouton ✓) ─
  // Pas de navigation ici : uniquement la mise à jour DB/local + retrait de la liste.
  // Les invitations ne sont pas concernées (elles exigent une réponse explicite).
  const [markingIds, setMarkingIds] = useState([]);

  const markNotificationAsRead = async (n) => {
    if (n._type === "invitation") return;

    if (n._type === "nouveau") {
      markAsSeen(n.id);
      setNotifications((prev) => prev.filter((notif) => !(notif._type === "nouveau" && notif.id === n.id)));
      return;
    }
    if (n._type === "membre_assigne") {
      await supabase.from("membres_complets").update({ notification_responsable: false }).eq("id", n.id);
      setNotifications((prev) => prev.filter((notif) => !(notif._type === "membre_assigne" && notif.id === n.id)));
      return;
    }
    if (n._type === "membre_assigne_evang") {
      await supabase.from("suivis_des_evangelises").update({ notification_responsable: false }).eq("id", n.id);
      setNotifications((prev) => prev.filter((notif) => !(notif._type === "membre_assigne_evang" && notif.id === n.id)));
      return;
    }
    if (n._type === "evangelise") {
      await supabase.from("evangelises").update({ status_suivi: "vu" }).eq("id", n.id);
      setNotifications((prev) => prev.filter((notif) => !(notif._type === "evangelise" && notif.id === n.id)));
      return;
    }
    if (n._type === "new_in_cellule") {
      await supabase.from("membres_complets").update({ is_new_in_cellule: false }).eq("id", n.id);
      setNotifications((prev) => prev.filter((notif) => !(notif._type === "new_in_cellule" && notif.id === n.id)));
      return;
    }
  };

  // ─── Bouton ✓ sur une notification : marque comme lu SANS naviguer ────────
  const handleMarkOneAsRead = async (n, e) => {
    e.stopPropagation();
    const key = `${n._type}-${n.id}`;
    if (markingIds.includes(key)) return;
    setMarkingIds((prev) => [...prev, key]);
    try {
      await markNotificationAsRead(n);
    } finally {
      setMarkingIds((prev) => prev.filter((k) => k !== key));
    }
  };

  // ─── Navigation au clic sur la carte (marque comme lu PUIS navigue) ───────
  const handleClick = async (n) => {
    if (n._type === "invitation") {
      router.push(`/accept-invitation?token=${n._token}`);
      return;
    }

    if (n._type === "nouveau") {
      const celluleId = n.cellule_id;
      await markNotificationAsRead(n);
      // ── Si le membre a une cellule → membres-cellule, sinon → list-members ──
      if (celluleId) {
        router.push(`/cellule/membres-cellule?highlight=${n.id}&celluleId=${celluleId}`);
      } else {
        router.push(`/membres/list-members?highlight=${n.id}`);
      }
      return;
    }

    if (n._type === "membre_assigne") {
      await markNotificationAsRead(n);
      router.push(`/membres/suivis-membres?highlight=${n.id}`);
      return;
    }

    if (n._type === "membre_assigne_evang") {
      await markNotificationAsRead(n);
      router.push(`/evangelisation/suivis-evangelisation?highlight=${n.id}`);
      return;
    }

    if (n._type === "evangelise") {
      await markNotificationAsRead(n);
      router.push(`/evangelisation/evangelisation?highlight=${n.id}`);
      return;
    }

    if (n._type === "new_in_cellule") {
      const celluleId = n.cellule_id;
      await markNotificationAsRead(n);
      const params = new URLSearchParams({ highlight: n.id });
      if (celluleId) params.set("celluleId", celluleId);
      router.push(`/cellule/membres-cellule?${params.toString()}`);
      return;
    }

    router.push(`/membres/list-members?highlight=${n.id}`);
  };

  // ─── Tout marquer comme lu ─────────────────────────────────────────────────
  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0 || markingAll) return;
    if (!window.confirm(t.confirmMarkAll)) return;

    setMarkingAll(true);

    // Les invitations exigent une réponse explicite : elles ne sont pas effacées ici
    const toProcess = notifications.filter((n) => n._type !== "invitation");

    const nouveauIds            = toProcess.filter((n) => n._type === "nouveau").map((n) => n.id);
    const membreAssigneIds      = toProcess.filter((n) => n._type === "membre_assigne").map((n) => n.id);
    const membreAssigneEvangIds = toProcess.filter((n) => n._type === "membre_assigne_evang").map((n) => n.id);
    const evangeliseIds         = toProcess.filter((n) => n._type === "evangelise").map((n) => n.id);
    const newInCelluleIds       = toProcess.filter((n) => n._type === "new_in_cellule").map((n) => n.id);

    // "nouveau" est géré en local (localStorage), pas besoin d'appel réseau
    nouveauIds.forEach((id) => markAsSeen(id));

    const updates = [];
    if (membreAssigneIds.length)
      updates.push(supabase.from("membres_complets").update({ notification_responsable: false }).in("id", membreAssigneIds));
    if (membreAssigneEvangIds.length)
      updates.push(supabase.from("suivis_des_evangelises").update({ notification_responsable: false }).in("id", membreAssigneEvangIds));
    if (evangeliseIds.length)
      updates.push(supabase.from("evangelises").update({ status_suivi: "vu" }).in("id", evangeliseIds));
    if (newInCelluleIds.length)
      updates.push(supabase.from("membres_complets").update({ is_new_in_cellule: false }).in("id", newInCelluleIds));

    try {
      await Promise.all(updates);
    } catch (err) {
      console.error("Erreur lors du marquage global comme lu :", err);
    }

    setNotifications((prev) => prev.filter((n) => n._type === "invitation"));
    setMarkingAll(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case "evangelise":           return "💗";
      case "membre_assigne":       return "🤝";
      case "membre_assigne_evang": return "📣";
      case "invitation":           return "📩";
      default:                     return "👤";
    }
  };

  const getAvatarBg = (type) => {
    switch (type) {
      case "evangelise":           return "#f5f3ff";
      case "membre_assigne":       return "#fffbeb";
      case "membre_assigne_evang": return "#ecfdf5";
      case "invitation":           return "#eef2ff";
      default:                     return "#fff7ed";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4" style={{ background: "#333699" }}>
      <HeaderPages />
      <div className="w-full max-w-3xl mt-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">🔔 <span>{t.title}</span></h1>
          <span style={{ background: "#ef4444", color: "#fff", fontSize: "12px", fontWeight: "700", borderRadius: "999px", padding: "2px 12px" }}>
            {t.newLabel(filtered.length)}
          </span>
        </div>
        <p className="text-white/60 text-sm mb-4">{t.subtitle}</p>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text" placeholder={t.searchPlaceholder} value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border-0 text-black text-sm"
            style={{ outline: "none" }}
          />
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "8px",
                padding: "0 14px",
                height: "38px",
                whiteSpace: "nowrap",
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: markingAll ? "default" : "pointer",
                opacity: markingAll ? 0.6 : 1,
              }}
            >
              {markingAll ? t.markingAll : t.markAllRead}
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-white text-center py-10">{t.loading}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div style={{ fontSize: "48px" }}>✅</div>
            <p className="text-white/70 mt-3 text-sm">{t.empty}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((n, i) => (
              <div
                key={`${n._type}-${n.id}-${i}`}
                onClick={() => handleClick(n)}
                style={{ background: "#fff", borderRadius: "12px", borderLeft: `4px solid ${getBorderColor(n._type)}`,
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.13)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
              >
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: getAvatarBg(n._type),
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                  {getIcon(n._type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <p style={{ fontWeight: "700", fontSize: "14px", color: "#111827", margin: 0 }}>{n.prenom} {n.nom}</p>
                    <TypeBadge type={n._type} lang={lang} />
                  </div>
                  {n._type === "invitation" && <p style={{ fontSize: "12px", color: "#4338ca", margin: "2px 0 0" }}>{t.clickInvitation}</p>}
                  {n._type === "membre_assigne" && n.suivi_cellule_nom && <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>🏠 {n.suivi_cellule_nom}</p>}
                  {n._type === "membre_assigne_evang" && <p style={{ fontSize: "12px", color: "#059669", margin: "2px 0 0" }}>{t.fromEvang}</p>}
                  {n.ville && !["membre_assigne", "membre_assigne_evang", "invitation"].includes(n._type) && <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>🏙️ {n.ville}</p>}
                  {n._type === "invitation" && n.ville && <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>🏙️ {n.ville}</p>}
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>📅 {formatDateFr(n._date)}</p>
                </div>
                {n._type !== "invitation" && (
                  <button
                    onClick={(e) => handleMarkOneAsRead(n, e)}
                    disabled={markingIds.includes(`${n._type}-${n.id}`)}
                    title={lang === "fr" ? "Marquer comme lu" : "Mark as read"}
                    style={{
                      flexShrink: 0,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "1px solid #d1fae5",
                      background: "#f0fdf4",
                      color: "#16a34a",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: markingIds.includes(`${n._type}-${n.id}`) ? "default" : "pointer",
                      opacity: markingIds.includes(`${n._type}-${n.id}`) ? 0.5 : 1,
                    }}
                  >
                    ✓
                  </button>
                )}
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
