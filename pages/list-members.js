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
  const [view, setView] = useState("card");
  const [popupMember, setPopupMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMembers(data);
  };

  const handleChangeStatus = async (id, newStatus) => {
    await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
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

  const filterBySearch = (list) =>
    list.filter((m) =>
      `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase())
    );

  const filteredMembers = filterBySearch(
    filter
      ? [...nouveaux, ...anciens].filter((m) => m.statut === filter)
      : [...nouveaux, ...anciens]
  );

  const statusOptions = [
    "actif",
    "Integrer",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

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

      {/* Barre de filtres */}
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
        </div>

        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-white text-sm underline hover:text-gray-200"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* === VUE CARTE === */}
      {view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition duration-200 border-l-4"
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

              <p className="text-sm text-gray-600 mb-1">
                📱 {m.telephone || "—"}
              </p>

              {/* 🏠 Ajout 1 - Intégré à la cellule */}
              {m.sent_to_cellule && (
                <p className="text-sm text-green-700 font-semibold mb-1">
                  🏠 Intégré à la cellule : {m.sent_to_cellule}
                </p>
              )}

              <select
                value={m.statut}
                onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full"
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <p
                className="text-blue-500 underline cursor-pointer text-sm"
                onClick={() => setPopupMember(m)}
              >
                Détails
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* === VUE TABLE === */
        <table className="bg-white w-full max-w-5xl rounded-xl shadow-md overflow-hidden text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Téléphone</th>
              <th className="px-4 py-2">Cellule</th> {/* 🏠 Ajout 2 */}
              <th className="px-4 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">
                  {m.prenom} {m.nom}
                </td>
                <td className="px-4 py-2">{m.telephone}</td>
                <td className="px-4 py-2">
                  {m.sent_to_cellule ? `🏠 ${m.sent_to_cellule}` : "—"}
                </td>
                <td className="px-4 py-2">{m.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* === POPUP DÉTAILS === */}
      {popupMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setPopupMember(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-2 text-indigo-700">
              {popupMember.prenom} {popupMember.nom}
            </h2>
            <p className="text-gray-700 text-sm mb-1">
              📱 {popupMember.telephone || "—"}
            </p>

            {/* 🏠 Ajout 3 - Intégré à la cellule */}
            {popupMember.sent_to_cellule && (
              <p className="text-sm text-green-700 font-semibold mb-2">
                🏠 Intégré à la cellule : {popupMember.sent_to_cellule}
              </p>
            )}

            <p className="text-gray-700 text-sm mb-2">
              ✉️ {popupMember.email || "—"}
            </p>
            <p className="text-gray-700 text-sm mb-2">
              🗓️ Ajouté le {formatDate(popupMember.created_at)}
            </p>
            <p className="text-gray-700 text-sm mb-4">
              🏷️ Statut :{" "}
              <span className="font-semibold">{popupMember.statut}</span>
            </p>

            <BoutonEnvoyer
              member={popupMember}
              onStatusUpdate={(id, newStatus) =>
                setMembers((prev) =>
                  prev.map((m) =>
                    m.id === id ? { ...m, statut: newStatus } : m
                  )
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
