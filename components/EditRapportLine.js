// 🔹 Popup pour modifier un rapport
function EditRapportPopup({ isOpen, onClose, rapport, onSave }) {
  const [formData, setFormData] = useState(rapport);

  useEffect(() => {
    setFormData(rapport);
  }, [rapport]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Modifier le rapport</h2>

        <div className="flex flex-col gap-2">
          <label className="font-semibold">Date :</label>
          <input
            type="date"
            className="input"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />

          <label className="font-semibold">Hommes :</label>
          <input
            type="number"
            className="input"
            value={formData.hommes || 0}
            onChange={e => setFormData({ ...formData, hommes: parseInt(e.target.value) || 0 })}
          />

          <label className="font-semibold">Femmes :</label>
          <input
            type="number"
            className="input"
            value={formData.femmes || 0}
            onChange={e => setFormData({ ...formData, femmes: parseInt(e.target.value) || 0 })}
          />

          <label className="font-semibold">Prière du salut :</label>
          <input
            type="number"
            className="input"
            value={formData.priere || 0}
            onChange={e => setFormData({ ...formData, priere: parseInt(e.target.value) || 0 })}
          />

          <label className="font-semibold">Nouveau converti :</label>
          <input
            type="number"
            className="input"
            value={formData.nouveau_converti || 0}
            onChange={e => setFormData({ ...formData, nouveau_converti: parseInt(e.target.value) || 0 })}
          />

          <label className="font-semibold">Réconciliation :</label>
          <input
            type="number"
            className="input"
            value={formData.reconciliation || 0}
            onChange={e => setFormData({ ...formData, reconciliation: parseInt(e.target.value) || 0 })}
          />

          <label className="font-semibold">Moissonneurs :</label>
          <input
            type="text"
            className="input"
            value={formData.moissonneurs || ""}
            onChange={e => setFormData({ ...formData, moissonneurs: e.target.value })}
            placeholder="Entrer le nombre de moissonneurs"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white"
          >
            Enregistrer
          </button>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          }
        `}</style>
      </div>
    </div>
  );
}

export default EditRapportPopup;
