const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setMessage("❌ Les mots de passe ne correspondent pas.");
    return;
  }

  setLoading(true);
  setMessage("⏳ Création en cours...");

  try {
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important pour l'auth
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Utilisateur créé avec succès !");
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        confirmPassword: "",
        telephone: "",
        role: "",
        cellule_nom: "",
        cellule_zone: "",
      });
    } else {
      setMessage(`❌ Erreur: ${data?.error || "Réponse vide du serveur"}`);
    }
  } catch (err) {
    setMessage("❌ " + err.message);
  } finally {
    setLoading(false);
  }
};
