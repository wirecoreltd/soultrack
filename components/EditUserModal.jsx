const handleSave = async () => {
  if (!user?.id) return;

  setSaving(true);

  // On utilise select() sans .single() pour éviter l'erreur
  const { data, error } = await supabase
    .from("profiles")
    .update({
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      role: form.role,
    })
    .eq("id", user.id)
    .select(); // <- juste select(), PAS de .single()

  setSaving(false);

  if (error) {
    alert("❌ Erreur lors de la mise à jour : " + error.message);
    return;
  }

  // On récupère le premier élément de data si besoin
  const updatedUser = data && data.length > 0 ? data[0] : null;

  if (onUpdated && updatedUser) onUpdated();

  setSuccess(true);
  setTimeout(() => {
    setSuccess(false);
    onClose();
  }, 700);
};
