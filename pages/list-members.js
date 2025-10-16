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

  const filterBySearch = (list) =>
    list.filter((m) =>
      `${(m.prenom || "")} ${(m.nom || "")}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const nouveaux = filterBySearch(
    members.filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC")
  );
  const anciens = filterBySearch(
    members.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC")
  );

  const totalCount = nouveaux.length + anciens.length;

  // === COMPOSANT POPUP ===
  const PopupDetails = ({ member }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={() => setPopupMember(null)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>
        <h2 className="text-xl font-bold mb-2 text-indigo-700">
          {member.prenom} {member.nom}
        </h2>
        <p className="text-gray-700 text-sm mb-1">📱 {member.telephone || "—"}</p>
        <p className="text-sm text-gray-700 mb-2">
          Statut :
          <select
            value={member.statut}
            onChange={(e) => handleChangeStatus(member.id, e.target.value)}
            className="ml-2 border rounded-md px-2 py-1 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </p>
        <p className="text-sm text-gray-700 mb-1">Besoin : {member.besoin || "—"}</p>
        <p className="text-sm text-gray-700 mb-1">Infos : {member.infos_supplementaires || "—"}</p>
        <p className="text-sm text-gray-700 mb-3">Comment venu : {member.comment || "—"}</p>

        <p className="text-green-600 font-semibold mt-2">Cellule :</p>
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
          <div className="mt-3">
            <BoutonEnvoyer
              membre={member}
              cellule={cellules.find(
                (c) => String(c.id) === String(selectedCellules[member.id])
              )}
              onStatusUpdate={handleStatusUpdateFromEnvoyer}
            />
          </div>
        )}
      </div>
    </div>
  );

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
            className="px-3 py-2 rounded-lg border text-sm text-black"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm text-black"
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

      {/* === VUE CARTE === */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8 transition-all duration-200">
          {/* Nouveaux */}
          {nouveaux.length > 0 && (
            <div>
              <p className="text-white text-lg mb-2 ml-1">
                💖 Bien aimé venu le {formatDate(nouveaux[0].created_at)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveaux.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition duration-200 border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold" style={{ color: getBorderColor(m) }}>
                        {m.star ? "⭐ S.T.A.R" : m.statut}
                      </span>
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">
                        Nouveau
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">{m.prenom} {m.nom}</div>
                    <p className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</p>
                    <select
                      value={m.statut}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <p className="text-blue-500 underline cursor-pointer text-sm" onClick={() => setPopupMember(m)}>
                      Détails
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Membres existants */}
          {anciens.length > 0 && (
            <div className="mt-6">
              <p className="text-white text-lg mb-2 ml-1">Membres existants</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anciens.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition duration-200 border-l-4"
                    style={{ borderLeftColor: getBorderColor(m) }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold" style={{ color: getBorderColor(m) }}>
                        {m.star ? "⭐ S.T.A.R" : m.statut}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">{m.prenom} {m.nom}</div>
                    <p className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</p>
                    <select
                      value={m.statut}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2 w-full"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <p className="text-blue-500 underline cursor-pointer text-sm" onClick={() => setPopupMember(m)}>
                      Détails
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === VUE TABLE === */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
          <table className="w-full text-sm text-left text-white border-separate border-spacing-0">
            <thead className="bg-indigo-600 text-white text-sm uppercase rounded-t-md">
              <tr>
                <th className="px-4 py-2">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-blue-300 hover:bg-white/10 transition duration-150">
                  <td className="px-4 py-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                    {m.prenom} {m.nom}
                    {(m.statut === "visiteur" || m.statut === "veut rejoindre ICC") && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Nouveau
                      </span>
                    )}
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
                      className="text-blue-200 underline text-sm"
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

      {popupMember && <PopupDetails member={popupMember} />}
    </div>
  );
}
