// pages/suivis-evangelisation.js

"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import SuiviDetailsEvanPopup from "../components/SuiviDetailsEvanPopup";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(null); // ID du suivi pour table
  const [view, setView] = useState("card");
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState([]);

  useEffect(() => {
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");
      if (!userEmail) throw new Error("Utilisateur non connecté");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, prenom, role")
        .eq("email", userEmail)
        .single();
      if (profileError) throw profileError;

      setPrenom(profileData.prenom || "cher membre");
      setRole(profileData.role);

      let query = supabase
        .from("suivis_des_evangelises")
        .select(`*, cellules:cellule_id (id, cellule, responsable)`)
        .order("date_suivi", { ascending: false });

      // Filtre selon rôle
      if (userRole.includes("ResponsableCellule")) {
        const { data: cellulesData } = await supabase
          .from("cellules")
          .select("id")
          .eq("responsable_id", profileData.id);
        const celluleIds = cellulesData?.map(c => c.id) || [];
        query = query.in("cellule_id", celluleIds);
      }
      if (userRole.includes("Conseiller")) {
        query = query.eq("responsable_cellule", profileData.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSuivis(data || []);
      if (!data || data.length === 0) setMessage("Aucun évangélisé à afficher.");
    } catch (err) {
      console.error("❌ Erreur :", err);
      setMessage("Erreur lors de la récupération des suivis.");
      setSuivis([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) => setDetailsOpen(prev => (prev === id ? null : id));

  const getBorderColor = (m) => {
    if (m.status_suivis_evangelises === "En cours") return "#FFA500";
    if (m.status_suivis_evangelises === "Integrer") return "#34A853";
    if (m.status_suivis_evangelises === "Venu à l’église") return "#3B82F6";
    return "#ccc";
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6"
         style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()}
                className="text-white hover:text-gray-200 transition">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" width={80} height={80}/>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">📋 Suivis des Évangélisés</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">Chaque personne a une valeur infinie. Ensemble, nous avançons 🌱</p>
      </div>

      {/* Toggle carte/table */}
      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")}
                className="text-white text-sm underline hover:text-gray-200">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {message && <div className="mb-4 px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 text-sm">{message}</div>}

      {loading ? (
        <p className="text-white">Chargement...</p>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {suivis.map(m => (
            <div key={m.id} className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl p-4 border-l-4"
                 style={{ borderLeftColor: getBorderColor(m) }}>
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {m.prenom} {m.nom}
                </h2>
                <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">📌 Cellule : {m.cellules?.cellule || "—"}</p>

                {/* Bouton détails carte */}
                <button onClick={() => toggleDetails(m.id)}
                        className="text-orange-500 underline text-sm mt-1">
                  {detailsOpen === m.id ? "Fermer détails" : "Détails"}
                </button>

                {/* Détails inline carte */}
                {detailsOpen === m.id && (
                  <div className="mt-2 w-full bg-gray-50 p-2 rounded-md text-left text-black text-sm space-y-1">
                    <p>🏙 Ville : {m.ville || "—"}</p>
                    <p>❓ Besoin : {(!m.besoin ? "—" : Array.isArray(m.besoin) 
                      ? m.besoin.join(", ") : (() => { try { const arr = JSON.parse(m.besoin); return Array.isArray(arr) ? arr.join(", ") : m.besoin; } catch { return m.besoin; } })())}</p>
                    <p>📝 Infos : {m.infos_supplementaires || "—"}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // VUE TABLE
        <div className="w-full max-w-6xl overflow-x-auto flex justify-center relative">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Cellule</th>
                <th className="px-4 py-2 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {suivis.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-2 text-white text-center">Aucun évangélisé</td></tr>
              ) : suivis.map(m => (
                <tr key={m.id} className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                  <td className="px-4 py-2 border-l-4 rounded-l-md" style={{ borderLeftColor: getBorderColor(m) }}>{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.cellules?.cellule || "—"}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => toggleDetails(m.id)}
                            className="text-orange-500 underline text-sm">
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* POPUP DETAILS TABLE */}
          {detailsOpen && (
            <SuiviDetailsEvanPopup
              member={suivis.find(s => s.id === detailsOpen)}
              onClose={() => setDetailsOpen(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
