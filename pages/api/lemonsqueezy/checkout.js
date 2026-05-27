const { lemonSqueezySetup, createCheckout } = require("@lemonsqueezy/lemonsqueezy.js");

const VARIANT_MAP = {
  starter:   process.env.LEMONSQUEEZY_VARIANT_CROISSANCE,
  vision:    process.env.LEMONSQUEEZY_VARIANT_VISION,
  expansion: process.env.LEMONSQUEEZY_VARIANT_EXPANSION,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { egliseId, planId, email } = req.body;

  if (!egliseId || !planId || !email) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  const variantId = VARIANT_MAP[planId];
  if (!variantId) {
    return res.status(400).json({ error: `Plan inconnu : ${planId}` });
  }

  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });

  const { data, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID,
    variantId,
    {
      checkoutOptions: { embed: false, media: false },
      checkoutData: {
        email,
        custom: { eglise_id: egliseId, plan_id: planId },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
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
