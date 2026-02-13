<div className="max-w-2xl w-full bg-white/10 rounded-3xl p-6 shadow-lg mb-6">
  <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">

    {/* Date */}
    <div className="flex flex-col">
      <label className="text-white font-medium mb-1">Date</label>
      <input
        type="date"
        required
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="input bg-white/20 text-white placeholder-white max-w-[200px] py-1"
      />
    </div>

    {/* Hommes et Femmes sur la même ligne */}
    <div className="flex gap-4 w-full">
      {/* Hommes */}
      <div className="flex flex-col flex-1">
        <label className="text-white font-medium mb-1">Hommes</label>
        <input
          type="number"
          value={formData.hommes}
          onChange={(e) => setFormData({ ...formData, hommes: e.target.value })}
          className="input bg-white/20 text-white placeholder-white w-full py-1"
        />
      </div>

      {/* Femmes */}
      <div className="flex flex-col flex-1">
        <label className="text-white font-medium mb-1">Femmes</label>
        <input
          type="number"
          value={formData.femmes}
          onChange={(e) => setFormData({ ...formData, femmes: e.target.value })}
          className="input bg-white/20 text-white placeholder-white w-full py-1"
        />
      </div>
    </div>

    {/* Baptisé par */}
    <div className="flex flex-col">
      <label className="text-white font-medium mb-1">Baptisé par</label>
      <input
        type="text"
        value={formData.baptise_par}
        onChange={(e) => setFormData({ ...formData, baptise_par: e.target.value })}
        className="input bg-white/20 text-white placeholder-white w-full py-1"
      />
    </div>

    <button
      type="submit"
      className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-md hover:from-blue-500 hover:to-indigo-600 transition-all"
    >
      {editId ? "Mettre à jour" : "Ajouter le rapport"}
    </button>
          </form>

        {message && <p className="mt-4 text-center font-medium text-white">{message}</p>}
      </div>

      {/* 🔹 Filtres + Bouton Générer */}
      <div className="bg-white/10 p-6 rounded-2xl shadow-lg mt-6 flex justify-center gap-4 flex-wrap text-white">
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border border-gray-400 rounded-lg px-3 py-2 bg-transparent text-white"
        />
        <button
          onClick={fetchRapports}
          className="bg-[#2a2f85] px-6 py-2 rounded-xl hover:bg-[#1f2366]"
        >
          Générer
        </button>
      </div>

      {/* 🔹 Tableau centré */}
      <div className="w-full flex justify-center mt-6 mb-6">
        <div className="w-max overflow-x-auto space-y-2">
          {/* HEADER */}
          <div className="flex text-sm font-semibold uppercase text-white px-4 py-3 border-b border-white/30 bg-white/5 rounded-t-xl whitespace-nowrap">
            <div className="min-w-[150px]">Date</div>
            <div className="min-w-[120px] text-center">Hommes</div>
            <div className="min-w-[120px] text-center">Femmes</div>
            <div className="min-w-[130px] text-center text-orange-400 font-semibold">Total</div>
            <div className="min-w-[180px] text-center">Baptisé par</div>
            <div className="min-w-[140px] text-center text-orange-400 font-semibold">Actions</div>
          </div>

          {/* LIGNES */}
          {rapports.map((r) => {
            const total = Number(r.hommes) + Number(r.femmes);
            return (
              <div
                key={r.id}
                className="flex items-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border-l-4 border-l-green-500"
              >
                <div className="min-w-[150px] text-white font-semibold">{r.date}</div>
                <div className="min-w-[120px] text-center text-white">{r.hommes}</div>
                <div className="min-w-[120px] text-center text-white">{r.femmes}</div>
                <div className="min-w-[130px] text-center text-orange-400 font-semibold">{total}</div>
                <div className="min-w-[180px] text-center text-white">{r.baptise_par}</div>
                <div className="min-w-[140px] text-center flex justify-center gap-2">
                  <button onClick={() => handleEdit(r)} className="text-blue-400 hover:text-blue-600">✏️</button>
                  <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
