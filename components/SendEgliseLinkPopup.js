"use client";

import { useState } from "react";
import supabase from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SendEgliseLinkPopup({
  label,
  type,
  superviseur,
  eglise,
  superviseurEgliseId,
  onSuccess
}) {

  const [showPopup,setShowPopup]=useState(false);
  const [phoneNumber,setPhoneNumber]=useState("");

  const handleSend = async () => {

    const token = uuidv4();

    const { error } = await supabase
      .from("eglise_supervisions")
      .insert({
        superviseur_eglise_id: superviseurEgliseId,
        responsable_prenom: superviseur.prenom,
        responsable_nom: superviseur.nom,
        invitation_token: token
      });

    if(error){
      alert(error.message);
      return;
    }

    const link = `${window.location.origin}/accept-invitation?token=${token}`;

    if(type==="whatsapp"){
      window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(link)}`,"_blank");
    }else{
      window.location.href=`mailto:?subject=Invitation&body=${encodeURIComponent(link)}`;
    }

    setShowPopup(false);
    onSuccess?.();
  };

  return (
    <>
      <button onClick={()=>setShowPopup(true)} className="w-full py-3 bg-indigo-600 text-white rounded-xl">
        {label}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            {type==="whatsapp" && (
              <input
                placeholder="Numéro WhatsApp"
                value={phoneNumber}
                onChange={(e)=>setPhoneNumber(e.target.value)}
                className="w-full border rounded p-2 mb-3"
              />
            )}

            <div className="flex gap-2">
              <button onClick={()=>setShowPopup(false)} className="flex-1 bg-gray-300 p-2 rounded">Annuler</button>
              <button onClick={handleSend} className="flex-1 bg-green-500 text-white p-2 rounded">Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
