import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function EditEvangelisePopup({
  member,
  onClose,
  onUpdate,
  besoinsList,
}) {
  const [formData, setFormData] = useState({
    prenom: member.prenom || "",
    nom: member.nom || "",
    telephone: member.telephone || "",
    ville: member.ville || "",
    is_whatsapp: member.is_whatsapp || false,
    sexe: member.sexe || "",
    priere_salut: member.priere_salut ? "Oui" : "Non", // ✅ boolean → string UI
    type_conversion: member.type_conversion || "",
    besoin: member.besoin || [],
    infos_supplementaires: member.infos_supplementaires || "",
  });

  const [showOtherField, setShowOtherField] = useState(false);
  const [otherBesoin, setOtherBesoin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBesoinChange = (besoin) => {
    setFormData((prev) => ({
      ...prev,
      besoin: prev.besoin.includes(besoin)
        ? prev.besoin.filter((b) => b !== besoin)
        : [...prev.besoin, besoin],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const besoinsFinal = [...formData.besoin];
    if (showOtherField && otherBesoin.trim()) {
      besoinsFinal.push(otherBesoin.trim());
    }

    const { error } = await supabase
      .from("evangelises")
      .update({
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        ville: formData.ville,
        is_whatsapp: formData.is_whatsapp,
        sexe: formData.sexe,
        priere_salut: formData.priere_salut === "Oui", // ✅ conversion CRUCIALE
        type_conversion:
          formData.priere_salut === "Oui" ? formData.type_conversion : null,
        besoin: besoinsFinal,
        infos_supplementaires: formData.infos_supplementaires,
      })
      .eq("id", member.id);

    setLoading(false);

    if (error) {
      console.error(error);
      setError("Erreur lors de la mise à jour");
      return;
    }

    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Modifier la personne</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            className="input"
            type="text"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={(e) =>
              setFormData({ ...formData, prenom: e.target.value })
            }
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Nom"
            value={formData.nom}
            onChange={(e) =>
              setFormData({ ...formData, nom: e.target.value })
            }
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={(e) =>
              setFormData({ ...formData, telephone: e.target.value })
            }
          />

          <input
            className="input"
            type="text"
            placeholder="Ville"
            value={formData.ville}
            onChange={(e) =>
              setFormData({ ...formData, ville: e.target.value })
            }
          />

          {/* WhatsApp */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_whatsapp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_whatsapp: e.target.checked,
                })
              }
              className="w-5 h-5 accent-indigo-600"
            />
            WhatsApp
          </label>

          {/* Sexe */}
          <select
            className="input"
            value={formData.sexe}
            onChange={(e) =>
              setFormData({ ...formData, sexe: e.target.value })
            }
            required
          >
            <option value="">Sexe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          {/* Prière du salut */}
          <select
            className="input"
            value={formData.priere_salut}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                priere_salut: value,
                type_conversion: value === "Oui" ? formData.type_conversion : "",
              });
            }}
            required
          >
            <option value="">-- Prière du salut ? --</option>
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>

          {/* Type de conversion */}
          {formData.priere_salut === "Oui" && (
            <select
              className="input"
              value={formData.type_conversion}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type_conversion: e.target.value,
                })
              }
              required
            >
              <option value="">Type</option>
              <option value="Nouveau converti">Nouveau converti</option>
              <option value="Réconciliation">Réconciliation</option>
            </select>
          )}

          {/* Besoins */}
          <div>
            <p className="font-semibold mb-2">Besoins :</p>

            {besoinsList.map((b) => (
              <label key={b} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={formData.besoin.includes(b)}
                  onChange={() => handleBesoinChange(b)}
                  className="w-5 h-5 accent-indigo-600"
                />
                {b}
              </label>
            ))}

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={showOtherField}
                onChange={() => setShowOtherField(!showOtherField)}
                className="w-5 h-5 accent-indigo-600"
              />
              Autre
            </label>

            {showOtherField && (
              <input
                type="text"
                className="input mt-2"
                placeholder="Précisez le besoin..."
                value={otherBesoin}
                onChange={(e) => setOtherBesoin(e.target.value)}
              />
            )}
          </div>

          <textarea
            className="input"
            rows={3}
            placeholder="Informations supplémentaires..."
            value={formData.infos_supplementaires}
            onChange={(e) =>
              setFormData({
                ...formData,
                infos_supplementaires: e.target.value,
              })
            }
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white py-2 rounded-xl"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-xl hover:scale-105 transition"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
