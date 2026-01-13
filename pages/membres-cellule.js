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
  const [conseillers, setConseillers] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("card");

  const [selectedMembre, setSelectedMembre] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);

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

        // -------- CONSEILLERS --------
        const { data: conseillersData } = await supabase
          .from("profiles")
          .select("id, prenom, nom")
          .eq("role", "Conseiller");
        setConseillers(conseillersData || []);

        const celluleIds = (cellulesData || []).map(c => c.id);

        if (celluleIds.length === 0) {
          setMembres([]);
          setMessage("Aucun membre intégré");
          return;
        }

        // ======== MEMBRES INTÉGRÉS ========
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
        if (!membresData || membresData.length === 0) setMessage("Aucun membre intégré trouvé");
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

  const getConseillerNom = (id) => {
    const c = conseillers.find(c => c.id === id);
    return c ? `${c.prenom} ${c.nom}` : "—";
  };

  const handleUpdateMember = (updated) => {
    setMembres(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  const filteredMembres = filterCellule
    ? membres.filter(m => m.cellule_id === filterCellule)
    : membres;

  if (loading) return <p className="text-white mt-10 text-center">Chargement...</p>;
  if (message) return <p className="text-white mt-10 text-center">{message}</p>;

  // ================= RENDER CARTE =================
  const renderCarte = (m) => (
    <div key={m.id} className="bg-white p-4 rounded-xl shadow-md relative">
      {/* Nom / Prénom centré */}
      <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>

      {/* Téléphone interactif */}
      <div className="relative flex justify-center mt-2">
        {m.telephone ? (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id); }}
              className="text-orange-500 underline font-semibold text-center"
            >
              {m.telephone}
            </button>
            {openPhoneMenuId === m.id && (
              <div className="phone-menu absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-50 w-52" onClick={e => e.stopPropagation()}>
                <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
              </div>
            )}
          </>
        ) : <span className="text-gray-400">—</span>}
      </div>

      {/* Infos principales alignées à gauche */}
      <div className="mt-2 text-sm text-black space-y-1">
        <p>🏙️ Ville : {m.ville || "—"}</p>
        <p>🏠 Cellule : {getCelluleNom(m.cellule_id)}</p>
        <p>👤 Conseiller : {getConseillerNom(m.conseiller_id)}</p>
      </div>

      {/* Bouton Détails */}
      <button
        onClick={() => setSelectedMembre(selectedMembre === m.id ? null : m.id)}
        className="text-orange-500 underline text-sm mt-2 w-full text-left"
      >
        {selectedMembre === m.id ? "Fermer détails" : "Détails"}
      </button>

      {/* Infos étendues */}
      {selectedMembre === m.id && (
        <div className="mt-2 text-sm text-black space-y-1">
          <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
          <p>🎗️ Sexe : {m.sexe || "—"}</p>
          <p>💧 Bapteme d'Eau : {m.bapteme_eau === true ? "Oui" : m.bapteme_eau === false ? "Non" : "—"}</p>
          <p>🔥 Bapteme de Feu : {m.bapteme_esprit === true ? "Oui" : m.bapteme_esprit === false ? "Non" : "—"}</p>
          <p>❓ Besoin : {m.besoin || "—"}</p>
          <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
          <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
          <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
          <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>
          <button
            onClick={() => setEditMember(m)}
            className="text-blue-600 text-sm mt-2 w-full text-left"
          >
            ✏️ Modifier le contact
          </button>
        </div>
      )}
    </div>
  );

  // ================= RENDER TABLE =================
  const renderTable = () => (
    <div className="w-full max-w-6xl overflow-x-auto">
      <table className="w-full border-collapse text-left text-black bg-transparent">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="px-3 py-2">Nom complet</th>
            <th className="px-3 py-2">Téléphone</th>
            <th className="px-3 py-2">Ville</th>
            <th className="px-3 py-2">Cellule</th>
            <th className="px-3 py-2">Conseiller</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembres.map((m) => (
            <tr key={m.id} className="hover:bg-white/20 transition">
              <td className="px-3 py-2">{m.prenom} {m.nom}</td>
              <td className="px-3 py-2">
                {m.telephone ? (
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenPhoneMenuId(openPhoneMenuId === m.id ? null : m.id); }}
                      className="text-orange-500 underline font-semibold"
                    >
                      {m.telephone}
                    </button>
                    {openPhoneMenuId === m.id && (
                      <div className="absolute mt-1 bg-white rounded-lg shadow-lg border z-50 w-48">
                        <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                        <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                        <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
                      </div>
                    )}
                  </div>
                ) : "—"}
              </td>
              <td className="px-3 py-2">{m.ville || "—"}</td>
              <td className="px-3 py-2">{getCelluleNom(m.cellule_id)}</td>
              <td className="px-3 py-2">{getConseillerNom(m.conseiller_id)}</td>
              <td className="px-3 py-2">
                <button
                  onClick={() => setSelectedMembre(selectedMembre === m.id ? null : m.id)}
                  className="text-orange-500 underline text-sm"
                >
                  {selectedMembre === m.id ? "Fermer détails" : "Détails"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ==================== PAGE ====================
  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(135deg,#2E3192,#92EFFD)" }}>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <button onClick={() => history.back()} className="text-white">← Retour</button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" width={80} height={80} alt="logo" className="mx-auto mb-4" />
      <h1 className="text-white text-2xl font-bold text-center mb-4">👥 Membres intégrés de mes cellules</h1>

      {/* FILTRE CELLULE */}
      <div className="flex gap-3 mb-4">
        <select className="px-3 py-2 rounded" value={filterCellule} onChange={(e) => setFilterCellule(e.target.value)}>
          <option value="">Toutes les cellules</option>
          {cellules.map(c => <option key={c.id} value={c.id}>{c.cellule_full}</option>)}
        </select>

        <select className="px-3 py-2 rounded" value={view} onChange={(e) => setView(e.target.value)}>
          <option value="card">Vue carte</option>
          <option value="table">Vue table</option>
        </select>
      </div>

      {/* RENDER */}
      {view === "card" ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{filteredMembres.map(renderCarte)}</div> : renderTable()}

      {/* POPUP EDIT */}
      {editMember && <EditMemberPopup member={editMember} onClose={() => setEditMember(null)} onUpdateMember={handleUpdateMember} />}
    </div>
  );
}
