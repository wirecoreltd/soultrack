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

  const statusOptions = [
    "actif",
    "Integrer",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  // ✅ Filtrage et recherche combinés
  const filteredMembers = members
    .filter((m) => (filter ? m.statut === filter : true))
    .filter(
      (m) =>
        `${m.prenom} ${m.nom}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
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

      {/* Filtre + recherche + compteur + toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
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
            placeholder="Rechercher un nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {/* === Vue Carte === */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
          {filteredMembers.map((m) => {
            const open = detailsOpen[m.id];
            return (
              <div
                key={m.id}
                onClick={() => toggleDetails(m.id)}
                className={`bg-white p-3 rounded-xl shadow-md border-l-4 transition-all duration-300 cursor-pointer ${
                  open ? "scale-105 shadow-2xl" : "hover:shadow-xl"
                }`}
                style={{ borderLeftColor: getBorderColor(m) }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: getBorderColor(m) }}
                  >
                    {m.star ? "⭐ S.T.A.R" : m.statut}
                  </span>
                </div>

                <div className="text-lg font-bold text-gray-800">
                  {m.prenom} {m.nom}
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  📱 {m.telephone || "—"}
                </p>

                {open && (
                  <div className="mt-2 text-sm text-gray-700 space-y-2">
                    <p>📅 Inscrit : {formatDate(m.created_at)}</p>
                    <p>🙏 Besoin : {m.besoin || "—"}</p>
                    <p>💬 Infos : {m.infos_supplementaires || "—"}</p>
                    <p>📍 Comment venu : {m.comment || "—"}</p>

                    <select
                      value={m.statut}
                      onChange={(e) =>
                        handleChangeStatus(m.id, e.target.value)
                      }
                      className="border rounded-md px-2 py-1 text-xs text-gray-700 w-full"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    <div>
                      <p className="font-semibold text-indigo-700 mt-2">
                        Cellule :
                      </p>
                      <select
                        value={selectedCellules[m.id] || ""}
                        onChange={(e) =>
                          setSelectedCellules((prev) => ({
                            ...prev,
                            [m.id]: e.target.value,
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
                      {selectedCellules[m.id] && (
                        <div className="mt-2">
                          <BoutonEnvoyer
                            membre={m}
                            cellule={cellules.find(
                              (c) =>
                                String(c.id) === String(selectedCellules[m.id])
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
          })}
        </div>
      ) : (
        // Vue Table
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-gray-700 border-separate border-spacing-0 rounded-md overflow-hidden shadow-lg bg-white">
            <thead className="bg-indigo-600 text-white text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr
                  key={m.id}
                  className="bg-white transition duration-200 rounded-lg mb-1"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
