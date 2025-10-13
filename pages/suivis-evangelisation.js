// pages/suivis-evangelisation.js
"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";

export default function SuivisEvangelisation() {
  const [suivis, setSuivis] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [vueTable, setVueTable] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [cellules, setCellules] = useState({});

  useEffect(() => {
    fetchCellules();
    fetchSuivis();
  }, []);

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, cellule");
    if (!error && data) {
      const map = {};
      data.forEach((c) => (map[c.id] = c.cellule));
      setCellules(map);
    }
  };

  const fetchSuivis = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suivis_des_evangelises")
      .select("*")
      .order("date_suivi", { ascending: false });

    if (error) {
      console.error("Erreur de chargement :", error.message);
      setSuivis([]);
    } else {
      setSuivis(data || []);
    }
    setLoading(false);
  };

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVue = () => setVueTable((prev) => !prev);

  const handleWhatsAppChange = async (id, checked) => {
    await supabase
      .from("suivis_des_evangelises")
      .update({ whatsapp: checked })
      .eq("id", id);
    fetchSuivis();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-purple-700 to-indigo-500">
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
        Suivis des Évangélisés
      </h1>

      <p className="text-center text-white text-lg mb-4 font-handwriting-light">
        Voici les personnes confiées pour le suivi spirituel 🌱
      </p>

      {/* Toggle vue */}
      <p
        onClick={toggleVue}
        className="text-white underline cursor-pointer mb-6 hover:text-gray-200"
      >
        Changer de vue
      </p>

      {loading ? (
        <p className="text-white">Chargement en cours...</p>
      ) : suivis.length === 0 ? (
        <p className="text-white text-lg italic">
          Aucun contact suivi pour le moment.
        </p>
      ) : vueTable ? (
        /* Vue Table */
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow-lg">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-3 text-left">Prénom</th>
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-center">WhatsApp</th>
                <th className="p-3 text-center">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{item.prenom}</td>
                  <td className="p-3">{item.nom}</td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={item.whatsapp || false}
                      onChange={(e) =>
                        handleWhatsAppChange(item.id, e.target.checked)
                      }
                      className="cursor-pointer"
                    />
                  </td>
                  <td
                    className="p-3 text-blue-600 underline text-center cursor-pointer"
                    onClick={() => setPopupData(item)}
                  >
                    Détails
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vue Cards */
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
                  🕊 Cellule : {cellules[item.cellule_id] || "—"}
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  👑 Responsable : {item.responsable_cellule || "—"}
                </p>

                <button
                  onClick={() => toggleDetails(item.id)}
                  className="text-blue-500 underline text-sm"
                >
                  {isOpen ? "Fermer" : "Voir détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-600 text-sm text-center mt-2 space-y-1">
                    <p>🏙 Ville : {item.ville || "—"}</p>
                    <p>🙏 Besoin : {item.besoin || "—"}</p>
                    <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                    <p>
                      📅 Date du suivi :{" "}
                      {new Date(item.date_suivi).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Popup Détails */}
      {popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setPopupData(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-center mb-4">
              👤 {popupData.prenom} {popupData.nom}
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>📞 Téléphone : {popupData.telephone || "—"}</p>
              <p>🕊 Cellule : {cellules[popupData.cellule_id] || "—"}</p>
              <p>👑 Responsable : {popupData.responsable_cellule || "—"}</p>
              <p>🏙 Ville : {popupData.ville || "—"}</p>
              <p>🙏 Besoin : {popupData.besoin || "—"}</p>
              <p>📝 Infos : {popupData.infos_supplementaires || "—"}</p>
              <p>
                📅 Date du suivi :{" "}
                {new Date(popupData.date_suivi).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <label className="flex items-center space-x-2 mt-3">
                <input
                  type="checkbox"
                  checked={popupData.whatsapp || false}
                  onChange={(e) =>
                    handleWhatsAppChange(popupData.id, e.target.checked)
                  }
                />
                <span>Contact WhatsApp</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
