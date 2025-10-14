// pages/list-members.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [view, setView] = useState("card");

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Erreur fetchMembers:", error.message);
    setMembers(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (error) console.error("Erreur fetchCellules:", error.message);
    setCellules(data || []);
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
      );
    } catch (err) {
      console.error("Erreur update statut:", err.message);
    }
  };

  const getBorderColor = (member) => {
    if (member.star) return "#FBC02D";
    if (member.statut === "actif") return "#4285F4";
    if (member.statut === "a déjà mon église") return "#EA4335";
    if (member.statut === "ancien") return "#999999";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur")
      return "#34A853";
    return "#ccc";
  };

  const filteredMembers = members.filter((m) => {
    if (!filter) return true;
    if (filter === "star") return m.star === true;
    return m.statut === filter;
  });

  const nouveaux = filteredMembers.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciens = filteredMembers.filter(
    (m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"
  );

  const statusOptions = [
    "actif",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <button
        onClick={() => window.history.back()}
        className="self-start mb-4 flex items-center text-white font-semibold hover:text-gray-200"
      >
        ← Retour
      </button>

      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        SoulTrack
      </h1>

      <p className="text-center text-white text-lg mb-2 font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
      </p>

      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* ✅ Filtres */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4 w-full max-w-md">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Filtrer par statut --</option>
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
          <option value="star">⭐ Star</option>
        </select>
        <span className="text-white italic text-opacity-80">
          Résultats: {filteredMembers.length}
        </span>
      </div>

      {/* === VUE CARTE === */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {[{ title: "🆕 Nouveaux contacts", list: nouveaux },
            { title: "👥 Membres existants", list: anciens }].map(
            ({ title, list }) =>
              list.length > 0 && (
                <div key={title}>
                  <p className="text-white mb-2 text-xl">{title}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4"
                        style={{ borderTopColor: getBorderColor(member) }}
                      >
                        <h2 className="text-lg font-bold text-gray-800 mb-1 flex justify-between items-center">
                          <span>
                            {member.prenom} {member.nom}
                          </span>
                          {(member.statut === "visiteur" ||
                            member.statut === "veut rejoindre ICC") && (
                            <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </h2>
                        <p className="text-sm text-gray-600 mb-1">
                          📱 {member.telephone || "—"}
                        </p>

                        {/* 🔽 Sélecteur de statut */}
                        <select
                          value={member.statut}
                          onChange={(e) =>
                            handleChangeStatus(member.id, e.target.value)
                          }
                          className="border rounded-md px-2 py-1 text-sm text-gray-700 w-full mb-1"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        {/* 🔽 Détails */}
                        <p
                          className="text-blue-500 underline cursor-pointer text-sm"
                          onClick={() =>
                            setDetailsOpen((prev) => ({
                              ...prev,
                              [member.id]: !prev[member.id],
                            }))
                          }
                        >
                          {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                        </p>

                        {detailsOpen[member.id] && (
                          <div className="mt-2 text-sm text-gray-700 space-y-1">
                            <p>Besoin : {member.besoin || "—"}</p>
                            <p>Infos : {member.infos_supplementaires || "—"}</p>
                            <p>Comment venu : {member.comment || "—"}</p>
                            <p className="text-green-600 font-semibold">Cellule :</p>
                            <select
                              value={selectedCellules[member.id] || ""}
                              onChange={(e) =>
                                setSelectedCellules((prev) => ({
                                  ...prev,
                                  [member.id]: e.target.value,
                                }))
                              }
                              className="border rounded-lg px-2 py-1 text-sm w-full"
                            >
                              <option value="">-- Sélectionner cellule --</option>
                              {cellules.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.cellule} ({c.responsable})
                                </option>
                              ))}
                            </select>

                            {selectedCellules[member.id] && (
                              <BoutonEnvoyer
                                membre={member}
                                cellule={cellules.find(
                                  (c) =>
                                    String(c.id) ===
                                    String(selectedCellules[member.id])
                                )}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      ) : (
        /* === VUE TABLE === */
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold">{m.nom}</td>
                  <td className="px-4 py-2">{m.prenom}</td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">
                    <select
                      value={m.statut}
                      onChange={(e) =>
                        handleChangeStatus(m.id, e.target.value)
                      }
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        setDetailsOpen((prev) => ({
                          ...prev,
                          [m.id]: !prev[m.id],
                        }))
                      }
                      className="text-blue-600 underline text-sm"
                    >
                      {detailsOpen[m.id] ? "Fermer" : "Détails"}
                    </button>

                    {detailsOpen[m.id] && (
                      <div className="mt-2 text-gray-700 text-xs space-y-1">
                        <p>Besoin : {m.besoin || "—"}</p>
                        <p>Infos : {m.infos_supplementaires || "—"}</p>
                        <p>Comment venu : {m.comment || "—"}</p>
                        <select
                          value={selectedCellules[m.id] || ""}
                          onChange={(e) =>
                            setSelectedCellules((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                          className="border rounded-md px-2 py-1 text-sm w-full"
                        >
                          <option value="">-- Sélectionner cellule --</option>
                          {cellules.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.cellule} ({c.responsable})
                            </option>
                          ))}
                        </select>

                        {selectedCellules[m.id] && (
                          <BoutonEnvoyer
                            membre={m}
                            cellule={cellules.find(
                              (c) =>
                                String(c.id) === String(selectedCellules[m.id])
                            )}
                          />
                        )}
                      </div>
                    )}
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

