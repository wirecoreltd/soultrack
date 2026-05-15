// pages/api/pastoral/prepare.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
   console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY?.slice(0, 8) + "...");

  const { membre, suivis, egliseId } = req.body;

  const REFERENCES_PAR_EGLISE = {
    "9bc9ddf4-dbbb-4a99-8859-0cb1c3c529c4": {
      nom: "Gloire",
      references: ["Yvan Castanou", "Myles Munroe", "T.D. Jakes"],
    },
    "1c59fd6b-2e82-4027-b24c-532c2d7d5d68": {
      nom: "Centre Missionnaire",
      references: ["Rick Warren", "Derek Prince", "Myles Munroe"],
    },
    "3e5148d1-2244-4e44-a9c1-76c538ce0106": {
      nom: "Centre Apostolique",
      references: ["Yvan Castanou", "Yves Castanou", "Derek Prince"],
    },
  };

  const eglise = REFERENCES_PAR_EGLISE[egliseId] ?? {
    nom: "Église",
    references: ["Myles Munroe", "T.D. Jakes", "Rick Warren"],
  };

  const historiqueTexte = suivis.length > 0
    ? suivis.slice(0, 5).map(s => {
        const besoins = s.besoin ? JSON.parse(s.besoin).map(b => b.label).join(", ") : "";
        return `- ${s.date_action} (${s.action_type}) : ${s.commentaire || ""}${besoins ? ` | Besoins : ${besoins}` : ""}`;
      }).join("\n")
    : "Aucun suivi enregistré.";

  const besoins = membre.besoin
    ? JSON.parse(membre.besoin).join(", ")
    : "Non précisé";

  const prompt = `Tu es un assistant pastoral bienveillant, formé à la sagesse biblique et aux enseignements de ${eglise.references.join(", ")}. Tu prépares le cœur d'un responsable avant un entretien pastoral.

Membre : ${membre.prenom} ${membre.nom}
Besoins : ${besoins}
Historique :
${historiqueTexte}

Génère une préparation pastorale en JSON uniquement (aucun texte avant ou après, aucun markdown) :
{
  "comprehension": "2-3 phrases douces sur ce que l'historique révèle en profondeur : blessures, blocages, cycles intérieurs.",
  "questions": ["question 1", "question 2", "question 3", "question 4"],
  "directions": ["direction concrète 1", "direction 2", "direction 3"],
  "versets": [{"reference": "Livre chapitre:verset", "texte": "texte du verset"}, {"reference": "...", "texte": "..."}],
  "references": [{"nom": "nom du pasteur", "sujet": "thème précis lié au besoin de cette personne"}]
}`;

  try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile", // gratuit et très capable
            max_tokens: 1000,
            messages: [
              {
                role: "system",
                content: "Tu es un assistant pastoral bienveillant. Réponds UNIQUEMENT en JSON valide, aucun texte avant ou après.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });
        
        const data = await response.json();
        const text = data.choices[0].message.content;
        const parsed = JSON.parse(text);       
           
    return res.status(200).json(parsed);
  } catch (err) {
    console.error("[pastoral/prepare]", err);
    return res.status(500).json({ error: err.message });
  }
}
