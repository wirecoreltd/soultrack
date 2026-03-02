"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import SendEgliseLinkPopup from "../../components/SendEgliseLinkPopup";
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

  // 🔹 Charger superviseur connecté
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

  // 🔹 Charger invitations
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

  // 🔹 BADGE STYLE
  const getStatusBadge = (statut) => {
    const s = statut?.toLowerCase();
    switch (s) {
      case "acceptee":
        return { style: "bg-green-100 text-green-700", icon: "✔" };
      case "refusee":
        return { style: "bg-red-100 text-red-700", icon: "✖" };
      case "pending":
        return { style: "bg-gray-100 text-gray-700", icon: "⏳" };
      case "supprimee":
        return { style: "bg-orange-100 text-orange-700", icon: "🗑" };
      default:
        return { style: "bg-gray-100 text-gray-700", icon: "" };
    }
  };

  const pendingCount = invitations.filter(
    (inv) => inv.statut?.toLowerCase() === "pending"
  ).length;

  // 🔔 RAPPEL
  const handleRappel = (inv) => {
    const message = `
🙏 Bonjour ${inv.responsable_prenom} ${inv.responsable_nom},

${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_nom} - ${superviseur.branche_nom} 
vous a envoyé une invitation pour que votre église soit placée sous sa supervision.

⚠️ Ceci est un rappel ! 🔔

Cliquez sur le lien ci-dessous pour accepter, refuser ou laisser l’invitation en attente :

https://soultrack-three.vercel.app/accept-invitation?token=${inv.invitation_token}

Que Dieu vous bénisse 🙏
`;

    if (inv.canal === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else if (inv.canal === "email") {
      window.location.href = `mailto:?subject=Rappel Invitation SoulTrack&body=${encodeURIComponent(message)}`;
    }
  };

  // ❌ SUPPRESSION
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
    } else if (inv.canal === "email") {
      window.location.href = `mailto:?subject=Annulation Invitation SoulTrack&body=${encodeURIComponent(message)}`;
    }

    await supabase
      .from("eglise_supervisions")
      .update({ statut: "supprimee" })
      .eq("id", inv.id);

    loadInvitations();
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-6 flex flex-col items-center">
      <HeaderPages />

      {/* FORMULAIRE */}
      <h4 className="text-2xl font-bold mb-6 text-center w-full max-w-5xl">
        Envoyer une invitation pour relier une église
      </h4>

      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-lg p-6 space-y-4 mb-10">
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Prénom du responsable"
          value={responsable.prenom}
          onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Nom du responsable"
          value={responsable.nom}
          onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
        />

        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Nom de l'église"
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

        <select
          className="w-full border rounded-xl px-3 py-2"
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
        >
          <option value="">-- Mode d’envoi --</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <SendEgliseLinkPopup
          label="Envoyer l'invitation"
          type={canal}
          superviseur={superviseur}
          responsable={responsable}
          eglise={eglise}
          onSuccess={loadInvitations}
        />
      </div>

      {/* TABLE */}
      <h4 className="text-2xl font-bold mb-4 text-amber-300">
        Liste des églises supervisées
      </h4>

      {pendingCount > 0 && (
        <div className="mb-4 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold">
          ⏳ {pendingCount} invitation(s) en attente
        </div>
      )}

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-5 gap-4 text-sm font-semibold uppercase border-b border-white/40 pb-2 pl-3">
          <div>Église</div>
          <div>Branche</div>
          <div>Pays</div>
          <div>Responsable</div>
          <div>Statut / Actions</div>
        </div>

        {invitations.map((inv) => {
          const badge = getStatusBadge(inv.statut);

          return (
            <div
              key={inv.id}
              className="grid grid-cols-5 gap-4 px-3 py-3 mt-2 bg-white text-black rounded-xl shadow items-center"
            >
              <div>{inv.eglise_nom}</div>
              <div>{inv.eglise_branche}</div>
              <div>{inv.eglise_pays}</div>
              <div>{inv.responsable_prenom} {inv.responsable_nom}</div>

              <div className="flex gap-2 items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.style}`}
                >
                  {badge.icon} {inv.statut}
                </span>

                {inv.statut?.toLowerCase() === "pending" && (
                  <>
                    <button
                      onClick={() => handleRappel(inv)}
                      className="text-orange-500 text-sm font-semibold hover:opacity-80"
                    >
                      Rappel
                    </button>

                    <button
                      onClick={() => handleSupprimer(inv)}
                      className="text-red-500 text-sm font-semibold hover:opacity-80"
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
