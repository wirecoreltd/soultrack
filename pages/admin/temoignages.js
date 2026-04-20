"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminTemoignages() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("contact")
      .select("*")
      .eq("type", "temoignage")
      .order("created_at", { ascending: false });

    if (!error) setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleVisible = async (id, current) => {
    await supabase
      .from("contact")
      .update({ is_visible: !current })
      .eq("id", id);

    fetchData();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Gestion des témoignages</h1>

      {data.map((t) => (
        <div key={t.id} style={{
          border: "1px solid #ccc",
          padding: 20,
          marginBottom: 10,
          borderRadius: 10
        }}>
          <p><b>{t.nom}</b> - {t.nom_eglise}</p>
          <p>{t.message}</p>
          <p>Note: {t.note}</p>

          <button onClick={() => toggleVisible(t.id, t.is_visible)}>
            {t.is_visible ? "❌ Retirer du site" : "✅ Afficher sur le site"}
          </button>
        </div>
      ))}
    </div>
  );
}
