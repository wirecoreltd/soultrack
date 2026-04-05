"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";

export default function MembresCellule() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <MembresCelluleContent />
    </ProtectedRoute>
  );
}

function MembresCelluleContent() {
  const router = useRouter();
  const { memberId, celluleId } = router.query;

  const [membres, setMembres] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);  
  const [detailsOpen, setDetailsOpen] = useState({});
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);

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

  // ------------------- Normalisation du memberId -------------------
  const memberIdStr = typeof memberId === "string" ? memberId : (Array.isArray(memberId) ? memberId[0] : null);

  // ------------------- Fetch membre unique si memberId -------------------
  useEffect(() => {
    if (!memberIdStr) return;

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

  // ------------------- Fetch tous les membres intégrés si pas de memberId -------------------
  useEffect(() => {
    if (memberIdStr) return;

    const fetchAllMembers = async () => {
      setLoading(true);
      try {
       let query = supabase
  .from("membres_complets")
  .select("*")
  .eq("statut_suivis", 3)
  .not("cellule_id", "is", null);      
  .order("created_at", { ascending: false });

// 🔥 si celluleId présent → filtrer
if (celluleId) {
  query = query.eq("cellule_id", celluleId);
}

const { data: membresData, error } = await query;

        if (error) throw error;

        setMembres(membresData || []);
        if (!membresData || membresData.length === 0) setMessage("Aucun membre trouvé");
      } catch (err) {
        console.error(err);
        setMessage("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, [memberIdStr]);

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

  useEffect(() => {
  if (celluleId) {
    setFilterCellule(celluleId);
  }
}, [celluleId]);

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
        
               <div className="w-full flex justify-end mb-6">                
                    <button
                      onClick={() => router.push("/ajouter-membre-cellule")}
                      className="text-white font-semibold px-4 py-2 rounded shadow text-sm"
                    >
                      ➕ Ajouter un membre
                    </button>                  
                </div>

          {/* ================= VUE CARTE ================= */}
          {view === "card" && (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative">
                {filteredMembres.map((m) => {
                  const besoins = parseJsonArray(m.besoin).join(", ") || "—";
                  const isOpen = detailsOpen[m.id];
                  return (
                   <div 
  key={m.id} 
  className="bg-white p-4 rounded-2xl shadow-xl border-l-4 relative overflow-visible"
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
                          <div ref={phoneMenuRef} className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border z-[9999] w-56" onClick={(e) => e.stopPropagation()}>
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
                          <p>❓ Difficultés / Besoins : {besoins}</p>  
                          <p>💢 Ministère : {formatMinistere(m.Ministere, m.Autre_Ministere)}</p>
                          <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                          <p>🧩 Comment est-il venu : {m.venu || ""}</p>                    
                          <p>📝 Commentaire Suivis : {m.commentaire_suivis || ""}</p>
                          
                          <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-2 block mx-auto underline">✏️ Modifier le contact</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}         
          
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
