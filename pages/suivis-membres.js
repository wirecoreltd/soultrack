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
  const [message, setMessage] = useState(null);
  const [view, setView] = useState("table");

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
        console.error("Erreur chargement :", error);
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
      const { data: currentData, error: fetchError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Erreur récupération :", fetchError);
        setMessage({ type: "error", text: `Impossible de récupérer l'entrée : ${fetchError.message}` });
        setUpdating((prev) => ({ ...prev, [id]: false }));
        return;
      }

      const payload = {};
      if (newStatus !== undefined && newStatus !== null) payload["statut_suivis"] = newStatus;
      if (newComment !== undefined && newComment !== null) payload["commentaire_suivis"] = newComment;
      payload["updated_at"] = new Date();

      const { data: updatedData, error: updateError } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Erreur update :", updateError);
        setMessage({ type: "error", text: `Erreur mise à jour : ${updateError.message}` });
        setUpdating((prev) => ({ ...prev, [id]: false }));
        return;
      }

      if (updatedData) {
        setSuivis((prev) => prev.map((it) => (it.id === id ? updatedData : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
      } else {
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

  const getBorderColor = (item) => {
    switch (item.statut_suivis) {
      case "actif": return "#34a853";
      case "en attente": return "#fbbc05";
      case "suivi terminé": return "#4285F4";
      case "inactif": return "#ea4335";
      default: return "#cccccc";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-blue-700 to-teal-500">
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      <h1 className="text-4xl font-handwriting text-white text-center mb-2">
        Liste des membres envoyés pour suivi 💬
      </h1>

      <div className="w-full max-w-6xl flex justify-end mb-4">
        <button
          onClick={() => setView(view === "table" ? "card" : "table")}
          className="bg-white text-gray-800 px-4 py-1 rounded-md shadow hover:bg-gray-100 transition"
        >
          {view === "table" ? "Vue Carte" : "Vue Table"}
        </button>
      </div>

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
          {suivis.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl shadow-md flex flex-col w-full transition-all duration-200 hover:shadow-xl">
              {/* Bande colorée intégrée en haut de la carte */}
              <div className="rounded-t-3xl w-full" style={{ backgroundColor: getBorderColor(item), height: "6px" }} />

              <div className="p-6 flex flex-col items-center divide-y divide-gray-200">
                <h2 className="font-bold text-black text-base text-center mb-2">
                  {item.prenom} {item.nom}
                </h2>
                <p className="text-sm text-gray-700 mb-1">📞 {item.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">🕊 Statut : {item.statut || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">📋 Statut Suivis : {item.statut_suivis || "—"}</p>

                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-orange-500 underline text-sm mt-2"
                >
                  {detailsOpen[item.id] ? "Fermer détails" : "Détails"}
                </button>

                {detailsOpen[item.id] && (
                  <div className="text-gray-700 text-sm mt-2 space-y-2 w-full pt-2">
                    <p>📌 Prénom Nom : {item.prenom} {item.nom}</p>
                    <p>📞 Téléphone : {item.telephone || "—"}</p>
                    <p>💬 WhatsApp : {item.whatsapp || "—"}</p>
                    <p>🏙 Ville : {item.ville || "—"}</p>
                    <p>🕊 Statut : {item.statut || "—"}</p>
                    <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                    <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                    <div>
                      <label className="text-black text-sm">BESOIN :</label>
                      <select value={item.besoin || ""} className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1">
                        <option value="">-- Sélectionner --</option>
                        <option value="Finances">Finances</option>
                        <option value="Santé">Santé</option>
                        <option value="Travail">Travail</option>
                        <option value="Les Enfants">Les Enfants</option>
                        <option value="La Famille">La Famille</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-black text-sm">📋 Statut Suivis :</label>
                      <select
                        value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                      >
                        <option value="">-- Choisir un statut --</option>
                        <option value="actif">✅ Actif</option>
                        <option value="en attente">🕓 En attente</option>
                        <option value="suivi terminé">🏁 Terminé</option>
                        <option value="inactif">❌ Inactif</option>
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
                        updating[item.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto w-full max-w-6xl bg-white rounded-2xl shadow p-4">
          <table className="w-full table-auto text-left divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2">{item.prenom} {item.nom}</td>
                  <td className="px-4 py-2">{item.telephone || "—"}</td>
                  <td className="px-4 py-2">{item.statut || "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="text-orange-500 underline text-sm"
                    >
                      {detailsOpen[item.id] ? "Fermer détails" : "Détails"}
                    </button>
                    {detailsOpen[item.id] && (
                      <div className="mt-2 p-2 border rounded-md bg-gray-50 space-y-2">
                        <p>📌 Prénom Nom : {item.prenom} {item.nom}</p>
                        <p>📞 Téléphone : {item.telephone || "—"}</p>
                        <p>💬 WhatsApp : {item.whatsapp || "—"}</p>
                        <p>🏙 Ville : {item.ville || "—"}</p>
                        <p>🕊 Statut : {item.statut || "—"}</p>
                        <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                        <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                        <div>
                          <label className="text-black text-sm">BESOIN :</label>
                          <select value={item.besoin || ""} className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1">
                            <option value="">-- Sélectionner --</option>
                            <option value="Finances">Finances</option>
                            <option value="Santé">Santé</option>
                            <option value="Travail">Travail</option>
                            <option value="Les Enfants">Les Enfants</option>
                            <option value="La Famille">La Famille</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-black text-sm">📋 Statut Suivis :</label>
                          <select
                            value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                          >
                            <option value="">-- Choisir un statut --</option>
                            <option value="actif">✅ Actif</option>
                            <option value="en attente">🕓 En attente</option>
                            <option value="suivi terminé">🏁 Terminé</option>
                            <option value="inactif">❌ Inactif</option>
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
                            updating[item.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
                        </button>
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
