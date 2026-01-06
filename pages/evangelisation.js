"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClient";
import Image from "next/image";
import LogoutLink from "../components/LogoutLink";
import EditEvangelisePopup from "../components/EditEvangelisePopup";

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
  const [loadingSend, setLoadingSend] = useState(false);

  /* ================= COULEUR BORDURE ================= */
  const getBorderColor = (member) => {
    if (member.is_whatsapp) return "#25D366";
    if (member.besoin) return "#FFB800";
    return "#888";
  };

  useEffect(() => {
    fetchContacts();
    fetchCellules();
    fetchConseillers();
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

  const toggleDetails = (id) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

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

  /* ================= ENVOI WHATSAPP ================= */
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

      /* ================= MESSAGE ================= */
      let message = `🙏 Bonjour ${cible.responsable || cible.prenom},\n\n`;

      message += isMultiple
        ? "Nous te confions avec joie ces personnes rencontrées lors de l’évangélisation.\n"
        : "Nous te confions avec joie une personne rencontrée lors de l’évangélisation.\n";

      message +=
        isMultiple
          ? "Merci pour ton cœur et ton engagement à les accompagner 🙏❤️\n\n"
          : "Merci pour ton cœur et ton engagement à l’accompagner 🙏❤️\n\n";

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
        message += `📝 Infos supplémentaires : ${formatBesoin(
          m.infos_supplementaires
        )}\n`;
      });

      const waLink = `https://wa.me/${cible.telephone.replace(
        /\D/g,
        ""
      )}?text=${encodeURIComponent(message)}`;

      window.open(waLink, "_blank");

      /* ================= TRANSFERT DB ================= */
      const insertData = selectedContacts.map((c) => ({
        prenom: c.prenom,
        nom: c.nom,
        telephone: c.telephone,
        ville: c.ville,
        besoin: c.besoin,
        infos_supplementaires: c.infos_supplementaires,
        is_whatsapp: c.is_whatsapp || false,
        cellule_id: selectedTargetType === "cellule" ? cible.id : null,
        responsable_cellule:
          selectedTargetType === "cellule" ? cible.responsable : null,
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

  /* ================= UI ================= */
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}
    >
      <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-white">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={90} height={90} className="mb-3" />
      <h1 className="text-4xl text-white text-center mb-6">
        Évangélisation
      </h1>

      {/* SELECT */}
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
            {(selectedTargetType === "cellule" ? cellules : conseillers).map(
              (c) => (
                <option key={c.id} value={c.id}>
                  {selectedTargetType === "cellule"
                    ? `${c.cellule_full} (${c.ville || "—"})`
                    : `${c.prenom} ${c.nom}`}
                </option>
              )
            )}
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

      {/* CARTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
        {contacts.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl shadow-xl p-4 border-l-4"
            style={{ borderLeftColor: getBorderColor(member) }}
          >
            <h2 className="font-bold text-center">
              {member.prenom} {member.nom}
            </h2>
            <p className="text-center text-sm">📱 {member.telephone || "—"}</p>

            <label className="flex justify-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={checkedContacts[member.id] || false}
                onChange={() => handleCheck(member.id)}
              />
              Sélectionner
            </label>

            <button
              onClick={() => toggleDetails(member.id)}
              className="text-orange-500 underline text-sm block mx-auto mt-2"
            >
              {detailsOpen[member.id] ? "Fermer Détails" : "Détails"}
            </button>

            {detailsOpen[member.id] && (
              <div className="text-sm mt-3 space-y-1">
                <p>🏙️ Ville : {member.ville || ""}</p>
                <p>💬 Whatsapp : {member.is_whatsapp ? "Oui" : "Non"}</p>
                <p> ⚥ Sexe : {member.sexe || "—"}</p>
                <p>🙏 Prière du salut : {member.priere_salut ? "Oui" : "Non"}</p>
                <p>☀️ Type de conversion : {member.type_conversion || "—"}</p>
                <p>❓ Besoin : {formatBesoin(member.besoin)}</p>
                <p>📝 Info Supp. : {formatBesoin(member.infos_supplementaires)}</p>

                <button
                  onClick={() => setEditMember(member)}
                  className="text-blue-600 text-center text-sm mt-2 block mx-auto"
                >
                  ✏️ Modifier
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editMember && (
        <EditEvangelisePopup
          member={editMember}
          cellules={cellules}
          conseillers={conseillers}
          onClose={() => setEditMember(null)}
          onUpdateMember={(data) => {
            setContacts((prev) =>
              prev.map((m) => (m.id === data.id ? data : m))
            );
            setEditMember(null);
          }}
        />
      )}
    </div>
  );
}
