import crypto from "crypto";

export async function POST(req) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json({ error: "Variables Cloudinary manquantes" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // Signature
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "soultrack/logos";
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    // FormData pour Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    const uploadForm = new FormData();
    uploadForm.append("file", blob, file.name);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp.toString());
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadForm }
    );

    const result = await response.json();
    console.log("Réponse Cloudinary complète:", JSON.stringify(result));

    if (!response.ok) {
      return Response.json({ 
        error: result.error?.message || "Erreur Cloudinary", 
        details: result 
      }, { status: 500 });
    }

    return Response.json({ url: result.secure_url });

  } catch (err) {
    console.error("Erreur:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
