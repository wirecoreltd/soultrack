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
  const getBorderColor = (m) => {
    if (m.is_whatsapp) return "#25D366";
    if (m.besoin) return "#FFB800";
    return "#999";
  };

  /* ================= FETCH ================= */
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
      .select("id, cellule, responsable, telephone");

    setCellules(data || []);
  };

  const fetchConseillers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom, telephone")
      .eq("role", "Conseiller");

    setConseillers(data || []);
  };

  /* ================= HELPERS ================= */
  const toggleDetails = (id) =>
    setDetailsOpen((p) => ({ ...p, [id]: !p[id] }));

  const handleCheck = (id) =>
    setCheckedContacts((p) => ({ ...p, [id]: !p[id] }));

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
          ? cellules.find((c) => c.id === selectedTarget)
          : conseillers.find((c) => c.id === selectedTarget);

      if (!cible?.telephone) throw new Error("Numéro WhatsApp invalide");

      const isMultiple = selectedContacts.length > 1;

      /* ================= MESSAGE ================= */
      let message = `🙏 Bonjour ${
        cible.prenom || cible.responsable || ""
      },\n\n`;

      message += isMultiple
        ? "Nous te confions avec joie ces personnes rencontrées lors de l’évangélisation.\n\n"
        : "Nous te confions avec joie une personne rencontrée lors de l’évangélisation.\n\n";

      selectedContacts.forEach((m, i) => {
        if (isMultiple) message += `👤 Personne ${i + 1}\n`;
        message += `Nom : ${m.prenom} ${m.nom}\n`;
        message += `Téléphone : ${m.telephone || "—"}\n`;
        message += `Ville : ${m.ville || "—"}\n`;
        message += `WhatsApp : ${m.is_whatsapp ? "Oui" : "Non"}\n`;
        message += `Sexe : ${m.sexe || "—"}\n`;
        message += `Prière du salut : ${m.priere_salut ? "Oui" : "Non"}\n`;
        message += `Type : ${m.type_conversion || "—"}\n`;
        message += `Besoin : ${formatBesoin(m.besoin)}\n`;
        message += `Infos supp. : ${formatBesoin(
          m.infos_supplementaires
        )}\n`;
        message += "────────────────────\n";
      });

      message +=
        "\nMerci de les accompagner avec amour et prière 🙏❤️";

      const waLink = `https://wa.me/${cible.telephone.replace(
        /\D/g,
        ""
      )}?text=${encodeURIComponent(message)}`;

      window.open(waLink, "_blank");

      /* ================= DB ================= */

      // 1️⃣ Update statut (SOURCE DE VÉRITÉ)
      const ids = selectedContacts.map((c) => c.id);

      await supabase
        .from("evangelises")
        .update({ statut: "en_suivi" })
        .in("id", ids);

      // 2️⃣ Historique suivi
      const suivis = selectedContacts.map((c) => ({
        evangelise_id: c.id,
        cellule_id: selectedTargetType === "cellule" ? cible.id : null,
        conseiller_id:
          selectedTargetType === "conseiller" ? cible.id : null,
        responsable_nom:
          cible.responsable || `${cible.prenom} ${cible.nom}`,
        statut_suivi: "envoye",
        date_suivi: new Date().toISOString(),
      }));

      await supabase.from("suivis_evangelises").insert(suivis);

      alert("✅ Contacts confiés avec succès !");
      setCheckedContacts({});
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert("❌ Une erreur est survenue");
    } finally {
      setLoadingSend(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div
      className="min-h-screen p-6 flex flex-col items-center"
      style={{ background: "linear-gradient(135deg,#2E3192,#92EFFD)" }}
    >
      <div className="w-full max-w-5xl flex justify-between mb-4">
        <button onClick={() => router.back()} className="text-white">
          ← Retour
        </button>
        <LogoutLink />
      </div>

      <Image src="/logo.png" alt="Logo" width={90} height={90} />
      <h1 className="text-3xl text-white font-bold my-6">
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
          className="w-full border rounded px-3 py-2 mb-2 text-center"
        >
          <option value="">-- Envoyer à --</option>
          <option value="cellule">Une cellule</option>
          <option value="conseiller">Un conseiller</option>
        </select>

        {selectedTargetType && (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full border rounded px-3 py-2 text-center"
          >
            <option value="">-- Choisir --</option>
            {(selectedTargetType === "cellule"
              ? cellules
              : conseillers
            ).map((c) => (
              <option key={c.id} value={c.id}>
                {c.cellule || `${c.prenom} ${c.nom}`}
              </option>
            ))}
          </select>
        )}

        {hasSelectedContacts && selectedTarget && (
          <button
            onClick={sendContacts}
            disabled={loadingSend}
            className="mt-3 w-full bg-green-600 text-white font-bold py-2 rounded"
          >
            {loadingSend ? "Envoi..." : "📤 Envoyer WhatsApp"}
          </button>
        )}
      </div>

      {/* CARTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
        {contacts.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-xl shadow p-4 border-l-4"
            style={{ borderLeftColor: getBorderColor(m) }}
          >
            <h2 className="font-bold text-center">
              {m.prenom} {m.nom}
            </h2>

            <label className="flex justify-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={checkedContacts[m.id] || false}
                onChange={() => handleCheck(m.id)}
              />
              Sélectionner
            </label>

            <button
              onClick={() => toggleDetails(m.id)}
              className="text-orange-500 text-sm underline block mx-auto mt-2"
            >
              Détails
            </button>

            {detailsOpen[m.id] && (
              <div className="text-sm mt-3 space-y-1">
                <p>📞 {m.telephone || "—"}</p>
                <p>🏙️ {m.ville || "—"}</p>
                <p>❓ {formatBesoin(m.besoin)}</p>
                <button
                  onClick={() => setEditMember(m)}
                  className="text-blue-600 text-sm mt-2"
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
          onClose={() => setEditMember(null)}
          onUpdateMember={() => fetchContacts()}
        />
      )}
    </div>
  );
}
