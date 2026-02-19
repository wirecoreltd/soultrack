"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberCellulePopup from "../components/EditMemberCellulePopup";
import DetailsCelluleMemberPopup from "../components/DetailsCelluleMemberPopup";
import ProtectedRoute from "../components/ProtectedRoute"
import HeaderPages from "../components/HeaderPages";
import Footer from "../components/Footer";

export default function MembresCellule() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableCellule", "SuperviseurCellule"]}>
      <MembresCelluleContent />
    </ProtectedRoute>
  );
}

  function MembresCelluleContent() {
  const [membres, setMembres] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("card");
  const [search, setSearch] = useState("");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});
  const toBoolean = (val) => val === true || val === "true";   
  const [openPhoneId, setOpenPhoneId] = useState(null);
  const phoneMenuRef = useRef(null);

  // ------------------- Close both popups -------------------
  const closeAllPopups = () => {
    setEditMember(null);
    setDetailsMember(null);
  };

  // ================= 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= FETCH =================
  useEffect(() => {
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

        let celluleQuery = supabase
          .from("cellules")
          .select("id, cellule_full, responsable_id");

        if (profile.role === "ResponsableCellule") {
          celluleQuery = celluleQuery.eq("responsable_id", profile.id);
        }

        const { data: cellulesData } = await celluleQuery;
        setCellules(cellulesData || []);    
                
        const celluleIds = (cellulesData || []).map(c => c.id);

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

        
        if (profile.role === "Conseiller") {
          membresQuery = membresQuery.eq("conseiller_id", profile.id);
        }
        
        const { data: membresData, error } = await membresQuery;
        if (error) throw error;
        
        setMembres(membresData || []);
        
        if (!membresData || membresData.length === 0) {
          setMessage("Aucun membre intégré trouvé");
        }

      } catch (err) {
        console.error(err);
        setMessage("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= HELPERS =================
  const getCelluleNom = (celluleId) => {
    const c = cellules.find(c => c.id === celluleId);
    return c?.cellule_full || "—";
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

  const getBorderColor = (m) => {
    if (m.besoin) return "#f97316";
    if (m.is_whatsapp) return "#22c55e";
    return "#3b82f6";
  };

  const handleUpdateMember = (updated) => {
    setMembres(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
  };

  const filteredMembres = membres
    .filter(m =>
      (!filterCellule || m.cellule_id === filterCellule) &&
      (!search || 
        m.prenom.toLowerCase().includes(search.toLowerCase()) ||
        m.nom.toLowerCase().includes(search.toLowerCase()) ||
        (m.telephone && m.telephone.includes(search))
      )
    );

  // ================= RENDER =================
  return (
    
  <div className="min-h-screen p-6" style={{ backgroundColor: "#333699" }}>
    <HeaderPages />

    <h1 className="text-white text-2xl font-bold text-center mb-4">
      {cellules.length > 1 ? "Membres de mes cellules" : "Membre de ma cellule"}
    </h1>

    {/* ================= ETAT LOADING ================= */}
    {loading && (
      <div className="text-center mt-10 text-white">
        Chargement...
      </div>
    )}

    {/* ================= MESSAGE VIDE ================= */}
    {!loading && message && (
      <div className="text-center mt-10 text-white">
        {message}
      </div>
    )}

    {/* ================= CONTENU NORMAL ================= */}
    {!loading && !message && (
      <>
        {/* Recherche + filtre */}
        <div className="w-full flex flex-col items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Recherche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-3 py-2 rounded-md border text-black focus:outline-none"
          />

          <div className="flex items-center gap-3">
            <select
              value={filterCellule}
              onChange={e => setFilterCellule(e.target.value)}
              className="px-3 py-2 rounded-md border text-black text-sm"
            >
              <option value="">-- Toutes les cellules --</option>
              {cellules.map(c => (
                <option key={c.id} value={c.id}>
                  {c.cellule_full}
                </option>
              ))}
            </select>
            <span className="text-white text-sm">
              {filteredMembres.length} membres
            </span>
          </div>
        </div>

      {/* Toggle Vue Carte / Vue Table */}
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
            {filteredMembres.map(m => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-2xl shadow-xl border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="text-center font-bold text-lg">
                  {m.prenom} {m.nom}
                </h2>

                {/* Téléphone */}
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
                    <div
                      ref={phoneMenuRef}
                      className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border z-50 w-56"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                      <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                      <a href={`https://wa.me/${m.telephone?.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                      <a href={`https://wa.me/${m.telephone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
                    </div>
                  )}
                </div>

                <p className="text-center text-sm mt-1">🏙️ {m.ville || ""}</p>
                <p className="text-center text-sm">🏠 {getCelluleNom(m.cellule_id)}</p>

                <button
                  onClick={() =>
                    setDetailsOpen(prev => ({ ...prev, [m.id]: !prev[m.id] }))
                  }
                  className="text-orange-500 underline mt-2 block mx-auto text-sm"
                >
                  {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                </button>

                {detailsOpen[m.id] && (
                  <div className="mt-3 p-3 rounded-lg text-sm space-y-1 text-left">
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🎗️ Sexe : {m.sexe || ""}</p>
                    <p>💧 Baptême d’Eau : {toBoolean(m.bapteme_eau) ? "Oui" : "Non"}</p>
                    <p>🔥 Baptême de Feu : {toBoolean(m.bapteme_esprit) ? "Oui" : "Non"}</p>
                    <p>❓ Besoin : {formatBesoin(m.besoin)}</p>
                    <p>📝 Infos : {m.infos_supplementaires || ""}</p>
                    <p>🧩 Comment est-il venu : {m.venu || ""}</p>                    
                    <p>📝 Commentaire Suivis : {m.commentaire_suivis || ""}</p>

                    <button
                      onClick={() => setEditMember(m)}
                      className="text-blue-600 text-sm mt-2 block mx-auto underline"
                    >
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            ))}
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

            {filteredMembres.map(m => (
              <div
                key={m.id}
                className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex-[2] text-white flex items-center gap-1">{m.prenom} {m.nom}</div>
                <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                <div className="flex-[1] text-white">{m.ville || "—"}</div>
                <div className="flex-[1] text-white flex justify-center items-center">{getCelluleNom(m.cellule_id)}</div>
                <div className="flex-[1]">
                  <button
                    onClick={() => setDetailsMember(m)}
                    className="text-orange-500 underline text-sm"
                  >
                    Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUPS */}
      <DetailsCelluleMemberPopup
        member={detailsMember}
        onClose={() => setDetailsMember(null)}
        getCelluleNom={getCelluleNom}
        onEdit={(m) => {
          setEditMember(m);       // ouvre la popup d’édition
          setDetailsMember(null); // ferme la popup détails
        }}
      />
      
      {editMember && (
        <EditMemberCellulePopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updated) => {
            handleUpdateMember(updated); // met à jour la liste
            setEditMember(null);         // ferme popup édition
            setDetailsMember(null);      // assure fermeture popup détails
          }}
        />
      )}

      </>
    )}

    <Footer />
  </div>
);
}
