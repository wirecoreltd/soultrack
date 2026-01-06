"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("evangelises")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000); // 🔹 corrige la limite à 15
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

      if (!cible) throw new Error("Cible introuvable");

      // 🔹 Vérifie que la cellule a un responsable valide pour Supabase
      let responsableId = null;
      if (selectedTargetType === "cellule") {
        // Si tu as l'UUID du responsable, tu dois le mettre ici
        responsableId = cible.responsable || null;
      }

      // 🔹 Création du message WhatsApp
      const isMultiple = selectedContacts.length > 1;
      let message = `👋 Bonjour ${selectedTargetType === "cellule" ? cible.responsable : cible.prenom},\n\n`;
      message += isMultiple
        ? "Nous te confions avec joie ces personnes rencontrées lors de l’évangélisation.\n"
        : "Nous te confions avec joie une personne rencontrée lors de l’évangélisation.\n";
      message += "Merci pour ton coeur et ton engagement dans l’accompagnement\n\n";

      selectedContacts.forEach((m, index) => {
        message += "────────────────────\n";
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

      // 🔹 Insertion dans la table suivi
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
        responsable_cellule: selectedTargetType === "cellule" ? responsableId : null,
        conseiller_id: selectedTargetType === "conseiller" ? cible.id : null,
        date_suivi: new Date().toISOString(),
      }));

      await supabase.from("suivis_des_evangelises").insert(insertData);

      // 🔹 Suppression des contacts envoyés
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

  // 🔹 Ici tu peux rajouter la suite : Vue carte, vue table, popups etc.
  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
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
    </div>
  );
}
