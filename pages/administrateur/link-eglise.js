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

      const { data } = await supabase
        .from("profiles")
        .select(`prenom, nom, eglise_id, eglises(nom, denomination, ville, pays)`)
        .eq("id", user.id)
        .single();

      if (data) {
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

  // 🔹 load
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

  // 🔹 ACTION
  const handleAction = async () => {
    if (!responsable.prenom || !responsable.nom || !eglise.nom || !eglise.denomination || !eglise.pays) {
      alert("Champs obligatoires manquants");
      return;
    }

    const token = crypto.randomUUID();

    await supabase.from("eglise_supervisions").insert([
      {
        superviseur_eglise_id: superviseur.eglise_id,
        responsable_prenom: responsable.prenom,
        responsable_nom: responsable.nom,
        eglise_nom: eglise.nom,
        eglise_denomination: eglise.denomination,
        eglise_ville: eglise.ville,
        eglise_pays: eglise.pays,
        eglise_branche: eglise.branche,
        statut: "pending",
        invitation_token: token,
      },
    ]);

    const message = `
✨ Bonjour ${responsable.prenom} ${responsable.nom},

Que la paix du Seigneur soit avec vous 🙏

${superviseur.prenom} ${superviseur.nom} vous invite à une supervision spirituelle.

🏛️ Église superviseur :
- ${superviseur.eglise_nom}
- ${superviseur.eglise_denomination}
- ${superviseur.eglise_ville}
- ${superviseur.eglise_pays}

🌍 Église concernée :
- ${eglise.nom}
- ${eglise.denomination}
- ${eglise.ville}
- ${eglise.pays}

🔗 Lien :
https://soultrack-three.vercel.app/accept-invitation?token=${token}

Avec amour en Christ ❤️
`;

    if (canal === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else if (canal === "email") {
      window.location.href = `mailto:?subject=Invitation&body=${encodeURIComponent(message)}`;
    }

    setResponsable({ prenom: "", nom: "" });
    setEglise({ id: null, nom: "", denomination: "", ville: "", pays: "", branche: "" });
    setCanal("");
    loadInvitations();
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-4 flex flex-col items-center">
      <HeaderPages />

      {/* 🔥 BLOC TEXTE RESTAURÉ EXACT */}
      <div className="w-full flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
          Invitations & Liens d’Eglises
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

        <input placeholder="Prénom responsable *"
          className="w-full p-2 text-black rounded"
          value={responsable.prenom}
          onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
        />

        <input placeholder="Nom responsable *"
          className="w-full p-2 text-black rounded"
          value={responsable.nom}
          onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
        />

        <input placeholder="Dénomination *"
          className="w-full p-2 text-black rounded"
          value={eglise.denomination}
          onChange={(e) => setEglise({ ...eglise, denomination: e.target.value })}
        />

        <input placeholder="Nom église *"
          className="w-full p-2 text-black rounded"
          value={eglise.nom}
          onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
        />

        <input placeholder="Branche"
          className="w-full p-2 text-black rounded"
          value={eglise.branche}
          onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
        />

        <input placeholder="Ville"
          className="w-full p-2 text-black rounded"
          value={eglise.ville}
          onChange={(e) => setEglise({ ...eglise, ville: e.target.value })}
        />

        <input placeholder="Pays *"
          className="w-full p-2 text-black rounded"
          value={eglise.pays}
          onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
        />

        {/* 🔥 LABEL DEMANDÉ */}
        <div className="text-sm text-white/80">Envoyer à</div>

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

      {/* TABLE MOBILE + DESKTOP */}
      <h3 className="text-2xl font-bold mt-10 mb-6 text-amber-300">
        Liste des églises supervisées
      </h3>

      <div className="w-full max-w-5xl overflow-x-auto">

        <div className="hidden md:grid md:grid-cols-6 text-sm font-semibold border-b pb-2">
          <div>Dénomination</div>
          <div>Nom</div>
          <div>Branche</div>
          <div>Ville</div>
          <div>Pays</div>
          <div>Statut</div>
        </div>

        {invitations.map((inv) => (
          <div key={inv.id} className="border-b py-3">

            {/* DESKTOP */}
            <div className="hidden md:grid md:grid-cols-6">
              <div>{inv.eglise_denomination}</div>
              <div>{inv.eglise_nom}</div>
              <div>{inv.eglise_branche}</div>
              <div>{inv.eglise_ville}</div>
              <div>{inv.eglise_pays}</div>
              <div>{inv.statut}</div>
            </div>

            {/* MOBILE (labels ajoutés) */}
            <div className="md:hidden bg-white/5 p-3 rounded text-sm space-y-1">
              <p><b>Dénomination:</b> {inv.eglise_denomination}</p>
              <p><b>Nom:</b> {inv.eglise_nom}</p>
              <p><b>Branche:</b> {inv.eglise_branche}</p>
              <p><b>Ville:</b> {inv.eglise_ville}</p>
              <p><b>Pays:</b> {inv.eglise_pays}</p>
              <p><b>Statut:</b> {inv.statut}</p>
            </div>

          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
