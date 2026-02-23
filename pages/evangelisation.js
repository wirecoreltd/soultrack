"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabaseClient";
import HeaderPages from "../components/HeaderPages";
import EditEvangelisePopup from "../components/EditEvangelisePopup";
import DetailsEvangePopup from "../components/DetailsEvangePopup";
import ProtectedRoute from "../components/ProtectedRoute";
import useChurchScope from "../hooks/useChurchScope";
import Footer from "../components/Footer";

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
  
  // 🔹 Popup doublon
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonsDetected, setDoublonsDetected] = useState([]);
  const [pendingContacts, setPendingContacts] = useState([]);

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

   useEffect(() => {
    if (!profile) return; // attendre le hook

    fetchContacts();
    fetchCellules();
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
  const checkDoublons = async () => {
    if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) return;

    const { data: existingSuivis } = await supabase
      .from("suivis_des_evangelises")
      .select("telephone");

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

      // Insert dans suivis_des_evangelises
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
        Date_Evangelise: m.created_at, 
        date_suivi: new Date().toISOString(),
        eglise_id: profile?.eglise_id || null,
        branche_id: profile?.branche_id || null
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

      // Construire message WhatsApp
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

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#333699]">
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
                    : c.cellule_fulls
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
                <p className="text-center text-sm text-orange-500 font-semibold underline cursor-pointer" onClick={() => setOpenPhoneMenuId(member.id)}>{member.telephone || "—"}</p>
                {openPhoneMenuId === member.id && (
                  <div ref={phoneMenuRef} className="phone-menu absolute mt-2 bg-white rounded-lg shadow-lg border z-50 w-52 left-1/2 -translate-x-1/2" onClick={(e) => e.stopPropagation()}>
                    <a href={member.telephone ? `tel:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📞 Appeler</a>
                    <a href={member.telephone ? `sms:${member.telephone}` : "#"} className="block px-4 py-2 text-sm text-black hover:bg-gray-100">✉️ SMS</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}?call` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">📱 Appel WhatsApp</a>
                    <a href={member.telephone ? `https://wa.me/${member.telephone.replace(/\D/g,"")}` : "#"} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">💬 Message WhatsApp</a>
                  </div>
                )}
                <p className="text-center mt-3 text-sm">🏙️ Ville : {member.ville || "—"}</p>
                <label className="flex justify-center gap-2 mt-4">
                  <input type="checkbox" checked={checkedContacts[member.id] || false} onChange={() => handleCheck(member.id)} /> Sélectionner
                </label>
                  <p className="text-[11px] text-gray-400 text-right mt-3">Créé le {formatDateFr(member.created_at)} </p>
                <button onClick={() => setDetailsOpen(prev => ({ ...prev, [member.id]: !prev[member.id] }))} className="text-orange-500 underline text-sm block mx-auto mt-2">
                  {detailsOpen[member.id] ? "Fermer détails" : "Détails"}
                </button>

               {detailsOpen[member.id] && (                  
                  <div className="text-sm mt-2 space-y-1">
                    <p>💬 WhatsApp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                    <p>🎗️ Sexe : {member.sexe || "—"}</p>
                    <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "—"}</p>
                    <p>☀️ Type : {member.type_conversion || "—"}</p>
                    <p>❓ Difficultés / Besoins : {formatBesoin(member.besoin)}</p>
                    <p>📝 Infos supplémentaires : {formatBesoin(member.infos_supplementaires)}</p>
                
                    {/* CARTE UNIQUE – ACTIONS */}
                    <div className="mt-3 bg-gray-50 rounded-xl shadow-md p-4">
                      <div className="flex flex-col gap-2">
                        {/* Modifier */}
                        <button
                          onClick={() => {
                            setEditMember(member);
                            setPopupMember(null);
                          }}
                          className="w-full py-2 rounded-lg text-orange-500"
                        >
                          ✏️ Modifier le contact
                        </button>
                
                        {/* Supprimer */}
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "⚠️ Suppression définitive\n\nVoulez-vous vraiment supprimer ce contact ?"
                              )
                            ) {
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
            setContacts((prev) => prev.map((c) => (c.id === updatedMember.id ? updatedMember : c)));
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 text-center">
            <h2 className="text-xl font-bold">⚠️ Doublons détectés</h2>
            <p className="text-sm">Ces contacts sont déjà enregistrés dans les suivis. 
            Vous pouvez les garder sur la page ou les supprimer.          
            </p>

            <ul className="text-left list-disc list-inside max-h-60 overflow-y-auto space-y-2">
              {doublonsDetected.map((d) => (
                <li key={d.id} className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-gray-100 p-2 rounded">
                  <span>{d.prenom} {d.nom} - {d.telephone}</span>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        sendToWhatsapp([d]);
                        setDoublonsDetected((prev) => prev.filter((c) => c.id !== d.id));
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded font-semibold"
                    >
                      Envoyer
                    </button>
                    <button
                      onClick={() => {
                        setDoublonsDetected((prev) => prev.filter((c) => c.id !== d.id));
                      }}
                      className="bg-gray-300 px-3 py-1 rounded font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {doublonsDetected.length === 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowDoublonPopup(false)}
                  className="bg-blue-500 text-white px-4 py-2 rounded font-semibold"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
        <Footer />
    </div>
  );
}
