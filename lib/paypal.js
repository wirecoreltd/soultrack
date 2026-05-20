export async function createPayPalSubscription({ planId, egliseId, email }) {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId];
  if (!paypalPlanId) throw new Error("Pas de plan PayPal");

  return paypalRequest("POST", "/v1/payments/billing-agreements", {
    name: `SoulTrack ${planId}`,
    description: `Abonnement SoulTrack plan ${planId}`,
    start_date: new Date(Date.now() + 60000).toISOString(),
    plan: {
      id: paypalPlanId,
    },
    payer: {
      payment_method: "paypal",
    },
  });
}
