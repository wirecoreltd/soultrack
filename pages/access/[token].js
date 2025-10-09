/* pages/access/[token].js */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";

export default function AccessPage() {
  const router = useRouter();
  const { token } = router.query; // Récupère le token depuis l'URL
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setLoading(true);

      // Vérifier si le token existe dans Supabase
      const { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        setErrorMsg("Lien invalide ou expiré.");
        setLoading(false);
        return;
      }

      // Vérifier l'expiration
      const now = new Date();
      if (data.expires_at && new Date(data.expires_at) < now) {
        setErrorMsg("Lien expiré.");
        setLoading(false);
        return;
      }

      // Redirection selon le type de token
      if (data.access_type === "ajouter_membre") {
        router.replace("/add-member");
      } else if (data.access_type === "ajouter_evangelise") {
        router.replace("/add-evangelise");
      } else {
        setErrorMsg("Type de token inconnu.");
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <p className="text-gray-700 text-lg">Vérification du lien...</p>
      ) : (
        <p className="text-red-500 text-lg">{errorMsg}</p>
      )}
    </div>
  );
}
