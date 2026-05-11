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
    eglise_nom: "",
    eglise_denomination: "",
    eglise_ville: "",
    eglise_pays: "",
  });

  const [responsable, setResponsable] = useState({
    prenom: "",
    nom: "",
  });

  const [eglise, setEglise] = useState({
  id: null,
  nom: "",
  denomination: "",
  ville: "",
  pays: "",
  branche: "",
});

  const [canal, setCanal] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [modeAction, setModeAction] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  // 🔹 superviseur
  useEffect(() => {
    const loadSuperviseur = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          prenom,
          nom,
          eglise_id,
          eglises(nom, denomination, ville, pays)
        `)
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setSuperviseur({
          prenom: data.prenom,
          nom: data.nom,
          eglise_id: data.eglise_id,
          eglise_nom: data.eglises?.nom || "",
          eglise_denomination: data.eglises?.denomination || "",
          eglise_ville: data.eglises?.ville || "",
          eglise_pays: data.eglises?.pays || "",
        });
      }
    };

    loadSuperviseur();
  }, []);

  const getStatusLabel = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee":
        return "Accepté";
      case "refusee":
        return "Refusée";
      case "lien_casse":
        return "Lien Cassé";
      case "pending":
        return "En Attente";
      case "expired":
        return "Lien Expiré";
      default:
        return statut;
    }
  };

  const getStatusStyle = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptee":
        return { text: "text-green-600", border: "border-green-600" };
      case "refusee":
        return { text: "text-red-600", border: "border-red-600" };
      case "lien_casse":
        return { text: "text-gray-400", border: "border-gray-400" };
      case "pending":
        return { text: "text-orange-500", border: "border-orange-500" };
      default:
        return { text: "text-white", border: "border-white/20" };
    }
  };

  const loadInvitations = async () => {
    if (!superviseur.eglise_id) return;

    const { data, error } = await supabase
      .from("eglise_supervisions")
      .select("*")
      .eq("superviseur_eglise_id", superviseur.eglise_id)
      .order("created_at", { ascending: false });

    if (!error) setInvitations(data || []);
  };

  useEffect(() => {
    loadInvitations();
  }, [superviseur.eglise_id]);

  const handleAction = async () => {
    try {
      const token = crypto.randomUUID();

      if (!selectedInvitation && modeAction === null) {
        await supabase.from("eglise_supervisions").insert([
          {
            superviseur_eglise_id: superviseur.eglise_id,
            responsable_prenom: responsable.prenom,
            responsable_nom: responsable.nom,
            eglise_nom: eglise.nom,
            eglise_denomination: eglise.denomination,
            eglise_ville: eglise.ville,
            eglise_pays: eglise.pays,
            statut: "pending",
            invitation_token: token,
          },
        ]);

        // 🔥 MESSAGE WHATSAPP PLUS CHALEUREUX
        const message = `
✨ Bonjour ${responsable.prenom} ${responsable.nom},

Que la paix du Seigneur soit avec vous 🙏

${superviseur.prenom} ${superviseur.nom} vous écrit avec amour dans le Seigneur.

Nous vous invitons à placer votre église sous une supervision spirituelle afin de grandir ensemble dans l’œuvre de Dieu.

🏛️ Église superviseur :
- Nom : ${superviseur.eglise_nom}
- Dénomination : ${superviseur.eglise_denomination}
- Ville : ${superviseur.eglise_ville}
- Pays : ${superviseur.eglise_pays}

🌍 Église à relier :
- Nom : ${eglise.nom}
- Dénomination : ${eglise.denomination}
- Ville : ${eglise.ville}
- Pays : ${eglise.pays}

🔗 Cliquez ici pour accepter :
https://soultrack-three.vercel.app/accept-invitation?token=${token}

Nous prions pour vous et votre ministère 🙏
Que Dieu vous guide puissamment.

Avec amour en Christ ❤️
        `;

        if (canal === "whatsapp") {
          window.open(
            `https://wa.me/?text=${encodeURIComponent(message)}`,
            "_blank"
          );
        } else if (canal === "email") {
          window.location.href = `mailto:?subject=Invitation Spirituelle&body=${encodeURIComponent(
            message
          )}`;
        }
      }

      setResponsable({ prenom: "", nom: "" });
      setEglise({ id: null, nom: "", denomination: "", ville: "", pays: "", branche: "" });
      setCanal("");
      setSelectedInvitation(null);
      setModeAction(null);

      loadInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-4 flex flex-col items-center">
      <HeaderPages />

      {/* 🔥 TON BLOC RESTAURÉ À L’IDENTIQUE */}
      <div className="w-full flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
          Invitations & Liens <span className="text-emerald-300">d’Eglises</span>
        </h1>

        <div className="max-w-3xl w-full text-center">
          <p className="italic text-base text-white/90 mb-4">
            Relier une église vous permet de placer une église sous votre supervision et de voir ses statistiques dans{" "}
            <span className="text-blue-300 font-semibold">Stats Globales</span>.
          </p>

          <p className="italic text-base text-white/90 mb-4">
            Dans cette <span className="text-blue-300 font-semibold">interface</span>, vous pouvez :
          </p>

          <ul className="list-none space-y-3 text-base">
            <li className="text-green-400 italic mt-3">✉️ <strong>Envoyer une invitation</strong> à une église</li>
            <li className="text-gray-400 italic">🔗 <strong>Casser le lien</strong> avec une église supervisée</li>
            <li className="text-red-500 italic">🗑️ <strong>Supprimer</strong> une invitation envoyée</li>
            <li className="text-green-400 italic">🔄 <strong>Renvoyer le lien</strong> si nécessaire</li>
            <li className="text-yellow-300 italic">⏳ <strong>Envoyer un rappel</strong> pour une invitation en attente</li>
          </ul>

          <p className="mt-3 text-gray-300 text-sm italic">
            Toutes les actions sont suivies ici et visibles dans votre tableau.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div ref={formRef} className="w-full max-w-md bg-white/10 p-6 rounded-xl space-y-4">

        <input className="w-full p-2 text-black rounded"
          placeholder="Prénom"
          value={responsable.prenom}
          onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
        />

        <input className="w-full p-2 text-black rounded"
          placeholder="Nom"
          value={responsable.nom}
          onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
        />        

        <input className="w-full p-2 text-black rounded"
          placeholder="Dénomination"
          value={eglise.denomination}
          onChange={(e) => setEglise({ ...eglise, denomination: e.target.value })}
        />

            <input className="w-full p-2 text-black rounded"
          placeholder="Nom église"
          value={eglise.nom}
          onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
        />

       <input
          className="w-full p-2 text-black rounded"
          placeholder="Branche église"
          value={eglise.branche}
          onChange={(e) =>
            setEglise({ ...eglise, branche: e.target.value })
          }
        />     

        <input className="w-full p-2 text-black rounded"
          placeholder="Ville"
          value={eglise.ville}
          onChange={(e) => setEglise({ ...eglise, ville: e.target.value })}
        />

        <input className="w-full p-2 text-black rounded"
          placeholder="Pays"
          value={eglise.pays}
          onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
        />

        <select
          className="w-full p-2 text-black rounded"
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
        >
          <option value="">Mode d’envoi</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <button onClick={handleAction} className="w-full bg-blue-600 py-2 rounded">
          Envoyer l’invitation
        </button>
      </div>

            {/* TABLE INVITATIONS */}
<h3 className="w-full max-w-5xl text-center text-2xl font-bold text-amber-300 mb-6 mt-10">
  Liste des églises supervisées
</h3>

<div className="w-full max-w-5xl overflow-x-auto">

  <div className="hidden md:grid md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] text-sm font-semibold uppercase border-b border-white/40 pb-2 gap-x-3">
    <div className = "ml-3">Dénomination</div>
    <div>Nom</div>
    <div>Branche</div>
    <div>Ville</div>
    <div>Pays</div>
    <div>Statut</div>
    <div className="text-center">Action</div>
  </div>

  {invitations.map((inv) => {
    const statusStyle = getStatusStyle(inv.statut);

    return (
      <div
        key={inv.id}
        className={`grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-x-3 px-4 py-3 mt-3 items-center border-l-4 ${statusStyle.border} bg-white/5 rounded-lg`}
      >
        <div>{inv.eglise_denomination}</div>
        <div>{inv.eglise_nom}</div>
        <div>{inv.eglise_branche}</div>
        <div>{inv.eglise_ville}</div>
        <div>{inv.eglise_pays}</div>

        <div className={`font-semibold ${statusStyle.text}`}>
          {getStatusLabel(inv.statut)}
        </div>

        <div className="flex justify-center gap-2 text-sm">
          {inv.statut === "pending" && (
            <button
              onClick={() => handleSelectInvitation(inv, "rappel")}
              className="text-yellow-300"
            >
              Rappel
            </button>
          )}

          {inv.statut === "acceptee" && (
            <button
              onClick={() => handleSelectInvitation(inv, "casser")}
              className="text-gray-300"
            >
              Casser
            </button>
          )}

          {(inv.statut === "refusee" || inv.statut === "lien_casse") && (
            <button
              onClick={() => handleSelectInvitation(inv, "renvoyer")}
              className="text-green-300"
            >
              Renvoyer
            </button>
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
