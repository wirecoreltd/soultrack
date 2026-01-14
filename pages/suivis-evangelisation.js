"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangeliseSuiviPopup from "../components/EditEvangeliseSuiviPopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";

export default function SuivisEvangelisation() {
  const [allSuivis, setAllSuivis] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card");
  const [updating, setUpdating] = useState({});
  const [detailsCarteId, setDetailsCarteId] = useState(null);
  const [detailsTable, setDetailsTable] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [commentChanges, setCommentChanges] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [showRefus, setShowRefus] = useState(false);
  const [user, setUser] = useState(null);
  const [phoneMenuId, setPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);

    // ================= INIT =================

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
    const cellulesData = await fetchCellules();
    if (userData) await fetchSuivis(userData, cellulesData);
    setLoading(false);
  };

  // ================= USER =================
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

  // ================= CONSEILLERS =================
  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("role", "Conseiller");

    setConseillers(data || []);
  };

  // ================= CELLULES =================
  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule_full, responsable_id");

    setCellules(data || []);
    return data || [];
  };

  // ================= SUIVIS =================
  const fetchSuivis = async (userData, cellulesData) => {
  try {
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Erreur fetchSuivis:", error);
      setAllSuivis([]);
      return;
    }

    let filtered = data || [];

    // 🔹 Filtrage selon rôle
    if (userData.role === "Conseiller") {
      filtered = filtered.filter((m) => m.conseiller_id === userData.id);
    } else if (userData.role === "ResponsableCellule") {
      const mesCellulesIds = cellulesData
        .filter((c) => c.responsable_id === userData.id)
        .map((c) => c.id);
      filtered = filtered.filter((m) => mesCellulesIds.includes(m.cellule_id));
    }

    setAllSuivis(filtered);
  } catch (err) {
    console.error("Erreur fetchSuivis:", err.message);
    setAllSuivis([]);
  }
};


  // ================= HELPERS =================
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

  // ================= UPSERT MEMBRE =================
  const upsertMembre = async (suivi) => {
    try {
      const payload = {
  suivi_int_id: Number(suivi.id), // 🔑 LIEN UNIQUE
  nom: suivi.nom,
  prenom: suivi.prenom,
  telephone: suivi.telephone,
  ville: suivi.ville,
  sexe: suivi.sexe,
  besoin: suivi.besoin,
  infos_supplementaires: suivi.infos_supplementaires,
  cellule_id: suivi.cellule_id,
  conseiller_id: suivi.conseiller_id,

  statut_initial: "intégré",
  suivi_statut: "Intégré",
  suivi_commentaire_suivis: suivi.commentaire_evangelises,
  suivi_updated_at: new Date().toISOString(),
};

      const { error } = await supabase
        .from("membres_complets")
        .upsert(payload, { onConflict: "suivi_int_id" });

      if (error) console.error("UPSERT ERROR", error);
    } catch (err) {
      console.error("Erreur upsert membre:", err.message);
    }
  };

  // ================= UPDATE SUIVI =================
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
      })
      .eq("id", id);

    if (error) throw error;

    // ✅ Si intégré → upsert + retrait immédiat
    if (newStatus === "Intégré") {
      await upsertMembre({
        ...m,
        status_suivis_evangelises: newStatus,
        commentaire_evangelises: newComment,
      });

      setAllSuivis((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    // ✅ Sinon update local
    setAllSuivis((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              commentaire_evangelises: newComment,
              status_suivis_evangelises: newStatus,
            }
          : s
      )
    );

    // Nettoyage
    setCommentChanges((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    setStatusChanges((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  } catch (err) {
    console.error("Erreur lors de la sauvegarde :", err.message);
    alert("Erreur lors de la sauvegarde : " + err.message);
  } finally {
    setUpdating((p) => ({ ...p, [id]: false }));
  }
};


  // ================= RENDER =================
  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!user) return <p className="text-center mt-10 text-red-600">Non connecté</p>;

  return (
    
  <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-r from-blue-800 to-cyan-400">
    {/* Header */}
    <div className="w-full max-w-5xl mb-6 flex justify-between">
      <button onClick={() => window.history.back()} className="text-white">← Retour</button>
      <LogoutLink />
    </div>

    <Image src="/logo.png" alt="Logo" width={80} height={80} />
    <h1 className="text-3xl font-bold text-white mb-6">📋 Suivis des Évangélisés</h1>

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

    {/* ================= VUE CARTE ================= */}
    {view === "card" && (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
        {suivisAffiches.map((m) => {
          const ouvert = detailsCarteId === m.id;
        
          // 🔹 CONSEILLER (déjà OK chez toi)
          const conseiller = conseillers.find(
            (c) => c.id === m.conseiller_id
          );
        
          // 🔹 CELLULE (CORRECTION ICI)
          const cellule = cellules.find(
            (c) => c.id === m.cellule_id
          );

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
                  <div className="flex-[1] text-sm text-white relative">
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
                  
                    {/* MENU TELEPHONE */}
                    {phoneMenuId === m.id && (
                      <div
                        ref={phoneMenuRef}
                        className="absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={m.telephone ? `tel:${m.telephone}` : "#"}
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                            !m.telephone ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          📞 Appeler
                        </a>
                  
                        <a
                          href={m.telephone ? `sms:${m.telephone}` : "#"}
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                            !m.telephone ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          ✉️ SMS
                        </a>
                  
                        <a
                          href={
                            m.telephone
                              ? `https://wa.me/${m.telephone.replace(/\D/g, "")}?call`
                              : "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                            !m.telephone ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          📱 Appel WhatsApp
                        </a>
                  
                        <a
                          href={
                            m.telephone
                              ? `https://wa.me/${m.telephone.replace(/\D/g, "")}`
                              : "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${
                            !m.telephone ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          💬 Message WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                <p className="text-sm text-black-700 mb-1">
                  🏠 Cellule : {cellule?.cellule_full || "—"}
                </p>
                <p className="text-sm text-black-700 mb-2">
                  👤 Conseiller : {conseiller ? `${conseiller.prenom} ${conseiller.nom}` : "—"}
                </p>
                <p className="text-sm text-black-700 mb-2">
                  🏙️ Ville : {m.ville || "—"}
                </p>

                {/* Commentaire + statut */}
                <div className="w-full bg-slate-50 rounded-xl p-3 mt-2">
                  <label className="block w-full text-center font-semibold text-blue-700 mb-1 mt-2">
                    Commentaire Suivis
                  </label>
                  <textarea
                    rows={2}
                    value={commentChanges[m.id] ?? m.commentaire_evangelises ?? ""}
                    onChange={(e) => handleCommentChange(m.id, e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                  <label className="block w-full text-center font-semibold text-blue-700 mb-1 mt-2">
                  Statut du suivis
                    </label>
                  <select
                    value={statusChanges[m.id] ?? m.status_suivis_evangelises ?? ""}
                    onChange={(e) => handleStatusChange(m.id, e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">-- Sélectionner un statut --</option>
                    <option value="En cours">En cours</option>
                    <option value="Intégré">Intégré</option>
                    <option value="Refus">Refus</option>
                  </select>

                  <button
                    onClick={() => updateSuivi(m.id, m)}
                    disabled={updating[m.id]}
                    className={`mt-3 w-full py-2 rounded-lg font-semibold shadow-md transition-all ${
                      updating[m.id]
                        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                    }`}
                  >
                    {updating[m.id] ? "Enregistrement..." : "Sauvegarder"}
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
                  <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2">
                     <p>🎗️ Sexe : {m.sexe || "—"}</p>
                    <p>🙏 Prière salut : {m.priere_salut ? "Oui" : "Non"}</p>
                    <p>☀️ Type : {m.type_conversion || "—"}</p>
                    <p>❓ Besoin : {formatBesoin(m.besoin)}</p>
                    <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                    <button
                      onClick={() => m.id && setEditingContact(m.evangelises)}
                      className="text-blue-600 text-sm underline w-full"
                    >
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* ================= VUE TABLE ================= */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2 mx-auto">
          <div className="min-w-[900px] space-y-2">
      
            {/* Header */}
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-3 py-2 border-b border-gray-400">
              <div className="flex-[2]">Nom complet</div>
              <div className="flex-[1]">Téléphone</div>
              <div className="flex-[1]">Attribué à</div>
              <div className="flex-[1]">Ville</div>
              <div className="flex-[1] text-center">Actions</div>
            </div>
      
            {/* Lignes */}
            {suivisAffiches.map((m) => {
              const cellule = cellules.find(c => c.id === m.cellule_id);
              const conseiller = conseillers.find(c => c.id === m.conseiller_id);
      
              const attribueA = cellule
                ? `🏠 ${cellule.cellule_full}`
                : conseiller
                  ? `👤 ${conseiller.prenom} ${conseiller.nom}`
                  : "—";
      
              return (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center px-3 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition gap-2 border-l-4"
                  style={{ borderLeftColor: getBorderColor(m) }}
                >
      
                  {/* Nom */}
                  <div className="flex-[2] font-bold text-white">
                    <span className="sm:hidden text-xs text-gray-300 block">Nom</span>
                    {m.prenom} {m.nom}
                  </div>      
                 
                  {/* Téléphone */}     
                   {/* Ville */}
                  <div className="flex-[1] text-sm text-white">
                    <span className="sm:hidden text-xs text-gray-300 block">Téléphone</span>
                    {m.telephone || "—"}
                  </div>
                         
                  {/* Attribué à */}
                  <div className="flex-[1] text-sm text-white">
                    <span className="sm:hidden text-xs text-gray-300 block">Attribué à</span>
                    {attribueA}
                  </div>
      
                  {/* Ville */}
                  <div className="flex-[1] text-sm text-white">
                    <span className="sm:hidden text-xs text-gray-300 block">Ville</span>
                    {m.ville || "—"}
                  </div>
      
                  {/* Actions */}
                  <div className="flex-[1] flex sm:justify-center gap-3 text-sm">
                    <button
                      onClick={() => setDetailsTable(m)}
                      className="text-orange-400 underline"
                    >
                      Détails
                    </button>      
                    
                  </div>      
                </div>
              );
            })}
          </div>
        </div>
      )}


    {view === "table" && detailsTable && (
      <DetailsEvangePopup
        member={detailsTable}
        onClose={() => setDetailsTable(null)}
        onEdit={(s) => {
          setDetailsTable(null);
          s.evangelises?.id && setEditingContact(s.evangelises);
        }}
      />
    )}

    {editingContact && (
      <EditEvangeliseSuiviPopup
        member={editingContact}
        onClose={() => setEditingContact(null)}
        onUpdateMember={() => {
          setEditingContact(null);
          fetchSuivis(user, cellules);
        }}
      />
    )}
  </div>
);
}
