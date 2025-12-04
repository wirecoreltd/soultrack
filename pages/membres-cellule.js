// pages/membres-cellule.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function MembresCellule() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [prenom, setPrenom] = useState("");
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [view, setView] = useState("card"); // carte ou table

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");

        if (!userEmail) throw new Error("Utilisateur non connecté");

        // 🔹 Profil de l'utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom")
          .eq("email", userEmail)
          .single();
        if (profileError) throw profileError;

        setPrenom(profileData?.prenom || "cher membre");
        const responsableId = profileData.id;

        let membresData = [];

        // ADMIN → tous les membres
        if (userRole.includes("Administrateur")) {
          const { data, error } = await supabase
            .from("v_membres_full")
            .select("*");
          if (error) throw error;
          membresData = data;
        }

        // ResponsableCellule → membres de ses cellules
        else if (userRole.includes("ResponsableCellule")) {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("cellules")
            .select("id")
            .eq("responsable_id", responsableId);
          if (cellulesError) throw cellulesError;

          if (!cellulesData || cellulesData.length === 0) {
            setMessage("Vous n’êtes responsable d’aucune cellule pour le moment.");
            setMembres([]);
            return;
          }

          const celluleIds = cellulesData.map(c => c.id);
          const { data, error } = await supabase
            .from("v_membres_full")
            .select("*")
            .in("cellule_id", celluleIds);
          if (error) throw error;
          membresData = data;

          if (!membresData || membresData.length === 0) {
            setMessage("Aucun membre assigné à vos cellules.");
          }
        }

        setMembres(membresData || []);
      } catch (err) {
        console.error("❌ Erreur:", err.message || err);
        setMessage("Erreur lors de la récupération des membres.");
        setMembres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembres();
  }, []);

  if (loading) return <p className="text-center mt-10 text-white">Chargement...</p>;
  if (message) return <p className="text-center text-white mt-10">{message}</p>;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-white hover:text-gray-200 transition">← Retour</button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <div className="mb-4">
        <Image src="/logo.png" alt="SoulTrack Logo" className="w-20 h-18 mx-auto" width={80} height={80} />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">👥 Membres de ma/mes cellule(s)</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      {/* Bouton Carte / Table */}
      <div className="mb-4 flex justify-end w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline hover:text-gray-200">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* VUE Carte */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {membres.map(m => {
            const celluleDisplay = m.cellule_nom || m.suivi_cellule_nom || "—";
            return (
              <div key={m.id} className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl overflow-hidden">
                <div className="p-4 flex flex-col items-center">
                  <h2 className="font-bold text-black text-base text-center mb-1">{m.prenom} {m.nom}</h2>
                  <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
                  <p className="text-sm text-gray-700 mb-1">📌 Cellule : {celluleDisplay}</p>
                  <button onClick={() => setSelectedMembre(m)} className="text-orange-500 underline text-sm mt-1">
                    Détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // VUE Table
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
              {membres.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-2 text-white text-center">Aucun membre</td></tr>
              ) : membres.map(m => {
                const celluleDisplay = m.cellule_nom || m.suivi_cellule_nom || "—";
                return (
                  <tr key={m.id} className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                    <td className="px-4 py-2">{m.prenom} {m.nom}</td>
                    <td className="px-4 py-2">{m.telephone || "—"}</td>
                    <td className="px-4 py-2">{m.ville || "—"}</td>
                    <td className="px-4 py-2">{celluleDisplay}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => setSelectedMembre(m)} className="text-orange-500 underline text-sm">Détails</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP Détails */}
      {selectedMembre && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl text-gray-800 relative">
            <button onClick={() => setSelectedMembre(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✖</button>
            <h2 className="text-xl font-bold mb-4 text-center text-indigo-600">🧾 Détails du membre</h2>
            <div className="text-sm space-y-2">
              <p>📌 <strong>Nom :</strong> {selectedMembre.prenom} {selectedMembre.nom}</p>
              <p>📞 <strong>Téléphone :</strong> {selectedMembre.telephone || "—"}</p>
              <p>🏙 <strong>Ville :</strong> {selectedMembre.ville || "—"}</p>
              <p>📌 <strong>Cellule :</strong> {selectedMembre.cellule_nom || selectedMembre.suivi_cellule_nom || "—"}</p>
              <p>📝 <strong>Infos :</strong> {selectedMembre.infos_supplementaires || "—"}</p>
              <p>🙏 <strong>Besoin :</strong> {selectedMembre.besoin || "—"}</p>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setSelectedMembre(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
