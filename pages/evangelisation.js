// ✅ pages/evangelisation.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";

export default function Evangelisation() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [checkedContacts, setCheckedContacts] = useState({});
  const [view, setView] = useState("card");

  useEffect(() => {
    fetchContacts();
    fetchCellules();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false });

    setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule, responsable, telephone");

    setCellules(data || []);
  };

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const sendWhatsapp = () => alert("Fonction OK ✅");

  const userName = "Utilisateur";

  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try {
      const arr = JSON.parse(b);
      return Array.isArray(arr) ? arr.join(", ") : b;
    } catch {
      return b;
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-white">
            ← Retour
          </button>
          <LogoutLink />
        </div>
        <div className="flex justify-end mt-2">
          <p className="text-orange-200 text-sm">👋 Bienvenue {userName}</p>
        </div>
      </div>

      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-2">Évangélisation</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-xl px-4 py-2 text-gray-800 shadow-md"
        >
          <option value="">📍 Sélectionner cellule</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} — {c.responsable}
            </option>
          ))}
        </select>

        {selectedCellule && (
          <button
            onClick={sendWhatsapp}
            className="bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-green-600 transition-all"
          >
            ✅ Envoyer WhatsApp
          </button>
        )}
      </div>

      <p
        onClick={() => setView(view === "card" ? "table" : "card")}
        className="cursor-pointer text-yellow-100 underline hover:text-white text-sm mb-4"
      >
        {view === "card" ? "Vue Table" : "Vue Carte"}
      </p>

      {/* ✅ VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {contacts.map((member) => {
            const isOpen = detailsOpen[member.id];
            return (
              <div
                key={member.id}
                className="bg-white text-gray-900 rounded-2xl shadow-xl p-4"
              >
                <h2 className="font-bold text-lg mb-1 text-center text-blue-800">
                  {member.prenom} {member.nom}
                </h2>

                <p className="text-sm text-center mb-2">
                  📱 {member.telephone || "—"}
                </p>

                <label className="flex items-center justify-center gap-2 text-sm mb-2">
                  <input
                    type="checkbox"
                    checked={checkedContacts[member.id] || false}
                    onChange={() => handleCheck(member.id)}
                  />
                  ✅ Envoyer ce Contact
                </label>

                <button
                  onClick={() => toggleDetails(member.id)}
                  className="text-orange-500 underline text-sm mt-1 block mx-auto text-center"
                >
                  {isOpen ? "Fermer Détails" : "Détails"}
                </button>

                {isOpen && (
                  <div className="text-gray-700 text-sm mt-2 space-y-2 w-full text-center flex flex-col items-center">
                    <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🏙 Ville: {member.ville || "—"}</p>
                    <p>❓Besoin : {formatBesoin(member.besoin)}</p>
                    <p>📝 Infos: {member.infos_supplementaires || "—"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== VUE TABLE ==================== */}
<div className="w-full max-w-5xl overflow-x-auto mt-4">
  <table className="w-full text-sm bg-white/10 rounded-xl">
    <thead className="bg-white/20 text-white">
      <tr>
        <th className="p-3">Prénom</th>
        <th className="p-3">Nom</th>
        <th className="p-3 text-center">Téléphone</th>
        <th className="p-3 text-center">Statut</th>
        <th className="p-3 text-center">Détails</th>
      </tr>
    </thead>

    <tbody>
      {suivis.map((item) => (
        <tr key={item.id} className="hover:bg-white/20">
          <td className="p-3">{item.prenom}</td>
          <td className="p-3">{item.nom}</td>
          <td className="p-3 text-center">{item.telephone || "—"}</td>
          <td className="p-3 text-center">{item.statut || "—"}</td>
          <td className="p-3 text-center">
            <button
              onClick={() => toggleDetails(item.id)}
              className="text-yellow-300 underline"
            >
              {detailsOpen[item.id] ? "Fermer détails" : "Détails"}
            </button>

            {detailsOpen[item.id] && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-80 relative">
                  <button
                    onClick={() => toggleDetails(item.id)}
                    className="absolute top-2 right-2 text-red-500 font-bold"
                  >
                    ✕
                  </button>
                  <h2 className="text-lg font-bold text-gray-800 text-center">
                    {item.prenom} {item.nom}
                  </h2>
                  <p>📞 {item.telephone || "—"}</p>
                  <p>💬 WhatsApp : {item.whatsapp || "—"}</p>
                  <p>🏙 Ville : {item.ville || "—"}</p>
                  <p>🕊 Statut : {item.statut_suivis || "—"}</p>
                  <p>🧩 Comment est-il venu : {item.venu || "—"}</p>
                  <p>📝 Infos : {item.infos_supplementaires || "—"}</p>
                  <div>
                    <label className="text-black text-sm">BESOIN :</label>
                    <select
                      value={item.besoin || ""}
                      className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Finances">Finances</option>
                      <option value="Santé">Santé</option>
                      <option value="Travail">Travail</option>
                      <option value="Les Enfants">Les Enfants</option>
                      <option value="La Famille">La Famille</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-black text-sm">📋 Statut Suivis :</label>
                    <select
                      value={statusChanges[item.id] ?? item.statut_suivis ?? ""}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1"
                    >
                      <option value="">-- Choisir un statut --</option>
                      <option value="actif">✅ Actif</option>
                      <option value="en attente">🕓 En attente</option>
                      <option value="suivi terminé">🏁 Terminé</option>
                      <option value="inactif">❌ Inactif</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-black text-sm">📝 Commentaire Suivis :</label>
                    <textarea
                      value={commentChanges[item.id] ?? item.commentaire_suivis ?? ""}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      rows={2}
                      className="w-full border rounded-md px-2 py-1 text-black text-sm mt-1 resize-none"
                      placeholder="Ajouter un commentaire..."
                    />
                  </div>
                  <button
                    onClick={() => updateSuivi(item.id)}
                    disabled={updating[item.id]}
                    className={`mt-3 w-full text-white font-semibold py-1 rounded-md transition ${
                      updating[item.id]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {updating[item.id] ? "Mise à jour..." : "Mettre à jour"}
                  </button>
                </div>
              </div>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
</div> // <-- ferme le <div> principal du return
  );
} // <-- ferme la fonction Evangelisation


