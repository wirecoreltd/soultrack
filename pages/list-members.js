// pages/list-members.js

// pages/list-members.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
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
    try {
      const { data, error } = await supabase
        .from("membres")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Erreur fetchMembers:", err.message);
      setMembers([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase
        .from("cellules")
        .select("id, cellule, responsable, telephone");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
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

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    // mise à jour locale instantanée (utilisé par BoutonEnvoyer)
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  const getBorderColor = (memberOrStatus) => {
    // accepts either member object or raw status string
    const statut = typeof memberOrStatus === "string" ? memberOrStatus : memberOrStatus?.statut;
    if (memberOrStatus?.star) return "#FBC02D";
    if (statut === "actif") return "#4285F4";
    if (statut === "a déjà mon église") return "#EA4335";
    if (statut === "ancien") return "#999999";
    if (statut === "veut rejoindre ICC" || statut === "visiteur") return "#34A853";
    return "#ccc";
  };

  const statusOptions = [
    "actif",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const filteredMembers = members.filter((m) => {
    if (!filter) return true;
    if (filter === "star") return m.star === true;
    return m.statut === filter;
  });

  // ********** Nouveaux = visiteur || veut rejoindre ICC **********
  const nouveaux = filteredMembers.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  // Anciens = tout le reste
  const anciens = filteredMembers.filter(
    (m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"
  );

  // Pour la table : on veut les visiteurs en haut, puis les autres (sans perdre filter)
  const tableMembers = [
    ...filteredMembers
      .filter((m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"),
    ...filteredMembers.filter((m) => m.statut !== "visiteur" && m.statut !== "veut rejoindre ICC"),
  ];

  // Date format (native) — pour le titre global des Nouveaux (basé sur created_at le plus récent)
  const getFormattedDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const latestNewMember = nouveaux.length > 0 ? nouveaux[0] : null;
  const latestDateText = latestNewMember
    ? `💖 Bien aimé venu le ${getFormattedDate(latestNewMember.created_at)}`
    : null;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>

        {/* Logout bouton stylé (inchangé) */}
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

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

      {/* FILTRES */}
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

      {/* VUE CARTE */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {/* 1) titre global remplace "Nouveaux contacts" */}
          {latestDateText && (
            <p className="text-white mb-2 text-xl text-center">{latestDateText}</p>
          )}

          {/* Afficher d'abord la section Nouveaux (si existants) */}
          {nouveaux.length > 0 && (
            <div>
              {/* on conserve l'esprit: pas de texte "Nouveaux contacts" visible ici (remplacé par latestDateText) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveaux.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between relative"
                    style={{ borderTopColor: getBorderColor(member), borderTopWidth: 6, borderTopStyle: "solid" }}
                  >
                    {/* TAG "Nouveau" bleu pour visiteurs/veut rejoindre */}
                    {(member.statut === "visiteur" || member.statut === "veut rejoindre ICC") && (
                      <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Nouveau
                      </span>
                    )}

                    {/* Statut en texte (couleur = même que bord) en haut à gauche */}
                    <div className="absolute top-3 left-3 text-xs font-semibold" style={{ color: getBorderColor(member) }}>
                      {member.star ? "⭐ S.T.A.R" : member.statut || "—"}
                    </div>

                    {/* Nom (prénom / nom sur 2 lignes si besoin) */}
                    <h2 className="text-lg font-bold text-gray-800 mb-1 break-words">
                      <span className="block">{member.prenom}</span>
                      <span className="block">{member.nom}</span>
                    </h2>

                    {/* Téléphone + select statut (select placé à droite) */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">📱 {member.telephone || "—"}</p>
                      <select
                        value={member.statut}
                        onChange={(e) => handleChangeStatus(member.id, e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Détails */}
                    <p
                      className="mt-2 text-blue-500 underline cursor-pointer text-sm"
                      onClick={() => setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
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
                          onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [member.id]: e.target.value }))}
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
                            cellule={cellules.find((c) => String(c.id) === String(selectedCellules[member.id]))}
                            onStatusUpdate={handleStatusUpdateFromEnvoyer}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Membres existants (anciens) */}
          {anciens.length > 0 && (
            <div>
              <p className="text-white mb-2 text-xl">👥 Membres existants</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anciens.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between relative"
                    style={{ borderTopColor: getBorderColor(member), borderTopWidth: 6, borderTopStyle: "solid" }}
                  >
                    {/* statut en haut gauche */}
                    <div className="absolute top-3 left-3 text-xs font-semibold" style={{ color: getBorderColor(member) }}>
                      {member.star ? "⭐ S.T.A.R" : member.statut || "—"}
                    </div>

                    <h2 className="text-lg font-bold text-gray-800 mb-1 break-words">
                      <span className="block">{member.prenom}</span>
                      <span className="block">{member.nom}</span>
                    </h2>

                    <p className="text-sm text-gray-600 mb-1">📱 {member.telephone || "—"}</p>

                    <p
                      className="mt-2 text-blue-500 underline cursor-pointer text-sm"
                      onClick={() => setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
                    >
                      {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                    </p>

                    {detailsOpen[member.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>Besoin : {member.besoin || "—"}</p>
                        <p>Infos : {member.infos_supplementaires || "—"}</p>
                        <p>Comment venu : {member.comment || "—"}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // VUE TABLE (avec visiteurs en haut + tag "Nouveau" bleu + fond léger coloré par statut)
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Nom complet</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {tableMembers.map((m) => {
                // couleur douce de fond basée sur statut (rgba-like via hex + 20 suffix)
                const borderColor = getBorderColor(m);
                // tiny translucent background: convert #RRGGBB to rgba with small alpha
                const hex = borderColor.replace("#", "");
                let bgColor = "";
                if (hex.length === 6) {
                  const r = parseInt(hex.slice(0, 2), 16);
                  const g = parseInt(hex.slice(2, 4), 16);
                  const b = parseInt(hex.slice(4, 6), 16);
                  bgColor = `rgba(${r}, ${g}, ${b}, 0.06)`;
                } else {
                  bgColor = "transparent";
                }

                return (
                  <tr key={m.id} className="border-b" style={{ backgroundColor: bgColor }}>
                    <td className="px-4 py-2 font-semibold">
                      {m.prenom} {m.nom}
                      {/* tag "Nouveau" bleu dans la table */}
                      {(m.statut === "visiteur" || m.statut === "veut rejoindre ICC") && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Nouveau</span>
                      )}
                      {/* étoile pour star */}
                      {m.star && <span className="ml-2 text-yellow-400">⭐</span>}
                    </td>
                    <td className="px-4 py-2">{m.telephone}</td>
                    <td className="px-4 py-2" style={{ color: getBorderColor(m) }}>
                      {m.star ? "⭐ S.T.A.R" : m.statut}
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => setPopupMember(m)} className="text-blue-600 underline text-sm">Détails</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP DÉTAILS TABLE */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button onClick={() => setPopupMember(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">✖</button>
            <h2 className="text-xl font-bold mb-2 text-indigo-700">{popupMember.prenom} {popupMember.nom}</h2>
            <p className="text-gray-700 text-sm mb-1">📱 {popupMember.telephone || "—"}</p>
            <p className="text-sm text-gray-700 mb-2">Statut : <span style={{ color: getBorderColor(popupMember) }} className="font-semibold">{popupMember.star ? "⭐ S.T.A.R" : popupMember.statut}</span></p>
            <p className="text-sm text-gray-700 mb-1">Besoin : {popupMember.besoin || "—"}</p>
            <p className="text-sm text-gray-700 mb-1">Infos : {popupMember.infos_supplementaires || "—"}</p>
            <p className="text-sm text-gray-700 mb-3">Comment venu : {popupMember.comment || "—"}</p>

            <select
              value={selectedCellules[popupMember.id] || ""}
              onChange={(e) => setSelectedCellules((prev) => ({ ...prev, [popupMember.id]: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm w-full mb-3"
            >
              <option value="">-- Sélectionner cellule --</option>
              {cellules.map((c) => <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>)}
            </select>

            {selectedCellules[popupMember.id] && (
              <BoutonEnvoyer
                membre={popupMember}
                cellule={cellules.find((c) => String(c.id) === String(selectedCellules[popupMember.id]))}
                onStatusUpdate={handleStatusUpdateFromEnvoyer}
              />
            )}
          </div>
        </div>
      )}

      <button onClick={scrollToTop} className="fixed bottom-5 right-5 text-white text-2xl font-bold">↑</button>
    </div>
  );
}

