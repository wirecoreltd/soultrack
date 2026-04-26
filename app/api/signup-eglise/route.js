import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

// 🔐 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔐 Supabase config
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("logo");
    let logoUrl = null;

    // 🖼️ Upload image
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "soultrack/logos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      logoUrl = uploadResult.secure_url;
    }

    // 🧾 INSERT EN BASE DE DONNÉES
    const { data, error } = await supabase
      .from("eglises")
      .insert({
        nom: formData.get("nomEglise"),          // ✅ FIX IMPORTANT
        denomination: formData.get("denomination"),
        ville: formData.get("ville"),
        pays: formData.get("localisation"),
        branche: formData.get("nomBranche"),
        logo_url: logoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: "Église créée avec succès",
      data,
    });

  } catch (error) {
    console.error("❌ API error:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
