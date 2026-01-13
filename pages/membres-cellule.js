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
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {filteredMembres.map(m => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-2xl shadow-xl border-l-4 relative"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                {/* Prénom Nom */}
                <h2 className="text-center font-bold text-lg">{m.prenom} {m.nom}</h2>
      
                {/* Téléphone interactif */}
                <div className="text-center mt-1 relative">
                  <button
                    onClick={() =>
                      setSelectedMembre(selectedMembre === m.id ? null : m.id)
                    }
                    className="text-orange-500 underline font-semibold"
                  >
                    {m.telephone || "—"}
                  </button>
      
                  {selectedMembre === m.id && m.telephone && (
                    <div
                      className="absolute z-50 mt-2 bg-white shadow-lg rounded-lg border w-52 left-1/2 -translate-x-1/2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={`tel:${m.telephone}`} className="block px-4 py-2 text-sm hover:bg-gray-100">📞 Appeler</a>
                      <a href={`sms:${m.telephone}`} className="block px-4 py-2 text-sm hover:bg-gray-100">✉️ SMS</a>
                      <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}?call`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-100">📱 Appel WhatsApp</a>
                      <a href={`https://wa.me/${m.telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-100">💬 Message WhatsApp</a>
                    </div>
                  )}
                </div>
      
                {/* Infos principales alignées à gauche */}
                <div className="mt-2 text-sm text-black space-y-1 text-left">
                  <p>🏙️ Ville : {m.ville || "—"}</p>
                  <p>🏠 Cellule : {getCelluleNom(m.cellule_id)}</p>
                  <p>👤 Conseiller : {m.conseiller || "—"}</p>
                </div>
      
                {/* Bouton détails */}
                <button
                  onClick={() =>
                    setDetailsOpen(prev => ({ ...prev, [m.id]: !prev[m.id] }))
                  }
                  className="text-orange-500 underline mt-2 block mx-auto text-sm"
                >
                  {detailsOpen?.[m.id] ? "Fermer détails" : "Détails"}
                </button>
      
                {/* Infos étendues */}
                {detailsOpen?.[m.id] && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-sm space-y-1 text-left">
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
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Ville</th>
                <th className="px-4 py-2">Cellule</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembres.map(m => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2">{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.ville || "—"}</td>
                  <td className="px-4 py-2">{getCelluleNom(m.cellule_id)}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => setDetailsMember(m)}
                      className="text-indigo-600 underline text-sm"
                    >
                      👁 Voir
                    </button>
                    <button
                      onClick={() => setEditMember(m)}
                      className="text-blue-600 underline text-sm"
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
