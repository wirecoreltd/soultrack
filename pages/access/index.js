// pages/access/index.js
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
        // Créer un nouveau token
        const newToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { error: insertError } = await supabase.from("access_tokens").insert([
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
        tokenToUse = tokens[0].token;
      }

      router.replace(`/access/${tokenToUse}`);
    };

    generateOrUseToken();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? <p>Génération du lien d'accès...</p> : <p className="text-red-500">{errorMsg}</p>}
    </div>
  );
}
