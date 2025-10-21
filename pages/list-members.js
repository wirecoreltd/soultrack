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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMembers(data);
    else setMembers([]);
    setLoading(false);
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

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

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

  const nouveauxFiltres = filterBySearch(
    filter ? nouveaux.filter((m) => m.statut === filter) : nouveaux
  );
  const anciensFiltres = filterBySearch(
    filter ? anciens.filter((m) => m.statut === filter) : anciens
  );

  const totalCount = filterBySearch([...nouveaux, ...anciens]).length;

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

      {/* === VUE CARTE === */}
      {view === "card" && (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...nouveauxFiltres, ...anciensFiltres].map((m) => {
            const isOpen = detailsOpen[m.id];
            const isNew =
              m.statut?.toLowerCase() === "visiteur" ||
              m.statut?.toLowerCase() === "veut rejoindre icc";
            return (
              <div
                key={m.id}
                className="relative bg-white rounded-2xl shadow-lg flex flex-col w-full transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                {/* Bande colorée */}
                <div
                  className="w-full h-[6px] rounded-t-2xl"
                  style={{ backgroundColor: getBorderColor(m) }}
                />
                {/* Tag Nouveau */}
                {isNew && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    Nouveau
                  </span>
                )}

                <div className="p-2 flex flex-col items-center">
                  <div className="font-bold text-black text-base text-center mb-0.5">
                    {m.prenom} {m.nom}
                  </div>
                  <p className="text-gray-700 mb-0.5 text-sm">📱 {m.telephone || "—"}</p>
                  <p className="text-gray-700 mb-0.5 text-sm">🕊 Statut : {m.statut || "—"}</p>

                  <button
                    onClick={() => toggleDetails(m.id)}
                    className="text-orange-500 underline text-xs mt-1"
                  >
                    {isOpen ? "Fermer détails" : "Détails"}
                  </button>

                  {/* Détails avec select de statut */}
                  {isOpen && (
                    <div className="text-gray-700 text-sm mt-2 space-y-1.5 w-full">
                      <p>Besoin : {m.besoin || "—"}</p>
                      <p>Infos : {m.infos_supplementaires || "—"}</p>
                      <p>Comment venu : {m.comment || "—"}</p>

                      <label className="text-black font-semibold mt-1 text-sm">
                        Statut :
                      </label>
                      <select
                        value={m.statut}
                        onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm w-full"
                      >
                        {statusOptions.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>

                      <p className="text-green-600 font-semibold mt-2">Cellule :</p>
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
                              (c) => String(c.id) === String(selectedCellules[m.id])
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === VUE TABLE === */}
      {view === "table" && (
        <div className="w-full max-w-5xl overflow-x-auto transition duration-200">
          {/* ton code table inchangé */}
        </div>
      )}

      {/* Popup détails table */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-200">
          {/* ton popup inchangé */}
        </div>
      )}
    </div>
  );
}
