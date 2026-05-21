"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaypalCallback() {
  const router = useRouter();

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const token   = params.get("token");

    if (!token) {
      router.push("/administrateur/subscription?cancelled=true");
      return;
    }

    fetch("/api/paypal/capture-order", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ orderId: token }),
    })
      .then(r => r.json())
      .then(d => {
        console.log("CAPTURE RESPONSE:", JSON.stringify(d)); 
        if (d.success) {
          router.push("/administrateur/subscription?success=true");
        } else {
          router.push("/administrateur/subscription?error=" + encodeURIComponent(d.error || "Erreur"));
        }
      })
      .catch(() => {
        router.push("/administrateur/subscription?cancelled=true");
      });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#333699", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#fff", fontSize: "18px" }}>Confirmation du paiement en cours…</p>
    </div>
  );
}
