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
        prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
      );
    } catch (err) {
      console.error("Erreur update statut:", err.message);
    }
  };

  const handleStatusUpdateFromEnvoyer = (id, newStatus) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m))
    );
  };

  const getColor = (member) => {
    if (member.star) return { border: "#FBC02D", bg: "#FFFDE7" };
    if (member.statut === "actif") return { border: "#4285F4", bg: "#E3F2FD" };
    if (member.statut === "a déjà mon église")
      return { border: "#EA4335", bg: "#FDECEA" };
    if (member.statut === "ancien") return { border: "#999999", bg: "#F5F5F5" };
    if (
      member.statut === "veut rejoindre ICC" ||
      member.statut === "visiteur"
    )
      return { border: "#34A853", bg: "#E8F5E9" };
    return { border: "#ccc", bg: "#fff" };
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

  const statusOptions = [
    "actif",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const renderDate = () => {
    if (nouveaux.length === 0) return null;
    const firstDate = nouveaux[0].created_at
      ? format(new Date(nouveaux[0].created_at), "EEEE d MMMM yyyy", {
          locale: fr,
        })
      : "récemment";
    return (
      <p className="text-center bg-pink-100/40 text-pink-900 text-lg italic px-4 py-2 rounded-xl shadow-sm mb-4">
        💖 Bien aimé venu le {firstDate}
      </p>
    );
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

      {/* === Vue Carte === */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {renderDate()}
          {/* Nouveaux */}
          {nouveaux.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveaux.map((member) => {
                  const color = getColor(member);
                  return (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4"
                      style={{
                        borderTopColor: color.border,
                        backgroundColor: "#fff",
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: color.border }}
                        >
                          {member.star
                            ? "⭐ S.T.A.R"
                            : member.statut || "—"}{" "}
                          {["visiteur", "veut rejoindre ICC"].includes(
                            member.statut
                          ) && (
                            <span className="ml-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {member.prenom} {member.nom}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          📱 {member.telephone || "—"}
                        </p>
                        <select
                          value={member.statut}
                          onChange={(e) =>
                            handleChangeStatus(member.id, e.target.value)
                          }
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Séparation stylée */}
          <div className="flex items-center justify-center mt-8 mb-4">
            <hr className="w-1/4 border-t-2 border-gradient-to-r from-purple-500 to-blue-400" />
            <span className="mx-3 text-white text-lg font-semibold">
              Membres existants──────
            </span>
            <hr className="w-1/4 border-t-2 border-gradient-to-l from-purple-500 to-blue-400" />
          </div>

          {/* Anciens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {anciens.map((member) => {
              const color = getColor(member);
              return (
                <div
                  key={member.id}
                  className="p-3 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4"
                  style={{
                    borderTopColor: color.border,
                    backgroundColor: color.bg,
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: color.border }}
                    >
                      {member.statut || "—"}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {member.prenom} {member.nom}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    📱 {member.telephone || "—"}
                  </p>
                  <select
                    value={member.statut}
                    onChange={(e) =>
                      handleChangeStatus(member.id, e.target.value)
                    }
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* === Vue Table === */
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto p-4">
          {renderDate()}
          <table className="w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2 w-1/4">Nom complet</th>
                <th className="px-4 py-2 w-1/4">Téléphone</th>
                <th className="px-4 py-2 w-1/4">Statut</th>
                <th className="px-4 py-2 w-1/4">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...nouveaux, ...anciens].map((m) => {
                const color = getColor(m);
                return (
                  <tr
                    key={m.id}
                    className="border-b hover:bg-gray-50"
                    style={{ backgroundColor: color.bg }}
                  >
                    <td className="px-4 py-2 font-semibold">
                      {m.prenom} {m.nom}{" "}
                      {["visiteur", "veut rejoindre ICC"].includes(m.statut) && (
                        <span className="ml-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{m.telephone}</td>
                    <td className="px-4 py-2">
                      <select
                        value={m.statut}
                        onChange={(e) =>
                          handleChangeStatus(m.id, e.target.value)
                        }
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
                );
              })}
            </tbody>
          </table>
          <div className="text-center mt-4 text-gray-700 font-semibold">
            Membres existants──────
          </div>
        </div>
      )}

      {/* ✅ Popup Détails */}
      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
              Statut :{" "}
              <span
                style={{ color: getColor(popupMember).border }}
                className="font-semibold"
              >
                {popupMember.star ? "⭐ S.T.A.R" : popupMember.statut}
              </span>
            </p>
            <select
              value={popupMember.statut}
              onChange={(e) =>
                handleChangeStatus(popupMember.id, e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm mb-3"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-700 mb-1">
              Besoin : {popupMember.besoin || "—"}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Infos : {popupMember.infos_supplementaires || "—"}
            </p>
            <p className="text-sm text-gray-700">
              Comment venu : {popupMember.comment || "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
