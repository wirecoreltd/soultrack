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
  const { profile, scopedQuery } = useChurchScope();

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

  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [contactsToSendNow, setContactsToSendNow] = useState([]);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
  }, [profile]);

  const fetchContacts = async () => {
    try {
      const query = scopedQuery("evangelises");
      if (!query) return;

      const { data } = await query
        .eq("status_suivi", "Non envoyé")
        .order("created_at", { ascending: false });

      setContacts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCellules = async () => {
    const query = scopedQuery("cellules");
    if (!query) return;

    const { data } = await query.select("*");
    setCellules(data || []);
  };

  const fetchConseillers = async () => {
    const query = scopedQuery("profiles");
    if (!query) return;

    const { data } = await query.select("*").eq("role", "Conseiller");
    setConseillers(data || []);
  };

  /* ================= UTILS ================= */

  const handleCheck = (id) =>
    setCheckedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedContacts = contacts.filter((c) => checkedContacts[c.id]);
  const hasSelectedContacts = selectedContacts.length > 0;

  /* ================= CHECK + OPEN POPUP ================= */

  const checkDoublons = () => {
    if (!hasSelectedContacts || !selectedTargetType || !selectedTarget) {
      alert("⚠️ Sélection incomplète");
      return;
    }

    setContactsToSendNow(selectedContacts);
    setShowWhatsappPopup(true);
  };

  /* ================= SEND WHATSAPP ================= */

  const sendToWhatsapp = async (contactsToSend = contactsToSendNow) => {
    setLoadingSend(true);

    try {
      const cible =
        selectedTargetType === "cellule"
          ? cellules.find((c) => c.id === selectedTarget)
          : conseillers.find((c) => c.id === selectedTarget);

      if (!cible) {
        alert("⚠️ Cible introuvable");
        setLoadingSend(false);
        return;
      }

      // numéro cible fallback
      let targetPhone = cible.telephone?.replace(/\D/g, "") || "";

      // message
      let message = `👋 Bonjour ${selectedTargetType === "cellule" ? cible.cellule_full : cible.prenom},\n\n`;

      message += "Voici les contacts :\n\n";

      contactsToSend.forEach((m, i) => {
        message += `👤 ${i + 1}. ${m.prenom} ${m.nom}\n`;
        message += `🏙️ Ville : ${m.ville || "—"}\n\n`;
      });

      message += "Merci ✨";

      // numéro saisi prioritaire
      const finalPhone = phoneNumber?.replace(/\D/g, "");

      const whatsappLink = finalPhone
        ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`
        : targetPhone
        ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;

      window.open(whatsappLink, "_blank");

      alert("✅ WhatsApp ouvert");

    } catch (err) {
      console.error(err);
      alert("❌ Erreur envoi");
    } finally {
      setLoadingSend(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen p-6 bg-[#333699]">
      <HeaderPages />

      <h1 className="text-white text-3xl mb-4 text-center">
        Contacts
      </h1>

      {/* SELECT TARGET */}
      <div className="max-w-md mx-auto mb-6">
        <select
          value={selectedTargetType}
          onChange={(e) => {
            setSelectedTargetType(e.target.value);
            setSelectedTarget("");
          }}
          className="w-full mb-3 p-2 rounded"
        >
          <option value="">-- Envoyer à --</option>
          <option value="cellule">Cellule</option>
          <option value="conseiller">Conseiller</option>
        </select>

        {selectedTargetType && (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full mb-3 p-2 rounded"
          >
            <option value="">-- Choisir --</option>
            {(selectedTargetType === "cellule" ? cellules : conseillers).map((c) => (
              <option key={c.id} value={c.id}>
                {selectedTargetType === "cellule"
                  ? c.cellule_full
                  : `${c.prenom} ${c.nom}`}
              </option>
            ))}
          </select>
        )}

        {hasSelectedContacts && selectedTarget && (
          <button
            onClick={checkDoublons}
            className="w-full bg-green-500 text-white py-2 rounded"
          >
            📤 Envoyer WhatsApp
          </button>
        )}
      </div>

      {/* CONTACT LIST */}
      <div className="max-w-4xl mx-auto bg-white p-4 rounded">
        {contacts.map((c) => (
          <div key={c.id} className="flex justify-between border-b py-2">
            <div>
              {c.prenom} {c.nom}
            </div>
            <input
              type="checkbox"
              checked={checkedContacts[c.id] || false}
              onChange={() => handleCheck(c.id)}
            />
          </div>
        ))}
      </div>

      {/* POPUP WHATSAPP */}
      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">

            <h2 className="text-xl font-bold mb-3">
              Envoyer WhatsApp
            </h2>

            <p className="mb-4 text-gray-600">
              Cliquez sur Envoyer ou saisissez un numéro manuellement.
            </p>

            <input
              type="text"
              placeholder="Numéro (ex: +230...)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWhatsappPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  sendToWhatsapp();
                  setShowWhatsappPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 bg-green-500 text-white py-2 rounded"
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
