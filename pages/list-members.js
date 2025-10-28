//list-members.js

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
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null); // gardé pour compatibilité si besoin
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession();
    fetchMembers();
    fetchCellules();
  }, []);

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data?.session || null);
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMembers(data);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (!error && data) setCellules(data);
  };

  const handleChangeStatus = async (id, newStatus) => {
    await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  const handleStatusUpdateFromEnvoyer = (id, currentStatus) => {
    if (currentStatus === "visiteur" || currentStatus === "veut rejoindre ICC") {
      handleChangeStatus(id, "actif");
    }
  };

  const getBorderColor = (m) => {
    if (m.star) return "#FBC02D";
    if (m.statut === "actif") return "#4285F4";
    if (m.statut === "a déjà mon église") return "#EA4335";
    if (m.statut === "Integrer") return "#FFA500";
    if (m.statut === "ancien") return "#999999";
    if (m.statut === "veut rejoindre ICC" || m.statut === "visiteur")
      return "#34A853";
    return "#ccc";
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  const filterBySearch = (list) =>
    list.filter((m) =>
      `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase())
    );

  const nouveaux = members.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciens = members.filter(
    (m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"
  );

  const nouveauxFiltres = filterBySearch(
    filter ? nouveaux.filter((m) => m.statut === filter) : nouveaux
  );
  const anciensFiltres = filterBySearch(
    filter ? anciens.filter((m) => m.statut === filter) : anciens
  );

  const allMembersOrdered = [...nouveaux, ...anciens];
  const filteredMembers = filterBySearch(
    filter ? allMembersOrdered.filter((m) => m.statut === filter) : allMembersOrdered
  );

  const statusOptions = [
    "actif",
    "Integrer",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const totalCount = filteredMembers.length;

  // ---------- helper pour toggle expansion des cards ----------
  const toggleCard = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---------- rendu ----------
  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Header */}
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      {/* Logo */}
      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-3">
        SoulTrack
      </h1>
      <p className="text-center text-white text-lg mb-2 font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
      </p>

      {/* Filtre + recherche + compteur + toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mb-4">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom..."
            className="px-3 py-2 rounded-lg border text-sm w-48"
          />

          <span className="text-white text-sm">({totalCount})</span>
        </div>

        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* === VUE CARTE (MODIFIÉE : cartes compactes + agrandissement dans la grille) === */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8 transition-all duration-200">
          {nouveauxFiltres.length > 0 && (
            <div>
              <p className="text-white text-lg mb-2 ml-1">
                💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
              </p>

              {/* grille compacte, cards "grow" when expanded */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveauxFiltres.map((m) => {
                  const isOpen = !!detailsOpen[m.id];
                  return (
                    <article
                      key={m.id}
                      className={`bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden cursor-pointer transform ${
                        isOpen ? "lg:col-span-2 sm:col-span-2 scale-100" : ""
                      }`}
                      style={{
                        borderTop: `6px solid ${getBorderColor(m)}`,
                        padding: isOpen ? "16px" : "12px",
                      }}
                      onClick={() => toggleCard(m.id)}
                      role="button"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{m.star ? "⭐" : "👤"}</div>
                            <div>
                              <div className="text-md font-semibold text-gray-800">
                                {m.prenom} {m.nom}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {m.statut || "—"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full">
                            Nouveau
                          </div>
                          <div className="text-sm text-gray-500 mt-2 underline">Détails ▾</div>
                        </div>
                      </div>

                      {/* Compact info row */}
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <div>📱 {m.telephone || "—"}</div>
                        <div>{m.ville || "—"}</div>
                      </div>

                      {/* Expanded content (apparaît quand la carte est agrandie) */}
                      {isOpen && (
                        <div className="mt-3 text-gray-700 text-sm space-y-3">
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500">Statut</label>
                              <select
                                value={m.statut}
                                onChange={(e) => {
                                  // empêcher propagation du click sur la carte
                                  e.stopPropagation();
                                  handleChangeStatus(m.id, e.target.value);
                                }}
                                className="mt-1 w-full border rounded-md px-2 py-1 text-sm text-gray-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {statusOptions.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500">Besoin</label>
                              <div className="mt-1 text-sm text-gray-700">{m.besoin || "—"}</div>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500">Infos supplémentaires</label>
                              <div className="mt-1 text-sm text-gray-700">
                                {m.infos_supplementaires || "—"}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500">Comment venu</label>
                              <div className="mt-1 text-sm text-gray-700">{m.venu || "—"}</div>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500">Cellule</label>
                              <select
                                value={selectedCellules[m.id] || ""}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setSelectedCellules((prev) => ({
                                    ...prev,
                                    [m.id]: e.target.value,
                                  }));
                                }}
                                className="mt-1 w-full border rounded-md px-2 py-1 text-sm text-gray-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="">-- Sélectionner cellule --</option>
                                {cellules.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.cellule} ({c.responsable})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {selectedCellules[m.id] && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <BoutonEnvoyer
                                  membre={m}
                                  cellule={cellules.find(
                                    (c) => c.id === selectedCellules[m.id]
                                  )}
                                  onStatusUpdate={handleStatusUpdateFromEnvoyer}
                                  session={session}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {anciensFiltres.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white text-lg mb-2 font-semibold">
                <span
                  style={{
                    background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Membres existants
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anciensFiltres.map((m) => {
                  const isOpen = !!detailsOpen[m.id];
                  return (
                    <article
                      key={m.id}
                      className={`bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden cursor-pointer transform ${
                        isOpen ? "lg:col-span-2 sm:col-span-2 scale-100" : ""
                      }`}
                      style={{
                        borderTop: `6px solid ${getBorderColor(m)}`,
                        padding: isOpen ? "16px" : "12px",
                      }}
                      onClick={() => toggleCard(m.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{m.star ? "⭐" : "👥"}</div>
                            <div>
                              <div className="text-md font-semibold text-gray-800">
                                {m.prenom} {m.nom}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {m.statut || "—"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="text-sm text-gray-500 mt-2 underline">Détails ▾</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <div>📱 {m.telephone || "—"}</div>
                        <div>{m.ville || "—"}</div>
                      </div>

                      {isOpen && (
                        <div className="mt-3 text-gray-700 text-sm space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500">Statut</label>
                            <select
                              value={m.statut}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleChangeStatus(m.id, e.target.value);
                              }}
                              className="mt-1 w-full border rounded-md px-2 py-1 text-sm text-gray-800"
                            >
                              {statusOptions.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500">Besoin</label>
                            <div className="mt-1 text-sm text-gray-700">{m.besoin || "—"}</div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500">Infos supplémentaires</label>
                            <div className="mt-1 text-sm text-gray-700">
                              {m.infos_supplementaires || "—"}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500">Comment venu</label>
                            <div className="mt-1 text-sm text-gray-700">{m.venu || "—"}</div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500">Cellule</label>
                            <select
                              value={selectedCellules[m.id] || ""}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedCellules((prev) => ({
                                  ...prev,
                                  [m.id]: e.target.value,
                                }));
                              }}
                              className="mt-1 w-full border rounded-md px-2 py-1 text-sm text-gray-800"
                            >
                              <option value="">-- Sélectionner cellule --</option>
                              {cellules.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.cellule} ({c.responsable})
                                </option>
                              ))}
                            </select>
                          </div>

                          {selectedCellules[m.id] && (
                            <div>
                              <BoutonEnvoyer
                                membre={m}
                                cellule={cellules.find(
                                  (c) => c.id === selectedCellules[m.id]
                                )}
                                onStatusUpdate={handleStatusUpdateFromEnvoyer}
                                session={session}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === VUE TABLE === */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-gray-800 text-sm uppercase rounded-t-lg">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 rounded-r-lg">Détails</th>
              </tr>
            </thead>
            <tbody>
              {nouveauxFiltres.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-white font-semibold">
                    💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
                  </td>
                </tr>
              )}

              {nouveauxFiltres.map((m, index) => (
                <tr
                  key={m.id}
                  className={`${
                    index < nouveauxFiltres.length - 1 ? "border-b border-gray-400" : ""
                  } hover:bg-white/10 transition duration-150`}
                >
                  <td
                    className="px-4 py-2 border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    {m.prenom} {m.nom}{" "}
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      Nouveau
                    </span>
                  </td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">
                    <select
                      value={m.statut}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm w-full text-gray-800"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(m)}
                      className="text-orange-400 underline text-sm"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}

              {anciensFiltres.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 font-semibold">
                    <span
                      style={{
                        background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        fontWeight: "bold",
                      }}
                    >
                      Membres existants ______________________________________________________
                    </span>
                  </td>
                </tr>
              )}

              {anciensFiltres.map((m, index) => (
                <tr
                  key={m.id}
                  className={`${
                    index < anciensFiltres.length - 1 ? "border-b border-gray-400" : ""
                  } hover:bg-white/10 transition duration-150`}
                >
                  <td
                    className="px-4 py-2 border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    {m.prenom} {m.nom}
                  </td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">
                    <select
                      value={m.statut}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm w-full text-gray-800"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setPopupMember(m)}
                      className="text-orange-400 underline text-sm"
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

      {/* ✅ Note : la popup a été remplacée par l'agrandissement des cartes.
          Je garde l'état popupMember (inutilisé maintenant) si tu veux revenir au comportement antérieur. */}
    </div>
  );
}
