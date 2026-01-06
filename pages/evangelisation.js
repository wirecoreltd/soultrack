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
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [popupMember, setPopupMember] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [view, setView] = useState("card"); // "card" ou "table"

  // ✅ Pour menu téléphone
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);

  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
  }, []);

  // ✅ Fermeture menu si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      .select("id, cellule_full, responsable, telephone");
    setCellules(data || []);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, telephone")
      .eq("role", "Conseiller");
    setConseillers(data || []);
  };

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

  const selectedContacts = contacts.filter((c) => checkedContacts[c.id]);
  const hasSelectedContacts = selectedContacts.length > 0;

  const sendContacts = async () => {
    if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) return;
    setLoadingSend(true);
    try {
      const cible =
        selectedTargetType === "cellule"
          ? cellules.find((c) => c.id == selectedTarget)
          : conseillers.find((c) => c.id == selectedTarget);

      if (!cible || !cible.telephone)
        throw new Error("Numéro de la cible invalide");

      const isMultiple = selectedContacts.length > 1;

      let message = `👋 Bonjour ${
        selectedTargetType === "cellule" ? cible.responsable : cible.prenom
      },\n\n`;
      message += isMultiple
        ? "Nous te confions avec joie ces personnes rencontrées lors de l’évangélisation.\n"
        : "Nous te confions avec joie une personne rencontrée lors de l’évangélisation.\n";
      message += "Merci pour ton coeur et ton engagement dans l’accompagnement\n\n";

      selectedContacts.forEach((m, index) => {
        if (isMultiple) message += `👥 Personne ${index + 1}\n`;
        message += `👤 Nom : ${m.prenom} ${m.nom}\n`;
        message += `📱 Téléphone : ${m.telephone || "—"}\n`;
        message += `🏙️ Ville : ${m.ville || "—"}\n`;
        message += `💬 WhatsApp : ${m.is_whatsapp ? "Oui" : "Non"}\n`;
        message += `⚥ Sexe : ${m.sexe || "—"}\n`;
        message += `🙏 Prière du salut : ${m.priere_salut ? "Oui" : "—"}\n`;
        message += `☀️ Type : ${m.type_conversion || "—"}\n`;
        message += `❓ Besoin : ${formatBesoin(m.besoin)}\n`;
        message += `📝 Infos supplementaires : ${formatBesoin(m.infos_supplementaires)}\n`;
      });

      message += "\nQue le Seigneur te fortifie et t’utilise puissamment dans ce suivi 🙌\n";

      const waLink = `https://wa.me/${cible.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(waLink, "_blank");

      const insertData = selectedContacts.map((c) => ({
        prenom: c.prenom,
        nom: c.nom,
        telephone: c.telephone,
        ville: c.ville,
        sexe: c.sexe,
        besoin: c.besoin,
        priere_salut: c.priere_salut,
        type_conversion: c.type_conversion,        
        infos_supplementaires: c.infos_supplementaires,
        is_whatsapp: c.is_whatsapp || false,
        cellule_id: selectedTargetType === "cellule" ? cible.id : null,
        responsable_cellule: selectedTargetType === "cellule" ? cible.responsable : null,
        conseiller_id: selectedTargetType === "conseiller" ? cible.id : null,
        date_suivi: new Date().toISOString(),
      }));

      await supabase.from("suivis_des_evangelises").insert(insertData);
      const idsToDelete = selectedContacts.map((c) => c.id);
      await supabase.from("evangelises").delete().in("id", idsToDelete);

      alert("✅ Contacts envoyés avec succès !");
      setCheckedContacts({});
      fetchContacts();
    } catch (err) {
      console.error("Erreur envoi contacts :", err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setLoadingSend(false);
    }
  };

  const getBorderColor = (member) => {
    if (member.is_whatsapp) return "#25D366";
    if (member.besoin) return "#FFB800";
    return "#888";
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      {/* Header */}
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-white">← Retour</button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-4">Évangélisation</h1>

      {/* Toggle Vue Carte / Vue Table */}
      <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
        <button
          onClick={() => setView(view === "card" ? "table" : "card")}
          className="text-sm font-semibold underline text-white"
        >
          {view === "card" ? "Vue Table" : "Vue Carte"}
        </button>
      </div>

      {/* Select Cellule / Conseiller */}
      <div className="w-full max-w-md mb-6">
        <select
          value={selectedTargetType}
          onChange={(e) => {
            setSelectedTargetType(e.target.value);
            setSelectedTarget("");
          }}
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
                {selectedTargetType === "cellule" ? `${c.cellule_full} (${c.responsable})` : `${c.prenom} ${c.nom}`}
              </option>
            ))}
          </select>
        )}

        {hasSelectedContacts && selectedTarget && (
          <div className="flex justify-center mt-2">
            <button
              onClick={sendContacts}
              disabled={loadingSend}
              className="bg-green-500 text-white font-bold px-4 py-2 rounded"
            >
              {loadingSend ? "Envoi..." : "📤 Envoyer WhatsApp"}
            </button>
          </div>
        )}
      </div>

      {/* VUE CARTE */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {contacts.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-xl p-4 border-l-4 transition-all duration-300 relative"
              style={{ borderLeftColor: getBorderColor(member) }}
            >
              <h2 className="font-bold text-center">{member.prenom} {member.nom}</h2>

              {/* Téléphone avec style orange semi-underline */}
              <p
                className="text-center text-sm text-orange-500 underline decoration-orange-400 cursor-pointer font-semibold"
                onClick={() => setOpenPhoneMenuId(member.id)}
              >
                {member.telephone || "—"}
              </p>

              {/* Menu actions téléphoniques / WhatsApp */}
              {openPhoneMenuId === member.id && (
                <div
                  ref={phoneMenuRef}
                  className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={member.telephone ? `tel:${member.telephone}` : "#"}
                    className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    📞 Appeler
                  </a>
                  <a
                    href={member.telephone ? `sms:${member.telephone}` : "#"}
                    className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    ✉️ SMS
                  </a>
                  <a
                    href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g, "")}?call` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    📱 Appel WhatsApp
                  </a>
                  <a
                    href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g, "")}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block px-4 py-2 text-sm text-black hover:bg-gray-100 ${!member.telephone ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    💬 Message WhatsApp
                  </a>
                </div>
              )}

              <p className="text-center text-sm">🏙️ Ville : {member.ville || "—"}</p>

              {/* Checkbox sélectionner */}
              <label className="flex justify-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={checkedContacts[member.id] || false}
                  onChange={() => handleCheck(member.id)}
                />
                Sélectionner
              </label>

              {/* Détails supplémentaires */}
              <button
                onClick={() =>
                  setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))
                }
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
                    onClick={() => {
                      setEditMember(member);
                      setPopupMember(null); // ferme popup si actif
                    }}
                    className="text-blue-600 text-sm mt-4 w-full text-center"
                  >
                    ✏️ Modifier le contact
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

     {/* VUE TABLE */}
{view === "table" && (
  <div className="w-full max-w-6xl overflow-x-auto py-2">
    <div className="min-w-[700px] space-y-2">

      {/* Header */}
      <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
        <div className="flex-[2]">Nom complet</div>
        <div className="flex-[1]">Téléphone</div>
        <div className="flex-[1]">Statut Suivis</div>
        <div className="flex-[2]">Attribué à</div>
        <div className="flex-[1]">Actions</div>
      </div>

      {uniqueMembers.length === 0 && (
        <div className="px-2 py-2 text-white text-center bg-gray-600 rounded">
          Aucun membre en suivi
        </div>
      )}

      {uniqueMembers.map((m) => {
        const attribue = m.conseiller_id
          ? `👤 ${conseillers.find((c) => c.id === m.conseiller_id)?.prenom || ""} ${conseillers.find((c) => c.id === m.conseiller_id)?.nom || ""}`.trim()
          : m.cellule_id
          ? `🏠 ${cellules.find((c) => c.id === m.cellule_id)?.cellule_full || "—"}`
          : "—";

        return (
          <div
            key={m.id}
            className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4"
            style={{ borderLeftColor: getBorderColor(m) }}
          >
            {/* Nom complet */}
            <div className="flex-[2] text-white font-semibold flex items-center gap-1">
              {m.prenom} {m.nom}
            </div>

            {/* Téléphone */}
            <div className="flex-[1] text-orange-500 underline decoration-orange-400 cursor-pointer">
              {m.telephone || "—"}
            </div>

            {/* Statut Suivis */}
            <div className="flex-[1] text-white">
              {statutLabels[m.statut_suivis ?? m.suivi_statut] || "—"}
            </div>

            {/* Attribué à */}
            <div className="flex-[2] text-white">{attribue}</div>

            {/* Actions */}
            <div className="flex-[1] flex justify-start">
              <button
                onClick={() => setDetailsModalMember(m)}
                className="text-orange-500 underline text-sm whitespace-nowrap"
              >
                Détails
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}


      {/* POPUP MODIFICATION */}
      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => {
            setEditMember(null);
            setPopupMember(null);
          }}
          onUpdateMember={(data) => {
            setContacts((prev) => prev.map((m) => (m.id === data.id ? data : m)));
            setEditMember(null);
            setPopupMember(null);
          }}
        />
      )}

      {/* POPUP DETAILS */}
      {popupMember && (
        <DetailsEvangePopup
          member={popupMember}
          onClose={() => setPopupMember(null)}
          onEdit={(m) => {
            setEditMember(m);
            setPopupMember(null);
          }}
        />
      )}
    </div>
  );
}
