"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import EditEvangelisePopup from "../../components/EditEvangelisePopup";
import ProtectedRoute from "../../components/ProtectedRoute";
import useChurchScope from ".../../../hooks/useChurchScope";
import Footer from "../../components/Footer";

export default function Evangelisation() {
  return (
    <ProtectedRoute allowedRoles={["Administrateur", "ResponsableEvangelisation"]}>
      <EvangelisationContent />
    </ProtectedRoute>
  );
}

function EvangelisationContent() {
  const { profile, loading: loadingProfile, error: profileError, scopedQuery } = useChurchScope();
  const [contacts, setContacts] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [familles, setFamilles] = useState([]); // ✅ familles state
  const [conseillers, setConseillers] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [checkedContacts, setCheckedContacts] = useState({});
  const [detailsOpen, setDetailsOpen] = useState({});
  const [editMember, setEditMember] = useState(null);
  const [popupMember, setPopupMember] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [openPhoneMenuId, setOpenPhoneMenuId] = useState(null);
  const phoneMenuRef = useRef(null);
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [targetName, setTargetName] = useState("");

  const contactsToSendRef = useRef([]);
  const [contactsToSendNow, setContactsToSendNow] = useState([]);

  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonsDetected, setDoublonsDetected] = useState([]);
  const [pendingContacts, setPendingContacts] = useState([]);

  const selectedTargetTypeRef = useRef("");
  const selectedTargetRef = useRef("");

  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("members_view") || "card";
    }
    return "card";
  });

  useEffect(() => {
    localStorage.setItem("members_view", view);
  }, [view]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(e.target)) {
        setOpenPhoneMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!profile) return;
    fetchContacts();
    fetchCellules();
    fetchFamilles(); // ✅
    fetchConseillers();
  }, [profile]);

  const fetchContacts = async () => {
    try {
      const query = scopedQuery("evangelises");
      if (!query) return;
      const { data, error } = await query
        .eq("status_suivi", "Non envoyé")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error("Erreur fetchContacts:", err.message);
      setContacts([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const query = scopedQuery("cellules");
      if (!query) return;
      const { data, error } = await query.select("id, cellule_full, responsable, telephone, ville");
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  // ✅ Fetch familles — même logique que cellules
  const fetchFamilles = async () => {
    try {
      const query = scopedQuery("familles");
      if (!query) return;
      const { data, error } = await query.select("id, famille_full, responsable, telephone, ville");
      if (error) throw error;
      setFamilles(data || []);
    } catch (err) {
      console.error("Erreur fetchFamilles:", err.message);
      setFamilles([]);
    }
  };

  const fetchConseillers = async () => {
    try {
      const query = scopedQuery("profiles");
      if (!query) return;
      const { data, error } = await query.select("id, prenom, nom, telephone").eq("role", "Conseiller");
      if (error) throw error;
      setConseillers(data || []);
    } catch (err) {
      console.error("Erreur fetchConseillers:", err.message);
      setConseillers([]);
    }
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

  const formatDateFr = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getBorderColor = (member) => {
    if (member.is_whatsapp) return "#25D366";
    if (member.besoin) return "#FFB800";
    return "#888";
  };

  // ✅ Helper : résoudre le nom/téléphone de la cible selon le type
  const resolveCible = (targetType, targetId) => {
    if (targetType === "cellule") return cellules.find((c) => c.id === targetId);
    if (targetType === "famille") return familles.find((f) => f.id === targetId);
    if (targetType === "conseiller") return conseillers.find((c) => c.id === targetId);
    return null;
  };

  const getCibleName = (targetType, cible) => {
    if (!cible) return "";
    if (targetType === "conseiller") return `${cible.prenom} ${cible.nom}`;
    return cible.responsable || cible.cellule_full || cible.famille_full || "";
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

  /* ================= VÉRIFICATION DOUBLONS ================= */
  const checkDoublons = async () => {
    if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) return;

    selectedTargetTypeRef.current = selectedTargetType;
    selectedTargetRef.current = selectedTarget;
    contactsToSendRef.current = selectedContacts;

    const { data: existingSuivis } = await supabase
      .from("suivis_des_evangelises")
      .select("telephone");

    const detected = selectedContacts.filter((c) =>
      (existingSuivis || []).some((s) => s.telephone === c.telephone)
    );

    if (detected.length > 0) {
      setDoublonsDetected(detected);
      setPendingContacts(selectedContacts);
      setShowDoublonPopup(true);
    } else {
      setContactsToSendNow(selectedContacts);
      contactsToSendRef.current = selectedContacts;

      const cible = resolveCible(selectedTargetType, selectedTarget);
      const cibleName = getCibleName(selectedTargetType, cible);

      setPhoneNumber(cible?.telephone || "");
      setTargetName(cibleName);
      setShowWhatsappPopup(true);
    }
  };

  /* ================= ÉCRITURE DANS suivi_assignments_evangelises ================= */
  const writeAssignments = async (insertedSuivis, targetType, targetId) => {
    if (!insertedSuivis || insertedSuivis.length === 0) return;
    if (targetType !== "conseiller") return;
    if (!targetId) return;

    const assignmentRows = insertedSuivis.map((suivi) => ({
      suivi_evangelise_id: suivi.id,
      conseiller_id: targetId,
      role: "principal",
      statut: "actif",
      assigned_by: profile?.id || null,
    }));

    const { data, error } = await supabase
      .from("suivi_assignments_evangelises")
      .insert(assignmentRows)
      .select();

    if (error) console.error("Erreur écriture suivi_assignments_evangelises :", error);
  };

  /* ================= SEND MESSAGE ================= */
  const sendToWhatsapp = async (contactsToSend, targetType, targetId) => {
    setShowDoublonPopup(false);
    setShowWhatsappPopup(false);
    setLoadingSend(true);

    try {
      if (!targetType || !targetId) {
        alert("⚠️ Veuillez sélectionner une cible");
        setLoadingSend(false);
        return;
      }

      if (!contactsToSend || contactsToSend.length === 0) {
        alert("⚠️ Aucun contact sélectionné");
        setLoadingSend(false);
        return;
      }

      const cible = resolveCible(targetType, targetId);

      if (!cible) {
        alert("⚠️ Cible introuvable");
        setLoadingSend(false);
        return;
      }

      // 🔹 Préparer les inserts pour suivis_des_evangelises
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
        conseiller_id: targetType === "conseiller" ? targetId : null,
        cellule_id: targetType === "cellule" ? targetId : null,
        famille_id: targetType === "famille" ? targetId : null, // ✅
        date_evangelise: m.date_evangelise,
        date_suivi: new Date().toISOString(),
        eglise_id: profile?.eglise_id || null,
        type_evangelisation: m.type_evangelisation,
      }));

      const { data: insertedSuivis, error: insertError } = await supabase
        .from("suivis_des_evangelises")
        .insert(inserts)
        .select("id, conseiller_id");

      if (insertError) throw insertError;

      await writeAssignments(insertedSuivis, targetType, targetId);

      const ids = contactsToSend.map((c) => c.id);
      const { error: updateError } = await supabase
        .from("evangelises")
        .update({ status_suivi: "Envoyé" })
        .in("id", ids);
      if (updateError) throw updateError;

      setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
      setCheckedContacts({});

      // 🔹 Construire le message WhatsApp
      const cibleName = getCibleName(targetType, cible);
      let message = `👋 Bonjour ${cibleName},\n\n`;
      message +=
        contactsToSend.length > 1
          ? "Nous te confions avec joie les personnes suivantes rencontrées lors de l'évangélisation.\n\n"
          : "Nous te confions avec joie la personne suivante rencontrée lors de l'évangélisation.\n\n";

      contactsToSend.forEach((m, i) => {
        message += "────────────────────\n";
        if (contactsToSend.length > 1) message += `👥 Personne ${i + 1}\n`;
        message += `📣 Type d'Evangélisation : ${m.type_evangelisation || "—"}
📅 Date évangélisé : ${formatDateFr(m.date_evangelise)}  
🎗️ Civilité : ${m.sexe || "—"}  
👤 Nom : ${m.prenom} ${m.nom}      
⏳ Tranche d'age : ${m.age || "—"}  
🏙️ Ville : ${m.ville || "—"}      
📞 Téléphone: ${m.telephone || "—"}  
💬 WhatsApp : ${m.is_whatsapp ? "Oui" : "Non"}     
🙏 Prière du salut : ${m.priere_salut ? "Oui" : "Non"}      
☀️ Type de conversion : ${m.type_conversion || "—"}               
❓ Difficultés / Besoins : ${formatBesoin(m.besoin)}      
📝 Infos : ${m.infos_supplementaires || "—"}

`;
      });

      message += "Merci pour ton engagement ✨";

      const rawPhone = phoneNumber ? phoneNumber.replace(/\D/g, "") : "";
      const targetPhone = rawPhone.length >= 8 ? rawPhone : "";
      const whatsappLink = targetPhone
        ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

      window.open(whatsappLink, "_blank");
      setPhoneNumber("");
      setTargetName("");

      alert("✅ Contacts envoyés et enregistrés");
    } catch (err) {
      console.error("Erreur envoi WhatsApp :", err);
      alert("❌ Erreur lors de l'envoi : " + err.message);
    } finally {
      setLoadingSend(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
      <HeaderPages />
      <h1 className="text-2xl font-bold mt-4 mb-6 text-blue-300 text-center text-white">
        Gestion des contacts <span className="text-emerald-300"> Evangélisés</span>
      </h1>
      <div className="max-w-3xl w-full mb-6 text-center">
        <p className="italic text-base text-white/90">
          Cette page <span className="text-blue-300 font-semibold">centralise </span> tous les contacts évangélisés et facilite la
          <span className="text-blue-300 font-semibold"> gestion de leur suivi.</span>
          Vous pouvez transmettre chaque contact à un conseiller ou à une cellule, et envoyer les informations directement via WhatsApp.
          Chaque contact peut être consulté en détail, modifié ou supprimé,{" "}
          <span className="text-blue-300 font-semibold">
            garantissant un suivi précis et organisé de l'évangélisation au sein de votre église
          </span>
          .
        </p>
      </div>

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
          <option value="famille">Une Famille</option> {/* ✅ */}
          <option value="conseiller">Un Conseiller</option>
        </select>

        {selectedTargetType && (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 text-center"
          >
            <option value="">-- Choisir --</option>
            {/* ✅ Liste selon le type sélectionné */}
            {selectedTargetType === "cellule" && cellules.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ville ? `${c.cellule_full} - ${c.ville}` : c.cellule_full}
              </option>
            ))}
            {selectedTargetType === "famille" && familles.map((f) => (
              <option key={f.id} value={f.id}>
                {f.ville ? `${f.famille_full} - ${f.ville}` : f.famille_full}
              </option>
            ))}
            {selectedTargetType === "conseiller" && conseillers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.prenom} {c.nom}
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

      {/* ================= AFFICHAGE CONTACTS ================= */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        {contacts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
            {contacts.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-xl p-4 border-l-4 relative"
                style={{ borderLeftColor: getBorderColor(member) }}
              >
                <h2 className="font-bold text-center">
                  {member.prenom} {member.nom}
                </h2>
                <p
                  className="text-center text-sm text-orange-500 font-semibold underline cursor-pointer"
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
                    <a href={member.telephone ? `tel:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                    <a href={member.telephone ? `sms:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g, "")}?call` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g, "")}` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
                  </div>
                )}
                <p className="text-center mt-3 text-sm">🏙️ Ville : {member.ville || "—"}</p>
                <label className="flex justify-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    checked={checkedContacts[member.id] || false}
                    onChange={() => handleCheck(member.id)}
                  />{" "}
                  Sélectionner
                </label>
                <p className="text-[11px] text-gray-400 text-right mt-3">
                  Evangélisé le {formatDateFr(member.date_evangelise)}
                </p>
                <button
                  onClick={() => setDetailsOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
                  className="text-orange-500 underline text-sm block mx-auto mt-2"
                >
                  {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                </button>

                {detailsOpen[member.id] && (
                  <div className="text-black text-sm mt-3 w-full space-y-4">
                    <div>
                      <p>📣 Type d'Evangélisation : {member.type_evangelisation || ""}</p>
                    </div>
                    <hr />
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">👤 Identité</p>
                      <p>🎗️ Civilité : {member.sexe || "—"}</p>
                      <p>⏳ Tranche d'age : {member.age || "—"}</p>
                      <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                    </div>
                    <hr />
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">🕊 Vie spirituelle</p>
                      <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "—"}</p>
                      <p>☀️ Type de conversion : {member.type_conversion || "—"}</p>
                    </div>
                    <hr />
                    <div>
                      <p className="font-bold text-[#2E3192] mb-1">❤️‍🩹 Soin pastoral</p>
                      <p>❓ Difficultés / Besoins : {formatBesoin(member.besoin)}</p>
                      <p>📝 Infos supplémentaires : {formatBesoin(member.infos_supplementaires)}</p>
                    </div>
                    <div className="mt-3 bg-gray-50 rounded-xl shadow-md p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => { setEditMember(member); setPopupMember(null); }}
                          className="w-full py-2 rounded-lg text-orange-500"
                        >
                          ✏️ Modifier le contact
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("⚠️ Suppression définitive\n\nVoulez-vous vraiment supprimer ce contact ?")) {
                              handleSupprimerMembre(member.id);
                            }
                          }}
                          className="w-full py-2 rounded-lg text-red-600 text-xs"
                        >
                          🗑️ Supprimer le contact
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP EDIT */}
      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          familles={familles} // ✅
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={(updatedMember) => {
            setContacts((prev) => prev.map((c) => (c.id === updatedMember.id ? updatedMember : c)));
            setEditMember(null);
          }}
        />
      )}

      {/* 🔹 Popup Doublon */}
      {showDoublonPopup && doublonsDetected.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 text-center">
            <h2 className="text-xl font-bold">⚠️ Doublons détectés</h2>
            <p className="text-sm">Ces contacts sont déjà enregistrés dans les suivis.</p>
            <ul className="text-left list-disc list-inside max-h-60 overflow-y-auto space-y-2">
              {doublonsDetected.map((d) => (
                <li key={d.id} className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-gray-100 p-2 rounded">
                  <span>{d.prenom} {d.nom} - {d.telephone}</span>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        sendToWhatsapp([d], selectedTargetTypeRef.current, selectedTargetRef.current);
                        setDoublonsDetected((prev) => prev.filter((c) => c.id !== d.id));
                        setShowDoublonPopup(false);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded font-semibold"
                    >
                      Envoyer
                    </button>
                    <button
                      onClick={() => setDoublonsDetected((prev) => prev.filter((c) => c.id !== d.id))}
                      className="bg-gray-300 px-3 py-1 rounded font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </li>
              ))}
              {doublonsDetected.length === 0 && (
                <div className="mt-4">
                  <button onClick={() => setShowDoublonPopup(false)} className="bg-blue-500 text-white px-4 py-2 rounded font-semibold">
                    Fermer
                  </button>
                </div>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* 🔹 Popup WhatsApp */}
      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <p className="text-gray-700 mb-4">
              Vérifiez les informations du responsable avant d'envoyer. Si le numéro est effacé,
              WhatsApp s'ouvrira sur vos contacts.
            </p>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">👤 Nom du responsable</label>
            <input
              type="text"
              placeholder="Nom du responsable"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
            />
            <label className="text-sm font-semibold text-gray-600 mb-1 block">📞 Numéro WhatsApp</label>
            <input
              type="text"
              placeholder="+3363xxx... — laisser vide pour choisir dans vos contacts"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowWhatsappPopup(false); setPhoneNumber(""); setTargetName(""); }}
                className="flex-1 py-3 bg-gray-300 rounded-2xl font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={() => sendToWhatsapp(contactsToSendRef.current, selectedTargetTypeRef.current, selectedTargetRef.current)}
                className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-semibold"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
