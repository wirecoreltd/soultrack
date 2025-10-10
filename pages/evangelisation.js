// pages/evangelisation.js
"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function ListEvangelises() {
  const [evangelises, setEvangelises] = useState([]);
  const [cellules, setCellules] = useState([]);
  const [selectedCellule, setSelectedCellule] = useState("");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [whatsappSelected, setWhatsappSelected] = useState({});

  useEffect(() => {
    fetchEvangelises();
    fetchCellules();
  }, []);

  const fetchEvangelises = async () => {
    try {
      const { data, error } = await supabase
        .from("evangelises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEvangelises(data || []);
    } catch (err) {
      console.error("Erreur fetchEvangelises:", err.message);
      setEvangelises([]);
    }
  };

  const fetchCellules = async () => {
    try {
      const { data, error } = await supabase
        .from("cellules")
        .select("*")
        .order("cellule", { ascending: true });
      if (error) throw error;
      setCellules(data || []);
    } catch (err) {
      console.error("Erreur fetchCellules:", err.message);
      setCellules([]);
    }
  };

  const getBorderColor = (ev) => {
    return "#34A853"; // couleur fixe pour évangélisés
  };

  const handleCheckbox = (id) => {
    setWhatsappSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sendWhatsapp = async () => {
    if (!selectedCellule) return alert("Sélectionnez une cellule.");

    const cellule = cellules.find((c) => c.id === Number(selectedCellule));
    if (!cellule) return alert("Cellule introuvable.");

    const toSend = evangelises.filter((ev) => whatsappSelected[ev.id]);
    if (!toSend.length) return alert("Aucun contact sélectionné.");

    for (let ev of toSend) {
      const message = `👋 Salut ${cellule.responsable},

🙏 Dieu nous a envoyé une nouvelle âme à suivre.
Voici ses infos :

- 👤 Nom : ${ev.prenom} ${ev.nom}
- 📱 Téléphone : ${ev.telephone || "—"}
- 🏙 Ville : ${ev.ville || "—"}
- 🙏 Besoin : ${ev.besoin || "—"}
- 📝 Infos supplémentaires : ${ev.infos_supplementaires || "—"}
- 💬 Comment est-il venu ? : ${ev.comment || "—"}

Merci pour ton cœur ❤ et son amour ✨`;

      // ouverture WhatsApp
      const phone = cellule.telephone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

      // insérer dans suivis_des_evangelises
      try {
        const { error: insertError } = await supabase
          .from("suivis_des_evangelises")
          .insert([{
            prenom: ev.prenom,
            nom: ev.nom,
            telephone: ev.telephone,
            whatsapp: ev.is_whatsapp,
            ville: ev.ville,
            besoin: ev.besoin,
            infos_supplementaires: ev.infos_supplementaires,
            comment: ev.comment,
            cellule_id: cellule.id,
            responsable_cellule: cellule.responsable,
            date_suivi: new Date()
          }]);
        if (insertError) throw insertError;

        // supprimer de evangelises
        const { error: delError } = await supabase
          .from("evangelises")
          .delete()
          .eq("id", ev.id);
        if (delError) throw delError;

      } catch (err) {
        console.error("Erreur envoi/suivi:", err.message);
        alert("Erreur lors de l'envoi du contact.");
      }
    }

    // rafraîchir la liste
    fetchEvangelises();
    setWhatsappSelected({});
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6" style={{ background: "linear-gradient(135deg, #2E3192 0%, #92EFFD 100%)" }}>
      <h1 className="text-5xl sm:text-6xl font-handwriting text-white text-center mb-6">Évangélisés</h1>

      {/* Filtre cellule */}
      <div className="w-full max-w-md mb-6 flex justify-center">
        <select
          value={selectedCellule}
          onChange={(e) => setSelectedCellule(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Sélectionner cellule --</option>
          {cellules.map((c) => (
            <option key={c.id} value={c.id}>{c.cellule} ({c.responsable})</option>
          ))}
        </select>
      </div>

      {/* Liste cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {evangelises.map((ev) => (
          <div key={ev.id} className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 relative" style={{ borderTopColor: getBorderColor(ev) }}>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{ev.prenom} {ev.nom}</h2>
            <p className="text-sm text-gray-600 mb-1">📱 {ev.telephone || "—"} {ev.is_whatsapp ? "(WhatsApp)" : ""}</p>
            <p className="text-sm text-gray-700 mb-1">🏙 {ev.ville || "—"}</p>

            <p className="mt-2 text-blue-500 underline cursor-pointer" onClick={() => setDetailsOpen((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))}>
              {detailsOpen[ev.id] ? "Fermer détails" : "Détails"}
            </p>

            {detailsOpen[ev.id] && (
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <p>Besoin : {ev.besoin || "—"}</p>
                <p>Infos supplémentaires : {ev.infos_supplementaires || "—"}</p>
                <p>Comment est-il venu ? : {ev.comment || "—"}</p>

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={whatsappSelected[ev.id] || false} onChange={() => handleCheckbox(ev.id)} className="h-5 w-5"/>
                  <label>Envoyer par WhatsApp</label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCellule && Object.values(whatsappSelected).some(v => v) && (
        <button
          onClick={sendWhatsapp}
          className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all duration-200"
        >
          Envoyer WhatsApp au responsable
        </button>
      )}
    </div>
  );
}
