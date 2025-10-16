"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";

export default function Membres() {
  const [membres, setMembres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("cards"); // cards | table
  const [popupMember, setPopupMember] = useState(null);
  const [filterStatut, setFilterStatut] = useState("");

  useEffect(() => {
    fetchMembres();
  }, []);

  const fetchMembres = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Erreur chargement :", error);
    else setMembres(data || []);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getBorderColor = (membre) => {
    switch (membre.statut) {
      case "actif":
        return "#10B981";
      case "ancien":
        return "#6366F1";
      case "visiteur":
        return "#F59E0B";
      default:
        return "#9CA3AF";
    }
  };

  const filtered = membres.filter((m) => {
    const matchName =
      `${m.prenom} ${m.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut ? m.statut === filterStatut : true;
    return matchName && matchStatut;
  });

  const nouveauxFiltres = filtered.filter(
    (m) => m.statut === "evangelisé" || m.venu === "Oui"
  );
  const anciensFiltres = filtered.filter(
    (m) => !["evangelisé"].includes(m.statut)
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-700 to-indigo-500 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold">📋 Liste des Membres</h1>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="🔍 Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded-md border text-black w-full sm:w-64"
        />
      </div>

      {/* Filtres et boutons */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="text-black px-3 py-2 rounded-md border"
        >
          <option value="">-- Tous les statuts --</option>
          <option value="actif">Actif</option>
          <option value="ancien">Ancien</option>
          <option value="visiteur">Visiteur</option>
          <option value="evangelisé">Évangélisé</option>
        </select>

        <button
          onClick={() =>
            setView((v) => (v === "cards" ? "table" : "cards"))
          }
          className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-md shadow hover:bg-gray-100"
        >
          {view === "cards" ? "📊 Vue Table" : "📇 Vue Cartes"}
        </button>
      </div>

      {/* ======= TABLE ======= */}
      {view === "table" ? (
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-800 rounded-lg">
                <th className="px-4 py-2 text-left rounded-l-lg">Nom complet</th>
                <th className="px-4 py-2 text-left">Téléphone</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2 text-left rounded-r-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {nouveauxFiltres.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan="4"
                      className="py-3 text-white font-semibold text-sm"
                    >
                      💖 Bien aimé venu le{" "}
                      {formatDate(nouveauxFiltres[0].created_at)}
                    </td>
                  </tr>
                  {nouveauxFiltres.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`${
                        i % 2 === 0 ? "bg-blue-50" : "bg-transparent"
                      } border-b border-blue-100`}
                    >
                      <td className="px-4 py-2 text-gray-900">
                        {m.prenom} {m.nom}
                      </td>
                      <td className="px-4 py-2 text-gray-900">
                        {m.telephone || "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-900">{m.statut}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setPopupMember(m)}
                          className="text-orange-500 hover:text-orange-400 underline"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {anciensFiltres.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan="4"
                      className="py-3 text-left font-semibold"
                      style={{
                        background:
                          "linear-gradient(to right, #3B82F6, #D1D5DB)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      Membres existants
                    </td>
                  </tr>
                  {anciensFiltres.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`${
                        i % 2 === 0 ? "bg-blue-50" : "bg-transparent"
                      } border-b border-blue-100`}
                    >
                      <td className="px-4 py-2 text-gray-900">
                        {m.prenom} {m.nom}
                      </td>
                      <td className="px-4 py-2 text-gray-900">
                        {m.telephone || "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-900">{m.statut}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setPopupMember(m)}
                          className="text-orange-500 hover:text-orange-400 underline"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // ======= CARTES =======
        <div className="w-full max-w-5xl mt-6 space-y-8">
          {/* 💖 Nouveaux */}
          {nouveauxFiltres.length > 0 && (
            <div>
              <h3 className="text-lg text-white font-semibold mb-3">
                💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveauxFiltres.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl p-4 shadow-md border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    <h3 className="font-semibold text-lg text-gray-900">
                      {m.prenom} {m.nom}
                    </h3>
                    <p className="text-sm text-gray-700">{m.telephone || "—"}</p>
                    <p className="text-sm italic text-gray-500">{m.statut}</p>
                    <button
                      onClick={() => setPopupMember(m)}
                      className="mt-2 text-orange-500 hover:text-orange-400 underline text-sm"
                    >
                      Détails
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Membres existants */}
          {anciensFiltres.length > 0 && (
            <div>
              <h3 className="text-lg mb-3 font-semibold text-left">
                <span
                  style={{
                    background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Membres existants
                </span>
                <span className="ml-2 w-3/4 inline-block h-px bg-gradient-to-r from-blue-500 to-gray-400"></span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anciensFiltres.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl p-4 shadow-md border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    <h3 className="font-semibold text-lg text-gray-900">
                      {m.prenom} {m.nom}
                    </h3>
                    <p className="text-sm text-gray-700">{m.telephone || "—"}</p>
                    <p className="text-sm italic text-gray-500">{m.statut}</p>
                    <button
                      onClick={() => setPopupMember(m)}
                      className="mt-2 text-orange-500 hover:text-orange-400 underline text-sm"
                    >
                      Détails
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === POPUP DÉTAIL === */}
      {popupMember && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 rounded-2xl p-6 w-96 relative shadow-lg">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setPopupMember(null)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-3">
              {popupMember.prenom} {popupMember.nom}
            </h2>
            <p className="mb-1">📞 {popupMember.telephone || "—"}</p>
            <p className="mb-1">🏷 Statut : {popupMember.statut}</p>
            <p className="mb-1">🏙 Ville : {popupMember.ville || "—"}</p>
            <p className="mb-1">🙏 Besoin : {popupMember.besoin || "—"}</p>
            <p className="mb-1">
              ✉ Email : {popupMember.email || "Aucune donnée"}
            </p>
            <p className="mt-2 text-sm italic text-gray-600">
              Date d’ajout : {formatDate(popupMember.created_at)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
