// ─── REMPLACE handlePaddle et le bouton Paddle dans PaymentModal ───────────────
//
// 1. Supprime l'import Script de "next/script" si Paddle est le seul à l'utiliser
// 2. Supprime le <Script src="https://cdn.paddle.com/..."> dans SubscriptionContent
// 3. Remplace handlePaddle par handleLemonSqueezy ci-dessous
// 4. Dans le JSX, remplace le bouton Paddle par le bouton LemonSqueezy ci-dessous

// ─── Fonction à mettre dans PaymentModal (remplace handlePaddle) ──────────────

async function handleLemonSqueezy() {
  setLoading("lemonsqueezy");
  setError(null);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;

    if (!email) throw new Error("Utilisateur non connecté");

    const res  = await fetch("/api/lemonsqueezy/checkout", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ egliseId, planId: plan.id, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    window.location.href = data.checkoutUrl;
  } catch (e: any) {
    setError("Erreur paiement : " + e.message);
  } finally {
    setLoading(null);
  }
}

// ─── Bouton JSX à mettre dans PaymentModal (remplace le bouton Paddle) ────────
//
// Remplace tout le <button onClick={handlePaddle} ...> par ceci :

/*
<button
  onClick={handleLemonSqueezy}
  disabled={!!loading}
  className="w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all"
  style={{
    background: loading === "lemonsqueezy" ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.12)",
    border:     "1.5px solid rgba(99,102,241,0.5)",
    opacity:    loading && loading !== "lemonsqueezy" ? 0.5 : 1,
  }}
>
  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.2)" }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="3" stroke="#818cf8" strokeWidth="1.8"/>
      <path d="M2 10h20" stroke="#818cf8" strokeWidth="1.8"/>
      <rect x="5" y="14" width="4" height="2" rx="1" fill="#818cf8"/>
    </svg>
  </div>
  <div className="flex-1">
    <p className="text-white font-semibold text-sm flex items-center gap-2">
      {t.creditCard}
      <span className="text-[10px] bg-indigo-400/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">{t.recommended}</span>
    </p>
    <p className="text-white/40 text-xs mt-0.5">Via Lemon Squeezy · Visa, Mastercard, Apple Pay</p>
  </div>
  {loading === "lemonsqueezy" ? <Spinner /> : <span className="text-white/30 text-lg">→</span>}
</button>
*/
