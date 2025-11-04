// ✅ pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import LogoutLink from "../components/LogoutLink";

export default function Evangelisation() {
  const [members, setMembers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [view, setView] = useState("card");
  const [selectedMember, setSelectedMember] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCellules();
    fetchMembers();
  }, []);

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, nom");
    if (!error && data) setCellules(data);
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("suivis_membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMembers(data);
  };

  const handleSendWhatsApp = async () => {
    alert("📤 Lien WhatsApp envoyé aux membres sélectionnés !");
  };

  const toggleDetails = (member) => {
    setSelectedMember(member);
  };

  const closePopup = () => {
    setSelectedMember(null);
  };

  const getBorderColor = (statut) => {
    switch (statut) {
      case "integrer":
        return "#4285F4";
      case "en cours":
        return "#FFA500";
      case "refus":
        return "#34A853";
      default:
        return "#ccc";
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200 text-center"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* 🔹 HEADER */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white font-semibold hover:text-gray-200"
          >
            ← Retour
          </button>

          <div className="flex items-center gap-4">
            <p className="text-orange-200 text-sm">👋 Bienvenue</p>
            <LogoutLink />
          </div>
        </div>
      </div>

      {/* 🔹 LOGO */}
      <div className="mb-4">
        <img src="/logo.png" alt="Logo SoulTrack" className="w-20 h-18 mx-auto" />
      </div>

      {/* 🔹 TITRE + TOGGLE */}
      <div className="flex justify-center items-center gap-6 mb-4">
        <h1 className="text-3xl text-white font-bold">Suivis des membres</h1>
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="bg-white/20 text-white px-3 py-1 rounded-md text-sm hover:bg-white/30 transition"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* 🔹 FILTRE + BOUTON ENVOYER */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-3 py-1 text-gray-900 w-auto bg-white"
        >
          <option value="">Toutes les cellules</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>

        <button
          onClick={handleSendWhatsApp}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          📩 Envoyer par WhatsApp
        </button>
      </div>

      {/* 🔹 VUE CARTES */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-6xl">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              <div
                className="w-full h-[6px] rounded-t-2xl mb-2"
                style={{ backgroundColor: getBorderColor(m.statut_suivis) }}
              />
              <h2 className="font-bold text-black text-base mb-1">
                {m.prenom} {m.nom}
              </h2>
              <p className="text-sm text-gray-700 mb-1">📞 {m.telephone || "—"}</p>
              <p className="text-sm text-gray-700 mb-1">🏙 {m.ville || "—"}</p>
              <button
                onClick={() => toggleDetails(m)}
                className="text-orange-500 underline text-sm mt-1"
              >
                Détails
              </button>
            </div>
          ))}
        </div>
      ) : (
        // 🔹 VUE TABLE
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Ville</th>
                <th className="px-4 py-2 rounded-tr-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-white/10 transition duration-150 border-b border-blue-300"
                >
                  <td
                    className="px-4 py-2 border-l-4 rounded-l-md"
                    style={{ borderLeftColor: getBorderColor(m.statut_suivis) }}
                  >
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-4 py-2">{m.telephone || "—"}</td>
                  <td className="px-4 py-2">{m.ville || "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleDetails(m)}
                      className="text-orange-400 underline"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 POPUP DÉTAILS (commun carte/table) */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 p-6 rounded-2xl max-w-md w-full relative shadow-xl">
            <button
              onClick={closePopup}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-2 text-center text-blue-700">
              {selectedMember.prenom} {selectedMember.nom}
            </h2>
            <p>📞 Téléphone : {selectedMember.telephone || "—"}</p>
            <p>🏙 Ville : {selectedMember.ville || "—"}</p>
            <p>🕊 Statut : {selectedMember.statut_suivis || "—"}</p>
            <p>🙏 Besoin : {selectedMember.besoin || "—"}</p>
            <p>📝 Infos supplémentaires : {selectedMember.infos_supplementaires || "—"}</p>
            <p>🏠 Cellule : {selectedMember.cellule_nom || "—"}</p>

            <div className="flex justify-center mt-4">
              <button
                onClick={closePopup}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
