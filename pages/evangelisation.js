{/* ENVOYER À */}
<div className="mt-2">
  <label className="font-semibold text-sm">Envoyer à :</label>
  {/* Choix entre Cellule ou Conseiller */}
  <select
    value={selectedTargetType[m.id] || ""}
    onChange={(e) =>
      setSelectedTargetType((prev) => ({ ...prev, [m.id]: e.target.value }))
    }
    className="mt-1 w-full border rounded px-2 py-1 text-sm"
  >
    <option value="">-- Choisir une option --</option>
    <option value="cellule">Une Cellule</option>
    <option value="conseiller">Un Conseiller</option>
  </select>

  {/* Sélection de la cible en fonction du type choisi */}
  {(selectedTargetType[m.id] === "cellule" || selectedTargetType[m.id] === "conseiller") && (
    <select
      value={selectedTargets[m.id] || ""}
      onChange={(e) =>
        setSelectedTargets((prev) => ({ ...prev, [m.id]: e.target.value }))
      }
      className="mt-1 w-full border rounded px-2 py-1 text-sm"
    >
      <option value="">-- Choisir {selectedTargetType[m.id]} --</option>
      {selectedTargetType[m.id] === "cellule"
        ? cellules.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cellule} ({c.responsable})
            </option>
          ))
        : conseillers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.prenom} {c.nom}
            </option>
          ))}
    </select>
  )}

  {/* Bouton Envoyer avec mise à jour automatique */}
  {selectedTargets[m.id] && (
    <div className="pt-2">
      <BoutonEnvoyer
        membre={m}
        type={selectedTargetType[m.id]}
        cible={
          selectedTargetType[m.id] === "cellule"
            ? cellules.find((c) => c.id === selectedTargets[m.id])
            : conseillers.find((c) => c.id === selectedTargets[m.id])
        }
        onEnvoyer={(id) =>
          handleAfterSend(
            id,
            selectedTargetType[m.id],
            selectedTargetType[m.id] === "cellule"
              ? cellules.find((c) => c.id === selectedTargets[m.id])
              : conseillers.find((c) => c.id === selectedTargets[m.id])
          )
        }
        session={session}
        showToast={showToast}
      />
    </div>
  )}
</div>
