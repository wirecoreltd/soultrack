import { useState, useEffect } from "react";
import Image from "next/image";
import DetailsPopup from "../components/DetailsPopup";
import DetailsModal from "../components/DetailsModal";
import EditMemberPopup from "../components/EditMemberPopup";
import LogoutLink from "../components/LogoutLink";

export default function SuivisMembres({ members, prenom, statutLabels, statutIds, updateMember, updateSuivi }) {
  const [view, setView] = useState("card");
  const [showRefus, setShowRefus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [detailsModalMember, setDetailsModalMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [message, setMessage] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState(false);

  const toggleDetails = (id) => {
    setDetailsOpen(detailsOpen === id ? null : id);
  };

  const filteredSuivis = members.filter(s => {
    if (s.statut_suivis === statutIds["integrer"]) return false;
    if (showRefus) return s.statut_suivis === statutIds["refus"];
    return s.statut_suivis === statutIds["envoye"] || s.statut_suivis === statutIds["en attente"];
  });

  const uniqueSuivis = filteredSuivis; // si tu faisais déjà un unique, adapte ici

  const getBorderColor = (item) => {
    switch(item.statut_suivis) {
      case statutIds["envoye"]: return "#facc15"; // jaune
      case statutIds["en attente"]: return "#3b82f6"; // bleu
      case statutIds["refus"]: return "#ef4444"; // rouge
      default: return "#6b7280"; // gris
    }
  };

  const handleStatusChange = (id, status) => {
    setStatusChanges(prev => ({ ...prev, [id]: status }));
  };

  const handleCommentChange = (id, comment) => {
    setCommentChanges(prev => ({ ...prev, [id]: comment }));
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
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="flex items-center text-white hover:text-black-200 transition-colors">← Retour</button>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {prenom}</p>
        </div>
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📋 Suivis des Membres</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline hover:text-black-200">{view === "card" ? "Vue Table" : "Vue Carte"}</button>
        <button onClick={() => setShowRefus(!showRefus)} className="text-orange-400 text-sm underline hover:text-orange-500">{showRefus ? "Voir tout les suivis" : "Voir les refus"}</button>
      </div>

      {message && <div className={`mb-4 px-4 py-2 rounded-md text-sm ${message.type === "error" ? "bg-red-200 text-red-800" : message.type === "success" ? "bg-green-200 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{message.text}</div>}
      
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
                   <td className="px-4 py-2"> {m.cellule_full || m.responsable || "—"}</td>
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
          onUpdateMember={updateMember} // 🔹 ici on passe updateMember du contexte
        />
      )}
    </div>
  );
}
