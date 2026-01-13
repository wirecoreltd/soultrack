"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberPopup from "../components/EditMemberPopup";
import MemberDetailsPopup from "../components/MemberDetailsPopup";

export default function MembresCellule() {
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

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage("");

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("Non connecté");

        // -------- PROFIL --------
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .single();

        // -------- CELLULES --------
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
          .eq("statut_suivis", 3)
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

  const getBorderColor = (m) => {
    if (m.besoin) return "#f97316";        // orange
    if (m.is_whatsapp) return "#22c55e";   // vert
    return "#3b82f6";                      // bleu par défaut
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


  if (loading) {
    return <p className="text-white mt-10 text-center">Chargement...</p>;
  }

  if (message) {
    return <p className="text-white mt-10 text-center">{message}</p>;
  }

  // ================= RENDER =================
  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(135deg,#2E3192,#92EFFD)" }}
    >
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <button onClick={() => history.back()} className="text-white">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image
        src="/logo.png"
        width={80}
        height={80}
        alt="logo"
        className="mx-auto mb-4"
      />

      <h1 className="text-white text-2xl font-bold text-center mb-4">
        👥 Membres intégrés de mes cellules
      </h1>
      
      {/* Barre de recherche */}
<div className="w-full max-w-4xl flex justify-center mb-2">
  <input
    type="text"
    placeholder="Recherche..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    className="w-2/3 px-3 py-1 rounded-md border text-black focus:outline-none"
  />
</div>

      
      {/* Filtre sous la barre de recherche */}
      <div className="w-full max-w-6xl flex justify-center items-center mb-4 gap-2 flex-wrap">
        <select
          value={filterCellule}
          onChange={e => setFilterCellule(e.target.value)}
          className="px-3 py-1 rounded-md border text-black text-sm"
        >
          <option value="">-- Toutes les cellules --</option>
          {cellules.map(c => (
            <option key={c.id} value={c.id}>{c.cellule_full}</option>
          ))}
        </select>
        <span className="text-white text-sm ml-2">{filteredMembres.length} membres</span>
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

                <p className="text-center text-orange-500 underline font-semibold">
                  {m.telephone || "—"}
                </p>

                <p className="text-center text-sm mt-1">
                  🏙️ {m.ville || "—"}
                </p>

                <p className="text-center text-sm">
                  🏠 {getCelluleNom(m.cellule_id)}
                </p>

                <button
                  onClick={() =>
                    setDetailsOpen(prev => ({
                      ...prev,
                      [m.id]: !prev[m.id]
                    }))
                  }
                  className="text-orange-500 underline mt-2 block mx-auto text-sm"
                >
                  {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                </button>

                {detailsOpen[m.id] && (
                  <div className="mt-3 p-3 rounded-lg text-sm space-y-1 text-left">
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🎗️ Sexe : {m.sexe || "—"}</p>
                    <p>💧 Bapteme d'Eau : {m.bapteme_eau ? "Oui" : "Non"}</p>
                    <p>🔥 Bapteme de Feu : {m.bapteme_esprit ? "Oui" : "Non"}</p>
                    <p>❓ Besoin : {m.besoin || "—"}</p>
                    <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                    <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                    <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
                    <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>

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
      
      {/* Header table */}
      <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
        <div className="flex-[2]">Nom complet</div>
        <div className="flex-[1]">Téléphone</div>
        <div className="flex-[1]">Ville</div>
        <div className="flex-[1] flex justify-center items-center">Cellule</div>
        <div className="flex-[1]">Action</div>
      </div>

      {/* Lignes */}
      {filteredMembres.map(m => (
        <div
          key={m.id}
          className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
          style={{ borderLeftColor: getBorderColor(m) }}
        >
          <div className="flex-[2] text-white flex items-center gap-1">
            {m.prenom} {m.nom}
          </div>
          <div className="flex-[1] text-white">{m.telephone || "—"}</div>
          <div className="flex-[1] text-white">{m.ville || "—"}</div>
          <div className="flex-[1] text-white flex justify-center items-center">
            {getCelluleNom(m.cellule_id)}
          </div>
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
      {detailsMember && (
        <MemberDetailsPopup
          member={detailsMember}
          onClose={() => setDetailsMember(null)}
          getCelluleNom={getCelluleNom}
        />
      )}

      {editMember && (
        <EditMemberPopup
          member={editMember}
          onClose={() => setEditMember(null)}
          onUpdateMember={handleUpdateMember}
        />
      )}
    </div>
  );
}
