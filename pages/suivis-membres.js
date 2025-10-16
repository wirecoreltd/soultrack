"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [message, setMessage] = useState(null); // succès / erreur visible à l'écran

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from("suivis_membres")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement suivis :", error);
        setMessage({ type: "error", text: `Erreur chargement : ${error.message}` });
        setSuivis([]);
      } else {
        setSuivis(data || []);
      }
    } catch (err) {
      console.error("Exception fetchSuivis:", err);
      setMessage({ type: "error", text: `Exception fetch: ${err.message}` });
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

  // Version robuste et verbeuse de updateSuivi
  const updateSuivi = async (id) => {
    setMessage(null);
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];

    if (!newStatus && !newComment) {
      setMessage({ type: "info", text: "Aucun changement détecté." });
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      // 1) Récupérer la ligne actuelle (single pour s'assurer de l'existence)
      const { data: currentData, error: fetchError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Erreur récupération (fetch current) :", fetchError);
        setMessage({ type: "error", text: `Impossible de récupérer l'entrée : ${fetchError.message}` });
        setUpdating((prev) => ({ ...prev, [id]: false }));
        return;
      }

      // 2) Déterminer le nom exact de la colonne de statut à utiliser.
      //    - Si ta table a 'statut_suivis' -> utilise cet attribut
      //    - si c'est 'statut' -> adapte. Ici on va tenter les deux (priorité à statut_suivis).
      const payload = {};
      if (newStatus !== undefined && newStatus !== null) {
        payload["statut_suivis"] = newStatus;
      }
      if (newComment !== undefined && newComment !== null) {
        // ta table semble avoir 'commentaire' comme champ; on envoie dans 'commentaire' si existant,
        // sinon on envoie dans 'comment' (au cas où la table a un autre nom).
        payload["commentaire"] = newComment;
      }
      payload["updated_at"] = new Date();

      // 3) Tenter l'update et récupérer la ligne modifiée en retour
      const { data: updatedData, error: updateError } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        // Cas fréquent : colonne inexistante (erreur de colonne), RLS, manque de permission, etc.
        console.error("Erreur update :", updateError);
        setMessage({ type: "error", text: `Erreur mise à jour : ${updateError.message}` });

        // Tentative fallback : si l'erreur mentionne une colonne inconnue, essaie avec d'autres noms
        if (updateError.message && updateError.message.toLowerCase().includes("column")) {
          console.warn("Tentative fallback avec noms alternatifs de colonnes...");
          // fallback 1 : utiliser 'statut' au lieu de 'statut_suivis' si présent
          const payloadFallback = {};
          if (newStatus) payloadFallback["statut"] = newStatus;
          if (newComment) payloadFallback["commentaire"] = newComment;
          payloadFallback["updated_at"] = new Date();

          const { data: upd2, error: upd2Err } = await supabase
            .from("suivis_membres")
            .update(payloadFallback)
            .eq("id", id)
            .select()
            .single();

          if (upd2Err) {
            console.error("Fallback update échoué :", upd2Err);
            setMessage({ type: "error", text: `Fallback échoué : ${upd2Err.message}` });
            setUpdating((prev) => ({ ...prev, [id]: false }));
            return;
          } else {
            // Succès fallback
            // mettre à jour local state
            setSuivis((prev) => prev.map((it) => (it.id === id ? upd2 : it)));
            setMessage({ type: "success", text: "Mise à jour réussie (fallback)." });
            setUpdating((prev) => ({ ...prev, [id]: false }));
            return;
          }
        }

        setUpdating((prev) => ({ ...prev, [id]: false }));
        return;
      }

      // 4) Succès : mettre à jour le state avec la ligne renvoyée.
      if (updatedData) {
        setSuivis((prev) => prev.map((it) => (it.id === id ? updatedData : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
      } else {
        // Si aucun data renvoyé, on force un refresh complet
        await fetchSuivis();
        setMessage({ type: "success", text: "Mise à jour effectuée (rafraîchissement)." });
      }
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Exception durant la mise à jour : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-emerald-700 to-teal-500">
      {/* Retour */}
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      {/* Logo */}
      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Suivis des Membres
      </h1>

      <p className="text-center text-white text-lg mb-6 font-handwriting-light">
        Liste des membres envoyés pour suivi 💬
      </p>

      {/* Message visible */}
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
        <p className="text-white text-lg italic">
          Aucun membre en suivi pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {suivis.map((item) => {
            const isOpen = detailsOpen[item.id];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 hover:shadow-2xl"
              >
                <h2 className="font-bold text-gray-800 text-base text-center mb-1">
                  👤 {item.prenom} {item.nom}
                </h2>
                <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">
                  🕊 : {item.cellule_nom || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  👑 Responsable : {item.responsable || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  📅 Créé le :{" "}
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>

                {/* Bouton voir détails */}
                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-blue-500 underline text-sm mt-1"
                >
                  {isOpen ? "Fermer" : "Voir détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-600 text-sm text-center mt-2 space-y-2 w-full">
                    <p>🙏 Besoin : {item.besoin || "—"}</p>
                    <p>🧩 Comment venu : {item.venu || "—"}</p>
                    <p>📝 Infos : {item.infos_supplementaires || "—"}</p>

                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">💬 Commentaire :</label>
                      <textarea
                        value={commentChanges[item.id] ?? item.commentaire ?? ""}
                        onChange={(e) =>
                          handleCommentChange(item.id, e.target.value)
                        }
                        rows={2}
                        className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                        placeholder="Ajouter un commentaire..."
                      ></textarea>
                    </div>

                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">📋 Statut suivi :</label>
                      <select
                        value={statusChanges[item.id] ?? item.statut_suivis ?? item.statut ?? ""}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value)
                        }
                        className="w-full border rounded-md px-2 py-1 text-sm mt-1"
                      >
                        <option value="">-- Choisir un statut --</option>
                        <option value="actif">✅ Actif</option>
                        <option value="en attente">🕓 En attente</option>
                        <option value="suivi terminé">🏁 Terminé</option>
                        <option value="inactif">❌ Inactif</option>
                      </select>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
