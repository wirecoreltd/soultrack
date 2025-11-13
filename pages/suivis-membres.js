"use client";

import React, { useEffect, useState } from "react";
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
  // Récupération des cellules gérées par ce responsable
  const { data: cellulesData, error: cellulesError } = await supabase
    .from("cellules")
    .select("id, cellule, responsable")
    .eq("responsable_id", responsableId);

  if (cellulesError) throw cellulesError;

  if (!cellulesData || cellulesData.length === 0) {
    setMessage("Vous n’êtes responsable d’aucune cellule pour le moment.");
    setSuivis([]);
    setLoading(false);
    return;
  }

  const celluleIds = cellulesData.map((c) => c.id);

  // On ne prend que les suivis rattachés à ces cellules
  const { data, error } = await supabase
    .from("suivis_membres")
    .select(`
      *,
      cellule:cellule_id (id, cellule, responsable)
    `)
    .in("cellule_id", celluleIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  suivisData = data;

  if (!suivisData || suivisData.length === 0) {
    setMessage("Aucun membre en suivi pour vos cellules.");
  }
}

// ✅ Filtre ajouté : on n'affiche pas ceux déjà intégrés ou refusés
setSuivis((suivisData || []).filter(
  (item) => item.statut_suivis !== "integrer" && item.statut_suivis !== "refus"
));

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
    if (m.statut_suivis === "refus") return "#EA4335";        // rouge
    if (m.statut_suivis === "integrer") return "#FFA500";    // orange
    if (m.statut_suivis === "en attente") return "#999999";  // gris
    if (m.statut_suivis === "actif") return "#34A853";       // vert
    return "#ccc";                                           // default
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
      const { data: suiviData, error: fetchError } = await supabase
        .from("suivis_membres")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError || !suiviData) throw new Error("Impossible de récupérer le suivi.");

      const payload = { updated_at: new Date() };
      if (newStatus) payload.statut_suivis = newStatus;
      if (newComment) payload.commentaire_suivis = newComment;

      let celluleIdToUpdate = suiviData.cellule_id;
      if (newStatus === "integrer" && !celluleIdToUpdate) {
        const userEmail = localStorage.getItem("userEmail");
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", userEmail)
          .single();

        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", profileData.id);

        if (!cellulesData || cellulesData.length === 0)
          throw new Error("⚠️ Aucune cellule trouvée pour ce responsable.");

        celluleIdToUpdate = cellulesData[0].id;
      }

      if (celluleIdToUpdate) payload.cellule_id = celluleIdToUpdate;

      const { data: updatedSuivi, error: updateError } = await supabase
        .from("suivis_membres")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;

      if (["integrer", "refus"].includes(updatedSuivi.statut_suivis)) {
        setSuivis((prev) => prev.filter((it) => it.id !== id));
        setMessage({
          type: "success",
          text: `Le contact a été ${updatedSuivi.statut_suivis === "integrer" ? "intégré" : "refusé"} et retiré de la liste.`,
        });

        // ✅ Sécurité : on refiltre après mise à jour
        setSuivis((prev) =>
          prev.filter(
            (it) => it.statut_suivis !== "integrer" && it.statut_suivis !== "refus"
          )
        );
      } else {
        setSuivis((prev) => prev.map((it) => (it.id === id ? updatedSuivi : it)));
        setMessage({ type: "success", text: "Mise à jour enregistrée avec succès." });
      }
    } catch (err) {
      console.error("Exception updateSuivi:", err);
      setMessage({ type: "error", text: `Erreur durant la mise à jour : ${err.message}` });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Header */}
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

      {/* Logo */}
      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" />
      </div>

      {/* Titre */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📋 Suivis des Membres</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      {/* Switch view */}
      <div className="mb-4 flex justify-end w-full max-w-6xl">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
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

      {/* VUE CARTE */}
      {view === "card" && (
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
                  <p className="text-sm text-gray-700 mb-1">👤 Statut : {item.statut || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">📋 Statut Suivis : {item.statut_suivis || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">
                    🏠 {item.cellule_nom} - {item.responsable_prenom || item.cellule?.responsable || "—"}
                  </p>                    
                  <button
                    onClick={() => toggleDetails(item.id)}
                    className="text-orange-500 underline text-sm mt-1"
                  >
                    {isOpen ? "Fermer détails" : "Détails"}
                  </button>

                  {isOpen && (
                    <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                      <p>🏙  Ville : {item.ville || "—"}</p>                     
                      <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                      <p>❓ Besoin : {item.besoin || "—"}</p>
                      <p>📝 Infos : {item.infos_supplementaires || "—"}</p>                     
                      <select
                        value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                      >
                        <option value="">-- Choisir un statut --</option>
                        <option value="en attente">🕓 En attente</option>
                        <option value="integrer">✅ Intégrer</option>
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
                          updating[item.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
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
      )}

      {/* VUE TABLE */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200 relative">
          <table className="w-full text-sm text-left text-black border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>  
                <th className="px-4 py-2">Statut Suivis</th>                              
                <th className="px-4 py-2 rounded-tr-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-white text-center">
                    Aucun membre en suivi
                  </td>
                </tr>
              ) : (
                suivis.map((m) => (
                  <React.Fragment key={m.id}>
                    <tr className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                      <td
                        className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2"
                        style={{ borderLeftColor: getBorderColor(m) }}
                      >
                        {m.prenom} {m.nom}
                      </td>
                      <td className="px-4 py-2">{m.telephone || "—"}</td>
                      <td className="px-4 py-2">{m.statut_suivis || "—"}</td>
                      <td className="px-4 py-2">{m.statut || "—"}</td>                      
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            setDetailsOpen((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                          }
                          className="text-orange-500 underline text-sm"
                        >
                          {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                        </button>
                      </td>
                    </tr>

                    {detailsOpen[m.id] && (
                      <tr>
                        <td colSpan={6}>
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                              <button
                                onClick={() =>
                                  setDetailsOpen((prev) => ({ ...prev, [m.id]: false }))
                                }
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold"
                              >
                                ✖
                              </button>

                              <h2 className="font-bold text-black text-base text-center mb-1">
                                {m.prenom} {m.nom}
                              </h2>
                              <p className="text-sm text-gray-700 mb-1 text-center">📞 {m.telephone || "—"}</p>
                              <p className="text-sm text-gray-700 mb-1 text-center">👤 Statut : {m.statut || "—"}</p>
                              <p className="text-sm text-gray-700 mb-1 text-center">📋 Statut Suivis : {m.statut_suivis || "—"}</p>
                              <p className="text-sm text-gray-700 mb-1">
                              🏠 {m.cellule_nom} - {m.responsable_prenom || m.cellule?.responsable || "—"}
                              </p> 
                              <p>🏙  Ville : {m.ville || "—"}</p>
                              <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                              <p>❓ Besoin : {m.besoin || "—"}</p>
                              <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                              <select
                                value={statusChanges[m.id] ?? m.statut_suivis ?? ""}
                                onChange={(e) => handleStatusChange(m.id, e.target.value)}
                                className="w-full border rounded-md px-2 py-1 text-black text-sm mt-2"
                              >
                                <option value="">-- Choisir un statut --</option>
                                <option value="en attente">🕓 En attente</option>
                                <option value="integrer">✅ Intégrer</option>
                                <option value="refus">❌ Refus</option>
                              </select>

                              <label className="text-black text-sm mt-2">📝 Commentaire :</label>
                              <textarea
                                value={commentChanges[m.id] ?? m.commentaire_suivis ?? ""}
                                onChange={(e) => handleCommentChange(m.id, e.target.value)}
                                rows={2}
                                className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1 resize-none"
                              />

                              <button
                                onClick={() => updateSuivi(m.id)}
                                disabled={updating[m.id]}
                                className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
                                  updating[m.id] ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                                }`}
                              >
                                {updating[m.id] ? "Mise à jour..." : "Mettre à jour"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
