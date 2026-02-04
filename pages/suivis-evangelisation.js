"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import EditEvangeliseSuiviPopup from "../components/EditEvangeliseSuiviPopup";
import DetailEvangeliseSuivisPopup from "../components/DetailEvangeliseSuivisPopup";
import HeaderPages from "../components/HeaderPages";
import ProtectedRoute from "../components/ProtectedRoute";
import useChurchScope from "../hooks/useChurchScope";

export default function SuivisEvangelisation() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation", "Conseiller"]}>
      <SuivisEvangelisationContent />
    </ProtectedRoute>
  );
}

function SuivisEvangelisationContent() {
  const { profile, loading: loadingProfile, error: profileError, scopedQuery } = useChurchScope();  

  // ===== STATES =====
  const [allSuivis, setAllSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showRefus, setShowRefus] = useState(false);
  const [phoneMenuId, setPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);

  const [detailsCarteId, setDetailsCarteId] = useState(null);
  const [detailsTable, setDetailsTable] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [updating, setUpdating] = useState({});

  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("members_view") || "card";
    }
    return "card";
  });

  useEffect(() => {
    localStorage.setItem("members_view", view);
  }, [view]);

  // ===== INIT =====
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    init();
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && cellules.length) {
      fetchSuivis(user, cellules);
    }
  }, [showRefus, user, cellules]);

  const handleClickOutside = (e) => {
    if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
      setPhoneMenuId(null);
    }
  };

  const init = async () => {
    setLoading(true);
    try {
      const userData = await fetchUser();
      const cellulesData = await fetchCellules();
      await fetchConseillers();
      if (userData && cellulesData) await fetchSuivis(userData, cellulesData);
    } catch (err) {
      console.error("Erreur init:", err);
    }
    setLoading(false);
  };

  // ===== FETCH =====
  const fetchUser = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.session.user.id)
        .single();
      if (error) throw error;

      setUser(data);
      return data;
    } catch (err) {
      console.error("Erreur fetchUser:", err.message);
      return null;
    }
  };

  const fetchConseillers = async () => {
    try {
      const query = scopedQuery("profiles");
      if (!query) return;
      const { data, error } = await query.select("id, prenom, nom").eq("role", "Conseiller");
      if (error) throw error;
      setConseillers(data || []);
    } catch (err) {
      console.error("Erreur fetchConseillers:", err.message);
      setConseillers([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const query = scopedQuery("cellules");
      if (!query) return [];
      const { data, error } = await query.select("id, cellule_full, responsable_id");
      if (error) throw error;
      setCellules(data || []);
      return data || [];
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
      return [];
    }
  };

  const fetchSuivis = async (userData, cellulesData) => {
    try {
      const query = scopedQuery("suivis_des_evangelises");
      if (!query) return;

      const { data, error } = await query.order("id", { ascending: false });
      if (error) throw error;

      let filtered = data || [];

      if (userData.role === "Conseiller") {
        filtered = filtered.filter((m) => String(m.conseiller_id) === String(userData.id));
      } else if (userData.role === "ResponsableCellule") {
        const mesCellulesIds = (cellulesData || [])
          .filter((c) => String(c.responsable_id) === String(userData.id))
          .map((c) => String(c.id));
        filtered = filtered.filter((m) => mesCellulesIds.includes(String(m.cellule_id)));
      }

      if (!showRefus) {
        filtered = filtered.filter((m) => m.status_suivis_evangelises !== "Refus");
      }

      console.log("Suivis filtrés:", filtered);
      setAllSuivis(filtered);
    } catch (err) {
      console.error("Erreur fetchSuivis:", err.message);
      setAllSuivis([]);
    }
  };

  // ===== HELPERS =====
  const getBorderColor = (m) => {
    const status = m.status_suivis_evangelises;
    if (status === "En cours") return "#FFA500";
    if (status === "Intégré") return "#34A853";
    if (status === "Refus") return "#FF4B5C";
    return "#ccc";
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

  const switchView = () => {
    setView(view === "card" ? "table" : "card");
    setDetailsCarteId(null);
    setDetailsTable(null);
    setEditingContact(null);
  };

  const suivisAffiches = allSuivis.filter((m) => {
    if (showRefus) return m.status_suivis_evangelises === "Refus";
    return m.status_suivis_evangelises === "En cours" || m.status_suivis_evangelises === "Envoyé";
  });

  const handleCommentChange = (id, value) =>
    setCommentChanges((p) => ({ ...p, [id]: value }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((p) => ({ ...p, [id]: value }));

  const updateSuiviLocal = (id, updates) => {
    setAllSuivis((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // ===== RENDER =====
  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user) return <p className="text-center mt-10 text-red-600">Non connecté</p>;  

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-3xl font-bold text-white mb-6">Suivis des Évangélisés</h1>

      {/* Toggle Vue / Refus */}
      <div className="mb-6 flex justify-between w-full max-w-6xl">
        <button onClick={switchView} className="text-white underline">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>

        <button
          onClick={() => setShowRefus(!showRefus)}
          className="text-orange-400 text-sm underline hover:text-orange-500"
        >
          {showRefus ? "Voir tous les suivis" : "Voir les refus"}
        </button>
      </div>

      {/* ===== VUE CARTE ===== */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {suivisAffiches.map((m) => {
            const ouvert = detailsCarteId === m.id;
            const conseiller = conseillers.find((c) => c.id === m.conseiller_id);
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

                  <div className="flex-[1] text-sm text-white relative mb-3">
                    <span className="sm:hidden text-xs text-gray-300 block">Téléphone</span>
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
                        <a
                          href={m.telephone ? `tel:${m.telephone}` : "#"}
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          📞 Appeler
                        </a>
                        <a
                          href={m.telephone ? `sms:${m.telephone}` : "#"}
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          ✉️ SMS
                        </a>
                        <a
                          href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}?call` : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          📱 Appel WhatsApp
                        </a>
                        <a
                          href={m.telephone ? `https://wa.me/${m.telephone.replace(/\D/g, "")}` : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!m.telephone ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          💬 Message WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-black-700">🏠 Cellule : {cellule?.cellule_full || "—"}</p>
                  <p className="text-sm text-black-700">👤 Conseiller : {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}</p>
                  <p className="text-sm text-black-700">🏙️ Ville : {m.ville || "—"}</p>
                  <p className="self-end text-[11px] text-gray-400 mt-2">Créé le {formatDateFr(m.date_suivi)}</p>

                  {!showRefus && (
                    <button
                      onClick={() => setEditingContact(m)}
                      className="w-full py-2 mt-2 rounded-lg bg-white text-orange-500 font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      ✏️ Modifier le contact
                    </button>
                  )}

                  <button
                    onClick={() => setDetailsCarteId(ouvert ? null : m.id)}
                    className="text-orange-500 underline text-sm mt-3"
                  >
                    {ouvert ? "Fermer détails" : "Détails"}
                  </button>

                  {ouvert && (
                    <div className="rounded-xl p-3 text-sm space-y-2 mt-3 bg-gray-50 w-full">
                      <p>📅 {m.sexe === "Femme" ? "Évangélisée" : "Évangélisé"} le : {formatDateFr(m.Date_Evangelise)}</p>
                      <p>🎗️ Sexe : {m.sexe || "—"}</p>
                      <p>🙏 Prière salut : {m.priere_salut ? "Oui" : "Non"}</p>
                      <p>☀️ Type : {m.type_conversion || "—"}</p>
                      <p>❓ Besoin : {formatBesoin(m.besoin)}</p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== POPUPS ===== */}
      {editingContact && (
        <EditEvangeliseSuiviPopup
          member={editingContact}
          onClose={() => setEditingContact(null)}
          closeDetails={() => setDetailsTable(null)}
          onUpdateMember={(updates) => {
            updateSuiviLocal(editingContact.id, updates);
            setEditingContact(null);
            fetchSuivis(user, cellules);
          }}
        />
      )}

      {view === "table" && detailsTable && (
        <DetailEvangeliseSuivisPopup
          member={detailsTable}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => {
            setEditingContact(null);
            setDetailsTable(null);
          }}
          onUpdate={(id, updates) => {
            updateSuiviLocal(id, updates);
            setDetailsTable(null);
          }}
          onEdit={(member) => setEditingContact(member)}
        />
      )}
    </div>
  );
}
