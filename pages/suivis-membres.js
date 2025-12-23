"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberPopup from "../components/EditMemberPopup";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import DetailsModal from "../components/DetailsModal";
import { useMembers } from "../context/MembersContext";

export default function SuivisMembres() {
  // ✅ Une seule déclaration du contexte
  const { members, setAllMembers, updateMember } = useMembers();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);
  const [detailsModalMember, setDetailsModalMember] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [showRefus, setShowRefus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(null);

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => (prev === id ? null : id));

  const statutIds = { envoye: 1, "en attente": 2, integrer: 3, refus: 4 };
  const statutLabels = { 1: "Envoyé", 2: "En attente", 3: "Intégrer", 4: "Refus" };

  // 🔹 Fetch et initialisation des suivis
  useEffect(() => {
    const fetchSuivis = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Utilisateur non connecté");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, nom, role")
          .eq("id", user.id)
          .single();
        if (profileError || !profileData) throw profileError;

        setPrenom(profileData.prenom || "cher membre");
        setRole(profileData.role);

        const tableName = "suivis_membres_view";
        let suivisData = [];

        if (["Administrateur", "ResponsableIntegration"].includes(profileData.role)) {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          suivisData = data;
        } else if (profileData.role === "Conseiller") {
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .eq("conseiller_id", profileData.id)
            .order("created_at", { ascending: false });
          if (error) throw error;
          suivisData = data;
        } else if (profileData.role === "ResponsableCellule") {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", profileData.id);
          if (cellulesError) throw cellulesError;

          const celluleIds = cellulesData?.map(c => c.id) || [];
          if (celluleIds.length > 0) {
            const { data, error } = await supabase
              .from(tableName)
              .select("*")
              .in("cellule_id", celluleIds)
              .order("created_at", { ascending: false });
            if (error) throw error;
            suivisData = data;
          }
        }

        const membresIds = suivisData.map(s => s.membre_id);
        const { data: membresData } = await supabase
          .from("membres")
          .select("id, sexe, venu, statut")
          .in("id", membresIds);

        const merged = suivisData.map(s => ({
          ...s,
          membre: membresData.find(m => m.id === s.membre_id) || {}
        }));

        // 🔹 Mise à jour du contexte pour chaque membre
        setAllMembers(merged);

        if (!merged || merged.length === 0) setMessage("Aucun membre à afficher.");
      } catch (err) {
        console.error("❌ Erreur:", err.message || err);
        setMessage("Erreur lors de la récupération des suivis.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuivis();
  }, [setAllMembers]);

  const handleStatusChange = (id, value) =>
    setStatusChanges(prev => ({ ...prev, [id]: parseInt(value, 10) }));
  const handleCommentChange = (id, value) =>
    setCommentChanges(prev => ({ ...prev, [id]: value }));

  const getBorderColor = (m) => {
    if (!m) return "#ccc";
    if (m.statut_suivis === statutIds["en attente"]) return "#FFA500";
    if (m.statut_suivis === statutIds["integrer"]) return "#34A853";
    if (m.statut_suivis === statutIds["refus"]) return "#FF4B5C";
    if (m.statut_suivis === statutIds["envoye"]) return "#3B82F6";
    return "#ccc";
  };

  const updateSuivi = async (id) => {
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];
    if (!newStatus && !newComment) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const payload = { updated_at: new Date() };
      if (newStatus) payload.statut_suivis = newStatus;
      if (newComment) payload.commentaire_suivis = newComment;

      const { data: updatedSuivi, error: updateError } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;

      // 🔹 Mise à jour du contexte pour ce suivi
      updateMember(updatedSuivi.membre_id, updatedSuivi);

      setMessage({ type: "success", text: "Mise à jour effectuée." });
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Erreur durant la mise à jour : ${err.message}` });
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredSuivis = members.filter(s => {
    if (s.statut_suivis === statutIds["integrer"]) return false;
    if (showRefus) return s.statut_suivis === statutIds["refus"];
    return s.statut_suivis === statutIds["envoye"] || s.statut_suivis === statutIds["en attente"];
  });

  const uniqueSuivis = Array.from(new Map(filteredSuivis.map(item => [item.id, item])).values());

  const handleAfterSend = (updatedMember) => {
    updateMember(updatedMember);
  };

  // 🔹 DetailsPopup reste inchangé
  const DetailsPopup = ({ m }) => {
    const [cellules, setCellules] = useState([]);
    const [conseillers, setConseillers] = useState([]);
    const [typeEnvoi, setTypeEnvoi] = useState("");
    const [cible, setCible] = useState(null);
    const commentRef = useRef(null);

    useEffect(() => {
      const loadData = async () => {
        try {
          const { data: cellulesData } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
          const { data: conseillersData } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
          setCellules(cellulesData || []);
          setConseillers(conseillersData || []);
        } catch (err) {
          console.error("Erreur chargement cellules/conseillers :", err);
        }
      };
      loadData();
    }, []);

    useEffect(() => {
      if (commentRef.current) {
        commentRef.current.focus();
        commentRef.current.selectionStart = commentRef.current.value.length;
      }
    }, [commentChanges[m.id]]);

    const handleSelectCible = (id) => {
      if (typeEnvoi === "cellule") setCible(cellules.find(c => c.id === id) || null);
      else if (typeEnvoi === "conseiller") setCible(conseillers.find(c => c.id === id) || null);
    };

    return (
      <div className="text-black text-sm space-y-2 w-full">
        <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
        <p>🏙 Ville : {m.ville || "—"}</p>
        <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
        <p>⚥ Sexe : {m.sexe || "—"}</p>
        <p>📋 Statut initial : {m.statut_initial ?? m.statut_membre ?? "—"}</p>
        <p>❓Besoin : {
          !m.besoin ? "—" :
          Array.isArray(m.besoin) ? m.besoin.join(", ") :
          (() => { try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; } })()
        }</p>
        <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

        <label className="text-black text-sm mt-4 block">📋 Statut Suivis :</label>
        <select value={statusChanges[m.id] ?? m.statut_suivis ?? ""} onChange={(e) => handleStatusChange(m.id, e.target.value)} className="w-full border rounded-md px-2 py-1">
          <option value="">-- Choisir un statut --</option>
          <option value={1}>🕓 En Cours</option>
          <option value={3}>✅ Intégrer</option>
          <option value={4}>❌ Refus</option>
        </select>

        <textarea ref={commentRef} value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""} onChange={(e) => handleCommentChange(m.id, e.target.value)} rows={2} className="w-full border rounded-md px-2 py-1 mt-2 resize-none" placeholder="Ajouter un commentaire..." />

        <button onClick={() => updateSuivi(m.id)} disabled={updating[m.id]} className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${updating[m.id] ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
          {updating[m.id] ? "Mise à jour..." : "Mettre à jour"}
        </button>

        <div className="mt-4 flex justify-center">
          <button onClick={() => setEditMember(m)} className="text-blue-600 text-sm mt-4">✏️ Modifier le contact</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* 🔹 Header */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black-200 transition-colors">← Retour</button>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom}</p>
        </div>
      </div>

      {/* 🔹 Logo */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      {/* 🔹 Titre */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📋 Suivis des Membres</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      {/* 🔹 Contrôles */}
      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline hover:text-black-200">{view === "card" ? "Vue Table" : "Vue Carte"}</button>
        <button onClick={() => setShowRefus(!showRefus)} className="text-orange-400 text-sm underline hover:text-orange-500">{showRefus ? "Voir tout les suivis" : "Voir les refus"}</button>
      </div>

      {/* 🔹 Message */}
      {message && <div className={`mb-4 px-4 py-2 rounded-md text-sm ${message.type === "error" ? "bg-red-200 text-red-800" : message.type === "success" ? "bg-green-200 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{message.text}</div>}

      {/* 🔹 Vue cartes */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {uniqueSuivis.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4" style={{ borderLeftColor: getBorderColor(item) }}>
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">{item.prenom} {item.nom}</h2>
                <p className="text-sm text-black-700 mb-1">📞 {item.telephone || "—"}</p>
                <p className="text-sm text-black-700 mb-1">📋 Statut Suivis : {statutLabels[item.statut_suivis] || "—"}</p>              
                <p className="text-sm text-black-700 mb-1">🏠 Cellule : {item.cellule_full || "—"}</p>
                {!item.cellule_full && (
                  <p className="text-sm text-black-700 mb-1">👤 Conseiller : {item.responsable || "—"}</p>
                )}

                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-orange-500 underline text-sm mt-1"
                >
                  {detailsOpen === item.id ? "Fermer détails" : "Détails"}
                </button>
              </div>

              <div className={`transition-all duration-500 overflow-hidden ${detailsOpen === item.id ? "max-h-[1000px] mt-3" : "max-h-0"}`}>
                {detailsOpen === item.id && <div className="pt-2"><DetailsPopup m={item} /></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Vue table */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto flex justify-center">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-black-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut Suivis</th>
                <th className="px-4 py-2">Attribué à</th>
                <th className="px-4 py-2 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {uniqueSuivis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-white text-center">Aucun membre en suivi</td>
                </tr>
              ) : (
                uniqueSuivis.map(m => (
                  <tr key={m.id} className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                    <td className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2" style={{ borderLeftColor: getBorderColor(m) }}>{m.prenom} {m.nom}</td>
                    <td className="px-4 py-2">{m.telephone || "—"}</td>
                    <td className="px-4 py-2">{statutLabels[m.statut_suivis] || "—"}</td>
                    <td className="px-4 py-2">{m.cellule_full || m.responsable || "—"}</td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <button onClick={() => setDetailsModalMember(m)} className="text-orange-500 underline text-sm">Détails</button>
                      <button onClick={() => setEditMember(m)} className="text-blue-600 underline text-sm">Modifier</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Modals */}
      {detailsModalMember && (
        <DetailsModal
          m={detailsModalMember}
          onClose={() => setDetailsModalMember(null)}
          handleStatusChange={handleStatusChange}
          handleCommentChange={handleCommentChange}
          statusChanges={statusChanges}
          commentChanges={commentChanges}
          updating={updating}
          updateSuivi={updateSuivi}
        />
      )}
      
      {editMember && (
        <EditMemberPopup
          member={editMember}
          cellules={[]}
          conseillers={[]}
          onClose={() => setEditMember(null)}
          onUpdateMember={updateMember} // 🔹 mise à jour contexte
        />
      )}
    </div>
  );
}
