import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { membre, suivis, lang = "fr" } = req.body;
  const isEn = lang === "en";

  const besoins = (() => {
    if (!membre.besoin) return isEn ? "Not specified" : "Non précisé";
    try {
      const p = JSON.parse(membre.besoin);
      return Array.isArray(p) ? p.join(", ") : String(p);
    } catch { return String(membre.besoin); }
  })();

  const historiqueTexte = suivis.length > 0
    ? suivis.slice(0, 6).map(s => {
        const b = (() => {
          if (!s.besoin) return "";
          try {
            const p = JSON.parse(s.besoin);
            if (Array.isArray(p)) return p.map(x => typeof x === "object" ? x.label : x).join(", ");
            return String(p);
          } catch { return String(s.besoin); }
        })();
        const needsLabel  = isEn ? "Needs" : "Besoins";
        const noteLabel   = isEn ? "Note"  : "Note";
        return `- ${s.date_action} (${s.action_type})${b ? ` | ${needsLabel}: ${b}` : ""}${s.commentaire ? ` | ${noteLabel}: ${s.commentaire}` : ""}`;
      }).join("\n")
    : (isEn ? "No follow-ups recorded." : "Aucun suivi enregistré.");

  const nombreSuivis = suivis.length;
  const aDesRecidives = nombreSuivis >= 2;

  const prompt = isEn
    ? `You are a loving, wise and caring shepherd. You are preparing the heart of a pastoral leader before they meet someone from their flock.
Here is what you know about this person:
- First name: ${membre.prenom}
- Identified needs: ${besoins}
- Number of past follow-ups: ${nombreSuivis}
- Recurring patterns detected: ${aDesRecidives ? "Yes" : "No"}
History:
${historiqueTexte}
As a wise shepherd, generate a pastoral preparation support in JSON only. Be gentle, deep, human — never cold or academic.
{
  "avant_dentrer": "1-2 essential sentences about this person's likely inner state today. What the leader should hold in their heart before even saying hello.",
  "cles_comprehension": "2-3 sentences about the deep wounds, blocks, and inner cycles detected in the history. Go to the root, not the symptoms.",
  "mots_cles": ["word 1", "word 2", "word 3", "word 4", "word 5"],
  "questions_a_poser": [
    "gentle and open question 1",
    "question 2",
    "question 3",
    "question 4"
  ],
  "pistes_accompagnement": [
    "concrete and human path 1",
    "path 2",
    "path 3"
  ],
  "versets": [
    {"reference": "Book chapter:verse", "texte": "verse text"},
    {"reference": "Book chapter:verse", "texte": "verse text"}
  ]
}`
    : `Tu es un berger aimant, sage et bienveillant. Tu prépares le cœur d'un responsable pastoral avant qu'il rencontre une personne de son troupeau.
Voici ce que tu sais sur cette personne :
- Prénom : ${membre.prenom}
- Besoins identifiés : ${besoins}
- Nombre de suivis passés : ${nombreSuivis}
- Cycles répétitifs détectés : ${aDesRecidives ? "Oui" : "Non"}
Historique :
${historiqueTexte}
En tant que berger sage, génère un support de préparation pastoral en JSON uniquement. Sois doux, profond, humain — jamais froid ni académique.
{
  "avant_dentrer": "1-2 phrases essentielles sur l'état intérieur probable de cette personne aujourd'hui. Ce que le responsable doit garder dans son cœur avant même de dire bonjour.",
  "cles_comprehension": "2-3 phrases sur les blessures profondes, les blocages, les cycles intérieurs détectés dans l'historique. Aller à la racine, pas aux symptômes.",
  "mots_cles": ["mot 1", "mot 2", "mot 3", "mot 4", "mot 5"],
  "questions_a_poser": [
    "question douce et ouverte 1",
    "question 2",
    "question 3",
    "question 4"
  ],
  "pistes_accompagnement": [
    "piste concrète et humaine 1",
    "piste 2",
    "piste 3"
  ],
  "versets": [
    {"reference": "Livre chapitre:verset", "texte": "texte du verset"},
    {"reference": "Livre chapitre:verset", "texte": "texte du verset"}
  ]
}`;

  const systemPrompt = isEn
    ? "You are a loving and wise shepherd. Respond ONLY in valid JSON, with no text before or after."
    : "Tu es un berger aimant et sage. Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: prompt },
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
