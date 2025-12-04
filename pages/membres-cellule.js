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
  const [view, setView] = useState("card");

  useEffect(() => {
    const fetchMembres = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        const userRole = JSON.parse(localStorage.getItem("userRole") || "[]");
        if (!userEmail) throw new Error("Utilisateur non connecté");

        // Profil utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, prenom")
          .eq("email", userEmail)
          .single();
        if (profileError) throw profileError;

        setPrenom(profileData?.prenom || "cher membre");
        const responsableId = profileData.id;

        let membresData = [];

        if (userRole.includes("Administrateur")) {
          const { data, error } = await supabase
            .from("v_membres_full")
            .select("*")
            .not("cellule_id", "is", null);
          if (error) throw error;
          membresData = data;
        } else if (userRole.includes("ResponsableCellule")) {
          const { data: cellulesData, error: cellulesError } = await supabase
            .from("v_membres_full")
            .select("*")
            .eq("responsable_cellule_id", responsableId);
          if (cellulesError) throw cellulesError;
          membresData = cellulesData || [];
          if (!membresData.length) setMessage("Aucun membre assigné à vos cellules.");
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

  const DetailsPopup = ({ membre }) => (
    <div className="text-black text-sm space-y-2 w-full">
      <p>📌 Ville : {membre.ville || "—"}</p>
      <p>📞 Téléphone : {membre.telephone || "—"}</p>
      <p>📌 Cellule : {membre.cellule_nom || "—"}</p>
      <p>👤 Responsable : {membre.responsable_cellule || "—"}</p>
      <p>📝 Infos : {membre.infos_supplementaires || "—"}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
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
        <p className="text-white text-lg max-w-xl mx-auto italic">Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️</p>
      </div>

      {/* Toggle Card / Table */}
      <div className="mb-4 flex justify-between w-full max-w-6xl">
        <button onClick={() => setView(view === "card" ? "table" : "card")} className="text-white text-sm underline hover:text-gray-200">
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {message && <div className="mb-4 px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 text-sm">{message}</div>}

      {loading ? (
        <p className="text-white">Chargement...</p>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl justify-items-center">
          {membres.map(m => (
            <div key={m.id} className="bg-white rounded-2xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl overflow-hidden">
              <div className="p-4 flex flex-col items-center">
                <h2 className="font-bold text-black text-base text-center mb-1">{m.prenom} {m.nom}</h2>
                <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
                <p className="text-sm text-gray-700 mb-1">📌 Cellule : {m.cellule_nom || "—"}</p>
                <button onClick={() => setSelectedMembre(selectedMembre === m.id ? null : m.id)} className="text-orange-500 underline text-sm mt-1">
                  {selectedMembre === m.id ? "Fermer détails" : "Action"}
                </button>
              </div>
              {selectedMembre === m.id && <div className="p-4 border-t"><DetailsPopup membre={m} /></div>}
            </div>
          ))}
        </div>
      ) : (
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
              ) : membres.map(m => (
                <tr key={m.id} className="hover:bg-white/10 transition duration-150 border-b border-gray-300">
                  <td className="px-4 py-2">{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.ville || "—"}</td>
                  <td className="px-4 py-2">{m.cellule_nom || "—"}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => setSelectedMembre(selectedMembre === m.id ? null : m.id)} className="text-orange-500 underline text-sm">
                      {selectedMembre === m.id ? "Fermer" : "Action"}
                    </button>
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
