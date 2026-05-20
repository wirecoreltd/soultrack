export async function createPayPalSubscription({ planId, egliseId, email }) {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId];
  if (!paypalPlanId) throw new Error("Pas de plan PayPal pour " + planId);

  return paypalRequest("POST", "/v2/billing/subscriptions", {
    plan_id: paypalPlanId,
    subscriber: {
      email_address: email,
    },
    custom_id: JSON.stringify({ eglise_id: egliseId, plan_id: planId }),
    application_context: {
      brand_name: "SoulTrack",
      locale: "fr-FR",
      user_action: "SUBSCRIBE_NOW",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/administrateur/subscription?cancelled=true`,
    },
  });
}
