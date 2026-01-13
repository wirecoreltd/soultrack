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

  const [selectedMembre, setSelectedMembre] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);

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

        // ======== SOURCE DE VÉRITÉ ========
        // 👉 UNIQUEMENT membres intégrés
        let membresQuery = supabase
          .from("membres_complets")
          .select("*")
          .in("cellule_id", celluleIds)
          .eq("statut_suivis", 3) // 🔒 INTÉGRÉ UNIQUEMENT
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

  const handleUpdateMember = (updated) => {
    setMembres(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
  };

  const filteredMembres = filterCellule
    ? membres.filter(m => m.cellule_id === filterCellule)
    : membres;

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

      {/* FILTRES */}
      <div className="flex gap-3 mb-4">
        <select
          className="px-3 py-2 rounded"
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
        >
          <option value="">Toutes les cellules</option>
          {cellules.map(c => (
            <option key={c.id} value={c.id}>
              {c.cellule_full}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 rounded"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="card">Vue carte</option>
          <option value="table">Vue table</option>
        </select>
      </div>

      {/* ================= VUE CARTE ================= */}
      {view === "card" && (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMembres.map((m) => {
            const isOpen = popupMember?.id === m.id;
            return (
              <div key={m.id} className="bg-white p-4 rounded-xl shadow-md border-l-4 relative hover:shadow-lg transition">
                
                {/* Badges */}
                {m.star && <span className="absolute top-3 right-3 text-yellow-400 text-xl">⭐</span>}
                {m.isNouveau && (
                  <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: "#2E3192", color: "white" }}>
                    Nouveau
                  </span>
                )}
      
                {/* Prénom/Nom */}
                <h2 className="text-lg font-bold text-center">{m.prenom} {m.nom}</h2>
      
                {/* Téléphone déroulant */}
                <div className="relative flex justify-center mt-1">
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
                        <div className="phone-menu absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-50 w-52" onClick={(e) => e.stopPropagation()}>
                          <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                          <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                          <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                          <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
                        </div>
                      )}
                    </>
                  ) : <span className="text-gray-400">—</span>}
                </div>
      
                {/* Infos principales */}
                <div className="mt-2 text-sm text-black space-y-1">
                  <p>🏙️ Ville : {m.ville || "—"}</p>
                  <p>🕊 Etat Contact : {m.etat_contact || "—"}</p>
                  <p>🏠 Cellule : {m.cellule_id ? cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—" : "—"}</p>
                  <p>👤 Conseiller : {m.conseiller_id ? `${conseillers.find(c => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find(c => c.id === m.conseiller_id)?.nom || ""}`.trim() : "—"}</p>
                </div>
      
                {/* Bouton Détails */}
                <button
                  onClick={() => setPopupMember(popupMember?.id === m.id ? null : { ...m })}
                  className="text-orange-500 underline text-sm mt-2 w-full"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>
      
                {/* Détails étendus */}
                {isOpen && (
                  <div className="text-black text-sm mt-2 w-full space-y-1">
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🎗️ Sexe : {m.sexe || "—"}</p>
                    <p>💧 Bapteme d'Eau : {m.bapteme_eau === true ? "Oui" : "Non"}</p>
                    <p>🔥 Bapteme de Feu : {m.bapteme_esprit === true ? "Oui" : "Non"}</p>
                    <p>❓ Besoin : {m.besoin || "—"}</p>
                    <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                    <p>🧩 Venu par : {m.venu || "—"}</p>
                    <p>✨ Raison de la venue : {m.statut_initial || "—"}</p>
                    <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>
                    <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-2 w-full">
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


      {/* ================= VUE TABLE ================= */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto py-2">
          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Nom complet</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Téléphone</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Ville</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Cellule</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Sexe</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">WhatsApp</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembres.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.ville || "—"}</td>
                  <td className="px-4 py-2">{m.cellule_id ? cellules.find(c => c.id === m.cellule_id)?.cellule_full || "—" : "—"}</td>
                  <td className="px-4 py-2">{m.sexe || "—"}</td>
                  <td className="px-4 py-2">{m.is_whatsapp ? "Oui" : "Non"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(popupMember?.id === m.id ? null : { ...m })}
                      className="text-orange-500 underline text-sm"
                    >
                      {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                    </button>
                    <button
                      onClick={() => setEditMember(m)}
                      className="text-blue-600 underline text-sm ml-2"
                    >
                      ✏️ Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP DETAILS */}
      {detailsMember && (
        <MemberDetailsPopup
          member={detailsMember}
          onClose={() => setDetailsMember(null)}
          getCelluleNom={getCelluleNom}
        />
      )}

      {/* POPUP EDIT */}
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
