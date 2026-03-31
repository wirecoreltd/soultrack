"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";
import DetailsCelluleMemberPopup from "../components/DetailsCelluleMemberPopup";

export default function MembresCellule() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <MembresCelluleContent />
    </ProtectedRoute>
  );
}

function MembresCelluleContent() {
  const router = useRouter();
  const { memberId } = router.query;
  const memberIdStr = Array.isArray(memberId) ? memberId[0] : memberId;  
  const [membres, setMembres] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);
  const memberRefs = useRef({}); // pour focus sur membre

  // ------------------- Helpers -------------------
  const parseJsonArray = (value) => {
    if (!value) return [];
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  };

  const formatMinistere = (ministereJson, autreMinistere) => {
    let list = parseJsonArray(ministereJson).filter((m) => m.toLowerCase() !== "autre");
    if (autreMinistere?.trim()) list.push(autreMinistere.trim());
    return list.join(", ") || "—";
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const statutSuiviLabels = {
    1: "En attente",
    2: "En Suivis",
    3: "Intégré",
    4: "Refus",
  };

  const getCelluleNom = (celluleId) => cellules.find((c) => c.id === celluleId)?.cellule_full || "—";

  const getBorderColor = (member) => {
    switch ((member?.etat_contact || "").toLowerCase().trim()) {
      case "nouveau": return "#fb923c";
      case "existant": return "#4ade80";
      case "inactif": return "#9ca3af";
      default: return "#9ca3af";
    }
  };

  const handleUpdateMember = (updated) => {
    setMembres((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // ------------------- Fetch membre unique si memberId -------------------
 useEffect(() => {
  if (!memberIdStr) return; // stop si pas défini

  const fetchMembreUnique = async () => {
    setLoading(true);
    try {
      const { data: member, error } = await supabase
        .from("membres_complets")
        .select("*")
        .eq("id", memberIdStr)
        .single();

      if (error) throw error;

      setMembres([member]);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Membre non trouvé");
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  fetchMembreUnique();
}, [memberIdStr]);
  // ------------------- Fetch data général -------------------
  useEffect(() => {
    if (memberIdStr) return;

    const fetchData = async () => {
      setLoading(true);
      setMessage("");
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("Non connecté");

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, eglise_id, branche_id")
          .eq("id", user.id)
          .single();

        let celluleQuery = supabase.from("cellules").select("id, cellule_full, responsable_id");
        if (profile.role === "ResponsableCellule") celluleQuery = celluleQuery.eq("responsable_id", profile.id);
        const { data: cellulesData } = await celluleQuery;
        setCellules(cellulesData || []);

        const celluleIds = (cellulesData || []).map((c) => c.id);
        if (celluleIds.length === 0) {
          setMembres([]);
          setMessage("Aucun membre intégré");
          return;
        }

        let membresQuery = supabase
          .from("membres_complets")
          .select("*")
          .in("cellule_id", celluleIds)
          .eq("eglise_id", profile.eglise_id)
          .eq("branche_id", profile.branche_id)
          .eq("statut_suivis", "3")
          .order("created_at", { ascending: false });

        if (profile.role === "Conseiller") membresQuery = membresQuery.eq("conseiller_id", profile.id);
        const { data: membresData, error } = await membresQuery;
        if (error) throw error;

        setMembres(membresData || []);
        if (!membresData || membresData.length === 0) setMessage("Aucun membre intégré trouvé");
      } catch (err) {
        console.error(err);
        setMessage("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberIdStr]);

  // ------------------- Scroll automatique sur membre ciblé -------------------
  useEffect(() => {
    if (memberIdStr && memberRefs.current[memberIdStr]) {
      memberRefs.current[memberIdStr].scrollIntoView({ behavior: "smooth", block: "center" });
      setDetailsOpen((prev) => ({ ...prev, [memberIdStr]: true }));
    }
  }, [memberIdStr, membres]);

  // ------------------- Click outside phone menu -------------------
  const handleClickOutside = useCallback((e) => {
    if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
      setOpenPhoneId(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // ------------------- Filtered members -------------------
  const filteredMembres = membres.filter(
    (m) =>
      (!filterCellule || m.cellule_id === filterCellule) &&
      (!search ||
        m.prenom.toLowerCase().includes(search.toLowerCase()) ||
        m.nom.toLowerCase().includes(search.toLowerCase()) ||
        (m.telephone && m.telephone.includes(search)))
  );

  // ------------------- Render -------------------
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
      <HeaderPages />
      <h1 className="text-white text-2xl font-bold text-center mb-4">
        {cellules.length > 1 ? "Membres de mes cellules" : "Membre de ma cellule"}
      </h1>

      {loading && <div className="text-center mt-10 text-white">Chargement...</div>}
      {!loading && message && <div className="text-center mt-10 text-white">{message}</div>}

      {!loading && !message && (
        <>
          {/* Recherche + filtre */}
          <div className="w-full flex flex-col items-center mb-4 gap-2">
            <input
              type="text"
              placeholder="Recherche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-3 py-2 rounded-md border text-black focus:outline-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={filterCellule}
                onChange={(e) => setFilterCellule(e.target.value)}
                className="px-3 py-2 rounded-md border text-black text-sm"
              >
                <option value="">-- Toutes les cellules --</option>
                {cellules.map((c) => (
                  <option key={c.id} value={c.id}>{c.cellule_full}</option>
                ))}
              </select>
              <span className="text-white text-sm">{filteredMembres.length} membres</span>
            </div>
          </div>

          {/* Toggle Vue Carte / Table */}
          <div className="w-full max-w-6xl flex justify-center mb-6">
            <button
              onClick={() => setView(view === "card" ? "table" : "card")}
              className="text-sm font-semibold underline text-white"
            >
              {view === "card" ? "Vue Table" : "Vue Carte"}
            </button>
          </div>

          {/* ================= VUE CARTE ================= */}
          {view === "card" && (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                {filteredMembres.map((m) => {
                  const besoins = parseJsonArray(m.besoin).join(", ") || "—";
                  const isOpen = detailsOpen[m.id];
                  return (
                    <div
                      key={m.id}
                      ref={(el) => (memberRefs.current[m.id] = el)}
                      className="bg-white p-4 rounded-2xl shadow-xl border-l-4"
                      style={{ borderLeftColor: getBorderColor(m) }}
                    >
                      <h2 className="text-center font-bold text-lg">{m.prenom} {m.nom}</h2>

                      <div className="relative text-center">
                        <p
                          className="text-orange-500 underline cursor-pointer font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPhoneId(openPhoneId === m.id ? null : m.id);
                          }}
                        >
                          {m.telephone || "—"}
                        </p>

                        {openPhoneId === m.id && (
                          <div ref={phoneMenuRef} className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-56" onClick={(e) => e.stopPropagation()}>
                            <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                            <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                            <a href={`https://wa.me/${m.telephone?.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                            <a href={`https://wa.me/${m.telephone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
                          </div>
                        )}
                      </div>

                      <p className="text-center text-sm mt-1">🏙️ {m.ville || ""}</p>
                      <p className="text-center text-sm">🏠 {getCelluleNom(m.cellule_id)}</p>

                      <button onClick={() => setDetailsOpen((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                        className="text-orange-500 underline mt-2 block mx-auto text-sm">
                        {isOpen ? "Fermer détails" : "Détails"}
                      </button>

                      {isOpen && (
                        <div className="text-black text-sm mt-2 w-full space-y-1">
                          <p className="font-semibold text-center" style={{ color: "#2E3192" }}>
                            💡 Statut Suivi : {statutSuiviLabels[m.statut_suivis] || m.suivi_statut || ""}
                          </p>
                          <p>📆 Envoyé en suivi : {formatDateFr(m.date_envoi_suivi)}</p>
                          <p>🎗️ Civilité : {m.sexe || ""}</p>
                          <p>⏳ Tranche d'age : {m.age || ""}</p>
                          <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                          <p>💧 Baptême d’Eau : {m.bapteme_eau || "—"}</p>
                          {m.bapteme_eau === "Non" && m.veut_se_faire_baptiser === "Oui" && (
                            <p className="ml-6">💦 Veut se faire baptiser</p>
                          )}
                          <p>🔥 Baptême de Feu : {m.bapteme_esprit || "—"}</p>
                          <p>✒️ Formation : {m.Formation || ""}</p>
                          <p>❤️‍🩹 Soin Pastoral : {m.Soin_Pastoral || ""}</p>
                          <p>💢 Ministère : {formatMinistere(m.Ministere, m.Autre_Ministere)}</p>
                          <p>❓ Difficultés / Besoins : {besoins}</p>
                          <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-2 block mx-auto underline">✏️ Modifier le contact</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= VUE TABLE ================= */}
          {view === "table" && (
            <div className="w-full max-w-6xl overflow-x-auto py-2 mx-auto">
              <div className="min-w-[700px] space-y-2">
                <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
                  <div className="flex-[2]">Nom complet</div>
                  <div className="flex-[1]">Téléphone</div>
                  <div className="flex-[1]">Ville</div>
                  <div className="flex-[1] flex justify-center items-center">Cellule</div>
                  <div className="flex-[1]">Action</div>
                </div>
                {filteredMembres.map((m) => (
                  <div key={m.id} className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                    <div className="flex-[2] text-white flex items-center gap-1">{m.prenom} {m.nom}</div>
                    <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                    <div className="flex-[1] text-white">{m.ville || "—"}</div>
                    <div className="flex-[1] text-white flex justify-center items-center">{getCelluleNom(m.cellule_id)}</div>
                    <div className="flex-[1]"><button onClick={() => setDetailsMember(m)} className="text-orange-500 underline text-sm">Détails</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= POPUPS ================= */}
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
              onUpdateMember={(updated) => {
                handleUpdateMember(updated);
                setEditMember(null);
                setDetailsMember(null);
              }}
            />
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
