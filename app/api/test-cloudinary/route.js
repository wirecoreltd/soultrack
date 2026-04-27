export async function GET() {
  return Response.json({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "MANQUANT",
    api_key: process.env.CLOUDINARY_API_KEY || "MANQUANT",
    api_secret: process.env.CLOUDINARY_API_SECRET ? `présent (${process.env.CLOUDINARY_API_SECRET.length} chars)` : "MANQUANT",
  });
}
