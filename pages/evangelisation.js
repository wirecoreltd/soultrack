"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";

export default function Evangelisation() {
  const router = useRouter();

  const [contacts, setContacts] = useState(null); // null = loading
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [popupMember, setPopupMember] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [view, setView] = useState("card"); // "card" ou "table"
  const phoneMenuRef = useRef(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .neq("status_suivi", "Envoyé")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Erreur fetchContacts:", error);
      setContacts([]);
      return;
    }

    console.log("Contacts chargés :", data);
    setContacts(data || []);
  };

  const fetchCellules = async () => {
    const { data } = await supabase
      .from("cellules")
      .select("id, cellule_full, responsable, telephone, ville");
    setCellules(data || []);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, telephone")
      .eq("role", "Conseiller");
    setConseillers(data || []);
  };

  /* ================= UTILS ================= */
  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

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

  const selectedContacts = contacts?.filter((c) => checkedContacts[c.id]) || [];
  const hasSelectedContacts = selectedContacts.length > 0;

  const getBorderColor = (member) => {
    if (member.is_whatsapp) return "#25D366";
    if (member.besoin) return "#FFB800";
    return "#888";
  };

  /* ================= ENVOI WHATSAPP + SUIVI ================= */
  const sendContacts = async () => {
    if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) return;

    setLoadingSend(true);

    try {
      const cible =
        selectedTargetType === "cellule"
          ? cellules.find((c) => c.id === selectedTarget)
          : conseillers.find((c) => c.id === selectedTarget);

      if (!cible) throw new Error("Cible introuvable");

      let message = `🙏 Bonjour ${selectedTargetType === "cellule" ? cible.cellule_full : cible.prenom},\n\n`;
      message += selectedContacts.length > 1
        ? `Nous te confions avec joie ${selectedContacts.length} personnes rencontrées lors de l’évangélisation.\n\n`
        : "Nous te confions avec joie une personne rencontrée lors de l’évangélisation.\n\n";

      selectedContacts.forEach((m) => {
        message += "────────────────────\n";
        message += `👤 Nom : *${m.prenom} ${m.nom}*\n`;
        message += `📱 Téléphone : ${m.telephone || "—"}\n`;
        message += `🏙️ Ville : ${m.ville || "—"}\n`;
        message += `💬 WhatsApp : ${m.is_whatsapp ? "Oui" : "Non"}\n`;
        message += `⚥ Sexe : ${m.sexe || "—"}\n`;
        message += `🙏 Prière du salut : ${m.priere_salut ? "Oui" : "—"}\n`;
        message += `☀️ Type : ${m.type_conversion || "—"}\n`;
        message += `❓ Besoin : ${formatBesoin(m.besoin)}\n`;
        message += `📝 Infos supplémentaires : ${formatBesoin(m.infos_supplementaires)}\n\n`;
      });

      message += `Que le Seigneur te fortifie et t’utilise puissamment dans ${selectedContacts.length > 1 ? "ces suivis" : "ce suivi"} 🙌\n`;

      if (cible.telephone) {
        const waLink = `https://wa.me/${cible.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
        window.open(waLink, "_blank");
      }

      // ✅ PREPARER INSERT SUIVI (sans id)
      const insertData = selectedContacts.map((c) => ({
        prenom: c.prenom,
        nom: c.nom,
        telephone: c.telephone,
        ville: c.ville,
        besoin: c.besoin,
        infos_supplementaires: c.infos_supplementaires,
        is_whatsapp: c.is_whatsapp || false,
        sexe: c.sexe,
        type_conversion: c.type_conversion,
        priere_salut: c.priere_salut,
        cellule_id: selectedTargetType === "cellule" ? cible.id : null,
        responsable_cellule: selectedTargetType === "cellule" ? cible.responsable || null : null,
        conseiller_id: selectedTargetType === "conseiller" ? cible.id : null,
        evangelise_id: c.id,
        status_suivis_evangelises: "Envoyé",
        date_suivi: new Date().toISOString(),
      }));

      console.log("DEBUG insertData ", insertData);

      const { error: insertError } = await supabase.from("suivis_des_evangelises").insert(insertData);
      if (insertError) throw insertError;

      // Mettre à jour status_suivi dans evangelises
      const { error: updateError } = await supabase
        .from("evangelises")
        .update({ status_suivi: "Envoyé" })
        .in("id", selectedContacts.map((c) => c.id));
      if (updateError) throw updateError;

      alert("✅ Contacts envoyés et suivis créés !");
      setCheckedContacts({});
      fetchContacts();
    } catch (err) {
      console.error("ERREUR ENVOI", err);
      alert("❌ Une erreur est survenue. Vérifie la console pour plus de détails.");
    } finally {
      setLoadingSend(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-white">← Retour</button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-4">Évangélisation</h1>

      {/* Toggle Carte / Table */}
      <div className="mb-4 flex justify-center gap-2">
        <button
          className={`px-4 py-2 rounded ${view === "card" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setView("card")}
        >
          Carte
        </button>
        <button
          className={`px-4 py-2 rounded ${view === "table" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>

      {/* Sélection cible */}
      <div className="w-full max-w-md mb-6">
        <select
          value={selectedTargetType}
          onChange={(e) => { setSelectedTargetType(e.target.value); setSelectedTarget(""); }}
          className="w-full border rounded px-3 py-2 mb-3 text-center"
        >
          <option value="">-- Envoyer à --</option>
          <option value="cellule">Une Cellule</option>
          <option value="conseiller">Un Conseiller</option>
        </select>

        {selectedTargetType && (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 text-center"
          >
            <option value="">-- Choisir --</option>
            {(selectedTargetType === "cellule" ? cellules : conseillers).map((c) => (
              <option key={c.id} value={c.id}>
                {selectedTargetType === "cellule" ? `${c.cellule_full} (${c.ville || "—"})` : `${c.prenom} ${c.nom}`}
              </option>
            ))}
          </select>
        )}

        {hasSelectedContacts && selectedTarget && (
          <button
            onClick={sendContacts}
            disabled={loadingSend}
            className="w-full bg-green-500 text-white font-bold px-4 py-2 rounded"
          >
            {loadingSend ? "Envoi..." : "📤 Envoyer WhatsApp"}
          </button>
        )}
      </div>

      {/* ================= AFFICHAGE CONTACTS ================= */}
      {contacts === null ? (
        <div className="px-2 py-2 text-white text-center bg-gray-600 rounded">
          Chargement des membres...
        </div>
       ) : (
         
      {/* VUE CARTE */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
  {contacts?.length === 0 && (
    <div className="px-2 py-2 text-white text-center bg-gray-600 rounded">
      Aucun membre en suivi
    </div>
  )}
  {contacts?.map((member) => (
    <div
      key={member.id}
      className="bg-white rounded-2xl shadow-xl p-4 border-l-4 relative"
      style={{ borderLeftColor: getBorderColor(member) }}
    >
      <h2 className="font-bold text-center">{member.prenom} {member.nom}</h2>

      {/* TELEPHONE */}
      <p
        className="text-center text-sm text-orange-500 underline decoration-orange-400 cursor-pointer font-semibold"
        onClick={() => setOpenPhoneMenuId(member.id)}
      >
        {member.telephone || "—"}
      </p>

      {openPhoneMenuId === member.id && (
        <div
          ref={phoneMenuRef}
          className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <a href={member.telephone ? `tel:${member.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>📞 Appeler</a>
          <a href={member.telephone ? `sms:${member.telephone}` : "#"} className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>✉️ SMS</a>
          <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>📱 Appel WhatsApp</a>
          <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}>💬 Message WhatsApp</a>
        </div>
      )}

      <p className="text-center text-sm">🏙️ Ville : {member.ville || "—"}</p>

      <label className="flex justify-center gap-2 mt-2">
        <input type="checkbox" checked={checkedContacts[member.id] || false} onChange={() => handleCheck(member.id)} /> Sélectionner
      </label>

      <button
        onClick={() => setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
        className="text-orange-500 underline text-sm block mx-auto mt-2"
      >
        {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
      </button>

      {detailsOpen[member.id] && (
        <div className="text-sm mt-3 space-y-1">
          <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
          <p>⚥ Sexe : {member.sexe || "—"}</p>
          <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "—"}</p>
          <p>☀️ Type : {member.type_conversion || "—"}</p>
          <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
          <p>📝 Infos supplémentaires : {formatBesoin(member.infos_supplementaires)}</p>
          <button
            onClick={() => { setEditMember(member); setPopupMember(null); }}
            className="text-blue-600 text-sm mt-4 w-full text-center"
          >
            ✏️ Modifier le contact
          </button>
        </div>
      )}
    </div>
  ))}
</div>

        <div className="w-full max-w-6xl overflow-x-auto py-2">
          <div className="min-w-[700px] space-y-2">
            <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
              <div className="flex-[2]">Nom complet</div>
              <div className="flex-[1]">Téléphone</div>
              <div className="flex-[1]">Ville</div>
              <div className="flex-[1]">Sélectionner</div>
            </div>

            {contacts.length === 0 && (
              <div className="px-2 py-2 text-white text-center bg-gray-600 rounded">
                Aucun membre en suivi
              </div>
            )}

            {contacts.map((m) => (
              <div key={m.id} className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                <div className="flex-[2] text-white flex items-center gap-1">{m.prenom} {m.nom}</div>
                <div className="flex-[1] text-white">📱 {m.telephone || "—"}</div>
                <div className="flex-[1] text-white">{m.ville || "—"}</div>
                <div className="flex-[1]"><input type="checkbox" checked={checkedContacts[m.id] || false} onChange={() => handleCheck(m.id)} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUPS */}
      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
        />
      )}

      {popupMember && (
        <DetailsEvangePopup
          member={popupMember}
          onClose={() => setPopupMember(null)}
          onEdit={(m) => { setEditMember(m); setPopupMember(null); }}
        />
      )}
    </div>
  );
}
