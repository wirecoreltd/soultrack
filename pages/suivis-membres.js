// ✅ /pages/suivis-membres.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});
  const [view, setView] = useState("card");

  useEffect(() => {
    const fetchSuivis = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

        if (!userEmail) throw new Error("Utilisateur non connecté");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom")
          .eq("email", userEmail)
          .single();

        if (profileError) throw profileError;

        setPrenom(profileData?.prenom || "cher membre");
        setRole(userRole);
        const responsableId = profileData.id;

        let suivisData = [];

        if (userRole.includes("Administrateur")) {
          const { data, error } = await supabase
            .from("suivis_membres")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          suivisData = data;
        } else if (userRole.includes("ResponsableCellule")) {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", responsableId);

          if (cellulesError) throw cellulesError;

          if (!cellulesData || cellulesData.length === 0) {
            setMessage("Vous n’êtes responsable d’aucune cellule pour le moment.");
            setSuivis([]);
            setLoading(false);
            return;
          }

          const celluleIds = cellulesData.map((c) => c.id);

          const { data, error } = await supabase
            .from("suivis_membres")
            .select("*")
            .in("cellule_id", celluleIds)
            .order("created_at", { ascending: false });

          if (error) throw error;
          suivisData = data;

          if (!suivisData || suivisData.length === 0) {
            setMessage("Aucun membre en suivi pour vos cellules.");
          }
        }

        setSuivis(suivisData || []);
      } catch (err) {
        console.error("❌ Erreur:", err.message || err);
        setMessage("Erreur lors de la récupération des suivis.");
        setSuivis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuivis();
  }, []);

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (id, value) =>
    setStatusChanges((prev) => ({ ...prev, [id]: value }));

  const handleCommentChange = (id, value) =>
    setCommentChanges((prev) => ({ ...prev, [id]: value }));

  const getBorderColor = (m) => {
    if (m.statut_suivis === "actif") return "#4285F4";
    if (m.statut_suivis === "en attente") return "#FFA500";
    if (m.statut_suivis === "suivi terminé") return "#34A853";
    if (m.statut_suivis === "inactif") return "#999999";
    return "#ccc";
  };

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
    const payload = {};
    if (newStatus) payload["statut_suivis"] = newStatus;
    if (newComment) payload["commentaire_suivis"] = newComment;
    payload["updated_at"] = new Date();

    let celluleIdToAssign = null;

    // 🔹 Rattachement cellule automatique si intégration
    if (newStatus === "integrer") {
      const userEmail = localStorage.getItem("userEmail");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();
      if (profileError) throw profileError;

      const responsableId = profileData.id;

      const { data: cellulesData, error: celluleError } = await supabase
        .from("cellules")
        .select("id")
        .eq("responsable_id", responsableId);
      if (celluleError) throw celluleError;

      if (!cellulesData || cellulesData.length === 0) {
        setMessage({
          type: "error",
          text: "⚠️ Aucune cellule trouvée pour ce responsable.",
        });
        setUpdating((prev) => ({ ...prev, [id]: false }));
        return;
      }

      celluleIdToAssign = cellulesData[0].id;
      payload["cellule_id"] = celluleIdToAssign;
    }

    // 🔹 Mise à jour de suivis_membres
    const { data: updatedData, error: updateError } = await supabase
      .from("suivis_membres")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 🔹 Mise à jour correspondante dans la table membres
    if (updatedData?.membre_id) {
      const membrePayload = {};
      if (newStatus === "integrer") membrePayload["cellule_id"] = celluleIdToAssign;
      if (newStatus) membrePayload["statut_suivis"] = newStatus;

      await supabase
        .from("membres")
        .update(membrePayload)
        .eq("id", updatedData.membre_id);
    }

    // 🔹 Actualisation UI
    if (["integrer", "refus"].includes(updatedData.statut_suivis)) {
      setSuivis((prev) => prev.filter((it) => it.id !== id));
      setMessage({
        type: "success",
        text: `Le contact a été ${updatedData.statut_suivis === "integrer" ? "intégré" : "refusé"} et retiré de la liste.`,
      });
    } else {
      setSuivis((prev) =>
        prev.map((it) => (it.id === id ? updatedData : it))
      );
      setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
    }

  } catch (err) {
    console.error("Exception updateSuivi:", err);
    setMessage({ type: "error", text: `Exception durant la mise à jour : ${err.message}` });
  } finally {
    setUpdating((prev) => ({ ...prev, [id]: false }));
  }
};


  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>

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
        <p className="text-white text-lg max-w-xl mx-auto italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      <div className="mb-4 flex justify-end w-full max-w-6xl">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
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
                      <p>🏙 Ville : {item.ville || "—"}</p>
                      <p>🕊 Statut : {item.statut || "—"}</p>
                      <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                      <p>❓Besoin : {
                              (() => {
                                if (!item.besoin) return "—";
                                if (Array.isArray(item.besoin)) return item.besoin.join(", ");
                                try {
                                  const arr = JSON.parse(item.besoin);
                                  return Array.isArray(arr) ? arr.join(", ") : item.besoin;
                                } catch { return item.besoin; }
                              })()
                            }</p>
                      <p>📝 Infos : {item.infos_supplementaires || "—"}</p>

                      <label className="text-black text-sm">📋 Statut Suivis :</label>
                      <select
                        value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                      >
                        <option value="">-- Choisir un statut --</option>
                        <option value="integrer">✅ Intégrer</option>
                        <option value="en attente">🕓 En attente</option>
                        <option value="refus">❌ Refus</option>
                      </select>

                      <label className="text-black text-sm mt-2">📝 Commentaire :</label>
                      <textarea
                        value={commentChanges[item.id] ?? item.commentaire_suivis ?? ""}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        rows={2}
                        className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1 resize-none"
                      />

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
        <p className="text-white">Vue table en préparation...</p>
      )}
    </div>
  );
}
