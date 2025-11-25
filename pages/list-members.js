"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedTargetType, setSelectedTargetType] = useState({});
  const [selectedTargets, setSelectedTargets] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [statusChanges, setStatusChanges] = useState({});

  const statusOptions = ["actif", "ancien", "visiteur", "veut rejoindre ICC", "a déjà son église"];

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 3500);
  };

  useEffect(() => {
    fetchMembers();
    fetchCellules();
    fetchConseillers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select(`
        *,
        cellules:cellule_id(cellule,responsable),
        conseiller:conseiller_id(prenom,nom)
      `)
      .order("created_at", { ascending: false });

    if (error) console.error("Erreur members:", error);
    else {
      console.log("Members récupérés:", data);
      setMembers(data || []);
    }
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase.from("cellules").select("id, cellule, responsable");
    if (error) console.error("Erreur cellules:", error);
    else {
      console.log("Cellules récupérées:", data);
      setCellules(data || []);
    }
  };

  const fetchConseillers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("role", "Conseiller");
    if (error) console.error("Erreur conseillers:", error);
    else {
      console.log("Conseillers récupérés:", data);
      setConseillers(data || []);
    }
  };

  const toggleDetails = (id) => setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = (memberId, value) => {
    setStatusChanges((prev) => ({ ...prev, [memberId]: value }));
  };

  const handleAfterSend = (memberId, type, cible) => {
    const update = {};
    if (type === "cellule") update.cellules = { cellule: cible.cellule, responsable: cible.responsable };
    if (type === "conseiller") update.conseiller = { prenom: cible.prenom, nom: cible.nom };
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, ...update } : m)));
    showToast("✅ Contact envoyé");
  };

  const filteredMembers = members.filter(
    (m) =>
      `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? m.statut === filter : true)
  );

  const getBorderColor = (m) => {
    if (m.statut === "actif") return "#4285F4";
    if (m.statut === "a déjà son église") return "#f21705";
    if (m.statut === "ancien") return "#999999";
    if (m.statut === "visiteur" || m.statut === "veut rejoindre ICC") return "#34A853";
    return "#ccc";
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-purple-700 to-blue-400 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Liste des Membres</h1>
          <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg" />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 rounded text-black"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1 rounded text-black"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Debug JSON */}
        <pre className="text-black bg-white p-2 mb-4 rounded">
          {JSON.stringify({ members, cellules, conseillers }, null, 2)}
        </pre>

        {/* Cartes Membres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => {
            const isOpen = detailsOpen[m.id];
            return (
              <div
                key={m.id}
                className="bg-white text-black p-4 rounded shadow border-l-4"
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <h2 className="font-bold text-lg">{m.prenom} {m.nom}</h2>
                <p>📱 {m.telephone || "—"}</p>
                <p>👥 Cellule : {m.cellules?.cellule || "—"}</p>
                <p>🧑‍💼 Conseiller : {m.conseiller ? `${m.conseiller.prenom} ${m.conseiller.nom}` : "—"}</p>

                <button
                  onClick={() => toggleDetails(m.id)}
                  className="mt-2 underline text-blue-700"
                >
                  {isOpen ? "Fermer détails" : "Détails"}
                </button>

                {isOpen && (
                  <div className="mt-2">
                    <label>Envoyer à :</label>
                    <select
                      value={selectedTargetType[m.id] || ""}
                      onChange={(e) =>
                        setSelectedTargetType((prev) => ({ ...prev, [m.id]: e.target.value }))
                      }
                      className="block mt-1 w-full"
                    >
                      <option value="">-- Choisir --</option>
                      <option value="cellule">Cellule</option>
                      <option value="conseiller">Conseiller</option>
                    </select>

                    {selectedTargetType[m.id] && (
                      <select
                        value={selectedTargets[m.id] || ""}
                        onChange={(e) =>
                          setSelectedTargets((prev) => ({ ...prev, [m.id]: e.target.value }))
                        }
                        className="block mt-1 w-full"
                      >
                        <option value="">-- Choisir --</option>
                        {selectedTargetType[m.id] === "cellule"
                          ? cellules.map((c) => (
                              <option key={c.id} value={c.id.toString()}>
                                {c.cellule} ({c.responsable})
                              </option>
                            ))
                          : conseillers.map((c) => (
                              <option key={c.id} value={c.id.toString()}>
                                {c.prenom} {c.nom}
                              </option>
                            ))}
                      </select>
                    )}

                    {selectedTargets[m.id] && (
                      <button
                        onClick={() =>
                          handleAfterSend(
                            m.id,
                            selectedTargetType[m.id],
                            selectedTargetType[m.id] === "cellule"
                              ? cellules.find((c) => c.id.toString() === selectedTargets[m.id])
                              : conseillers.find((c) => c.id.toString() === selectedTargets[m.id])
                          )
                        }
                        className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Envoyer
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showingToast && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
