"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function LinkEglise() {

  const [mode, setMode] = useState("create"); // create | rappel | supprimer
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  const [superviseur, setSuperviseur] = useState({
    prenom: "",
    nom: "",
    eglise_id: null,
    branche_id: null,
    eglise_nom: "",
    branche_nom: ""
  });

  const [responsable, setResponsable] = useState({
    prenom: "",
    nom: ""
  });

  const [eglise, setEglise] = useState({
    nom: "",
    branche: "",
    pays: ""
  });

  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);

  // ================= LOAD USER =================
  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select(`
          prenom,
          nom,
          eglise_id,
          branche_id,
          eglises(nom),
          branches(nom)
        `)
        .eq("id", user.id)
        .single();

      if (data) {
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

  // ================= LOAD INVITATIONS =================
  const loadInvitations = async () => {
    if (!superviseur.eglise_id) return;

    const { data } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", superviseur.eglise_id)
      .order("created_at", { ascending: false });

    setInvitations(data || []);
  };

  useEffect(() => {
    loadInvitations();
  }, [superviseur.eglise_id]);

  // ================= STATUS STYLE =================
  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee":
        return { border: "border-l-4 border-green-500" };
      case "refusee":
        return { border: "border-l-4 border-red-500" };
      case "pending":
        return { border: "border-l-4 border-gray-400" };
      case "supprimee":
        return { border: "border-l-4 border-orange-500" };
      default:
        return { border: "border-l-4 border-gray-300" };
    }
  };

  // ================= RAPPEL =================
  const handleRappel = (inv) => {
    const message = `
🙏 Bonjour ${inv.responsable_prenom} ${inv.responsable_nom},

${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_nom} - ${superviseur.branche_nom}
vous a envoyé une invitation pour que votre église soit placée sous sa supervision.

⚠️ Ceci est un rappel ! 🔔

Cliquez sur le lien ci-dessous :
https://soultrack-three.vercel.app/accept-invitation?token=${inv.invitation_token}

Que Dieu vous bénisse 🙏
`;

    if (inv.canal === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else {
      window.location.href = `mailto:?subject=Rappel Invitation SoulTrack&body=${encodeURIComponent(message)}`;
    }
  };

  // ================= SUPPRESSION =================
  const handleSupprimer = async (inv) => {
    const message = `
🙏 Bonjour ${inv.responsable_prenom} ${inv.responsable_nom},

L’invitation concernant l’église ${inv.eglise_nom}
(${inv.eglise_branche} - ${inv.eglise_pays})
a été supprimée.

Veuillez contacter ${superviseur.prenom} ${superviseur.nom}
pour de plus amples informations.

Que Dieu vous bénisse 🙏
`;

    if (inv.canal === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else {
      window.location.href = `mailto:?subject=Annulation Invitation SoulTrack&body=${encodeURIComponent(message)}`;
    }

    await supabase
      .from("eglise_supervisions")
      .update({ statut: "supprimee" })
      .eq("id", inv.id);

    loadInvitations();
  };

  // ================= ACTION BUTTON =================
  const handleMainAction = () => {
    if (mode === "rappel" && selectedInvitation) {
      handleRappel(selectedInvitation);
      setMode("create");
    }

    if (mode === "supprimer" && selectedInvitation) {
      handleSupprimer(selectedInvitation);
      setMode("create");
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-4 md:p-8 flex flex-col items-center">

      <HeaderPages />

      {/* ================= TITLE ================= */}
      <h4 className="text-2xl font-bold mb-6 text-center">
        {mode === "create" && "Envoyer une invitation"}
        {mode === "rappel" && "Envoyer un rappel"}
        {mode === "supprimer" && "Supprimer une invitation"}
      </h4>

      {/* ================= FORM ================= */}
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-12">

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Prénom responsable"
          value={responsable.prenom}
          onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Nom responsable"
          value={responsable.nom}
          onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Nom église"
          value={eglise.nom}
          onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Branche"
          value={eglise.branche}
          onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Pays"
          value={eglise.pays}
          onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
        />

        <button
          onClick={handleMainAction}
          className={`w-full py-2 rounded-xl font-semibold ${
            mode === "supprimer"
              ? "bg-red-600 text-white"
              : "bg-[#333699] text-white"
          }`}
        >
          {mode === "create" && "Envoyer l'invitation"}
          {mode === "rappel" && "Envoyer le rappel"}
          {mode === "supprimer" && "Confirmer la suppression"}
        </button>

      </div>

      {/* ================= TABLE ================= */}
      <div className="w-full max-w-6xl">

        <div className="grid grid-cols-6 gap-4 text-sm font-semibold uppercase border-b border-white/30 pb-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Responsable</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>

        {invitations.map((inv) => {
          const statusStyle = getStatusStyle(inv.statut);

          return (
            <div
              key={inv.id}
              className={`grid grid-cols-6 gap-4 px-3 py-2 mt-2 ${statusStyle.border} items-center`}
            >
              <div>{inv.eglise_nom}</div>
              <div>{inv.eglise_branche}</div>
              <div>{inv.eglise_pays}</div>
              <div>{inv.responsable_prenom} {inv.responsable_nom}</div>

              <div className="text-sm">
                {inv.statut === "refusee" ? "refus" : inv.statut}
              </div>

              <div className="flex gap-3">
                {inv.statut?.toLowerCase() === "pending" && (
                  <>
                    <button
                      className="text-orange-500 font-semibold text-sm hover:opacity-80"
                      onClick={() => {
                        setMode("rappel");
                        setSelectedInvitation(inv);
                        setResponsable({
                          prenom: inv.responsable_prenom,
                          nom: inv.responsable_nom
                        });
                        setEglise({
                          nom: inv.eglise_nom,
                          branche: inv.eglise_branche,
                          pays: inv.eglise_pays
                        });
                        setCanal(inv.canal);
                      }}
                    >
                      Rappel
                    </button>

                    <button
                      className="text-red-500 font-semibold text-sm hover:opacity-80"
                      onClick={() => {
                        setMode("supprimer");
                        setSelectedInvitation(inv);
                        setResponsable({
                          prenom: inv.responsable_prenom,
                          nom: inv.responsable_nom
                        });
                        setEglise({
                          nom: inv.eglise_nom,
                          branche: inv.eglise_branche,
                          pays: inv.eglise_pays
                        });
                        setCanal(inv.canal);
                      }}
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
