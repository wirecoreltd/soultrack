"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import BoutonEnvoyer from "../components/BoutonEnvoyer";
import LogoutLink from "../components/LogoutLink";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

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
    const { data, error } = await supabase
      .from("membres")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Erreur fetchMembers:", error.message);
    setMembers(data || []);
  };

  const fetchCellules = async () => {
    const { data, error } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");
    if (error) console.error("Erreur fetchCellules:", error.message);
    setCellules(data || []);
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await supabase.from("membres").update({ statut: newStatus }).eq("id", id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, statut: newStatus } : m
        )
      );
    } catch (err) {
      console.error("Erreur update statut:", err.message);
    }
  };

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, statut: newStatus } : m
      )
    );
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

  const getBackgroundColor = (member) => {
    if (member.star) return "bg-yellow-50";
    if (member.statut === "actif") return "bg-blue-50";
    if (member.statut === "a déjà mon église") return "bg-red-50";
    if (member.statut === "ancien") return "bg-gray-50";
    if (member.statut === "veut rejoindre ICC" || member.statut === "visiteur")
      return "bg-green-50";
    return "bg-white";
  };

  const nouveaux = members.filter(
    (m) => m.statut === "visiteur" || m.statut === "veut rejoindre ICC"
  );
  const anciens = members.filter(
    (m) =>
      m.statut !== "visiteur" &&
      m.statut !== "veut rejoindre ICC"
  );

  const statusOptions = [
    "actif",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "EEEE d MMMM yyyy", { locale: fr });
    } catch {
      return "";
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)",
      }}
    >
      <div className="flex justify-between w-full max-w-5xl items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white font-semibold hover:text-gray-200"
        >
          ← Retour
        </button>
        <LogoutLink className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition" />
      </div>

      <Image src="/logo.png" alt="SoulTrack Logo" width={80} height={80} />
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

      {/* === SECTION NOUVEAUX === */}
      {nouveaux.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-5xl"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-white text-xl font-semibold">
              💖 Bien aimé venu le {formatDate(nouveaux[0].created_at)}
            </h2>
          </div>

          {view === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nouveaux.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-t-4 ${getBackgroundColor(member)}`}
                  style={{ borderTopColor: getBorderColor(member) }}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: getBorderColor(member) }}>
                    {member.star ? "⭐ S.T.A.R" : member.statut}
                    {(member.statut === "visiteur" || member.statut === "veut rejoindre ICC") && (
                      <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Nouveau</span>
                    )}
                  </div>

                  <div className="flex flex-col mb-2">
                    <span className="text-lg font-bold text-gray-800 leading-tight">{member.prenom}</span>
                    <span className="text-lg font-bold text-gray-800 leading-tight">{member.nom}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">📱 {member.telephone || "—"}</p>

                  <select
                    value={member.statut}
                    onChange={(e) => handleChangeStatus(member.id, e.target.value)}
                    className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <p
                    className="text-blue-500 underline cursor-pointer text-sm"
                    onClick={() =>
                      setDetailsOpen((prev) => ({
                        ...prev,
                        [member.id]: !prev[member.id],
                      }))
                    }
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
                        <BoutonEnvoyer
                          membre={member}
                          cellule={cellules.find(
                            (c) => String(c.id) === String(selectedCellules[member.id])
                          )}
                          onStatusUpdate={handleStatusUpdateFromEnvoyer}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full bg-white rounded-xl shadow-lg text-sm text-gray-700">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-2 w-1/4">Nom complet</th>
                  <th className="px-4 py-2 w-1/4">Téléphone</th>
                  <th className="px-4 py-2 w-1/4">Statut</th>
                  <th className="px-4 py-2 w-1/4">Action</th>
                </tr>
              </thead>
              <tbody>
                {nouveaux.map((m) => (
                  <tr
                    key={m.id}
                    className={`border-b ${getBackgroundColor(m)} hover:bg-gray-100`}
                  >
                    <td className="px-4 py-2 font-semibold">
                      {m.prenom} {m.nom}{" "}
                      {(m.statut === "visiteur" || m.statut === "veut rejoindre ICC") && (
                        <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{m.telephone}</td>
                    <td className="px-4 py-2">
                      <select
                        value={m.statut}
                        onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
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
              </tbody>
            </table>
          )}
        </motion.div>
      )}

      {/* === SÉPARATEUR === */}
      <div className="w-full max-w-5xl border-t border-gray-300 mt-8 mb-2 relative">
        <p className="text-white text-lg text-center -mt-3 bg-transparent">
          Membres existants ───
        </p>
      </div>

      {/* === MEMBRES EXISTANTS === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl mt-4"
      >
        {view === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {anciens.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl shadow-md border-t-4 ${getBackgroundColor(m)}`}
                style={{ borderTopColor: getBorderColor(m) }}
              >
                <div className="text-sm font-semibold mb-1" style={{ color: getBorderColor(m) }}>
                  {m.star ? "⭐ S.T.A.R" : m.statut}
                </div>
                <div className="flex flex-col mb-2">
                  <span className="text-lg font-bold text-gray-800 leading-tight">{m.prenom}</span>
                  <span className="text-lg font-bold text-gray-800 leading-tight">{m.nom}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">📱 {m.telephone || "—"}</p>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full bg-white rounded-xl shadow-lg text-sm text-gray-700">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2 w-1/4">Nom complet</th>
                <th className="px-4 py-2 w-1/4">Téléphone</th>
                <th className="px-4 py-2 w-1/4">Statut</th>
                <th className="px-4 py-2 w-1/4">Action</th>
              </tr>
            </thead>
            <tbody>
              {anciens.map((m) => (
                <tr key={m.id} className={`border-b ${getBackgroundColor(m)} hover:bg-gray-100`}>
                  <td className="px-4 py-2 font-semibold">{m.prenom} {m.nom}</td>
                  <td className="px-4 py-2">{m.telephone}</td>
                  <td className="px-4 py-2">
                    <select
                      value={m.statut}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
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
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
