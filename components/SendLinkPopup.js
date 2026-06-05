"use client";

import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useLang } from "../hooks/useLang";

const translations = {
  fr: {
    send: "Envoyer",
    cancel: "Annuler",
    clickSend: "Cliquez sur",
    bold_send: "Envoyer",
    ifContact: "si le contact figure déjà dans WhatsApp, ou saisissez un numéro manuellement.",
    phonePlaceholder: "Numéro (ex: +2305xxxxxxx)",
    selectCellule: "Sélectionnez une cellule",
    selectFamille: "Sélectionnez une famille",
    selectCelluleAlert: "Veuillez sélectionner une cellule.",
    selectFamilleAlert: "Veuillez sélectionner une famille.",
    noteCelluleMembre: "📌 Ce lien sert à ajouter une personne dans ta cellule et dans la liste globale de l'église.",
    noteCelluleEvang: "📌 Ce lien sert à ajouter une personne évangélisée qui sera placée sous ta responsabilité.",
    noteFamilleMembre: "📌 Ce lien sert à ajouter une personne dans ta famille et dans la liste globale de l'église.",
    noteFamilleEvang: "📌 Ce lien sert à ajouter une personne évangélisée qui sera placée sous ta responsabilité.",
    msgEvangeliseCellule: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\n📌 Ce lien sert à ajouter une personne évangélisée qui sera placée sous ta responsabilité.\n\nCellule : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgMembreCellule: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la cellule.\n\n📌 Ce lien sert à ajouter une personne dans ta cellule et dans la liste globale de l'église.\n\nCellule : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgEvangeliseFamille: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\n📌 Ce lien sert à ajouter une personne évangélisée qui sera placée sous ta responsabilité.\n\nFamille : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgMembreFamille: (groupeName, link) =>
      `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre à la famille.\n\n📌 Ce lien sert à ajouter une personne dans ta famille et dans la liste globale de l'église.\n\nFamille : ${groupeName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgMembre: (churchName, link) =>
      `Bonjour 👋\n\nVoici le lien pour ajouter un nouveau membre.\n\nÉglise : ${churchName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
    msgEvangelise: (churchName, link) =>
      `Bonjour 👋\n\nVoici le lien pour enregistrer une personne rencontrée lors de l'évangélisation.\n\nÉglise : ${churchName}\n\nCliquez ici :\n${link}\n\nMerci 🙏`,
  },
  en: {
    send: "Send",
    cancel: "Cancel",
    clickSend: "Click",
    bold_send: "Send",
    ifContact: "if the contact is already in WhatsApp, or enter a number manually.",
    phonePlaceholder: "Number (e.g. +2305xxxxxxx)",
    selectCellule: "Select a cell group",
    selectFamille: "Select a family group",
    selectCelluleAlert: "Please select a cell group.",
    selectFamilleAlert: "Please select a family group.",
    noteCelluleMembre: "📌 This link is used to add a person to your cell group and to the church's global list.",
    noteCelluleEvang: "📌 This link is used to add an evangelised person who will be placed under your responsibility.",
    noteFamilleMembre: "📌 This link is used to add a person to your family group and to the church's global list.",
    noteFamilleEvang: "📌 This link is used to add an evangelised person who will be placed under your responsibility.",
    msgEvangeliseCellule: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to register a person met during outreach.\n\n📌 This link is used to add an evangelised person who will be placed under your responsibility.\n\nCell group: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgMembreCellule: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to add a new member to the cell group.\n\n📌 This link is used to add a person to your cell group and to the church's global list.\n\nCell group: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgEvangeliseFamille: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to register a person met during outreach.\n\n📌 This link is used to add an evangelised person who will be placed under your responsibility.\n\nFamily: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgMembreFamille: (groupeName, link) =>
      `Hello 👋\n\nHere is the link to add a new member to the family group.\n\n📌 This link is used to add a person to your family group and to the church's global list.\n\nFamily: ${groupeName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgMembre: (churchName, link) =>
      `Hello 👋\n\nHere is the link to add a new member.\n\nChurch: ${churchName}\n\nClick here:\n${link}\n\nThank you 🙏`,
    msgEvangelise: (churchName, link) =>
      `Hello 👋\n\nHere is the link to register a person met during outreach.\n\nChurch: ${churchName}\n\nClick here:\n${link}\n\nThank you 🙏`,
  },
};

export default function SendLinkPopup({ label, type, buttonColor, celluleId = null }) {
  const { lang } = useLang();
  const t = translations[lang] || translations.fr;

  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [churchName, setChurchName] = useState("");
  const [egliseId, setEgliseId] = useState(null);

  // Liste de tous les groupes disponibles (cellules ou familles)
  const [groupesList, setGroupesList] = useState([]);
  // ID et nom du groupe actuellement sélectionné dans le <select>
  const [selectedGroupeId, setSelectedGroupeId] = useState(null);
  const [selectedGroupeName, setSelectedGroupeName] = useState("");

  const isFamille = type.includes("famille");
  const isCellule = type.includes("cellule");
  const needsGroupe = isCellule || isFamille;
  const table = isFamille ? "familles" : "cellules";
  const nameField = isFamille ? "famille" : "cellule";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("eglise_id")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) return;
        setEgliseId(profile.eglise_id);

        const { data: churchData } = await supabase
          .from("eglises")
          .select("nom")
          .eq("id", profile.eglise_id)
          .single();
        if (churchData) setChurchName(churchData.nom);

        // Si celluleId est passé en prop → un seul groupe fixe, pas de sélection
        if (celluleId) {
          const { data: groupeData } = await supabase
            .from(table)
            .select(`ville, ${nameField}`)
            .eq("id", celluleId)
            .single();
          if (groupeData) {
            const name = `${groupeData.ville} - ${groupeData[nameField]}`;
            setGroupesList([{ id: celluleId, label: name }]);
            setSelectedGroupeId(celluleId);
            setSelectedGroupeName(name);
          }
          return;
        }

        // Sinon : charger TOUS les groupes du responsable connecté
        if (needsGroupe) {
          const { data: groupesData } = await supabase
            .from(table)
            .select(`id, ville, ${nameField}`)
            .eq("responsable_id", user.id)
            .eq("eglise_id", profile.eglise_id);

          if (groupesData && groupesData.length > 0) {
            const list = groupesData.map((g) => ({
              id: g.id,
              label: `${g.ville} - ${g[nameField]}`,
            }));
            setGroupesList(list);
            // Pré-sélectionner le premier par défaut
            setSelectedGroupeId(list[0].id);
            setSelectedGroupeName(list[0].label);
          }
        }
      } catch (err) {
        console.error("Erreur fetchUserData :", err.message);
      }
    };

    fetchUserData();
  }, [type, celluleId]);

  // Met à jour le nom quand l'utilisateur change la sélection
  const handleGroupeChange = (e) => {
    const id = e.target.value;
    const found = groupesList.find((g) => g.id === id);
    setSelectedGroupeId(id);
    setSelectedGroupeName(found ? found.label : "");
  };

  const getLink = (cid) => {
    const base = window.location.origin;
    if (type === "ajouter_membre")             return `${base}/add-member?eglise_id=${egliseId}&lang=${lang}`;
    if (type === "ajouter_membre_cellule")      return `${base}/cellule/ajouter-membre-cellule?eglise_id=${egliseId}&cellule_id=${cid}&cellule_full=${encodeURIComponent(selectedGroupeName)}&lang=${lang}`;
    if (type === "ajouter_membre_famille")      return `${base}/famille/ajouter-membre-famille?eglise_id=${egliseId}&famille_id=${cid}&lang=${lang}`;
    if (type === "ajouter_evangelise")          return `${base}/add-evangelise?eglise_id=${egliseId}&lang=${lang}`;
    if (type === "ajouter_evangelise_cellule")  return `${base}/add-evangelise?eglise_id=${egliseId}&cellule_id=${cid}&lang=${lang}`;
    if (type === "ajouter_evangelise_famille")  return `${base}/add-evangelise?eglise_id=${egliseId}&famille_id=${cid}&lang=${lang}`;
    return base;
  };

  const getNote = () => {
    if (type === "ajouter_membre_cellule")       return t.noteCelluleMembre;
    if (type === "ajouter_evangelise_cellule")   return t.noteCelluleEvang;
    if (type === "ajouter_membre_famille")       return t.noteFamilleMembre;
    if (type === "ajouter_evangelise_famille")   return t.noteFamilleEvang;
    return null;
  };

  const handleSend = () => {
    if (needsGroupe && !selectedGroupeId) {
      alert(isFamille ? t.selectFamilleAlert : t.selectCelluleAlert);
      return;
    }

    const link = getLink(selectedGroupeId);

    let message = "";
    if (type === "ajouter_evangelise_cellule")     message = t.msgEvangeliseCellule(selectedGroupeName, link);
    else if (type === "ajouter_membre_cellule")    message = t.msgMembreCellule(selectedGroupeName, link);
    else if (type === "ajouter_evangelise_famille") message = t.msgEvangeliseFamille(selectedGroupeName, link);
    else if (type === "ajouter_membre_famille")    message = t.msgMembreFamille(selectedGroupeName, link);
    else if (type === "ajouter_membre")            message = t.msgMembre(churchName, link);
    else                                            message = t.msgEvangelise(churchName, link);

    const whatsappLink = phoneNumber
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappLink, "_blank");
    setShowPopup(false);
    setPhoneNumber("");
  };

  const note = getNote();

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
      >
        {label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-3">{label}</h2>

            <p className="text-gray-700 mb-4">
              {t.clickSend} <b>{t.bold_send}</b> {t.ifContact}
            </p>

            {note && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700">
                {note}
              </div>
            )}

            {/* Sélecteur de groupe — affiché uniquement si plusieurs groupes disponibles */}
            {needsGroupe && groupesList.length > 1 && (
              <select
                value={selectedGroupeId || ""}
                onChange={handleGroupeChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="" disabled>
                  {isFamille ? t.selectFamille : t.selectCellule}
                </option>
                {groupesList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              placeholder={t.phonePlaceholder}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPopup(false); setPhoneNumber(""); }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-2xl font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold"
              >
                {t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
