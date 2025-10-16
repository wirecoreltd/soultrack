// pages/list-members.js
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
  const [popupMember, setPopupMember] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

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

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const nouveaux = members.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciens = members.filter(
    (m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"
  );

  const allMembersOrdered = [...nouveaux, ...anciens];

  const statusOptions = [
    "actif",
    "Integrer",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const filteredMembers = allMembersOrdered.filter((m) => {
    const matchFilter = filter ? m.statut === filter : true;
    const matchSearch = search
      ? `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchFilter && matchSearch;
  });

  const nouveauxFiltres = filteredMembers.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciensFiltres = filteredMembers.filter(
    (m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"
  );

  const totalCount = filteredMembers.length;

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

      {/* Filtre + recherche */}
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
            placeholder="🔍 Rechercher par nom..."
            className="px-3 py-2 rounded-lg border text-sm"
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

      {/* === TABLE VIEW === */}
      {view === "table" ? (
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200 bg-white rounded-xl shadow-lg p-3">
          <table className="w-full text-sm text-left text-gray-700 border-separate border-spacing-0">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>

            <tbody>
              {/* Section nouveaux */}
              {nouveauxFiltres.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan="4"
                      className="text-pink-600 font-semibold py-2 text-center"
                    >
                      💖 Bien aimé venu le{" "}
                      {formatDate(nouveauxFiltres[0].created_at)}
                    </td>
                  </tr>

                  {nouveauxFiltres.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b hover:bg-gray-50 transition duration-150"
                    >
                      <td
                        className="px-4 py-2 border-l-4 rounded-l-md"
                        style={{ borderLeftColor: getBorderColor(m) }}
                      >
                        {m.prenom} {m.nom}
                      </td>
                      <td className="px-4 py-2">{m.telephone}</td>
                      <td className="px-4 py-2">
                        <select
                          value={m.statut}
                          onChange={(e) =>
                            handleChangeStatus(m.id, e.target.value)
                          }
                          className="border rounded-md px-2 py-1 text-sm w-full"
                        >
                          {statusOptions.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setPopupMember(m)}
                          className="text-blue-600 underline text-sm"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Section anciens */}
              {anciensFiltres.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan="4"
                      className="text-indigo-600 font-semibold py-3 text-center border-t"
                    >
                      Membres existants ————————————
                    </td>
                  </tr>

                  {anciensFiltres.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b hover:bg-gray-50 transition duration-150"
                    >
                      <td
                        className="px-4 py-2 border-l-4 rounded-l-md"
                        style={{ borderLeftColor: getBorderColor(m) }}
                      >
                        {m.prenom} {m.nom}
                      </td>
                      <td className="px-4 py-2">{m.telephone}</td>
                      <td className="px-4 py-2">
                        <select
                          value={m.statut}
                          onChange={(e) =>
                            handleChangeStatus(m.id, e.target.value)
                          }
                          className="border rounded-md px-2 py-1 text-sm w-full"
                        >
                          {statusOptions.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setPopupMember(m)}
                          className="text-blue-600 underline text-sm"
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
        // 🟢 la vue carte reste inchangée
        <></>
      )}

      {/* ✅ Popup Détails identique à la carte */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setPopupMember(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-2 text-indigo-700">
              {popupMember.prenom} {popupMember.nom}
            </h2>
            <p className="text-gray-700 text-sm mb-1">
              📱 {popupMember.telephone || "—"}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Statut :
              <select
                value={popupMember.statut}
                onChange={(e) =>
                  handleChangeStatus(popupMember.id, e.target.value)
                }
                className="ml-2 border rounded-md px-2 py-1 text-sm"
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Besoin : {popupMember.besoin || "—"}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Infos : {popupMember.infos_supplementaires || "—"}
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Comment venu : {popupMember.comment || "—"}
            </p>

            <p className="text-green-600 font-semibold mt-2">Cellule :</p>
            <select
              value={selectedCellules[popupMember.id] || ""}
              onChange={(e) =>
                setSelectedCellules((prev) => ({
                  ...prev,
                  [popupMember.id]: e.target.value,
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

            {selectedCellules[popupMember.id] && (
              <div className="mt-3">
                <BoutonEnvoyer
                  membre={popupMember}
                  cellule={cellules.find(
                    (c) => String(c.id) === String(selectedCellules[popupMember.id])
                  )}
                  onStatusUpdate={handleStatusUpdateFromEnvoyer}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
