"use client";

import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function SuivisMembres() {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("cards");
  const [popupMember, setPopupMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [responsableCellule, setResponsableCellule] = useState(null);

  useEffect(() => {
    fetchResponsableCellule();
  }, []);

  useEffect(() => {
    if (responsableCellule) {
      fetchSuivis();
    }
  }, [responsableCellule]);

  async function fetchResponsableCellule() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("responsables_cellules")
        .select("id, cellule_id, nom, prenom")
        .eq("email", user.email)
        .single();

      if (error) console.error(error);
      else setResponsableCellule(data);
    }
  }

  async function fetchSuivis() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suivis_membres")
        .select(
          `
          id,
          prenom,
          nom,
          telephone,
          statut_suivis,
          cellule_id,
          ville,
          statut,
          venu,
          besoin,
          infos_supplementaires,
          created_at,
          cellules ( nom )
        `
        )
        .eq("cellule_id", responsableCellule.cellule_id);

      if (error) throw error;
      setSuivis(data);
    } catch (err) {
      console.error("Erreur lors du chargement :", err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      const { error } = await supabase
        .from("suivis_membres")
        .update({ statut_suivis: newStatus })
        .eq("id", memberId);

      if (error) throw error;

      setSuivis((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, statut_suivis: newStatus } : m))
      );
    } catch (err) {
      console.error("Erreur durant la mise à jour :", err.message);
    }
  };

  const getBorderColor = (m) => {
    switch (m.statut_suivis) {
      case "1":
        return "#22C55E"; // vert
      case "2":
        return "#EAB308"; // jaune
      case "3":
        return "#EF4444"; // rouge
      default:
        return "#6B7280"; // gris
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const nouveauxFiltres = suivis.filter((m) => m.statut_suivis === "1");
  const anciensFiltres = suivis.filter((m) => m.statut_suivis !== "1");

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Chargement des membres...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suivis des membres</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(view === "cards" ? "table" : "cards")}
            className="bg-orange-500 text-white px-3 py-1 rounded-md"
          >
            {view === "cards" ? "Vue Table" : "Vue Carte"}
          </button>
          <LogoutLink />
        </div>
      </div>

      {/* === VUE CARTE === */}
      {view === "cards" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suivis.map((item) => {
            const isOpen = popupMember?.id === item.id;
            return (
              <div
                key={item.id}
                className="bg-white text-gray-800 p-4 rounded-lg shadow-md border-t-4"
                style={{ borderTopColor: getBorderColor(item) }}
              >
                <h2 className="font-bold text-black text-base text-center mb-1">
                  {item.prenom} {item.nom}{" "}
                  {item.cellules?.nom ? `(${item.cellules.nom})` : ""}
                </h2>
                <p className="text-sm text-gray-700 mb-1">
                  📞 {item.telephone || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  📋 Statut Suivis : {item.statut_suivis || "—"}
                </p>

                <button
                  onClick={() => setPopupMember(isOpen ? null : item)}
                  className="text-orange-500 underline text-sm mt-1"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
                    <p>📌 Prénom : {item.prenom}</p>
                    <p>📞 Téléphone : {item.telephone || "—"}</p>
                    <p>🏙 Ville : {item.ville || "—"}</p>
                    <p>🕊 Statut : {item.statut || "—"}</p>
                    <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                    <p>❓Besoin : {item.besoin || "—"}</p>
                    <p>📝 Infos : {item.infos_supplementaires || "—"}</p>

                    <label className="text-black text-sm">📋 Statut Suivis :</label>
                    <select
                      value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                    >
                      <option value="">—</option>
                      <option value="1">Nouveau</option>
                      <option value="2">En Suivi</option>
                      <option value="3">Intégré</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === VUE TABLE === */}
      {view === "table" && (
        <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-tr-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {suivis.map((m) => {
                const isOpen = popupMember?.id === m.id;
                return (
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
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setPopupMember(isOpen ? null : m)}
                          className="text-orange-500 underline text-sm"
                        >
                          {isOpen ? "Fermer détails" : "Détails"}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={4} className="bg-white text-gray-800 p-4">
                          <div className="text-sm space-y-2">
                            <p>📞 Téléphone : {m.telephone || "—"}</p>
                            <p>🏙 Ville : {m.ville || "—"}</p>
                            <p>🕊 Statut : {m.statut || "—"}</p>
                            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
                            <p>❓Besoin : {m.besoin || "—"}</p>
                            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

                            <label className="text-black text-sm">📋 Statut Suivis :</label>
                            <select
                              value={statusChanges[m.id] ?? m.statut_suivis ?? ""}
                              onChange={(e) => handleStatusChange(m.id, e.target.value)}
                              className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                            >
                              <option value="">—</option>
                              <option value="1">Nouveau</option>
                              <option value="2">En Suivi</option>
                              <option value="3">Intégré</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
