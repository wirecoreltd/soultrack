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
    eglise_branche: "",
  });

  const [responsable, setResponsable] = useState({ prenom: "", nom: "" });

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
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const loadSuperviseur = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(`prenom, nom, eglise_id, eglises(nom, denomination, ville, pays, branche)`)
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
          eglise_branche: data.eglises?.branche || "",
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
      case "acceptee": return { text: "text-green-400", border: "border-green-500" };
      case "refusee": return { text: "text-red-400", border: "border-red-500" };
      case "lien_casse": return { text: "text-gray-400", border: "border-gray-400" };
      case "pending": return { text: "text-orange-400", border: "border-orange-400" };
      default: return { text: "text-white", border: "border-white/20" };
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

  const handleSelectInvitation = (inv, mode) => {
    setSelectedInvitation(inv);
    setModeAction(mode);
    setResponsable({
      prenom: inv.responsable_prenom || "",
      nom: inv.responsable_nom || "",
    });
    setEglise({
      id: null,
      nom: inv.eglise_nom || "",
      denomination: inv.eglise_denomination || "",
      ville: inv.eglise_ville || "",
      pays: inv.eglise_pays || "",
      branche: inv.eglise_branche || "",
    });
    setErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const resetForm = () => {
    setResponsable({ prenom: "", nom: "" });
    setEglise({ id: null, nom: "", denomination: "", ville: "", pays: "", branche: "" });
    setCanal("");
    setSelectedInvitation(null);
    setModeAction(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("eglise_supervisions")
      .delete()
      .eq("id", id);
    if (!error) {
      setConfirmDelete(null);
      loadInvitations();
    }
  };

  const handleCasser = async (inv) => {
    const { error } = await supabase
      .from("eglise_supervisions")
      .update({ statut: "lien_casse" })
      .eq("id", inv.id);
    if (!error) loadInvitations();
  };

  const validate = () => {
    const newErrors = {};
    if (!responsable.prenom.trim()) newErrors.prenom = true;
    if (!responsable.nom.trim()) newErrors.nom = true;
    if (!eglise.denomination.trim()) newErrors.denomination = true;
    if (!eglise.pays.trim()) newErrors.pays = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildMessage = (token, mode = "nouveau") => {
    const branche = superviseur.eglise_branche ? `, ${superviseur.eglise_branche}` : "";
    const superviseurInfo = `${superviseur.prenom} ${superviseur.nom} de ${superviseur.eglise_denomination}, ${superviseur.eglise_nom}${branche}, ${superviseur.eglise_ville}`;
    const destinataire = `${responsable.prenom} ${responsable.nom}`;
    const lien = `https://soultrack-three.vercel.app/accept-invitation?token=${token}`;

    if (mode === "rappel") {
      return `Bonjour ${destinataire},

${superviseurInfo} vous renvoie un rappel pour la supervision de votre église.

🔗 Cliquez ici pour accepter :
${lien}

Que Dieu vous guide puissamment.
Avec amour en Christ ❤️`;
    }

    return `Bonjour ${destinataire},

${superviseurInfo} invite votre église à être sous sa supervision.

🔗 Cliquez ici pour accepter :
${lien}

Que Dieu vous guide puissamment.
Avec amour en Christ ❤️`;
  };

  const sendMessage = (message) => {
    if (canal === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else if (canal === "email") {
      window.location.href = `mailto:?subject=Invitation Spirituelle&body=${encodeURIComponent(message)}`;
    }
  };

  const handleAction = async () => {
    if (!validate()) return;

    try {
      // CAS 1 : Rappel — même token
      if (modeAction === "rappel" && selectedInvitation) {
        const message = buildMessage(selectedInvitation.invitation_token, "rappel");
        sendMessage(message);
        resetForm();
        return;
      }

      // CAS 2 : Renvoyer — nouveau token
      if (modeAction === "renvoyer" && selectedInvitation) {
        const token = crypto.randomUUID();
        await supabase
          .from("eglise_supervisions")
          .update({
            statut: "pending",
            invitation_token: token,
            responsable_prenom: responsable.prenom,
            responsable_nom: responsable.nom,
            eglise_nom: eglise.nom,
            eglise_denomination: eglise.denomination,
            eglise_ville: eglise.ville,
            eglise_pays: eglise.pays,
            eglise_branche: eglise.branche,
          })
          .eq("id", selectedInvitation.id);

        const message = buildMessage(token, "nouveau");
        sendMessage(message);
        resetForm();
        loadInvitations();
        return;
      }

      // CAS 3 : Nouvelle invitation
      const token = crypto.randomUUID();
      await supabase.from("eglise_supervisions").insert([{
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
      }]);

      const message = buildMessage(token, "nouveau");
      sendMessage(message);
      resetForm();
      loadInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass = (hasError) =>
    `w-full p-2 text-black rounded ${hasError ? "border-2 border-red-500" : ""}`;

  const LabelField = ({ children, required }) => (
    <label className="block text-sm text-white/70 mb-1">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );

  const buttonLabel = () => {
    if (modeAction === "rappel") return "📨 Renvoyer un rappel";
    if (modeAction === "renvoyer") return "🔄 Renvoyer l'invitation";
    return "✉️ Envoyer l'invitation";
  };

  return (
    <div className="min-h-screen bg-[#333699] text-white p-4 flex flex-col items-center">
      <HeaderPages />

      {/* INTRO */}
      <div className="w-full flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold mt-4 mb-6 text-center text-white">
          Invitations & Liens <span className="text-emerald-300">d'Eglises</span>
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

        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <h2 className="text-lg font-semibold text-emerald-300">
            {modeAction === "rappel"
              ? `📨 Rappel — ${eglise.denomination || "..."}`
              : modeAction === "renvoyer"
              ? `🔄 Renvoyer — ${eglise.denomination || "..."}`
              : "Envoyer à"}
          </h2>
          {modeAction && (
            <button onClick={resetForm} className="text-xs text-white/50 hover:text-white underline">
              ✕ Annuler
            </button>
          )}
        </div>

        <div>
          <LabelField required>Prénom du responsable</LabelField>
          <input className={inputClass(errors.prenom)} placeholder="Prénom *"
            value={responsable.prenom}
            onChange={(e) => setResponsable({ ...responsable, prenom: e.target.value })}
          />
          {errors.prenom && <p className="text-red-400 text-xs mt-1">Ce champ est obligatoire</p>}
        </div>

        <div>
          <LabelField required>Nom du responsable</LabelField>
          <input className={inputClass(errors.nom)} placeholder="Nom *"
            value={responsable.nom}
            onChange={(e) => setResponsable({ ...responsable, nom: e.target.value })}
          />
          {errors.nom && <p className="text-red-400 text-xs mt-1">Ce champ est obligatoire</p>}
        </div>

        <div>
          <LabelField required>Dénomination</LabelField>
          <input className={inputClass(errors.denomination)} placeholder="Dénomination *"
            value={eglise.denomination}
            onChange={(e) => setEglise({ ...eglise, denomination: e.target.value })}
          />
          {errors.denomination && <p className="text-red-400 text-xs mt-1">Ce champ est obligatoire</p>}
        </div>

        <div>
          <LabelField>Nom de l'église</LabelField>
          <input className={inputClass(false)} placeholder="Nom église"
            value={eglise.nom}
            onChange={(e) => setEglise({ ...eglise, nom: e.target.value })}
          />
        </div>

        <div>
          <LabelField>Branche de l'église</LabelField>
          <input className={inputClass(false)} placeholder="Branche église"
            value={eglise.branche}
            onChange={(e) => setEglise({ ...eglise, branche: e.target.value })}
          />
        </div>

        <div>
          <LabelField>Ville</LabelField>
          <input className={inputClass(false)} placeholder="Ville"
            value={eglise.ville}
            onChange={(e) => setEglise({ ...eglise, ville: e.target.value })}
          />
        </div>

        <div>
          <LabelField required>Pays</LabelField>
          <input className={inputClass(errors.pays)} placeholder="Pays *"
            value={eglise.pays}
            onChange={(e) => setEglise({ ...eglise, pays: e.target.value })}
          />
          {errors.pays && <p className="text-red-400 text-xs mt-1">Ce champ est obligatoire</p>}
        </div>

        <div>
          <LabelField>Mode d'envoi</LabelField>
          <select className="w-full p-2 text-black rounded" value={canal}
            onChange={(e) => setCanal(e.target.value)}
          >
            <option value="">Choisir un mode d'envoi</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>

        <p className="text-white/50 text-xs">* Champs obligatoires</p>

        <button onClick={handleAction}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition-colors"
        >
          {buttonLabel()}
        </button>
      </div>

      {/* TABLE */}
      <h3 className="w-full max-w-5xl text-center text-2xl font-bold text-amber-300 mb-6 mt-10">
        Liste des églises supervisées
      </h3>

      <div className="w-full max-w-5xl overflow-x-auto">

        <div className="hidden md:grid md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_0.8fr_1fr] text-sm font-semibold uppercase border-b border-white/40 pb-2 gap-x-3 px-4">
          <div>Dénomination</div>
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
            <div key={inv.id}
              className={`grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_0.8fr_1fr] gap-x-3 px-4 py-3 mt-3 items-center border-l-4 ${statusStyle.border} bg-white/5 rounded-lg`}
            >
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">Dénomination</span>
                {inv.eglise_denomination}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">Nom</span>
                {inv.eglise_nom}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">Branche</span>
                {inv.eglise_branche}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">Ville</span>
                {inv.eglise_ville}
              </div>
              <div>
                <span className="block text-xs text-white/50 uppercase md:hidden">Pays</span>
                {inv.eglise_pays}
              </div>
              <div className={`font-semibold ${statusStyle.text}`}>
                <span className="block text-xs text-white/50 uppercase md:hidden">Statut</span>
                {getStatusLabel(inv.statut)}
              </div>

              <div className="flex flex-wrap justify-start md:justify-center gap-2 text-sm mt-2 md:mt-0">
                {inv.statut === "pending" && (
                  <>
                    <button
                      onClick={() => handleSelectInvitation(inv, "rappel")}
                      className="text-yellow-300 hover:underline whitespace-nowrap"
                    >
                      ⏳ Rappel
                    </button>
                    <button
                      onClick={() => setConfirmDelete(inv.id)}
                      className="text-red-400 hover:underline whitespace-nowrap"
                    >
                      🗑️ Supprimer
                    </button>
                  </>
                )}
                {inv.statut === "acceptee" && (
                  <button
                    onClick={() => handleCasser(inv)}
                    className="text-gray-300 hover:underline whitespace-nowrap"
                  >
                    🔗 Casser
                  </button>
                )}
                {(inv.statut === "refusee" || inv.statut === "lien_casse") && (
                  <button
                    onClick={() => handleSelectInvitation(inv, "renvoyer")}
                    className="text-green-300 hover:underline whitespace-nowrap"
                  >
                    🔄 Renvoyer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL SUPPRESSION */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e2a7a] border border-red-500 rounded-xl p-6 max-w-sm w-full text-center space-y-4">
            <p className="text-lg font-semibold text-white">🗑️ Confirmer la suppression</p>
            <p className="text-white/70 text-sm">
              Cette invitation sera définitivement supprimée. Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-center mt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
