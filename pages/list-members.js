// ✅ pages/list-members.js

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
      return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr });
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

  const statusOptions = [
    "actif",
    "Integrer",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const totalCount = filterBySearch(members).length;

  const toggleDetails = (id) => {
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Header */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            ← Retour
          </button>
          <LogoutLink />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">
            👋 Bienvenue {session?.user?.user_metadata?.prenom || "Utilisateur"}
          </p>
        </div>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} className="mx-auto" />
      </div>

      {/* Titre */}
      <div className="text-center mb-6">
        <h1 className="text-5xl sm:text-6xl font-handwriting text-white mb-2">SoulTrack</h1>
        <p className="text-white text-lg max-w-xl mx-auto italic">
          Chaque personne a une valeur infinie. Ensemble, nous avançons ❤️
        </p>
      </div>

      {/* Controls */}
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

      {/* Vue Carte */}
      {view === "card" && (
        <div className="w-full max-w-5xl space-y-8 transition-all duration-200">
          {/* Nouveaux Membres */}
          {nouveauxFiltres.length > 0 && (
            <div>
              <p className="text-white text-lg mb-2 ml-1">
                💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveauxFiltres.map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    detailsOpen={detailsOpen[m.id]}
                    toggleDetails={toggleDetails}
                    cellules={cellules}
                    selectedCellules={selectedCellules}
                    setSelectedCellules={setSelectedCellules}
                    handleChangeStatus={handleChangeStatus}
                    handleStatusUpdateFromEnvoyer={handleStatusUpdateFromEnvoyer}
                    session={session}
                    getBorderColor={getBorderColor}
                    statusOptions={statusOptions}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Membres existants */}
          {anciensFiltres.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white text-lg mb-3 font-semibold">
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
                {anciensFiltres.map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    detailsOpen={detailsOpen[m.id]}
                    toggleDetails={toggleDetails}
                    cellules={cellules}
                    selectedCellules={selectedCellules}
                    setSelectedCellules={setSelectedCellules}
                    handleChangeStatus={handleChangeStatus}
                    handleStatusUpdateFromEnvoyer={handleStatusUpdateFromEnvoyer}
                    session={session}
                    getBorderColor={getBorderColor}
                    statusOptions={statusOptions}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Table */}
      {view === "table" && (
        <MemberTable
          nouveauxFiltres={nouveauxFiltres}
          anciensFiltres={anciensFiltres}
          detailsOpen={detailsOpen}
          toggleDetails={toggleDetails}
          selectedCellules={selectedCellules}
          setSelectedCellules={setSelectedCellules}
          handleChangeStatus={handleChangeStatus}
          handleStatusUpdateFromEnvoyer={handleStatusUpdateFromEnvoyer}
          cellules={cellules}
          session={session}
          getBorderColor={getBorderColor}
          statusOptions={statusOptions}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

const MemberCard = ({
  member: m,
  detailsOpen,
  toggleDetails,
  cellules,
  selectedCellules,
  setSelectedCellules,
  handleChangeStatus,
  handleStatusUpdateFromEnvoyer,
  session,
  getBorderColor,
  statusOptions,
}) => {
  const isNew = m.statut === "visiteur" || m.statut === "veut rejoindre ICC";
  return (
    <div
      className="bg-white p-3 rounded-xl shadow-md border-l-4 transition duration-200 overflow-hidden relative"
      style={{ borderLeftColor: getBorderColor(m) }}
    >
      {isNew && (
        <span className="absolute top-3 right-[-25px] bg-blue-600 text-white text-[10px] font-bold px-6 py-1 rotate-45 shadow-md">
          Nouveau
        </span>
      )}
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold text-gray-800 text-center">
          {m.prenom} {m.nom}
          {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
        </h2>
        <p className="text-sm text-gray-600 mb-2 text-center">📱 {m.telephone || "—"}</p>
        <p className="text-sm text-gray-600 mb-2 text-center">🕊 Statut : {m.statut || "—"}</p>

        <button onClick={() => toggleDetails(m.id)} className="text-orange-500 underline text-sm">
          {detailsOpen ? "Fermer détails" : "Détails"}
        </button>

        {detailsOpen && (
          <div className="text-gray-700 text-sm mt-2 space-y-2 w-full">
            <p>💬 WhatsApp : {m.is_whatsapp || "—"}</p>
            <p>🏙 Ville : {m.ville || "—"}</p>
            <p>🧩 Comment est-il venu : {m.venu || "—"}</p>
            <p>❓Besoin : {m.besoin || "—"}</p>
            <p>📝 Infos : {m.infos_supplementaires || "—"}</p>

            <p className="mt-2 font-semibold text-blue-600">Changer Statut :</p>
            <select
              value={m.statut}
              onChange={(e) => handleChangeStatus(m.id, e.target.value)}
              className="border rounded-md px-2 py-1 text-sm w-full"
            >
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <p className="mt-2 font-semibold text-green-600">Cellule :</p>
            <select
              value={selectedCellules[m.id] || ""}
              onChange={(e) =>
                setSelectedCellules((prev) => ({ ...prev, [m.id]: e.target.value }))
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
                  cellule={cellules.find((c) => c.id === selectedCellules[m.id])}
                  onStatusUpdate={handleStatusUpdateFromEnvoyer}
                  session={session}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

