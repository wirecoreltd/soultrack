import { v2 as cloudinary } from "cloudinary";

// 🔐 Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();

    // 📦 Récupérer le fichier logo
    const file = formData.get("logo");

    let logoUrl = null;

    // 🖼️ Upload vers Cloudinary si fichier présent
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "soultrack/logos", // dossier dans Cloudinary
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      logoUrl = uploadResult.secure_url;
    }

    // 🧾 Récupérer les champs du formulaire
    const data = {
      denomination: formData.get("denomination"),
      nomEglise: formData.get("nomEglise"),
      nomBranche: formData.get("nomBranche"),
      ville: formData.get("ville"),
      localisation: formData.get("localisation"),
      adminPrenom: formData.get("adminPrenom"),
      adminNom: formData.get("adminNom"),
      adminEmail: formData.get("adminEmail"),
      adminPassword: formData.get("adminPassword"),
      logoUrl,
    };

    // 🧪 Debug (à voir dans terminal serveur)
    console.log("📦 Données reçues :", data);

    // 🗄️ 👉 Ici tu ajouteras ta base de données plus tard
    // Exemple :
    // await db.eglise.create({ data });

    return Response.json({
      success: true,
      message: "Église créée avec succès",
      data,
    });

  } catch (error) {
    console.error("❌ Erreur API :", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
