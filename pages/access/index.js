"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function AccessIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const generateOrUseToken = async () => {
      setLoading(true);

      const now = new Date();

      // Chercher le dernier token pour ajouter_membre
      const { data: tokens, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("access_type", "ajouter_membre")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        setErrorMsg("Erreur lors de la récupération du token : " + error.message);
        setLoading(false);
        return;
      }

      let tokenToUse;

      if (!tokens || tokens.length === 0 || new Date(tokens[0].created_at) <= new Date(now.getTime() - 7*24*60*60*1000)) {
        // Pas de token ou token vieux d'une semaine → créer un nouveau
        const newToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // valable 7 jours

        const { error: insertError } = await supabase
          .from("access_tokens")
          .insert([
            {
              token: newToken,
              access_type: "ajouter_membre",
              created_at: now,
              expires_at: expiresAt,
            },
          ]);

        if (insertError) {
          setErrorMsg("Erreur lors de la création du token : " + insertError.message);
          setLoading(false);
          return;
        }

        tokenToUse = newToken;
      } else {
        // Token existant encore valide
        tokenToUse = tokens[0].token;
      }

      // Redirection automatique vers /access/[token]
      router.replace(`/access/${tokenToUse}`);
    };

    generateOrUseToken();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <p className="text-gray-700 text-lg">Génération du lien d'accès...</p>
      ) : (
        <p className="text-red-500 text-lg">{errorMsg}</p>
      )}
    </div>
  );
}
