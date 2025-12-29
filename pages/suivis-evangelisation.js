"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SuiviDetailsEvanPopup from "../components/SuiviDetailsEvanPopup";
import EditEvangelisePopup from "../components/EditEvangelisePopup";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [view, setView] = useState("card");
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [detailsSuivi, setDetailsSuivi] = useState(null); // id (card) ou objet (table)
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");
      if (!userEmail) throw new Error("Utilisateur non connecté");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, prenom, role")
        .eq("email", userEmail)
        .single();

      setPrenom(profileData?.prenom || "cher membre");

      let query = supabase
        .from("suivis_des_evangelises")
        .select(`*, cellules:cellule_id (id, cellule, responsable)`)
        .order("date_suivi", { ascending: false });

      const { data } = await query;
      setSuivis(data || []);
      if (!data || data.length === 0) setMessage("Aucun évangélisé à afficher.");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la récupération des suivis.");
    } finally {
      setLoading(false);
    }
  };

  const getBorderColor = (m) => {
    if (m.status_suivis_evangelises === "En cours") return "#FFA500";
    if (m.status_suivis_evangelises === "Integrer") return "#34A853";
    if (m.status_suivis_evangelises === "Venu à l’église") return "#3B82F6";
    return "#ccc";
  };

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const updateSuivi = async (id) => {
    const newComment = commentChanges[id];
    if (!newComment) return;

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const { data } = await supabase
        .from("suivis_des_evangelises")
        .update({ commentaire_evangelises: newComment })
        .eq("id", id)
        .select()
        .single();

      setSuivis((prev) => prev.map((s) => (s.id === id ? data : s)));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={80} height={80} />
      <h1 className="text-3xl font-bold text-white mb-6">
        📋 Suivis des Évangélisés
      </h1>

      {/* Toggle */}
      <button
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="text-white underline mb-4"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </button>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-lg p-4 border-l-4 transition-all"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              <h2 className="font-bold text-center">
                {m.prenom} {m.nom}
              </h2>
              <p className="text-sm text-center">📱 {m.telephone || "—"}</p>    
              <p className="text-sm text-center">🏠 Cellule : {m.cellules?.cellule || "—"}</p>
              <p className="text-sm text-center">👤 Conseiller : {m.responsable_cellule || "—"}</p>            

              <button
                onClick={() =>
                  setDetailsSuivi(detailsSuivi === m.id ? null : m.id)
                }
                className="text-orange-500 underline text-sm block mx-auto mt-2"
              >
                {detailsSuivi === m.id ? "Fermer détails" : "Détails"}
              </button>

              {/* CARRÉ GRANDISSANT */}
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  detailsSuivi === m.id ? "max-h-[1000px] mt-3" : "max-h-0"
                }`}
              >
                {detailsSuivi === m.id && (
                  <div className="text-sm space-y-2">                    
                    <p>🏙️ Ville : {m.ville || "—"}</p>
                    <p>💬 WhatsApp : {m.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>⚥ Sexe : {m.sexe || "—"}</p>
                    <p>🙏 Prière du salut : {m.priere_salut ? "Oui" : "Non"}</p>
                    <p>☀️ Type : {m.type_conversion || "—"}</p>
                    <p>❓ Besoin : {formatBesoin(m.besoin)}</p>
                    <p>📝 Infos supplémentaires : {m.infos_supplementaires || "—"}</p>

                    <textarea
                      rows={2}
                      className="w-full border rounded px-2 py-1 mt-2"
                      placeholder="Ajouter un commentaire..."
                      value={commentChanges[m.id] ?? m.commentaire_evangelises ?? ""}
                      onChange={(e) =>
                        handleCommentChange(m.id, e.target.value)
                      }
                    />

                    <button
                      onClick={() => updateSuivi(m.id)}
                      className="w-full bg-green-600 text-white rounded py-1 mt-2"
                    >
                      Mettre à jour
                    </button>

                    <button
                      onClick={() => setEditingContact(m)}
                      className="text-blue-600 text-sm text-center mt-3 w-full"
                    >
                      ✏️ Modifier le contact
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VUE TABLE */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="w-full text-sm bg-white rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">Téléphone</th>
                <th className="px-3 py-2">Cellule</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="px-3 py-2">{m.prenom} {m.nom}</td>
                  <td className="px-3 py-2">{m.telephone || "—"}</td>
                  <td className="px-3 py-2">{m.cellules?.cellule || "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setDetailsSuivi(m)}
                      className="text-orange-500 underline"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP DÉTAILS (VUE TABLE) */}
      {detailsSuivi && typeof detailsSuivi === "object" && (
        <SuiviDetailsEvanPopup
          member={detailsSuivi}
          onClose={() => setDetailsSuivi(null)}
          onEdit={(m) => {
            setDetailsSuivi(null);
            setEditingContact(m);
          }}
        />
      )}

      {/* POPUP MODIFIER */}
      {editingContact && (
        <EditEvangelisePopup
          member={editingContact}
          onClose={() => setEditingContact(null)}
          onUpdateMember={() => {
            setEditingContact(null);
            fetchSuivis();
          }}
        />
      )}
    </div>
  );
}
