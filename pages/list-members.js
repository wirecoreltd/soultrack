// pages/list-members.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";

export default function ListMembers() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [cellules, setCellules] = useState([]);
  const [selectedCellules, setSelectedCellules] = useState({});
  const [view, setView] = useState("card");
  const [dateTexte, setDateTexte] = useState("");

  useEffect(() => {
    fetchMembers();
    fetchCellules();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      const plusRecent = members[0];
      const date = new Date(plusRecent.created_at);
      const dateStr = date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setDateTexte(
        `💖 Bien aimé venu le ${dateStr.charAt(0).toLowerCase() + dateStr.slice(1)}`
      );
    }
  }, [members]);

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
      setMembers((prev) => {
        const updated = prev.map((m) =>
          m.id === id ? { ...m, statut: newStatus } : m
        );
        return updated;
      });
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const StatusTag = ({ member }) => {
    let text =
      member.star
        ? "S.T.A.R ⭐"
        : member.statut
        ? member.statut.toUpperCase()
        : "—";
    return (
      <span
        className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full text-white"
        style={{
          backgroundColor: getBorderColor(member),
        }}
      >
        {text}
      </span>
    );
  };

  const handleSendToSuivis = async (membre, cellule) => {
    await handleChangeStatus(membre.id, "actif");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <div className="mt-2 mb-2">
        <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
      </div>

      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-2">
        SoulTrack
      </h1>

      <p className="text-center text-white text-lg mb-4 font-handwriting-light">
        Chaque personne a une valeur infinie. Ensemble, avançons et partageons
        l’amour de Christ ❤️
      </p>

      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        Visuel
      </p>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-4 w-full max-w-md">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Filtrer par statut --</option>
          <option value="actif">Actif</option>
          <option value="ancien">Ancien</option>
          <option value="veut rejoindre ICC">Veut rejoindre ICC</option>
          <option value="visiteur">Visiteur</option>
          <option value="a déjà mon église">A déjà mon église</option>
          <option value="star">⭐ Star</option>
        </select>
        <span className="text-white italic text-opacity-80">
          Résultats: {filteredMembers.length}
        </span>
      </div>

      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-10">
          {nouveaux.length > 0 && (
            <div>
              <p className="text-white mb-2 text-xl">{dateTexte}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {nouveaux.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-3 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between border-t-4 relative"
                      style={{
                        borderTopColor: getBorderColor(member),
                        minHeight: "200px",
                      }}
                    >
                      <StatusTag member={member} />
                      <h2 className="text-lg font-bold text-gray-800 mb-1 flex flex-col break-words">
                        <span>{member.prenom}</span>
                        <span>{member.nom}</span>
                      </h2>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 mb-1">
                          📱 {member.telephone || "—"}
                        </p>
                        <select
                          value={member.statut}
                          onChange={(e) =>
                            handleChangeStatus(member.id, e.target.value)
                          }
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="visiteur">Visiteur</option>
                          <option value="veut rejoindre ICC">
                            Veut rejoindre ICC
                          </option>
                          <option value="actif">Actif</option>
                          <option value="ancien">Ancien</option>
                          <option value="a déjà mon église">
                            A déjà mon église
                          </option>
                        </select>
                      </div>

                      <p
                        className="mt-2 text-blue-500 underline cursor-pointer"
                        onClick={() =>
                          setDetailsOpen((prev) => ({
                            ...prev,
                            [member.id]: !prev[member.id],
                          }))
                        }
                      >
                        {detailsOpen[member.id]
                          ? "Fermer détails"
                          : "Détails"}
                      </p>

                      {detailsOpen[member.id] && (
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <p>Besoin : {member.besoin || "—"}</p>
                          <p>Infos : {member.infos_supplementaires || "—"}</p>
                          <p>Comment venu : {member.comment || "—"}</p>
                          <p className="text-green-600">Cellule :</p>
                          <select
                            value={selectedCellules[member.id] || ""}
                            onChange={(e) =>
                              setSelectedCellules((prev) => ({
                                ...prev,
                                [member.id]: e.target.value,
                              }))
                            }
                            className="border rounded-lg px-2 py-1 text-sm w-full mt-1"
                          >
                            <option value="">
                              -- Sélectionner cellule --
                            </option>
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
                              onSend={() =>
                                handleSendToSuivis(member, cellule)
                              }
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {anciens.length > 0 && (
            <div>
              <p className="text-white mb-2 text-xl">👥 Membres existants</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {anciens.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-3 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between border-t-4 relative"
                      style={{
                        borderTopColor: getBorderColor(member),
                        minHeight: "200px",
                      }}
                    >
                      <StatusTag member={member} />
                      <h2 className="text-lg font-bold text-gray-800 mb-1 flex flex-col break-words">
                        <span>{member.prenom}</span>
                        <span>{member.nom}</span>
                      </h2>
                      <p className="text-sm text-gray-600 mb-1">
                        📱 {member.telephone || "—"}
                      </p>
                      <p
                        className="mt-2 text-blue-500 underline cursor-pointer"
                        onClick={() =>
                          setDetailsOpen((prev) => ({
                            ...prev,
                            [member.id]: !prev[member.id],
                          }))
                        }
                      >
                        {detailsOpen[member.id]
                          ? "Fermer détails"
                          : "Détails"}
                      </p>
                      {detailsOpen[member.id] && (
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <p>Besoin : {member.besoin || "—"}</p>
                          <p>Infos : {member.infos_supplementaires || "—"}</p>
                          <p>Comment venu : {member.comment || "—"}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-white">Vue table non modifiée</p>
      )}

      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 text-white text-2xl font-bold"
      >
        ↑
      </button>
    </div>
  );
}


