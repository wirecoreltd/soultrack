const { lemonSqueezySetup, createCheckout } = require("@lemonsqueezy/lemonsqueezy.js");

const VARIANT_MAP = {
  starter_1m:   process.env.LEMONSQUEEZY_VARIANT_CROISSANCE,
  starter_6m:   process.env.LEMONSQUEEZY_VARIANT_CROISSANCE_6M,
  starter_1a:   process.env.LEMONSQUEEZY_VARIANT_CROISSANCE_1A,
  vision_1m:    process.env.LEMONSQUEEZY_VARIANT_VISION,
  vision_6m:    process.env.LEMONSQUEEZY_VARIANT_VISION_6M,
  vision_1a:    process.env.LEMONSQUEEZY_VARIANT_VISION_1A,
  expansion_1m: process.env.LEMONSQUEEZY_VARIANT_EXPANSION,
  expansion_6m: process.env.LEMONSQUEEZY_VARIANT_EXPANSION_6M,
  expansion_1a: process.env.LEMONSQUEEZY_VARIANT_EXPANSION_1A,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { egliseId, planId, duree, email } = req.body;
  // duree = "1m" | "6m" | "1a"

  if (!egliseId || !planId || !duree || !email) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  const key = `${planId}_${duree}`;
  const variantId = VARIANT_MAP[key];
  if (!variantId) {
    return res.status(400).json({ error: `Variant inconnu : ${key}` });
  }

  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });

  const { data, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID,
    variantId,
    {
      checkoutOptions: { embed: false, media: false },
      checkoutData: {
        email,
        custom: {
          eglise_id: egliseId,
          plan_id:   planId,
          duree:     duree,
        },
      },
      productOptions: {
        redirectUrl:       `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
        receiptButtonText: "Retour à SoulTrack",
      },
    }
  );

  if (error) {
    console.error("LS checkout error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ checkoutUrl: data?.data?.attributes?.url });
}
