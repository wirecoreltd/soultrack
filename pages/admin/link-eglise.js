"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function LinkEglise() {
  const formRef = useRef(null);
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
  const [modeAction, setModeAction] = useState(null); // null, "rappel", "supprimer", "casser", "renvoyer"
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
      case "pending": return "En Attente";
      case "expired": return "Lien Expiré";
      default: return statut;
    }
  };

  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee": return { text: "text-green-600", border: "border-green-600" };
      case "refusee": return { text: "text-red-600", border: "border-red-600" };
      case "lien_casse": return { text: "text-gray-400", border: "border-gray-400" };
      case "pending": return { text: "text-orange-500", border: "border-orange-500" };
      default: return { text: "text-white", border: "border-white/20" };
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

  // 🔹 Sélectionner invitation pour action
  const handleSelectInvitation = (inv, action) => {
    setSelectedInvitation(inv);
    setModeAction(action);

    setResponsable({
      prenom: inv.responsable_prenom,
      nom: inv.responsable_nom
    });

    setEglise({
      id: inv.supervisee_eglise_id,
      branche_id: inv.supervisee_branche_id,
      nom: inv.eglise_nom,
      branche: inv.eglise_branche,
      pays: inv.eglise_pays
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 🔹 Exécuter l'action
  const handleAction = async () => {
    try {
      if (!selectedInvitation && modeAction === null && (!eglise.nom || !eglise.branche || !eglise.pays)) return;

      // 🔹 NOUVELLE INVITATION
      if (!selectedInvitation && modeAction === null) {
        const token = crypto.randomUUID();
        await supabase.from("eglise_supervisions").insert([{
          superviseur_eglise_id: superviseur.eglise_id,
          superviseur_branche_id: superviseur.branche_id,
          supervisee_eglise_id: null,
          supervisee_branche_id: null,
          responsable_prenom: responsable.prenom,
          responsable_nom: responsable.nom,
          eglise_nom: eglise.nom,
          eglise_branche: eglise.branche,
          eglise_pays: eglise.pays,
          statut: "pending",
          invitation_token: token
        }]);
        const message = `
🙏 Bonjour ${responsable.prenom} ${responsable.nom},

${superviseur.prenom} ${superviseur.nom} vous invite à placer votre église sous sa supervision.

Lien :
https://soultrack-three.vercel.app/accept-invitation?token=${token}

Que Dieu vous bénisse 🙏
`;
        if (canal === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        else if (canal === "email") window.location.href = `mailto:?subject=Invitation SoulTrack&body=${encodeURIComponent(message)}`;
      }

      // 🔹 RENVOYER LE LIEN
      if (modeAction === "renvoyer" && selectedInvitation) {
        const newToken = crypto.randomUUID();
        await supabase
          .from("eglise_supervisions")
          .update({ statut: "pending", invitation_token: newToken })
          .eq("id", selectedInvitation.id);
        const message = `
🙏 Bonjour ${selectedInvitation.responsable_prenom} ${selectedInvitation.responsable_nom},

${superviseur.prenom} ${superviseur.nom} vous renvoie une invitation.

Lien :
https://soultrack-three.vercel.app/accept-invitation?token=${newToken}

Que Dieu vous bénisse 🙏
`;
        if (canal === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        else if (canal === "email") window.location.href = `mailto:?subject=Invitation SoulTrack&body=${encodeURIComponent(message)}`;
      }

      // 🔹 RAPPEL (pending)
      if (modeAction === "rappel" && selectedInvitation) {
        const message = `
🙏 Bonjour ${selectedInvitation.responsable_prenom} ${selectedInvitation.responsable_nom},

Ceci est un rappel pour votre invitation.

Lien :
https://soultrack-three.vercel.app/accept-invitation?token=${selectedInvitation.invitation_token}

Que Dieu vous bénisse 🙏
`;
        if (canal === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        else if (canal === "email") window.location.href = `mailto:?subject=Rappel Invitation&body=${encodeURIComponent(message)}`;
      }

      // 🔹 CASSER LE LIEN (acceptee)
      if (modeAction === "casser" && selectedInvitation) {
        await supabase
          .from("eglise_supervisions")
          .update({ statut: "lien_casse", superviseur_branche_id: null })
          .eq("id", selectedInvitation.id);
        await supabase
          .from("branches")
          .update({ superviseur_nom: null, superviseur_id: null })
          .eq("id", selectedInvitation.supervisee_branche_id);
        const message = `💔 Le lien avec l'église ${selectedInvitation.eglise_nom} - ${selectedInvitation.eglise_branche} a été cassé.`;
        if (canal === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        else if (canal === "email") window.location.href = `mailto:?subject=Lien cassé&body=${encodeURIComponent(message)}`;
      }

      // 🔹 SUPPRIMER (refusee, lien_casse, expired)
      if (modeAction === "supprimer" && selectedInvitation) {
        await supabase
          .from("eglise_supervisions")
          .delete()
          .eq("id", selectedInvitation.id);
        await supabase
          .from("branches")
          .update({ superviseur_nom: null, superviseur_id: null })
          .eq("id", selectedInvitation.supervisee_branche_id);
      }

      // 🔹 RESET FORMULAIRE
      setModeAction(null);
      setSelectedInvitation(null);
      setResponsable({ prenom: "", nom: "" });
      setEglise({ id: null, branche_id: null, nom: "", branche: "", pays: "" });
      setCanal("");
      loadInvitations();

    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
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

          <className="w-full max-w-md mb-6 text-white text-sm bg-white/10 p-4 rounded-xl">
          <p>
            Bienvenue dans <strong>Invitations & Liens d’églises</strong>.<br />
            Relier une église vous permet de placer une église sous votre supervision et de consulter ses statistiques dans <strong>Stats Globales</strong>.<br />
            Vous pouvez également :<br />
            - Casser le lien avec une église supervisée.<br />
            - Supprimer une invitation envoyée.<br />
            - Renvoyer un lien si nécessaire.<br />
            Toutes les actions sont suivies et visibles dans cette interface.
          </p>                         

      {/* FORMULAIRE */}
      <div ref={formRef} className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-4 mb-10 bg-white/10">
        <div>
          <label className="font-semibold">Prénom du responsable</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black"
            value={responsable.prenom} onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })} />
        </div>
        <div>
          <label className="font-semibold">Nom du responsable</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black"
            value={responsable.nom} onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })} />
        </div>
        <div>
          <label className="font-semibold">Nom de l'Église</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black"
            value={eglise.nom} onChange={(e) => setEglise({ ...eglise, nom: e.target.value })} />
        </div>
        <div>
          <label className="font-semibold">Branche / Région</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black"
            value={eglise.branche} onChange={(e) => setEglise({ ...eglise, branche: e.target.value })} />
        </div>
        <div>
          <label className="font-semibold">Pays</label>
          <input className="w-full border rounded-xl px-3 py-2 text-black"
            value={eglise.pays} onChange={(e) => setEglise({ ...eglise, pays: e.target.value })} />
        </div>

        {modeAction === "supprimer" && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-xl text-sm">
            ⚠️ Si vous supprimez cette invitation, l'église sortira de la liste des
            supervisions et le lien avec la branche sera retiré.
          </div>
        )}
        
        {modeAction === "casser" && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded-xl text-sm">
            ⚠️ Si vous cassez ce lien, l'église ne sera plus sous votre supervision.
          </div>
        )}
        
        {modeAction !== "supprimer" && (
          <select
            className="w-full border rounded-xl px-3 py-2 text-black"
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
          >
            <option value="">-- Sélectionnez le mode d’envoi --</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        )}

       <button
        onClick={handleAction}
        disabled={!canal && modeAction === "casser"}
        className={`w-full py-3 rounded-xl text-white font-semibold ${
          !canal && modeAction === "casser"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#333699] hover:bg-[#2a2f85]"
        }`}
      >
        {modeAction === "rappel" && "Envoyer le rappel"}
        {modeAction === "renvoyer" && "Renvoyer le lien"}
        {modeAction === "supprimer" && "Supprimer l'invitation"}
        {modeAction === "casser" && "Confirmer le cassage"}
        {modeAction === null && "Envoyer l'invitation"}
      </button>
      </div>

      <h3 className="w-full max-w-5xl text-center text-2xl font-bold text-amber-300 mb-8">
        Liste des églises supervisées
      </h3>

      {/* TABLE INVITATIONS */}
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
          if (inv.statut?.toLowerCase() === "supprimee") return null;

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
                    <button onClick={() => handleSelectInvitation(inv, "renvoyer")} className="hover:opacity-80">Renvoyer le lien</button>
                    <button onClick={() => handleSelectInvitation(inv, "supprimer")} className="text-red-600 hover:opacity-80">🗑️</button>
                  </>
                )}
                {inv.statut.toLowerCase() === "pending" && (
                  <button onClick={() => handleSelectInvitation(inv, "rappel")}>Envoyer un rappel</button>
                )}
                {inv.statut.toLowerCase() === "expired" && (
                  <>
                    <button onClick={() => handleSelectInvitation(inv, "renvoyer")}>Renvoyer un lien</button>
                    <button onClick={() => handleSelectInvitation(inv, "supprimer")} className="text-red-600">🗑️</button>
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
