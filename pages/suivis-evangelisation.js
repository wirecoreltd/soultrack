"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangeliseSuiviPopup from "../components/EditEvangeliseSuiviPopup";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/Footer";

export default function SuivisEvangelisation() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation", "ResponsableCellule", "Conseiller"]}>
      <SuivisEvangelisationContent />
    </ProtectedRoute>
  );
}

function SuivisEvangelisationContent() {
  const [allSuivis, setAllSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [detailsCarteId, setDetailsCarteId] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [showRefus, setShowRefus] = useState(false);
  const [user, setUser] = useState(null);
  const [phoneMenuId, setPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);

  // 🔥 Map : suivi_evangelise_id → [{id, prenom, nom}]
  const [assignmentsMap, setAssignmentsMap] = useState({});

  /* ================= INIT ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (user) fetchSuivis(user, cellules);
  }, [showRefus]);

  const init = async () => {
    const userData = await fetchUser();
    await fetchConseillers();
    const cellulesData = await fetchCellules(userData);
    if (userData) {
      await fetchSuivis(userData, cellulesData);
    }
    setLoading(false);
  };

  /* ================= USER ================= */
  const fetchUser = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.session.user.id)
      .single();
    setUser(data);
    return data;
  };

  /* ================= CONSEILLERS ================= */
  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("role", "Conseiller");
    setConseillers(data || []);
    return data || [];
  };

  /* ================= CELLULES ================= */
  const fetchCellules = async (userData) => {
    const u = userData || user;
    if (!u) return [];
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule_full, responsable_id")
      .eq("eglise_id", u.eglise_id)
      .eq("branche_id", u.branche_id);
    if (error) {
      console.error("Erreur fetchCellules :", error);
      setCellules([]);
      return [];
    }
    setCellules(data || []);
    return data || [];
  };

  /* ================= ASSIGNMENTS MAP ================= */
  // 🔥 Lit depuis suivi_assignments_evangelises (table dédiée)
  const fetchAssignmentsForSuivis = async (suivisIds) => {
    if (!suivisIds || suivisIds.length === 0) {
      setAssignmentsMap({});
      return;
    }

    const { data: assignments, error } = await supabase
      .from("suivi_assignments_evangelises")   // 🔥 table dédiée
      .select("suivi_evangelise_id, conseiller_id")
      .in("suivi_evangelise_id", suivisIds)
      .eq("statut", "actif");

    if (error) {
      console.error("Erreur fetchAssignments:", error);
      setAssignmentsMap({});
      return;
    }

    // Récupérer les profils des conseillers
    const conseillerIds = [...new Set((assignments || []).map(a => a.conseiller_id).filter(Boolean))];

    let profileMap = {};
    if (conseillerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, prenom, nom")
        .in("id", conseillerIds);
      (profiles || []).forEach(p => { profileMap[p.id] = p; });
    }

    // Construire la map suivi_evangelise_id → [{id, prenom, nom}]
    const map = {};
    (assignments || []).forEach(row => {
      const profile = profileMap[row.conseiller_id];
      if (!profile) return;
      if (!map[row.suivi_evangelise_id]) map[row.suivi_evangelise_id] = [];
      if (!map[row.suivi_evangelise_id].some(c => c.id === profile.id)) {
        map[row.suivi_evangelise_id].push(profile);
      }
    });

    setAssignmentsMap(map);
  };

  /* ================= SUIVIS ================= */
  const fetchSuivis = async (userData, cellulesData) => {
    try {
      if (!userData) return;

      const { data, error } = await supabase
        .from("suivis_des_evangelises")
        .select("*")
        .eq("eglise_id", userData.eglise_id)
        .eq("branche_id", userData.branche_id)
        .order("id", { ascending: false });

      if (error) {
        console.error("Erreur fetchSuivis:", error);
        setAllSuivis([]);
        return;
      }

      let filtered = data || [];

      // 🔹 Filtrage par rôle
      if (userData.role === "Conseiller") {
        // 🔥 Pour un conseiller : filtrer via suivi_assignments_evangelises
        const { data: myAssignments } = await supabase
          .from("suivi_assignments_evangelises")  // 🔥 table dédiée
          .select("suivi_evangelise_id")
          .eq("conseiller_id", userData.id)
          .eq("statut", "actif");

        const myIds = (myAssignments || []).map(a => a.suivi_evangelise_id);
        filtered = filtered.filter(m => myIds.includes(m.id));
      } else if (userData.role === "ResponsableCellule") {
        const mesCellulesIds = (cellulesData || [])
          .filter((c) => c.responsable_id === userData.id)
          .map((c) => c.id);
        filtered = filtered.filter((m) => mesCellulesIds.includes(m.cellule_id));
      }

      setAllSuivis(filtered);

      // ✅ Charger les assignments pour affichage des conseillers
      const suivisIds = filtered.map(s => s.id);
      await fetchAssignmentsForSuivis(suivisIds);

    } catch (err) {
      console.error("Erreur fetchSuivis:", err.message);
      setAllSuivis([]);
    }
  };

  /* ================= HELPERS ================= */
  const getBorderColor = (m) => {
    const status = m.status_suivis_evangelises;
    if (status === "En cours") return "#FFA500";
    if (status === "Intégré") return "#34A853";
    if (status === "Refus") return "#FF4B5C";
    return "#ccc";
  };

  const formatBesoin = (b) => {
    if (!b) return "—";
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // ✅ Récupère les conseillers d'un suivi depuis assignmentsMap
  const getConseillersForSuivi = (suiviId) => {
    const assigned = assignmentsMap[suiviId];
    if (assigned && assigned.length > 0) {
      return assigned.map(c => `${c.prenom} ${c.nom}`).join(", ");
    }
    return "—";
  };

  const suivisAffiches = allSuivis.filter((m) => {
    if (showRefus) return m.status_suivis_evangelises === "Refus";
    return m.status_suivis_evangelises === "En cours" || m.status_suivis_evangelises === "Envoyé";
  });

  const handleCommentChange = (id, value) =>
    setCommentChanges((p) => ({ ...p, [id]: value }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((p) => ({ ...p, [id]: value }));

  /* ================= UPSERT MEMBRE + mise à jour suivi_assignments_evangelises ================= */
  const upsertMembre = async (suivi) => {
    try {
      const payload = {
        suivi_int_id: suivi.id,
        eglise_id: user.eglise_id,
        branche_id: user.branche_id,
        nom: suivi.nom || "",
        prenom: suivi.prenom || "",
        telephone: suivi.telephone || "",
        ville: suivi.ville || "",
        sexe: suivi.sexe || "",
        cellule_id: suivi.cellule_id || null,
        conseiller_id: suivi.conseiller_id || null,
        besoin: suivi.besoin || "",
        infos_supplementaires: suivi.infos_supplementaires || "",
        Commentaire_Suivi_Evangelisation: suivi.commentaire_evangelises || "",
        etat_contact: "Existant",
        venu: "Évangélisation",
        statut_suivis: 3,
        suivi_updated_at: new Date().toISOString(),
        evangelise_member_id: suivi.evangelise_id || null,
      };

      const { data, error } = await supabase
        .from("membres_complets")
        .upsert(payload, { onConflict: "suivi_int_id" })
        .select("id")
        .single();

      if (error) {
        console.error("Erreur insertion membre :", error);
        alert("Erreur insertion membre : " + error.message);
        return null;
      }

      console.log("Membre intégré avec succès :", data);
      return data?.id || null;

    } catch (err) {
      console.error("Erreur upsert membre :", err.message);
      alert("Erreur upsert membre : " + err.message);
      return null;
    }
  };

  /* ================= UPDATE SUIVI ================= */
  const updateSuivi = async (id, m) => {
    const newComment = commentChanges[id] ?? m.commentaire_evangelises ?? "";
    const newStatus = statusChanges[id] ?? m.status_suivis_evangelises ?? "";

    if (!newComment && !newStatus) return;

    try {
      setUpdating((p) => ({ ...p, [id]: true }));

      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({
          commentaire_evangelises: newComment,
          status_suivis_evangelises: newStatus,
          date_statut: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      if (newStatus === "Intégré") {
        // 🔥 1. Créer le membre dans membres_complets
        const membreId = await upsertMembre({
          ...m,
          status_suivis_evangelises: newStatus,
          commentaire_evangelises: newComment,
        });

        // 🔥 2. Si on a le membre_id, on pourrait mettre à jour suivi_assignments si besoin
        // (la table suivi_assignments_evangelises n'a pas de membre_id, c'est la table suivi_assignments qui en a)
        // Donc on crée une entrée dans suivi_assignments pour le membre intégré
        if (membreId) {
          const assigned = assignmentsMap[id];
          if (assigned && assigned.length > 0) {
            const rows = assigned.map((c, index) => ({
              membre_id: membreId,
              conseiller_id: c.id,
              role: index === 0 ? "principal" : "assistant",
              statut: "actif",
            }));
            const { error: assignError } = await supabase
              .from("suivi_assignments")
              .insert(rows);
            if (assignError) {
              console.error("Erreur création suivi_assignments pour membre intégré:", assignError);
            }
          }
        }

        setAllSuivis((prev) => prev.filter((s) => s.id !== id));
        return;
      }

      setAllSuivis((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, commentaire_evangelises: newComment, status_suivis_evangelises: newStatus }
            : s
        )
      );

      setCommentChanges((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
      setStatusChanges((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });

    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err.message);
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setUpdating((p) => ({ ...p, [id]: false }));
    }
  };

  /* ================= RÉACTIVER SUIVI ================= */
  const reactiverSuivi = async (m) => {
    if (!m?.id) return;
    try {
      setUpdating((p) => ({ ...p, [m.id]: true }));
      const { error } = await supabase
        .from("suivis_des_evangelises")
        .update({ status_suivis_evangelises: "En cours" })
        .eq("id", m.id);
      if (error) throw error;
      setAllSuivis((prev) =>
        prev.map((s) => s.id === m.id ? { ...s, status_suivis_evangelises: "En cours" } : s)
      );
    } catch (err) {
      console.error("Erreur réactivation :", err.message);
      alert("Erreur lors de la réactivation");
    } finally {
      setUpdating((p) => ({ ...p, [m.id]: false }));
    }
  };

  const updateSuiviLocal = (id, updates) => {
    setAllSuivis(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  /* ================= RENDER ================= */
  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user) return <p className="text-center mt-10 text-red-600">Non connecté</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        Suivis des <span className="text-emerald-300">Evangélisés</span>
      </h1>

      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          Suivez facilement tous vos <span className="text-blue-300 font-semibold">contacts évangélisés et leur progression</span>.
          Attribuez-les à un conseiller ou à une cellule, partagez leurs informations via WhatsApp, et{" "}
          <span className="text-blue-300 font-semibold">consultez chaque contact en détail</span>.
          Vous pouvez modifier ou supprimer des contacts,{" "}
          <span className="text-blue-300 font-semibold">assurant un suivi clair et structuré de l'évangélisation dans votre église</span>.
        </p>
      </div>

      {/* Toggle Refus */}
      <div className="mb-6 flex justify-end w-full max-w-6xl">
        <button
          onClick={() => setShowRefus(!showRefus)}
          className="text-orange-400 text-sm underline hover:text-orange-500"
        >
          {showRefus ? "Voir tous les suivis" : "Voir les refus"}
        </button>
      </div>

      {/* ================= VUE CARTE ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
        {suivisAffiches.map((m) => {
          const ouvert = detailsCarteId === m.id;
          const cellule = cellules.find((c) => c.id === m.cellule_id);

          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {m.prenom} {m.nom}
                </h2>

                {/* Téléphone */}
                <div className="flex-[1] text-sm text-white relative mb-3">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoneMenuId(phoneMenuId === m.id ? null : m.id);
                    }}
                    className="text-orange-500 underline font-semibold cursor-pointer"
                  >
                    {m.telephone || "—"}
                  </p>
                  {phoneMenuId === m.id && (
                    <div
                      ref={phoneMenuRef}
                      className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={m.telephone ? `tel:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📞 Appeler</a>
                      <a href={m.telephone ? `sms:${m.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>✉️ SMS</a>
                      <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}?call` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>📱 Appel WhatsApp</a>
                      <a href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}>💬 Message WhatsApp</a>
                    </div>
                  )}
                </div>

                {/* Cellule, Conseiller(s), Ville */}
                <div className="flex flex-col items-center space-y-1 mb-1">
                  <p className="text-sm text-black">🏠 Cellule : {cellule?.cellule_full || "—"}</p>
                  {/* 🔥 Conseillers depuis suivi_assignments_evangelises */}
                  <p className="text-sm text-black">
                    👤 Conseiller(s) : {getConseillersForSuivi(m.id)}
                  </p>
                  <p className="text-sm text-black">🏙️ Ville : {m.ville || "—"}</p>
                </div>

                <p className="self-end text-[11px] text-gray-400 mt-2">
                  Envoyé au suivis le {formatDateFr(m.date_suivi)}
                </p>

                {/* Commentaire + statut */}
                <div className="w-full rounded-xl p-3 mt-2">
                  <label className="block w-full text-center font-semibold text-blue-700 mb-1 mt-2 text-sm">
                    Commentaire Suivis
                  </label>
                  <textarea
                    rows={2}
                    value={commentChanges[m.id] ?? m.commentaire_evangelises ?? ""}
                    onChange={(e) => handleCommentChange(m.id, e.target.value)}
                    disabled={showRefus}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${showRefus ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                  />

                  <label className="block w-full text-center font-semibold text-blue-700 mb-1 mt-2 text-sm">
                    Statut du suivis
                  </label>
                  <select
                    value={statusChanges[m.id] ?? m.status_suivis_evangelises ?? ""}
                    onChange={(e) => handleStatusChange(m.id, e.target.value)}
                    disabled={showRefus}
                    className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm ${showRefus ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                  >
                    <option value="">-- Sélectionner un statut --</option>
                    <option value="En cours">En Suivis</option>
                    <option value="Intégré">Intégrer</option>
                    <option value="Refus">Refus</option>
                  </select>

                  <button
                    onClick={() => showRefus ? reactiverSuivi(m) : updateSuivi(m.id, m)}
                    disabled={updating[m.id]}
                    className={`mt-3 w-full py-2 rounded-lg font-semibold shadow-md transition-all ${
                      updating[m.id]
                        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                        : showRefus
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                    }`}
                  >
                    {updating[m.id] ? "Traitement..." : showRefus ? "🔄 Réactiver" : "Sauvegarder"}
                  </button>
                </div>

                <button
                  onClick={() => setDetailsCarteId(ouvert ? null : m.id)}
                  className="text-orange-500 underline text-sm mt-3"
                >
                  {ouvert ? "Fermer détails" : "Détails"}
                </button>
              </div>

              {/* Détails */}
              <div className={`transition-all duration-500 overflow-hidden ${ouvert ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
                {ouvert && (
                  <div className="text-black text-sm mt-3 w-full space-y-4">
                  <div>
                  <p className="font-bold text-[#2E3192] mb-1">👤 Identité</p>
                  <p>🎗️ Civilité : {m.sexe || ""}</p>
                    <p>⏳ Tranche d'age : {m.age || ""}</p>
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                  </div>
                  <hr />

                   <div>
                  <p className="font-bold text-[#2E3192] mb-1">🕊 Vie spirituelle</p>
                  <p>🙏 Prière salut : {m.priere_salut ? "Oui" : "Non"}</p>
                    <p>☀️ Type de conversion : {m.type_conversion || ""}</p>
                  </div>
                  <hr />

                   <div>
                <p className="font-bold text-[#2E3192] mb-1">🌱 Parcours</p>                  
                    <p>📅 {m.sexe === "Femme" ? "Évangélisée" : "Évangélisé"} le : {formatDateFr(m.date_evangelise)}</p>
                    <p>📣 Type d'Evangélisation : {m.type_evangelisation || ""}</p>
                   </div>
              <hr />
                    
                    <div>
                <p className="font-bold text-[#2E3192] mb-1">❤️‍🩹 Soin pastoral</p>
                    <p>❓ Difficultés / Besoins : {formatBesoin(m.besoin)}</p>
                    <p>📝 Infos : {m.infos_supplementaires || ""}</p>
                  </div>                    

                    {!showRefus && (
                      <div className="mt-4">
                        <button
                          onClick={() => setEditingContact(m)}
                          className="w-full py-2 rounded-lg bg-white text-orange-500 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          ✏️ Modifier le contact
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingContact && (
        <EditEvangeliseSuiviPopup
          member={editingContact}
          onClose={() => setEditingContact(null)}
          closeDetails={() => {}}
          onUpdateMember={(updates) => {
            updateSuiviLocal(editingContact.id, updates);
            setEditingContact(null);
            fetchSuivis(user, cellules);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
