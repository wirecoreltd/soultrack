"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    envoyer: "📤 Envoyer par WhatsApp",
    envoi: "Envoi...",
    errNotConnected: "❌ Vous devez être connecté.",
    errDoublonCheck: "❌ Erreur lors de la vérification des doublons",
    errUpdateMembre: "❌ Erreur mise à jour membre",
    toastEnvoye: (nom) => `✅ ${nom} envoyé`,
    doublonTitle: "⚠️ Doublon détecté",
    doublonText: (tel) => `Ce numéro (${tel}) existe déjà.`,
    envoyerQuandMeme: "Envoyer quand même",
    annuler: "Annuler",
    whatsappCheckText:
      "Vérifiez les informations du responsable avant d'envoyer. Si le numéro est effacé, WhatsApp s'ouvrira sur vos contacts.",
    labelNomResponsable: "👤 Nom du responsable",
    labelNumeroWhatsapp: "📞 Numéro WhatsApp",
    placeholderNumero: "+3363xxx... — laisser vide pour choisir dans vos contacts",
    envoyerBtn: "Envoyer",
    // Message WhatsApp
    msgBonjour: (prenom) => `👋 Bonjour ${prenom} !`,
    msgIntro1: "J'espère que tu vas bien 😊",
    msgIntro2: "Je te partage les informations d'un nouveau membre que tu vas pouvoir accompagner :",
    msgNom: "👤 Nom :",
    msgSexe: "🎗️ Sexe :",
    msgAge: "⏳ Âge :",
    msgTelephone: "📱 Téléphone :",
    msgWhatsapp: "💬 WhatsApp :",
    msgVille: "🏙️ Ville :",
    msgRaisonVenue: "✨ Raison de sa venue :",
    msgPriereSalut: "🙏 Prière du salut :",
    msgBesoins: "❓ Besoins :",
    msgInfosSupp: "📝 Infos supplémentaires :",
    msgMerci: "Merci beaucoup pour ton engagement et le temps que tu vas lui consacrer ❤️",
    msgBenediction: "Que ton accompagnement soit une vraie bénédiction.",
    oui: "Oui",
    non: "Non",
    responsableDefaut: "Responsable",
  },
  en: {
    envoyer: "📤 Send via WhatsApp",
    envoi: "Sending...",
    errNotConnected: "❌ You must be logged in.",
    errDoublonCheck: "❌ Error checking for duplicates",
    errUpdateMembre: "❌ Error updating member",
    toastEnvoye: (nom) => `✅ ${nom} sent`,
    doublonTitle: "⚠️ Duplicate detected",
    doublonText: (tel) => `This number (${tel}) already exists.`,
    envoyerQuandMeme: "Send anyway",
    annuler: "Cancel",
    whatsappCheckText:
      "Check the recipient's details before sending. If the number is cleared, WhatsApp will open your contacts.",
    labelNomResponsable: "👤 Recipient's name",
    labelNumeroWhatsapp: "📞 WhatsApp number",
    placeholderNumero: "+3363xxx... — leave empty to choose from your contacts",
    envoyerBtn: "Send",
    // WhatsApp message
    msgBonjour: (prenom) => `👋 Hello ${prenom}!`,
    msgIntro1: "I hope you're doing well 😊",
    msgIntro2: "Here are the details of a new member you'll be supporting:",
    msgNom: "👤 Name:",
    msgSexe: "🎗️ Gender:",
    msgAge: "⏳ Age:",
    msgTelephone: "📱 Phone:",
    msgWhatsapp: "💬 WhatsApp:",
    msgVille: "🏙️ City:",
    msgRaisonVenue: "✨ Reason for coming:",
    msgPriereSalut: "🙏 Prayer of salvation:",
    msgBesoins: "❓ Needs:",
    msgInfosSupp: "📝 Additional info:",
    msgMerci: "Thank you so much for your commitment and the time you'll give ❤️",
    msgBenediction: "May your support be a true blessing.",
    oui: "Yes",
    non: "No",
    responsableDefaut: "Recipient",
  },
};

export default function BoutonEnvoyer({
  membre,
  type = "cellule",
  cible,
  session,
  onEnvoyer,
  showToast
}) {
  const { lang } = useLang();
  const t = translations[lang];

  const [loading, setLoading] = useState(false);
  const [showDoublonPopup, setShowDoublonPopup] = useState(false);
  const [doublonDetected, setDoublonDetected] = useState(false);
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const [messageToSend, setMessageToSend] = useState("");
  const [responsableNom, setResponsableNom] = useState("");

  // =========================
  // 🔹 Vérification doublon
  // =========================
  const checkDoublon = async () => {
    if (!membre.telephone) return false;
    const { data, error } = await supabase
      .from("membres_complets")
      .select("id")
      .eq("telephone", membre.telephone)
      .neq("id", membre.id);
    if (error) { alert(t.errDoublonCheck); return false; }
    return data.length > 0;
  };

  // =========================
  // 🔹 Construction message
  // =========================
  const buildMessage = async () => {
    let responsablePrenom = "";
    let responsableTelephone = "";

    if (type === "cellule") {
      const { data: cellule } = await supabase
        .from("cellules")
        .select("id, responsable_id, cellule_full")
        .eq("id", cible.id)
        .single();

      const { data: resp } = await supabase
        .from("profiles")
        .select("prenom, telephone")
        .eq("id", cellule.responsable_id)
        .single();

      responsablePrenom = resp.prenom;
      responsableTelephone = resp.telephone;
      cible.cellule_full = cellule.cellule_full;
    }

    if (type === "conseiller") {
      responsablePrenom = cible.prenom;
      responsableTelephone = cible.telephone;
    }

    if (type === "famille") {
      const { data: famille } = await supabase
        .from("familles")
        .select("id, responsable_id, famille_full, telephone_responsable")
        .eq("id", cible.id)
        .single();

      if (famille?.responsable_id) {
        const { data: resp } = await supabase
          .from("profiles")
          .select("prenom, telephone")
          .eq("id", famille.responsable_id)
          .single();
        responsablePrenom = resp?.prenom || t.responsableDefaut;
        responsableTelephone = resp?.telephone || famille.telephone_responsable || "";
      } else {
        responsablePrenom = t.responsableDefaut;
        responsableTelephone = famille?.telephone_responsable || "";
      }
      cible.famille_full = famille?.famille_full || cible.famille_full;
    }

    if (type === "numero") {
      responsablePrenom = t.responsableDefaut;
      responsableTelephone = cible;
    }

    let message = `${t.msgBonjour(responsablePrenom)}\n\n`;
    message += `${t.msgIntro1}\n\n`;
    message += `${t.msgIntro2}\n\n`;

    message += `${t.msgNom} ${membre.prenom} ${membre.nom}\n`;
    message += `${t.msgSexe} ${membre.sexe || "—"}\n`;
    message += `${t.msgAge} ${membre.age || "—"}\n`;
    message += `${t.msgTelephone} ${membre.telephone || "—"}\n`;
    message += `${t.msgWhatsapp} ${membre.is_whatsapp ? t.oui : t.non}\n`;
    message += `${t.msgVille} ${membre.ville || "—"}\n\n`;

    message += `${t.msgRaisonVenue} ${membre.statut_initial || "—"}\n`;
    message += `${t.msgPriereSalut} ${membre.priere_salut || "—"}\n`;

    message += `${t.msgBesoins} ${
      membre.besoin
        ? (() => {
            try {
              const besoins = typeof membre.besoin === "string" ? JSON.parse(membre.besoin) : membre.besoin;
              return Array.isArray(besoins) ? besoins.join(", ") : besoins;
            } catch { return membre.besoin; }
          })()
        : "—"
    }\n`;

    message += `${t.msgInfosSupp} ${membre.infos_supplementaires || "—"}\n\n`;

    message += `${t.msgMerci}\n`;
    message += t.msgBenediction;

    setResponsableNom(responsablePrenom);
    return { message, responsableTelephone };
  };

  // =========================
  // 🔹 Click principal
  // =========================
  const handleClick = async () => {
    if (!session) { alert(t.errNotConnected); return; }
    try {
      setLoading(true);
      const { message, responsableTelephone } = await buildMessage();

      if (await checkDoublon()) {
        setDoublonDetected(true);
        setShowDoublonPopup(true);
        setMessageToSend(message);
        setManualPhone(responsableTelephone || "");
        setLoading(false);
        return;
      }

      setMessageToSend(message);
      setManualPhone(responsableTelephone || "");
      setShowWhatsappPopup(true);
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔹 Envoi WhatsApp + écriture Supabase
  // =========================
  const sendToWhatsapp = async () => {
    const phone = manualPhone?.replace(/\D/g, "");
    const whatsappLink = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(messageToSend)}`
      : `https://wa.me/?text=${encodeURIComponent(messageToSend)}`;

    setShowWhatsappPopup(false);
    setShowDoublonPopup(false);
    setDoublonDetected(false);

    window.open(whatsappLink, "_blank");

    try {
      const now = new Date().toISOString();

      const updatePayload = {
        statut: "actif",
        statut_suivis: 1,
        etat_contact: "existant",
        date_envoi_suivi: now,
        notification_responsable: true, // ✅ NOUVEAU — déclenche la notif pour le responsable
      };

      if (type === "cellule") {
        updatePayload.cellule_id = cible.id;
        updatePayload.suivi_cellule_nom = cible.cellule_full || null;
        updatePayload.suivi_responsable = null;
        updatePayload.suivi_responsable_id = null;
      }

      if (type === "conseiller") {
        updatePayload.suivi_responsable = `${cible.prenom} ${cible.nom}`;
        updatePayload.suivi_responsable_id = cible.id;
      }

      if (type === "famille") {
        updatePayload.famille_id = cible.id;
        updatePayload.suivi_responsable = null;
        updatePayload.suivi_responsable_id = null;
      }

      if (onEnvoyer) onEnvoyer(membre.id);

      const { data, error } = await supabase
        .from("membres_complets")
        .update(updatePayload)
        .eq("id", membre.id)
        .select()
        .single();

      if (error) { console.error(error); alert(t.errUpdateMembre); return; }

      // Si type conseiller → écrire dans suivi_assignments
      if (type === "conseiller" && cible?.id) {
        await supabase
          .from("suivi_assignments")
          .delete()
          .eq("membre_id", membre.id)
          .eq("conseiller_id", cible.id);

        const { data: existing } = await supabase
          .from("suivi_assignments")
          .select("id")
          .eq("membre_id", membre.id);

        const role = (!existing || existing.length === 0) ? "principal" : "assistant";

        await supabase.from("suivi_assignments").insert({
          membre_id: membre.id,
          conseiller_id: cible.id,
          role,
          statut: "actif",
        });
      }

      if (showToast) showToast(t.toastEnvoye(`${membre.prenom} ${membre.nom}`));

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // 🔹 UI
  // =========================
  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-white font-bold px-4 py-2 rounded-lg shadow-lg ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? t.envoi : t.envoyer}
      </button>

      {/* ================= POPUP DOUBLON ================= */}
      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 text-center">
            <h3 className="font-bold text-lg mb-3">{t.doublonTitle}</h3>
            <p className="mb-4">{t.doublonText(membre.telephone)}</p>
            <div className="flex gap-2">
              <button onClick={sendToWhatsapp} className="flex-1 bg-green-500 text-white py-2 rounded">
                {t.envoyerQuandMeme}
              </button>
              <button onClick={() => setShowDoublonPopup(false)} className="flex-1 bg-gray-300 py-2 rounded">
                {t.annuler}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POPUP WHATSAPP ================= */}
      {showWhatsappPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <p className="text-gray-700 mb-4">
              {t.whatsappCheckText}
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  {t.labelNomResponsable}
                </label>
                <input
                  type="text"
                  value={responsableNom}
                  onChange={(e) => setResponsableNom(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  {t.labelNumeroWhatsapp}
                </label>
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder={t.placeholderNumero}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={sendToWhatsapp} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold">
                {t.envoyerBtn}
              </button>
              <button onClick={() => setShowWhatsappPopup(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                {t.annuler}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
