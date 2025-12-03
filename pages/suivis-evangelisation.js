//pages/suivis-evangelisation.js

"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import AccessGuard from "../components/AccessGuard";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusChanges, setStatusChanges] = useState({});
  const [commentChanges, setCommentChanges] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);

    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

      if (!userEmail) throw new Error("Utilisateur non connecté");

      // 🔹 Récupération du profil connecté
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (profileError) throw profileError;
      const responsableId = profileData.id;

      let query = supabase
        .from("suivis_des_evangelises")
        .select(`*, cellules:cellule_id (id, cellule, responsable)`)
        .order("date_suivi", { ascending: false });

      // 🔸 Si ResponsableCellule → filtrer par toutes ses cellules
      if (userRole.includes("ResponsableCellule")) {
        const { data: cellulesData, error: celluleError } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", responsableId);

        if (celluleError) throw celluleError;
        if (!cellulesData || cellulesData.length === 0) {
          setSuivis([]);
          setLoading(false);
          return;
        }

        const celluleIds = cellulesData.map((c) => c.id);
        query = query.in("cellule_id", celluleIds);
      }
      if (userRole.includes("Conseiller")) {
        query = query.eq("responsable_cellule", responsableId); // ou "responsable_id" selon ta table
      }

      const { data, error } = await query;
      if (error) throw error;

      setSuivis(data || []);
    } catch (err) {
      console.error("❌ Erreur chargement suivis :", err.message || err);
      setSuivis([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (id, value) => {
    setStatusChanges((prev) => ({ ...prev, [id]: value }));
  };

  const handleCommentChange = (id, value) => {
    setCommentChanges((prev) => ({ ...prev, [id]: value }));
  };

  // Transfert vers table membres si statut = "Integrer" ou "Venu à l’église"
  const updateStatus = async (id) => {
    const newStatus = statusChanges[id];
    const newComment = commentChanges[id];

    if (!newStatus && !newComment) return;

    setUpdating((prev) => ({ ...prev, [id]: true }));

    const { data: currentData, error: fetchError } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Erreur récupération :", fetchError.message);
      setUpdating((prev) => ({ ...prev, [id]: false }));
      return;
    }

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from("suivis_des_evangelises")
      .update({
        status_suivis_evangelises: newStatus,
        commentaire_evangelises: newComment,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Erreur mise à jour :", updateError.message);
      setUpdating((prev) => ({ ...prev, [id]: false }));
      return;
    }

    // Transfert vers membres si statut = "Integrer" ou "Venu à l’église"
    if (["Integrer", "Venu à l’église"].includes(newStatus)) {
      const { error: insertError } = await supabase.from("membres").insert([
        {
          nom: currentData.nom,
          prenom: currentData.prenom,
          telephone: currentData.telephone,
          email: currentData.email,
          statut: newStatus,
          venu: newStatus === "Venu à l’église" ? "Oui" : null,
          besoin: currentData.besoin,
          ville: currentData.ville,
          formation: currentData.formation,
          evangeliste_nom: currentData.evangeliste_nom,
          comment: newComment || currentData.commentaire_evangelises,
          responsable_suivi: currentData.responsable_cellule,
          cellule_id: currentData.cellule_id, // ✅ On ajoute la cellule !!
        },
      ]);

      if (insertError) {
        console.error("Erreur insertion membre :", insertError.message);
      } else {
        // Supprime le contact transféré
        await supabase.from("suivis_des_evangelises").delete().eq("id", id);
      }
    }

    setUpdating((prev) => ({ ...prev, [id]: false }));
    fetchSuivis();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-700 to-indigo-500">
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-3" />

      <h1 className="text-4xl font-handwriting text-white text-center mb-3">
        Suivis des Évangélisés
      </h1>

      <p className="text-center text-white text-lg mb-6 font-handwriting-light">
        Voici les personnes confiées pour le suivi spirituel 🌱
      </p>

      {loading ? (
        <p className="text-white">Chargement en cours...</p>
      ) : suivis.length === 0 ? (
        <p className="text-white text-lg italic">
          Aucun contact suivi pour le moment.
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

                <p className="text-sm text-gray-700 mb-1">
                  📞 {item.telephone || "—"}
                </p>

                <p className="text-sm text-gray-700 mb-1">
                  🕊 Cellule : {item.cellules?.cellule || "—"}
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  👑 Responsable : {item.responsable_cellule || "—"}
                </p>

                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-blue-500 underline text-sm mt-1"
                >
                  {isOpen ? "Fermer" : "Voir détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-600 text-sm text-center mt-2 space-y-2 w-full">
                    <p>🏙 Ville : {item.ville || "—"}</p>
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

                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">💬 Commentaire :</label>
                      <textarea
                        value={
                          commentChanges[item.id] ?? item.commentaire_evangelises ?? ""
                        }
                        onChange={(e) =>
                          handleCommentChange(item.id, e.target.value)
                        }
                        rows={2}
                        className="w-full border rounded-md px-2 py-1 text-sm mt-1 resize-none"
                        placeholder="Ajouter un commentaire..."
                      ></textarea>
                    </div>

                    <div className="mt-2">
                      <label className="text-gray-700 text-sm">
                        📋 Statut du suivi :
                      </label>
                      <select
                        value={statusChanges[item.id] ?? item.status_suivis_evangelises ?? ""}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value)
                        }
                        className="w-full border rounded-md px-2 py-1 text-sm mt-1"
                      >
                        <option value="">-- Choisir un statut --</option>
                        <option value="En cours">🕊 En cours</option>
                        <option value="Integrer">🔥 Intégrer</option>
                        <option value="Venu à l’église">⛪ Venu à l’église</option>
                        <option value="Veut venir à la famille d’impact">
                          👨‍👩‍👧‍👦 Veut venir à la famille d’impact
                        </option>
                        <option value="Veut être visité">🏡 Veut être visité</option>
                        <option value="Ne souhaite pas continuer">
                          🚫 Ne souhaite pas continuer
                        </option>
                      </select>
                    </div>

                    <p className="mt-2">
                      📅 Date du suivi :{" "}
                      {new Date(item.date_suivi).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    <button
                      onClick={() => updateStatus(item.id)}
                      disabled={updating[item.id]}
                      className={`mt-2 w-full text-white font-semibold py-1 rounded-md transition ${
                        updating[item.id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
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
