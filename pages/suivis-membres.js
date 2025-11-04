// pages/suivis-membres.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import AccessGuard from "../components/AccessGuard";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

      if (!userEmail) throw new Error("Utilisateur non connecté");

      // 🔹 Récupérer l'ID du profil connecté
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (profileError) throw profileError;
      const responsableId = profileData.id;

      // On sélectionne la table suivis_membres et on récupère aussi la cellule liée
      let query = supabase
        .from("suivis_membres")
        .select("*, cellules (id, cellule)")
        .order("created_at", { ascending: false });

      // 🔹 Si ResponsableCellule → filtrer uniquement ses cellules
      if (userRole.includes("ResponsableCellule")) {
        const { data: cellulesData, error: cellulesError } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", responsableId);

        if (cellulesError) throw cellulesError;

        const celluleIds = cellulesData.map((c) => c.id);
        query = query.in("cellule_id", celluleIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Normalisation
      const normalized = (data || []).map((item) => ({
        ...item,
        cellule_id: item.cellules?.id ?? item.cellule_id ?? null,
        cellule_nom: item.cellules?.cellule ?? item.cellule_nom ?? null,
      }));

      setSuivis(normalized);
    } catch (err) {
      console.error("Erreur fetchSuivis:", err);
      setMessage("Erreur lors de la récupération des membres.");
      setSuivis([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((prev) => ({ ...prev, [id]: value }));

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const getBorderColor = (m) => {
    if (m.statut_suivis === "integrer") return "#4285F4";
    if (m.statut_suivis === "en cours" || m.statut_suivis === "en attente") return "#FFA500";
    if (m.statut_suivis === "refus") return "#EA5454";
    if (m.statut_suivis === "suivi terminé" || m.statut_suivis === "termine") return "#34A853";
    return "#ccc";
  };

  // ✅ Modification : mise à jour cellule_id au lieu d'insertion
  const updateSuivi = async (id) => {
    setMessage(null);
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];

    const currentData = suivis.find((s) => s.id === id);
    if (!currentData) return;

    if (!newStatus && !newComment) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      if (newStatus === "integrer") {
        console.log("➡️ Mise à jour du membre existant pour suivi id:", id);

        // ✅ Chercher membre existant
        const { data: membreData, error: membreError } = await supabase
          .from("membres")
          .select("id")
          .or(`telephone.eq.${currentData.telephone},email.eq.${currentData.email}`)
          .single();

        if (membreError || !membreData) {
          throw new Error("Membre non trouvé dans la table 'membres'.");
        }

        // ✅ Mise à jour du cellule_id et autres champs
        const { error: updateError } = await supabase
          .from("membres")
          .update({
            cellule_id: currentData.cellule_id ?? null,
            statut: "integrer",
            venu: "Oui",
            besoin: currentData.besoin,
            ville: currentData.ville,
            formation: currentData.formation,
            comment:
              newComment ||
              currentData.commentaire_suivis ||
              currentData.infos_supplementaires,
            responsable_suivi: currentData.responsable_cellule ?? null,
            infos_supplementaires: currentData.infos_supplementaires ?? null,
          })
          .eq("id", membreData.id);

        if (updateError) throw updateError;

        // ✅ Supprimer le suivi une fois intégré
        const { error: deleteError } = await supabase
          .from("suivis_membres")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        setSuivis((prev) => prev.filter((s) => s.id !== id));
        setMessage({
          type: "success",
          text: "🎉 Membre intégré : cellule mise à jour avec succès !",
        });
      } else {
        // 🔸 Mise à jour normale
        const payload = {};
        if (newStatus) payload.statut_suivis = newStatus;
        if (newComment) payload.commentaire_suivis = newComment;
        payload.updated_at = new Date();

        const { data: updated, error: updateError } = await supabase
          .from("suivis_membres")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;

        setSuivis((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setMessage({ type: "success", text: "✅ Suivi mis à jour." });
      }
    } catch (err) {
      console.error("Erreur :", err);
      setMessage({ type: "error", text: `Erreur : ${err.message || err}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 🔸 UI inchangé
  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Liste des membres suivis
      </h1>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm ${
            message.type === "error"
              ? "bg-red-200 text-red-800"
              : message.type === "success"
              ? "bg-green-200 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="text-white">Chargement...</p>
      ) : suivis.length === 0 ? (
        <p className="text-white text-lg italic">Aucun membre en suivi pour le moment.</p>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((item) => {
            const isOpen = detailsOpen[item.id];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg flex flex-col w-full transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                <div
                  className="w-full h-[6px] rounded-t-2xl"
                  style={{ backgroundColor: getBorderColor(item) }}
                />
                <div className="p-4 flex flex-col items-center">
                  <h2 className="font-bold text-black text-base text-center mb-1">
                    {item.prenom} {item.nom}
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">
                    📞 {item.telephone || "—"}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    🏠 Cellule : {item.cellule_nom || "—"}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    🕊 Statut : {item.statut || "—"}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    📋 Statut Suivis : {item.statut_suivis || "—"}
                  </p>
                  <button
                    onClick={() => toggleDetails(item.id)}
                    className="text-orange-500 underline text-sm mt-1"
                  >
                    {isOpen ? "Fermer détails" : "Détails"}
                  </button>

                  {isOpen && (
                    <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                      <p>📌 Prénom Nom : {item.prenom} {item.nom}</p>
                      <p>📞 Téléphone : {item.telephone || "—"}</p>
                      <p>💬 WhatsApp : {item.is_whatsapp ? "Oui" : "—"}</p>
                      <p>🏙 Ville : {item.ville || "—"}</p>
                      <p>🕊 Statut : {item.statut || "—"}</p>
                      <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                      <p>
                        ❓Besoin :{" "}
                        {(() => {
                          if (!item.besoin) return "—";
                          if (Array.isArray(item.besoin)) return item.besoin.join(", ");
                          try {
                            const arr = JSON.parse(item.besoin);
                            return Array.isArray(arr) ? arr.join(", ") : item.besoin;
                          } catch {
                            return item.besoin;
                          }
                        })()}
                      </p>
                      <p>📝 Infos : {item.infos_supplementaires || "—"}</p>

                      <div>
                        <label className="text-black text-sm">
                          📋 Statut Suivis :
                        </label>
                        <select
                          value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                        >
                          <option value="">-- Choisir un statut --</option>
                          <option value="integrer">✅ Intégrer</option>
                          <option value="en cours">🕓 En Cours</option>
                          <option value="refus">❌ Refus</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-black text-sm">
                          📝 Commentaire Suivis :
                        </label>
                        <textarea
                          value={commentChanges[item.id] ?? item.commentaire_suivis ?? ""}
                          onChange={(e) =>
                            handleCommentChange(item.id, e.target.value)
                          }
                          rows={2}
                          className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1 resize-none"
                          placeholder="Ajouter un commentaire..."
                        />
                      </div>

                      <button
                        onClick={() => updateSuivi(item.id)}
                        disabled={updating[item.id]}
                        className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
                          updating[item.id]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {updating[item.id]
                          ? "Mise à jour..."
                          : "Mettre à jour"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          {/* Vue Table inchangée */}
          ...
        </div>
      )}
    </div>
  );
}
