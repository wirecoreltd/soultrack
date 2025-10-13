//components/SendAppLink.js

"use client";

import { useState } from "react";

export default function SendAppLink({ label, buttonColor, linkType }) {
  const [manual, setManual] = useState(false);
  const [phone, setPhone] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const page = linkType === "membre" ? "add-member" : "add-evangelise";
  const link = `${baseUrl}/${page}`;

  const handleOpenWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`, "_blank");
    setPopupOpen(false);
  };

  const handleSendManual = () => {
    if (!phone) return alert("Veuillez entrer un numéro valide avec l’indicatif, ex: +2305XXXXXXX");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(link)}`, "_blank");
    setPhone("");
    setManual(false);
    setPopupOpen(false);
  };

  return (
    <>
      {/* Bouton principal pour ouvrir le popup */}
      <button
        onClick={() => setPopupOpen(true)}
        className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${buttonColor} hover:opacity-90 transition`}
      >
        {label}
      </button>

      {/* Popup */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 relative">
            
            {/* Fermer le popup */}
            <button
              onClick={() => { setPopupOpen(false); setManual(false); setPhone(""); }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center">{label}</h2>
            <p className="text-sm text-gray-600 text-center">
              Cliquez sur "Envoyer" si le contact figure déjà dans votre liste WhatsApp.
            </p>

            {/* Bouton pour ouvrir WhatsApp avec les contacts */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-md transition"
            >
              Envoyer
            </button>

            {/* Option pour numéro manuel */}
            {!manual ? (
              <button
                onClick={() => setManual(true)}
                className="w-full py-2 text-sm text-gray-700 underline"
              >
                Saisir un numéro manuellement
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="+2305XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border p-2 rounded-lg text-center"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleSendManual}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Envoyer
                  </button>
                  <button
                    onClick={() => { setManual(false); setPhone(""); }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
