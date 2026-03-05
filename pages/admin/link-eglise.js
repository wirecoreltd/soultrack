"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function LinkEglise() {
  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    eglise_id: null,
    branche_id: null,
    eglise_nom: "",
    branche_nom: ""
  });

  const [responsable, setResponsable] = useState({ prenom: "", nom: "" });
  const [eglise, setEglise] = useState({ id: null, branche_id: null, nom: "", branche: "", pays: "" });
  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [modeAction, setModeAction] = useState(null); // null, "rappel", "supprimer", "casser"
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const formRef = useRef(null);

  // 🔹 Charger superviseur connecté
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select(`prenom, nom, eglise_id, branche_id, eglises(nom), branches(nom)`)
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setSuperviseur({
          prenom: data.prenom,
          nom: data.nom,
          eglise_id: data.eglise_id,
          branche_id: data.branche_id,
          eglise_nom: data.eglises?.nom || "",
          branche_nom: data.branches?.nom || ""
        });
      }
    };
    loadSuperviseur();
  }, []);

  const getStatusLabel = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee": return "Accepté";
      case "refusee": return "Refusée";
      case "lien_casse": return "Lien Cassé";
      case "pending": return "En attente";
      default: return statut;
    }
  };

  // 🔹 Charger invitations
  const loadInvitations = async () => {
    if (!superviseur.eglise_id) return;
    const { data, error } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", superviseur.eglise_id)
      .order("created_at", { ascending: false });
    if (!error) setInvitations(data || []);
  };
  useEffect(() => { loadInvitations(); }, [superviseur.eglise_id]);

  // 🔹 Styles statut
  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee": return { text: "text-green-600", border: "border-green-600" };
      case "refusee": return { text: "text-red-600", border: "border-red-600" };
      case "lien_casse": return { text: "text-gray-400", border: "border-gray-400" };
      case "pending": return { text: "text-orange-500", border: "border-orange-500" };
      default: return { text: "text-white", border: "border-white/20" };
    }
  };

  // 🔹 Sélectionner invitation pour action
  const handleSelectInvitation = (inv, action) => {
    setSelectedInvitation(inv);
    setModeAction(action);

    // Pré-remplir le responsable
    setResponsable({ prenom: inv.responsable_prenom, nom: inv.responsable_nom });

    // Pré-remplir les informations de l'église
    setEglise({
      id: inv.supervisee_eglise_id,
      branche_id: inv.supervisee_branche_id,
      nom: inv.eglise_nom,
      branche: inv.eglise_branche,
      pays: inv.eglise_pays
    });

    // Scroll automatique vers le formulaire
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 Exécuter l'action
  const handleAction = async () => {
    if (!selectedInvitation) return;

    try {
      // Supprimer
      if (modeAction === "supprimer") {
        await supabase.from("eglise_supervisions").delete().eq("id", selectedInvitation.id);
        if (selectedInvitation.supervisee_branche_id) {
          await supabase
            .from("branches")
            .update({ superviseur_branche_id: null, superviseur_nom: null })
            .eq("id", selectedInvitation.supervisee_branche_id);
        }
      }

      // Casser le lien
      if (modeAction === "casser") {
        await supabase
          .from("eglise_supervisions")
          .update({ statut: "lien_casse" })
          .eq("id", selectedInvitation.id);

        if (selectedInvitation.supervisee_branche_id) {
          await supabase
            .from("branches")
            .update({ superviseur_branche_id: null, superviseur_nom: null })
            .eq("id", selectedInvitation.supervisee_branche_id);
        }
      }

      // Refuser
      if (modeAction === "refusee") {
        await supabase
          .from("eglise_supervisions")
          .update({ statut: "refusee" })
          .eq("id", selectedInvitation.id);

        if (selectedInvitation.supervisee_branche_id) {
          await supabase
            .from("branches")
            .update({ superviseur_branche_id: null, superviseur_nom: null })
            .eq("id", selectedInvitation.supervisee_branche_id);
        }
      }

      setModeAction(null);
      setSelectedInvitation(null);
      setResponsable({ prenom: "", nom: "" });
      setEglise({ nom: "", branche: "", pays: "" });
      loadInvitations();
    } catch (err) {
      console.error("Erreur action:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-4 flex flex-col items-center">
      <HeaderPages />
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        {modeAction === "rappel" ? "Envoyer un rappel" :
         modeAction === "supprimer" ? "Supprimer une invitation" :
         modeAction === "casser" ? "Casser le lien" :
         "Envoyer une invitation pour relier une église"}
      </h4>

      {/* FORMULAIRE */}
      <div ref={formRef} className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-4 mb-10 bg-white/10">
        <div>
          <label className="font-semibold">Prénom du responsable</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black" value={responsable.prenom} readOnly />
        </div>
        <div>
          <label className="font-semibold">Nom du responsable</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black" value={responsable.nom} readOnly />
        </div>
        <div>
          <label className="font-semibold">Nom de l'Église *</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black" value={eglise.nom} readOnly />
        </div>
        <div>
          <label className="font-semibold">Branche / Région *</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black" value={eglise.branche} readOnly />
        </div>
        <div>
          <label className="font-semibold">Pays *</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black" value={eglise.pays} readOnly />
          {modeAction === "supprimer" && (
            <p className="text-red-600 font-medium text-sm mt-1">
              Êtes-vous sûr de vouloir supprimer cette invitation qui a été {selectedInvitation?.statut} ?
            </p>
          )}
        </div>

        <button
          onClick={handleAction}
          className="w-full py-2 rounded-xl text-white font-semibold bg-red-500 hover:bg-red-600"
        >
          {modeAction === "supprimer" ? "Supprimer" :
           modeAction === "casser" ? "Confirmer le cassage" :
           modeAction === "refusee" ? "Refuser" : "Valider"}
        </button>
      </div>

      {/* TABLE INVITATIONS */}
      <h3 className="w-full max-w-5xl text-center text-2xl font-bold text-amber-300 mb-8">
        Liste des églises supervisées
      </h3>

      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="hidden md:grid md:grid-cols-[1.3fr_1.2fr_1.2fr_0.8fr_1fr] text-sm font-semibold uppercase border-b border-white/40 pb-2 gap-x-3">
          <div className="text-left">Église</div>
          <div className="text-left">Branche</div>
          <div className="text-left">Responsable</div>
          <div className="text-left">Statut</div>
          <div className="text-center">Action</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);
          return (
            <div key={inv.id} className={`grid grid-cols-1 md:grid-cols-[1.3fr_1.2fr_1.2fr_0.8fr_1fr] gap-y-2 md:gap-y-0 gap-x-3 px-4 py-3 mt-3 items-center border-b border-b-white/20 border-l-4 ${statusStyle.border} rounded-lg bg-white/5`}>
              <div className="text-left">{inv.eglise_nom}</div>
              <div className="text-left">{inv.eglise_branche}</div>
              <div className="text-left">{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className={`text-left font-semibold ${statusStyle.text}`}>{getStatusLabel(inv.statut)}</div>
              <div className="flex justify-center gap-2 text-white font-semibold text-sm items-center">
                {inv.statut.toLowerCase() === "acceptee" && (
                  <button onClick={() => handleSelectInvitation(inv, "casser")} className="hover:opacity-80">Casser le lien</button>
                )}
                {(inv.statut.toLowerCase() === "lien_casse" || inv.statut.toLowerCase() === "refusee") && (
                  <>
                    <button onClick={() => handleSelectInvitation(inv, null)} className="hover:opacity-80">Renvoyer le lien</button>
                    <span>|</span>
                    <button onClick={() => handleSelectInvitation(inv, "supprimer")} className="text-red-600 hover:opacity-80">🗑️</button>
                  </>
                )}
                {inv.statut.toLowerCase() === "pending" && (
                  <>
                    <button onClick={() => handleSelectInvitation(inv, "rappel")} className="hover:opacity-80">Envoyer un rappel</button>
                    <span>|</span>
                    <button onClick={() => handleSelectInvitation(inv, "supprimer")} className="text-red-600 hover:opacity-80">🗑️</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
