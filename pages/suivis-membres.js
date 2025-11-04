// pages/suivis-membres.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");
  const [message, setMessage] = useState(null);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Utilisateur";
    const prenom = name.split(" ")[0];
    setUserName(prenom);
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

      if (!userEmail) throw new Error("Utilisateur non connecté");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (profileError) throw profileError;
      const responsableId = profileData.id;

      let query = supabase.from("suivis_membres").select("*").order("created_at", { ascending: false });

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

      setSuivis(data || []);
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
    if (m.statut_suivis === "en cours") return "#FFA500";
    if (m.statut_suivis === "refus") return "#34A853";    
    return "#ccc";
  };

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
      if (["integrer", "Venu à l’église"].includes(newStatus)) {
        console.log("➡️ Transfert vers membres avec cellule_id :", currentData.cellule_id);

        // Vérifier si membre existe déjà
        const { data: existing, error: checkError } = await supabase
          .from("membres")
          .select("*")
          .eq("email", currentData.email)
          .single();

        if (checkError && checkError.code !== "PGRST116") throw checkError;

        if (existing) {
          // Mettre à jour cellule_id uniquement
          const { error: updateError } = await supabase
            .from("membres")
            .update({ cellule_id: currentData.cellule_id })
            .eq("email", currentData.email);

          if (updateError) throw updateError;
        } else {
          // Insertion si n'existe pas
          const { error: insertError } = await supabase.from("membres").insert([
            {
              nom: currentData.nom,
              prenom: currentData.prenom,
              telephone: currentData.telephone,
              email: currentData.email,
              statut: "integrer",
              venu: "Oui",
              besoin: currentData.besoin,
              ville: currentData.ville,
              formation: currentData.formation,
              comment: newComment || currentData.commentaire_suivis || currentData.infos_supplementaires,
              cellule_id: currentData.cellule_id ?? null,
              responsable_suivi: currentData.responsable_cellule ?? null,
              infos_supplementaires: currentData.infos_supplementaires ?? null,
            },
          ]);
          if (insertError) throw insertError;
        }

        // Supprimer le suivi
        const { error: deleteError } = await supabase
          .from("suivis_membres")
          .delete()
          .eq("id", id);
        if (deleteError) throw deleteError;

        setSuivis((prev) => prev.filter((s) => s.id !== id));
        setMessage({ type: "success", text: "🎉 Membre intégré avec succès dans sa cellule !" });
      } else {
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
      console.error("Error :", err);
      setMessage({ type: "error", text: `Erreur : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 text-center"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Top bar */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>
          <LogoutLink />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18 mx-auto" />
      </div>

      {/* Message */}
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
                  <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">🏠 Cellule : {item.cellule_nom || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">🕊 Statut : {item.statut || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">📋 Statut Suivis : {item.statut_suivis || "—"}</p>
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
                      <p>❓Besoin : {
                        (() => {
                          if (!item.besoin) return "—";
                          if (Array.isArray(item.besoin)) return item.besoin.join(", ");
                          try { const arr = JSON.parse(item.besoin); return Array.isArray(arr) ? arr.join(", ") : item.besoin; } 
                          catch { return item.besoin; }
                        })()
                      }</p>
                      <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                      <div>
                        <label className="text-black text-sm">📋 Statut Suivis :</label>
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
                        <label className="text-black text-sm">📝 Commentaire Suivis :</label>
                        <textarea
                          value={commentChanges[item.id] ?? item.commentaire_suivis ?? ""}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
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
                        {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
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
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-tr-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((item) => (
                <tr key={item.id} className="hover:bg-white/10 transition duration-150 border-b border-blue-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: getBorderColor(item) }}>
                    {item.prenom} {item.nom}
                  </td>
                  <td className="px-4 py-2">{item.telephone}</td>
                  <td className="px-4 py-2">{item.statut || "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsOpen[item.id] ? "Fermer détails" : "Détails"}
                    </button>

                    {detailsOpen[item.id] && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                          <button
                            onClick={() => toggleDetails(item.id)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                          >
                            ✕
                          </button>
                          <div className="text-gray-700 text-sm space-y-2 w-full">
                            <p>📌 Prénom Nom : {item.prenom} {item.nom}</p>
                            <p>📞 Téléphone : {item.telephone || "—"}</p>
                            <p>💬 WhatsApp : {item.is_whatsapp ? "Oui" : "—"}</p>
                            <p>🏙 Ville : {item.ville || "—"}</p>
                            <p>🏠 Cellule : {item.cellule_nom || "—"}</p>
                            <p>🕊 Statut : {item.statut || "—"}</p>
                            <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                            <p>❓Besoin : {
                              (() => {
                                if (!item.besoin) return "—";
                                if (Array.isArray(item.besoin)) return item.besoin.join(", ");
                                try { const arr = JSON.parse(item.besoin); return Array.isArray(arr) ? arr.join(", ") : item.besoin; } 
                                catch { return item.besoin; }
                              })()
                            }</p>
                            <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                            <div>
                              <label className="text-black text-sm">📋 Statut Suivis :</label>
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
                              <label className="text-black text-sm">📝 Commentaire Suivis :</label>
                              <textarea
                                value={commentChanges[item.id] ?? item.commentaire_suivis ?? ""}
                                onChange={(e) => handleCommentChange(item.id, e.target.value)}
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
                              {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
