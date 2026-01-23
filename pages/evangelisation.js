"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";

export default function Evangelisation() {
  const [contacts, setContacts] = useState(null);
  const [cellules, setCellules] = useState([]);
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [popupMember, setPopupMember] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [view, setView] = useState("card");
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);

  // 🔹 Popup doublon
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(null);
  const [pendingContacts, setPendingContacts] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("evangelises")
      .select("*")
      .eq("status_suivi", "Non envoyé")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Erreur fetchContacts:", error);
      setContacts([]);
      return;
    }
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

  /* ================= SUPPRESSION ================= */
  const handleSupprimerMembre = async (id) => {
    try {
      const { error } = await supabase
        .from("evangelises")
        .update({ status_suivi: "supprime" })
        .eq("id", id);

      if (error) {
        console.error("Erreur suppression :", error);
        alert("❌ Erreur lors de la suppression");
        return;
      }

      setContacts((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la suppression");
    }
  };

  /* ================= ENVOI WHATSAPP ================= */
  // State pour doublons multiples
const [showDoublonPopup, setShowDoublonPopup] = useState(false);
const [doublonsDetected, setDoublonsDetected] = useState([]);
const [pendingContacts, setPendingContacts] = useState([]);

        // Fonction de vérification des doublons avant envoi
        const checkDoublons = async () => {
          if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) return;
        
          // Récupérer tous les numéros déjà dans les suivis
          const { data: existingSuivis } = await supabase
            .from("suivis_des_evangelises")
            .select("telephone");
        
          // Filtrer les contacts sélectionnés qui sont déjà en suivi
          const detected = selectedContacts.filter((c) =>
            existingSuivis.some((s) => s.telephone === c.telephone)
          );
        
          if (detected.length > 0) {
            setDoublonsDetected(detected);
            setPendingContacts(selectedContacts);
            setShowDoublonPopup(true);
          } else {
            sendToWhatsapp(selectedContacts);
          }
        };
        
        // Fonction envoi WhatsApp (appelé par popup)
        const sendToWhatsapp = async (contactsToSend = pendingContacts) => {
          setShowDoublonPopup(false);
          setPendingContacts([]);
          setLoadingSend(true);
        
          try {
            const cible =
              selectedTargetType === "cellule"
                ? cellules.find((c) => c.id === selectedTarget)
                : conseillers.find((c) => c.id === selectedTarget);
        
            if (!cible || !cible.telephone) throw new Error("Numéro cible invalide");
        
            // INSERT dans suivis_des_evangelises
            const inserts = contactsToSend.map((m) => ({
              prenom: m.prenom,
              nom: m.nom,
              telephone: m.telephone,
              is_whatsapp: m.is_whatsapp,
              ville: m.ville,
              besoin: m.besoin,
              infos_supplementaires: m.infos_supplementaires,
              sexe: m.sexe,
              type_conversion: m.type_conversion,
              priere_salut: m.priere_salut,
              status_suivis_evangelises: "Envoyé",
              evangelise_id: m.id,
              conseiller_id: selectedTargetType === "conseiller" ? selectedTarget : null,
              cellule_id: selectedTargetType === "cellule" ? selectedTarget : null,
              date_suivi: new Date().toISOString()
            }));
        
            const { error: insertError } = await supabase
              .from("suivis_des_evangelises")
              .insert(inserts);
            if (insertError) throw insertError;
        
            const ids = contactsToSend.map((c) => c.id);
            const { error: updateError } = await supabase
              .from("evangelises")
              .update({ status_suivi: "Envoyé" })
              .in("id", ids);
            if (updateError) throw updateError;
        
            setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
            setCheckedContacts({});
        
            // 🔹 Construction du message WhatsApp (ici, tout est dans la fonction)
            let message = `👋 Bonjour ${selectedTargetType === "cellule" ? cible.cellule_full : cible.prenom},\n\n`;
            message += contactsToSend.length > 1
              ? "Nous te confions avec joie les personnes suivantes rencontrées lors de l’évangélisation.\n\n"
              : "Nous te confions avec joie la personne suivante rencontrée lors de l’évangélisation.\n\n";
        
            contactsToSend.forEach((m, i) => {
              message += "────────────────────\n";
              if (contactsToSend.length > 1) message += `👥 Personne ${i + 1}\n`;
              message += `👤 Nom : ${m.prenom} ${m.nom}\n📱 Téléphone : ${m.telephone || "—"}\n🏙️ Ville : ${m.ville || "—"}\n💬 WhatsApp : ${m.is_whatsapp ? "Oui" : "Non"}\n🎗️ Sexe : ${m.sexe || "—"}\n🙏 Prière du salut : ${m.priere_salut ? "Oui" : "Non"}\n☀️ Type de conversion : ${m.type_conversion || "—"}\n❓ Besoin : ${formatBesoin(m.besoin)}\n📝 Infos : ${m.infos_supplementaires || "—"}\n\n`;
            });
            message += "Merci pour ton engagement ✨";
        
            window.open(
              `https://wa.me/${cible.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
              "_blank"
            );
        
            alert("✅ Contacts envoyés et enregistrés");
        
          } catch (err) {
            console.error(err);
            alert("❌ Erreur lors de l’envoi");
          } finally {
            setLoadingSend(false);
          }
        };
      // Optionnel: ouverture WhatsApp (comme avant)
      let message = `👋 Bonjour ${selectedTargetType === "cellule" ? cible.cellule_full : cible.prenom},\n\n`;
      message += contactsToSend.length > 1
        ? "Nous te confions avec joie les personnes suivantes rencontrées lors de l’évangélisation.\n\n"
        : "Nous te confions avec joie la personne suivante rencontrée lors de l’évangélisation.\n\n";
      contactsToSend.forEach((m, i) => {
        message += "────────────────────\n";
        if (contactsToSend.length > 1) message += `👥 Personne ${i + 1}\n`;
        message += `👤 Nom : ${m.prenom} ${m.nom}\n
        📱 Téléphone : ${m.telephone || "—"}\n
        🏙️ Ville : ${m.ville || "—"}\n
        💬 WhatsApp : ${m.is_whatsapp ? "Oui" : "Non"}\n
        🎗️ Sexe : ${m.sexe || "—"}\n
        🙏 Prière du salut : ${m.priere_salut ? "Oui" : "Non"}\n
        ☀️ Type de conversion : ${m.type_conversion || "—"}\n
        ❓ Besoin : ${formatBesoin(m.besoin)}\n
        📝 Infos : ${m.infos_supplementaires || "—"}\n\n`;
      });
      message += "Merci pour ton engagement ✨";

      if (cible.telephone) {
        window.open(
          `https://wa.me/${cible.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      }

    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l’envoi");
    } finally {
      setLoadingSend(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-r from-blue-800 to-cyan-400">
      <HeaderPages />
      <h1 className="text-4xl text-white text-center mb-4">Évangélisation</h1>

      {/* Sélection cible */}
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
                {selectedTargetType === "cellule"
                  ? c.ville
                    ? `${c.cellule_full} - ${c.ville}`
                    : c.cellule_full
                  : `${c.prenom} ${c.nom}`}
              </option>
            ))}
          </select>
        )}

        {hasSelectedContacts && selectedTarget && (
          <button
            onClick={checkDoublons}
            disabled={loadingSend}
            className="w-full bg-green-500 text-white font-bold px-4 py-2 rounded"
          >
            {loadingSend ? "Envoi..." : "📤 Envoyer WhatsApp"}
          </button>
        )}
      </div>

         {/* Toggle Vue Carte / Vue Table */}
            <div className="w-full max-w-6xl flex justify-center gap-4 mb-4">
              <button
                onClick={() => setView(view === "card" ? "table" : "card")}
                className="text-sm font-semibold underline text-white"
              >
                {view === "card" ? "Vue Table" : "Vue Carte"}
              </button>
            </div>  

      {/* ================= AFFICHAGE CONTACTS ================= */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* VUE CARTE */}
        {contacts && view === "card" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
            {contacts.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl shadow-xl p-4 border-l-4 relative" style={{ borderLeftColor: getBorderColor(member) }}>
                <h2 className="font-bold text-center">{member.prenom} {member.nom}</h2>
                <p className="text-center text-sm text-orange-500 underline cursor-pointer" onClick={() => setOpenPhoneMenuId(member.id)}>{member.telephone || "—"}</p>
                {openPhoneMenuId === member.id && (
                  <div ref={phoneMenuRef} className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2" onClick={(e) => e.stopPropagation()}>
                    <a href={member.telephone ? `tel:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                    <a href={member.telephone ? `sms:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
                  </div>
                )}
                <p className="text-center text-sm">🏙️ Ville : {member.ville || "—"}</p>
                <label className="flex justify-center gap-2 mt-2">
                  <input type="checkbox" checked={checkedContacts[member.id] || false} onChange={() => handleCheck(member.id)} /> Sélectionner
                </label>
                <button onClick={() => setDetailsOpen(prev => ({ ...prev, [member.id]: !prev[member.id] }))} className="text-orange-500 underline text-sm block mx-auto mt-2">
                  {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                </button>
                {detailsOpen[member.id] && (
                  <div className="text-sm mt-3 space-y-1">
                    <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🎗️ Sexe : {member.sexe || "—"}</p>
                    <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "—"}</p>
                    <p>☀️ Type : {member.type_conversion || "—"}</p>
                    <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
                    <p>📝 Infos supplémentaires : {formatBesoin(member.infos_supplementaires)}</p>
                    <button onClick={() => { setEditMember(member); setPopupMember(null); }} className="text-blue-600 text-sm mt-4 w-full text-center">✏️ Modifier le contact</button>
                    <button
                      onClick={() => {
                        if (window.confirm("⚠️ Suppression définitive\n\nVoulez-vous vraiment supprimer ce contact ?")) {
                          handleSupprimerMembre(member.id); 
                        }
                      }}
                      className="text-red-600 text-sm mt-2 w-full"
                    >
                      🗑️ Supprimer le contact
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VUE TABLE */}
        {contacts && view === "table" && (
          <div className="w-full max-w-6xl overflow-x-auto py-2">
            <div className="min-w-[700px] space-y-2">
              <div className="hidden sm:flex text-sm font-semibold uppercase text-white px-2 py-1 border-b border-gray-400 bg-transparent">
                <div className="flex-[2]">Nom complet</div>
                <div className="flex-[1]">Téléphone</div>
                <div className="flex-[1]">Ville</div>
                <div className="flex-[1] flex justify-center items-center">Sélectionner</div>
                <div className="flex-[1]">Action</div>
              </div>
              {contacts.map((m) => (
                <div key={m.id} className="flex flex-row items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-150 gap-2 border-l-4" style={{ borderLeftColor: getBorderColor(m) }}>
                  <div className="flex-[2] text-white flex items-center gap-1">{m.prenom} {m.nom}</div>
                  <div className="flex-[1] text-white">{m.telephone || "—"}</div>
                  <div className="flex-[1] text-white">{m.ville || "—"}</div>
                  <div className="flex-[1] flex justify-center items-center"><input type="checkbox" checked={checkedContacts[m.id] || false} onChange={() => handleCheck(m.id)} /></div>
                  <div className="flex-[1]"><button onClick={() => setPopupMember(m)} className="text-orange-500 underline text-sm">Détails</button></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* POPUPS EDIT */}
      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updatedMember) => {
            setContacts((prev) =>
              prev.map((c) => (c.id === updatedMember.id ? updatedMember : c))
            );
            setEditMember(null);
          }}
        />
      )}

      {popupMember && (
        <DetailsEvangePopup
          member={popupMember}
          onClose={() => setPopupMember(null)}
          onEdit={(m) => { setEditMember(m); setPopupMember(null); }}
        />
      )}

      {/* 🔹 Popup Doublon - Moderne */}
      {showDoublonPopup && doublonsDetected.length > 0 && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 w-96 max-w-[90%] text-center animate-fadeIn">
      <h3 className="text-xl font-bold mb-3 text-gray-800">⚠️ Contact déjà en suivi !</h3>
      <p className="mb-4 text-gray-700">Ces contacts sont déjà enregistrés dans les suivis. 
        Vous pouvez les garder sur la page ou les supprimer. 
        (Ils restent dans les suivis jusqu’à la prochaine étape) :</p>
      <ul className="text-left max-h-40 overflow-y-auto mb-6 px-4">
        {doublonsDetected.map((d, i) => (
          <li key={i} className="border-b py-1 text-gray-800">
            {d.prenom} {d.nom} ({d.telephone})
          </li>
        ))}
      </ul>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => sendToWhatsapp()}
          className="flex-1 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Envoyer quand même
        </button>
        <button
          onClick={() => setShowDoublonPopup(false)}
          className="flex-1 bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-400 transition"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
