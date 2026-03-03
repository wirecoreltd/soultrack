"use client";

import { useState, useEffect } from "react";
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
  const [eglise, setEglise] = useState({ nom: "", branche: "", pays: "" });
  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [modeAction, setModeAction] = useState(null); // null, "rappel", "supprimer", "casser"
  const [selectedInvitation, setSelectedInvitation] = useState(null);

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
      case "acceptee": return { color: "text-green-600" };
      case "refus": return { color: "text-red-600" };
      case "pending": return { color: "text-gray-400" };
      default: return { color: "text-gray-300" };
    }
  };

  // 🔹 Sélectionner invitation pour action
  const handleSelectInvitation = (inv, action) => {
  setSelectedInvitation(inv);
  setModeAction(action);

  // Pré-remplir le responsable
  setResponsable({
    prenom: inv.responsable_prenom,
    nom: inv.responsable_nom
  });

  // Pré-remplir les informations de l'église
  setEglise({
    nom: inv.eglise_nom,
    branche: inv.eglise_branche,
    pays: inv.eglise_pays
  });
};

  // Après qu'une invitation est acceptée
const handleAcceptInvitation = async (invitation) => {
  // Mettre à jour la branche du superviseur
  const { data, error } = await supabase
    .from("profiles")
    .update({ branche_id: invitation.branche_id }) // ici on prend la branche de l'église acceptée
    .eq("eglise_id", invitation.superviseur_eglise_id);

  if (error) {
    console.error("Erreur mise à jour superviseur_brache_id :", error);
    return;
  }

  alert("La branche du superviseur a été mise à jour automatiquement !");
};

  // 🔹 Exécuter l'action (nouveau / rappel / supprimer / casser)
  const handleAction = async () => {
  if (!canal) return;

  let message = "";
  let token = selectedInvitation?.invitation_token || crypto.randomUUID();

  // 🔹 Chercher l'ID de la branche correspondante
  let brancheData = await supabase
    .from("branches")
    .select("id")
    .eq("eglise_id", superviseur.eglise_id)
    .eq("nom", eglise.branche)
    .single();

  // 🔹 Obtenir ou créer la branche pour superviseur_branche_id
let superviseur_branche_id = null;
if (eglise.branche) {
  // Chercher la branche
  const { data: brancheExist, error: err1 } = await supabase
    .from("branches")
    .select("id")
    .eq("eglise_id", superviseur.eglise_id)
    .eq("nom", eglise.branche)
    .single();

  if (brancheExist) {
    superviseur_branche_id = brancheExist.id;
  } else {
    // Créer la branche si elle n'existe pas
    const { data: newBranche, error: err2 } = await supabase
      .from("branches")
      .insert([{ nom: eglise.branche, eglise_id: superviseur.eglise_id }])
      .select()
      .single();

    if (newBranche) superviseur_branche_id = newBranche.id;
  }
}

  // 🔹 Nouveau formulaire
  if (!selectedInvitation && !modeAction) {
    message = `
🙏 Bonjour ${responsable.prenom} ${responsable.nom},

${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_nom} - ${superviseur.branche_nom} vous a envoyé une invitation pour que votre église soit placée sous sa supervision.

Cliquez sur le lien ci-dessous pour accepter, refuser ou laisser l’invitation en attente :

https://soultrack-three.vercel.app/accept-invitation?token=${token}

Que Dieu vous bénisse 🙏
`;

    // Enregistrer en base avec superviseur_branche_id
    const { data, error } = await supabase
      .from("eglise_supervisions")
      .insert([{
        superviseur_eglise_id: superviseur.eglise_id,
        superviseur_branche_id: superviseur_branche_id,
        responsable_prenom: responsable.prenom,
        responsable_nom: responsable.nom,
        eglise_nom: eglise.nom,
        eglise_branche: eglise.branche,
        eglise_pays: eglise.pays,
        statut: "pending",
        invitation_token: token
      }]);
    if (error) { alert("Erreur lors de l'envoi de l'invitation"); return; }
  }

  // 🔹 Rappel
  if (modeAction === "rappel") {
    message = `
🙏 Bonjour ${selectedInvitation.responsable_prenom} ${selectedInvitation.responsable_nom},

Ceci est un rappel : ${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_nom} - ${superviseur.branche_nom} vous a envoyé une invitation pour que votre église soit placée sous sa supervision.

Lien : https://soultrack-three.vercel.app/accept-invitation?token=${selectedInvitation.invitation_token}

Que Dieu vous bénisse 🙏
`;
  }

  // 🔹 Supprimer
  if (modeAction === "supprimer") {
    message = `
❌ L'invitation de votre église ${selectedInvitation.eglise_nom} - ${selectedInvitation.eglise_branche}, ${selectedInvitation.eglise_pays} a été supprimée.

Veuillez contacter ${superviseur.prenom} ${superviseur.nom} pour plus d'informations.
`;
    await supabase.from("eglise_supervisions").delete().eq("id", selectedInvitation.id);
  }

  // 🔹 Casser le lien
  if (modeAction === "casser") {
    message = `
💔 Le lien avec l'église ${selectedInvitation.eglise_nom} - ${selectedInvitation.eglise_branche} a été cassé.
`;
    await supabase.from("eglise_supervisions").delete().eq("id", selectedInvitation.id);
  }

  // 🔹 Si l'invitation est acceptée, mettre à jour superviseur_branche_id
  if (selectedInvitation?.statut?.toLowerCase() === "acceptee" && superviseur_branche_id) {
    await supabase
      .from("eglise_supervisions")
      .update({ superviseur_branche_id })
      .eq("id", selectedInvitation.id);
  }

  // 🔹 Envoi WhatsApp / Email
  if (canal === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  } else if (canal === "email") {
    window.location.href = `mailto:?subject=Invitation SoulTrack&body=${encodeURIComponent(message)}`;
  }

  alert("Message envoyé !");
  setModeAction(null);
  setSelectedInvitation(null);
  setResponsable({ prenom: "", nom: "" });
  setEglise({ nom: "", branche: "", pays: "" });
  setCanal("");
  loadInvitations();
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
<div className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-4 mb-10 bg-white/10">
  <div>
    <label className="font-semibold">Prénom du responsable</label>
    <input
      className="w-full border rounded-xl px-3 py-2 text-black"
      value={responsable.prenom}
      onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
    />
  </div>
  <div>
    <label className="font-semibold">Nom du responsable</label>
    <input
      className="w-full border rounded-xl px-3 py-2 text-black"
      value={responsable.nom}
      onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
    />
  </div>
  <div>
    <label className="font-semibold">Nom de l'Église *</label>
    <input
      className="w-full border rounded-xl px-3 py-2 text-black"
      value={eglise.nom}
      onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
    />
  </div>
  <div>
    <label className="font-semibold">Branche / Région *</label>
    <input
      className="w-full border rounded-xl px-3 py-2 text-black"
      value={eglise.branche}
      onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
    />
  </div>
  <div>
    <label className="font-semibold">Pays *</label>
    <input
      className="w-full border rounded-xl px-3 py-2 text-black"
      value={eglise.pays}
      onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
    />
  </div>
  <select
    className="w-full border rounded-xl px-3 py-2 text-black"
    value={canal}
    onChange={(e) => setCanal(e.target.value)}
  >
    <option value="">-- Sélectionnez le mode d’envoi --</option>
    <option value="whatsapp">WhatsApp</option>
    <option value="email">Email</option>
  </select>

  {/* BOUTON ENVOYER / ACTION */}
  <button
    onClick={handleAction}
    disabled={
      !canal || 
      (!selectedInvitation && (!eglise.nom || !eglise.branche || !eglise.pays))
    } // canal + champs obligatoires
    className={`w-full py-2 rounded-xl text-white font-semibold ${
      !canal || (!selectedInvitation && (!eglise.nom || !eglise.branche || !eglise.pays))
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#333699] hover:bg-[#2a2f85]"
    }`}
  >
    {modeAction === "rappel" && "Envoyer le rappel"}
    {modeAction === "supprimer" && "Envoyer notification de suppression"}
    {modeAction === "casser" && "Confirmer le cassage"}
    {modeAction === null && "Envoyer l'invitation"}
  </button>
</div>

      {/* TABLE INVITATIONS */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="grid grid-cols-5 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Action</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);
          return (
            <div key={inv.id} className="grid grid-cols-5 px-3 py-2 mt-2 items-center border-b border-white/20">
              <div>{inv.eglise_nom}</div>
              <div>{inv.eglise_branche}</div>
              <div>{inv.responsable_prenom} {inv.responsable_nom}</div>
              <div className={`${statusStyle.color}`}>{inv.statut.toLowerCase()}</div>
              <div className="flex gap-2">
                {inv.statut.toLowerCase() === "acceptee" && (
                  <button
                    onClick={() => handleSelectInvitation(inv, "casser")}
                    className="text-purple-600 font-semibold text-sm hover:opacity-80"
                  >
                    Casser le lien
                  </button>
                )}
                {inv.statut.toLowerCase() !== "acceptee" && (
                  <>
                    <button
                      onClick={() => handleSelectInvitation(inv, "rappel")}
                      className="text-orange-500 font-semibold text-sm hover:opacity-80"
                    >
                      Rappel
                    </button>
                    <button
                      onClick={() => handleSelectInvitation(inv, "supprimer")}
                      className="text-red-500 font-semibold text-sm hover:opacity-80"
                    >
                      Supprimer
                    </button>
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
