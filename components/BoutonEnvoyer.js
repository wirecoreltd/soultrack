"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function BoutonEnvoyer({
  membre,
  type = "cellule",
  cible,
  session,
  onEnvoyer,
  showToast
}) {
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
    if (error) { alert("❌ Erreur lors de la vérification des doublons"); return false; }
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

    // ✅ Famille : on récupère le responsable de la famille
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
        responsablePrenom = resp?.prenom || "Responsable";
        responsableTelephone = resp?.telephone || famille.telephone_responsable || "";
      } else {
        responsablePrenom = "Responsable";
        responsableTelephone = famille?.telephone_responsable || "";
      }
      cible.famille_full = famille?.famille_full || cible.famille_full;
    }

    if (type === "numero") {
      responsablePrenom = "Responsable";
      responsableTelephone = cible;
    }

    let message = `👋 Bonjour ${responsablePrenom} !\n\n`;
    message += `J'espère que tu vas bien 😊\n\n`;
    message += `Je te partage les informations d'un nouveau membre que tu vas pouvoir accompagner :\n\n`;

    message += `👤 Nom : ${membre.prenom} ${membre.nom}\n`;
    message += `🎗️ Sexe : ${membre.sexe || "—"}\n`;
    message += `⏳ Âge : ${membre.age || "—"}\n`;
    message += `📱 Téléphone : ${membre.telephone || "—"}\n`;
    message += `💬 WhatsApp : ${membre.is_whatsapp ? "Oui" : "Non"}\n`;
    message += `🏙️ Ville : ${membre.ville || "—"}\n\n`;

    message += `✨ Raison de sa venue : ${membre.statut_initial || "—"}\n`;
    message += `🙏 Prière du salut : ${membre.priere_salut || "—"}\n`;

    message += `❓ Besoins : ${
      membre.besoin
        ? (() => {
            try {
              const besoins = typeof membre.besoin === "string" ? JSON.parse(membre.besoin) : membre.besoin;
              return Array.isArray(besoins) ? besoins.join(", ") : besoins;
            } catch { return membre.besoin; }
          })()
        : "—"
    }\n`;

    message += `📝 Infos supplémentaires : ${membre.infos_supplementaires || "—"}\n\n`;

    message += `Merci beaucoup pour ton engagement et le temps que tu vas lui consacrer ❤️\n`;
    message += `Que ton accompagnement soit une vraie bénédiction.`;

    setResponsableNom(responsablePrenom);
    return { message, responsableTelephone };
  };

  // =========================
  // 🔹 Click principal
  // =========================
  const handleClick = async () => {
    if (!session) { alert("❌ Vous devez être connecté."); return; }
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

    // ✅ Fermer les popups AVANT de faire quoi que ce soit
    setShowWhatsappPopup(false);
    setShowDoublonPopup(false);
    setDoublonDetected(false);

    window.open(whatsappLink, "_blank");

    try {
      const now = new Date().toISOString();

      // 1️⃣ Mise à jour membres_complets
      const updatePayload = {
        statut: "actif",
        statut_suivis: 1,
        etat_contact: "existant",
        date_envoi_suivi: now,
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

      // ✅ Famille : écrire famille_id dans membres_complets
      if (type === "famille") {
        updatePayload.famille_id = cible.id;
        updatePayload.suivi_responsable = null;
        updatePayload.suivi_responsable_id = null;
      }

      // ✅ Appeler onEnvoyer AVANT le update Supabase pour que le verrou
      // dans list-members soit posé avant que le realtime arrive
      if (onEnvoyer) onEnvoyer(membre.id);

      const { data, error } = await supabase
        .from("membres_complets")
        .update(updatePayload)
        .eq("id", membre.id)
        .select()
        .single();

      if (error) { console.error(error); alert("❌ Erreur mise à jour membre"); return; }

      // 2️⃣ Si type conseiller → écrire dans suivi_assignments
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

      if (showToast) showToast(`✅ ${membre.prenom} ${membre.nom} envoyé`);

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
        {loading ? "Envoi..." : "📤 Envoyer par WhatsApp"}
      </button>

      {/* ================= POPUP DOUBLON ================= */}
      {showDoublonPopup && doublonDetected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 text-center">
            <h3 className="font-bold text-lg mb-3">⚠️ Doublon détecté</h3>
            <p className="mb-4">Ce numéro ({membre.telephone}) existe déjà.</p>
            <div className="flex gap-2">
              <button onClick={sendToWhatsapp} className="flex-1 bg-green-500 text-white py-2 rounded">
                Envoyer quand même
              </button>
              <button onClick={() => setShowDoublonPopup(false)} className="flex-1 bg-gray-300 py-2 rounded">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POPUP WHATSAPP ================= */}
      {showWhatsappPopup && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
      <p className="text-gray-500 text-sm mb-4">
        Vérifiez les informations du responsable avant d'envoyer. 
        Si le numéro est effacé, WhatsApp s'ouvrira sur vos contacts.
      </p>

      <div className="flex flex-col gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            👤 Nom du responsable
          </label>
          <input
            type="text"
            value={responsableNom}
            onChange={(e) => setResponsableNom(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            📞 Numéro WhatsApp
          </label>
          <input
            type="text"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            placeholder="Numéro WhatsApp"
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={sendToWhatsapp} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold">
          Envoyer
        </button>
        <button onClick={() => setShowWhatsappPopup(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
          Annuler
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}
