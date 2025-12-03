"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";

export default function Evangelisation() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase.from("evangelises").select("*").order("created_at", { ascending: false });
    setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data } = await supabase.from("cellules").select("id, cellule, responsable, telephone");
    setCellules(data || []);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase.from("profiles").select("id, prenom, nom, telephone").eq("role", "Conseiller");
    setConseillers(data || []);
  };

  const toggleDetails = (id) => setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }));
  const handleCheck = (id) => setCheckedContacts(prev => ({ ...prev, [id]: !prev[id] }));
  const formatBesoin = (b) => {
    if (!b) return "—";
    if (Array.isArray(b)) return b.join(", ");
    try { const arr = JSON.parse(b); return Array.isArray(arr) ? arr.join(", ") : b; }
    catch { return b; }
  };

  const selectedContacts = contacts.filter(c => checkedContacts[c.id]);
  const hasSelectedContacts = selectedContacts.length > 0;

  const sendContacts = async () => {
    if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) return;
    setLoadingSend(true);

    try {
      const cible = selectedTargetType === "cellule"
        ? cellules.find(c => c.id == selectedTarget)
        : conseillers.find(c => c.id == selectedTarget);

      if (!cible || !cible.telephone) throw new Error("Numéro de la cible invalide");

      // 🔹 Créer le message pour WhatsApp
      const messageTexte = selectedContacts
        .map(c => `👤 ${c.prenom} ${c.nom}\n📱 ${c.telephone}\n🏙️ Ville: ${c.ville || "—"}\n📝 Besoin: ${c.besoin || "—"}`)
        .join("\n\n");

      // 🔹 Ouvrir WhatsApp Web / Mobile avec tous les contacts en texte
      const waLink = `https://wa.me/${cible.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(messageTexte)}`;
      window.open(waLink, "_blank");

      // 🔹 Ajouter dans suivis_des_evangelises
      const insertData = selectedContacts.map(c => ({
        prenom: c.prenom,
        nom: c.nom,
        telephone: c.telephone,
        ville: c.ville,
        besoin: c.besoin,
        infos_supplementaires: c.infos_supplementaires,
        is_whatsapp: c.is_whatsapp || false,
        cellule_id: selectedTargetType === "cellule" ? cible.id : null,
        responsable_cellule: selectedTargetType === "cellule" ? cible.responsable : null,
        date_suivi: new Date().toISOString()
      }));
      const { error: insertError } = await supabase.from("suivis_des_evangelises").insert(insertData);
      if (insertError) throw insertError;

      // 🔹 Supprimer les contacts envoyés de evangelises
      const idsToDelete = selectedContacts.map(c => c.id);
      const { error: deleteError } = await supabase.from("evangelises").delete().in("id", idsToDelete);
      if (deleteError) throw deleteError;

      alert("✅ Contacts envoyés et transférés avec succès !");
      setCheckedContacts({});
      fetchContacts();
    } catch (err) {
      console.error("Erreur envoi contacts :", err);
      alert("❌ Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-white">← Retour</button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-4">Évangélisation</h1>

      {/* SELECT ENVOYER À */}
      <div className="w-full max-w-md flex flex-col items-center mb-6">
        <label className="font-semibold text-white mb-1 w-full text-left">Envoyer à :</label>
        <select
          value={selectedTargetType}
          onChange={(e) => { setSelectedTargetType(e.target.value); setSelectedTarget(""); }}
          className="w-full border rounded px-3 py-2 text-gray-800 mb-3 text-center"
        >
          <option value="">-- Choisir une option --</option>
          <option value="cellule">Une Cellule</option>
          <option value="conseiller">Un Conseiller</option>
        </select>

        {selectedTargetType && (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 text-center"
          >
            <option value="">-- Choisir {selectedTargetType} --</option>
            {selectedTargetType === "cellule"
              ? cellules.map(c => <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>)
              : conseillers.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)
            }
          </select>
        )}

        {hasSelectedContacts && selectedTargetType && selectedTarget && (
          <button
            onClick={sendContacts}
            disabled={loadingSend}
            className={`bg-green-500 text-white font-semibold px-4 py-2 rounded ${loadingSend ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"}`}
          >
            {loadingSend ? "Envoi en cours..." : "📤 Envoyer WhatsApp"}
          </button>
        )}
      </div>

      {/* LISTE CONTACTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
        {contacts.map(member => {
          const isOpen = detailsOpen[member.id];
          return (
            <div key={member.id} className="bg-white text-gray-900 rounded-2xl shadow-xl p-4">
              <h2 className="font-bold text-lg mb-1 text-center text-blue-800">{member.prenom} {member.nom}</h2>
              <p className="text-sm text-center mb-2">📱 {member.telephone || "—"}</p>
              <label className="flex items-center justify-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={checkedContacts[member.id] || false} onChange={() => handleCheck(member.id)} />
                ✅ Envoyer ce Contact
              </label>

              {isOpen && (
                <div className="text-gray-700 text-sm mt-2 space-y-2 w-full text-center flex flex-col items-center">
                  <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                  <p>🏙 Ville: {member.ville || "—"}</p>
                  <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
                  <p>📝 Infos: {member.infos_supplementaires || "—"}</p>

                  <button onClick={() => setEditMember(member)} className="text-blue-600 text-sm mt-4 block mx-auto">✏️ Modifier le contact</button>
                  <button onClick={() => toggleDetails(member.id)} className="text-orange-500 underline text-sm mt-2">Fermer Détails</button>
                </div>
              )}

              {!isOpen && (
                <button onClick={() => toggleDetails(member.id)} className="text-orange-500 underline text-sm mt-1 block mx-auto text-center">
                  Détails
                </button>
              )}
            </div>
          );
        })}
      </div>

      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={(data) => {
            setContacts(prev => prev.map(m => m.id === data.id ? data : m));
            setEditMember(null);
          }}
        />
      )}
    </div>
  );
}
