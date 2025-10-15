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
    if (m.statut === "ancien") return "#999999";
    if (m.statut === "veut rejoindre ICC" || m.statut === "visiteur")
      return "#34A853";
    return "#ccc";
  };

  const getBackgroundTint = (m) => {
    if (m.statut === "actif") return "bg-blue-50";
    if (m.statut === "ancien") return "bg-gray-50";
    if (m.statut === "a déjà mon église") return "bg-red-50";
    if (m.statut === "visiteur" || m.statut === "veut rejoindre ICC")
      return "bg-blue-100";
    return "bg-white";
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

  const statusOptions = [
    "actif",
    "ancien",
    "veut rejoindre ICC",
    "visiteur",
    "a déjà mon église",
  ];

  const allMembersOrdered = [...nouveaux, ...anciens];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
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

      <p
        className="self-end text-orange-500 cursor-pointer mb-4"
        onClick={() => setView(view === "card" ? "table" : "card")}
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* === VUE CARTE === */}
      {view === "card" ? (
        <div className="w-full max-w-5xl space-y-8">
          {/* Section Nouveaux */}
          {nouveaux.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-white text-xl">
                  💖 Bien aimé venu le{" "}
                  {formatDate(nouveaux[0].created_at)}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nouveaux.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl shadow-md hover:shadow-xl transition duration-300 border-t-4 flex flex-col justify-between ${getBackgroundTint(
                      m
                    )}`}
                    style={{ borderTopColor: getBorderColor(m) }}
                  >
                    {/* Status */}
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: getBorderColor(m) }}
                      >
                        {m.star ? "⭐ S.T.A.R" : m.statut}
                      </span>
                      {(m.statut === "visiteur" ||
                        m.statut === "veut rejoindre ICC") && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">
                          Nouveau
                        </span>
                      )}
                    </div>

                    {/* Nom */}
                    <div className="flex flex-col break-words mb-1">
                      <span className="text-lg font-bold text-gray-800">
                        {m.prenom}
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        {m.nom}
                      </span>
                    </div>

                    {/* Téléphone + Statut */}
                    <p className="text-sm text-gray-600 mb-1">
                      📱 {m.telephone || "—"}
                    </p>

                    <select
                      value={m.statut}
                      onChange={(e) =>
                        handleChangeStatus(m.id, e.target.value)
                      }
                      className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    {/* Détails */}
                    <p
                      className="text-blue-500 underline cursor-pointer text-sm"
                      onClick={() =>
                        setDetailsOpen((prev) => ({
                          ...prev,
                          [m.id]: !prev[m.id],
                        }))
                      }
                    >
                      {detailsOpen[m.id] ? "Fermer détails" : "Détails"}
                    </p>

                    {detailsOpen[m.id] && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>Besoin : {m.besoin || "—"}</p>
                        <p>Infos : {m.infos_supplementaires || "—"}</p>
                        <p>Comment venu : {m.comment || "—"}</p>

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
                          <BoutonEnvoyer
                            membre={m}
                            cellule={cellules.find(
                              (c) =>
                                String(c.id) ===
                                String(selectedCellules[m.id])
                            )}
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

          {/* Section Membres existants */}
          {anciens.length > 0 && (
            <div>
              <h3 className="text-white text-lg mt-6 mb-2">
                ── Membres existants
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anciens.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl shadow-md border-t-4 ${getBackgroundTint(
                      m
                    )}`}
                    style={{ borderTopColor: getBorderColor(m) }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: getBorderColor(m) }}
                      >
                        {m.star ? "⭐ S.T.A.R" : m.statut}
                      </span>
                    </div>

                    <div className="flex flex-col break-words mb-1">
                      <span className="text-lg font-bold text-gray-800">
                        {m.prenom}
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        {m.nom}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      📱 {m.telephone || "—"}
                    </p>

                    <select
                      value={m.statut}
                      onChange={(e) =>
                        handleChangeStatus(m.id, e.target.value)
                      }
                      className="border rounded-md px-2 py-1 text-xs text-gray-700 mb-2"
                    >
                      {statusOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // === VUE TABLE ===
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-2 w-1/4">Nom complet</th>
                <th className="px-4 py-2 w-1/4">Téléphone</th>
                <th className="px-4 py-2 w-1/4">Statut</th>
                <th className="px-4 py-2 w-1/4">Détails</th>
              </tr>
            </thead>
            <tbody>
              {allMembersOrdered.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b ${getBackgroundTint(m)} transition`}
                >
                  <td className="px-4 py-2 font-semibold">
                    {m.prenom} {m.nom}{" "}
                    {(m.statut === "visiteur" ||
                      m.statut === "veut rejoindre ICC") && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-1">
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
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ POPUP DÉTAILS */}
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
                style={{ color: getBorderColor(popupMember) }}
                className="font-semibold"
              >
                {popupMember.star ? "⭐ S.T.A.R" : popupMember.statut}
              </span>
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
          </div>
        </div>
      )}
    </div>
  );
}
