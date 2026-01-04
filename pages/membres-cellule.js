// pages/membres-cellule.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditMemberPopup from "../components/EditMemberPopup";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [view, setView] = useState("card");
  const [editMember, setEditMember] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [filterCellule, setFilterCellule] = useState("");

  // -------------------- FETCH MEMBRES --------------------
  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("Utilisateur non connecté");

        // Profil de l'utilisateur connecté
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom, role")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        setPrenom(profileData?.prenom || "");

        let query = supabase
          .from("v_membres_full")
          .select("*")
          .not("cellule_id", "is", null) // Seulement membres assignés à une cellule
          .order("created_at", { ascending: false });

        // Filtrage selon rôle
        if (profileData.role === "Conseiller") {
          query = query.eq("conseiller_id", profileData.id);
        } else if (profileData.role === "ResponsableCellule") {
          query = query.or(`responsable_id.eq.${profileData.id},suivi_responsable_id.eq.${profileData.id}`);
        }

        const { data, error } = await query;
        if (error) throw error;

        setMembres(data || []);
        if (!data || data.length === 0) setMessage("Aucun membre assigné à vos cellules.");
      } catch (err) {
        console.error("Erreur fetchMembres:", err.message || err);
        setMessage("Erreur lors de la récupération des membres.");
        setMembres([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCellules = async () => {
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule_full");
      if (error) console.error("Erreur fetchCellules:", error);
      if (data) setCellules(data);
    };

    fetchCellules();
    fetchMembres();
  }, []);

  // -------------------- HELPERS --------------------
  const getCellule = (m) => m.cellule_full || "—";

  const getBorderColor = (m) => {
    if (m.statut === "actif") return "#34A853";
    if (m.statut === "inactif") return "#FFA500";
    return "#ccc";
  };

  const handleUpdateMember = (updated) => {
    setMembres(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
  };

  const filteredMembres = filterCellule
    ? membres.filter(m => m.cellule_id === filterCellule)
    : membres;

  if (loading) return <p className="text-center mt-10 text-white">Chargement...</p>;
  if (message) return <p className="text-center mt-10 text-white">{message}</p>;

  // -------------------- RENDER --------------------
  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="text-white hover:text-gray-200 transition"
        >
          ← Retour
        </button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <Image src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" width={80} height={80} />

      <h1 className="text-3xl font-bold text-white mb-4">👥 Membres de ma/mes cellule(s)</h1>

      {/* Filtre par cellule */}
      <div className="mb-4 w-full max-w-6xl">
        <select
          value={filterCellule}
          onChange={(e) => setFilterCellule(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded"
        >
          <option value="">Toutes les cellules</option>
          {cellules.map(c => (
            <option key={c.id} value={c.id}>{c.cellule_full}</option>
          ))}
        </select>
      </div>

      {/* Toggle Carte/Table */}
      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* Vue Carte */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {filteredMembres.map(m => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-xl shadow-md border-l-4 w-full transition hover:shadow-lg"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {m.prenom} {m.nom}
                </h2>
                <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">📌 Cellule : {getCellule(m)}</p>

                {/* Bouton détails */}
                <button
                  onClick={() => setSelectedMembre(selectedMembre === m.id ? null : m.id)}
                  className="text-orange-500 text-sm mt-1"
                >
                  {selectedMembre === m.id ? "Fermer détails" : "Détails"}
                </button>

                {/* Détails de la carte */}
                {selectedMembre === m.id && (
                  <div className="mt-3 w-full bg-gray-50 p-4 rounded-lg text-left">
                    <div className="text-black text-sm mt-2 w-full space-y-1">
                      <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                      <p>⚥ Sexe : {m.sexe || "—"}</p>
                      <p>❓ Besoin : {Array.isArray(m.besoin) ? m.besoin.join(", ") : m.besoin || "—"}</p>
                      <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                      <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                      <p>🧩 Raison de la venue : {m.statut_initial || "—"}</p>
                      <p>📝 Commentaire Suivis : {m.commentaire_suivis || "—"}</p>
                      <button
                        onClick={() => setEditMember(m)}
                        className="text-blue-600 text-sm mt-2 w-full"
                      >
                        ✏️ Modifier le contact
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vue Table
        <div className="w-full max-w-6xl overflow-x-auto flex justify-center">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Ville</th>
                <th className="px-4 py-2">Cellule</th>
                <th className="px-4 py-2 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembres.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-white text-center">Aucun membre</td>
                </tr>
              ) : filteredMembres.map(m => (
                <tr key={m.id} className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: getBorderColor(m) }}>{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.ville || "—"}</td>
                  <td className="px-4 py-2">{getCellule(m)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedMembre(m)}
                        className="text-orange-500 underline text-sm"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => setEditMember(m)}
                        className="text-blue-600 underline text-sm"
                      >
                        Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
