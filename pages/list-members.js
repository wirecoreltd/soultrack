{/* ==================== VUE TABLE ==================== */}
{view === "table" && (
  <div className="w-full max-w-6xl overflow-x-auto transition duration-200">
    <table className="w-full text-sm text-left border-separate border-spacing-0 bg-white rounded-lg">
      {/* Header */}
      <thead className="bg-gray-200 text-gray-800 text-sm uppercase">
        <tr>
          <th className="px-4 py-2 rounded-tl-lg">Nom complet</th>
          <th className="px-4 py-2">Téléphone</th>
          <th className="px-4 py-2">Statut</th>
          <th className="px-4 py-2 rounded-tr-lg">Détails</th>
        </tr>
      </thead>

      <tbody>
        {/* Section Nouveaux Membres */}
        {nouveauxFiltres.length > 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-2 text-gray-800 font-semibold">
              💖 Bien aimé venu le {formatDate(nouveauxFiltres[0].created_at)}
            </td>
          </tr>
        )}

        {nouveauxFiltres.map((m) => (
          <tr
            key={m.id}
            className="hover:bg-gray-100 transition duration-150 border-b border-gray-300"
          >
            <td
              className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2"
              style={{ borderLeftColor: getBorderColor(m) }}
            >
              {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
              <span className="bg-blue-500 text-white text-xs px-1 rounded ml-2">Nouveau</span>
            </td>
            <td className="px-4 py-2">{m.telephone || "—"}</td>
            <td className="px-4 py-2">{m.statut || "—"}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
                className="text-orange-500 underline text-sm"
              >
                {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
              </button>
            </td>
          </tr>
        ))}

        {/* Section Membres Existants */}
        {anciensFiltres.length > 0 && (
          <>
            <tr>
              <td colSpan={4} className="px-4 py-2 font-semibold text-lg">
                <span
                  style={{
                    background: "linear-gradient(to right, #3B82F6, #D1D5DB)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Membres existants
                </span>
              </td>
            </tr>

            {anciensFiltres.map((m) => (
              <tr
                key={m.id}
                className="hover:bg-gray-100 transition duration-150 border-b border-gray-300"
              >
                <td
                  className="px-4 py-2 border-l-4 rounded-l-md flex items-center gap-2"
                  style={{ borderLeftColor: getBorderColor(m) }}
                >
                  {m.prenom} {m.nom} {m.star && <span className="text-yellow-400 ml-1">⭐</span>}
                </td>
                <td className="px-4 py-2">{m.telephone || "—"}</td>
                <td className="px-4 py-2">{m.statut || "—"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setPopupMember(popupMember?.id === m.id ? null : m)}
                    className="text-orange-500 underline text-sm"
                  >
                    {popupMember?.id === m.id ? "Fermer détails" : "Détails"}
                  </button>
                </td>
              </tr>
            ))}
          </>
        )}
      </tbody>
    </table>

    {popupMember && (
      <DetailsPopup
        member={popupMember}
        onClose={() => setPopupMember(null)}
        statusOptions={statusOptions}
        cellules={cellules}
        selectedCellules={selectedCellules}
        setSelectedCellules={setSelectedCellules}
        handleChangeStatus={handleChangeStatus}
        handleStatusUpdateFromEnvoyer={handleStatusUpdateFromEnvoyer}
        session={session}
      />
    )}
  </div>
)}
