// pages/refund.js
export default function Refund() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px", fontFamily: "Arial, sans-serif", color: "#1a1a2e", lineHeight: 1.7 }}>
      <h1 style={{ color: "#333699", marginBottom: 8 }}>Politique de remboursement</h1>
      <p style={{ color: "#999", fontSize: 14, marginBottom: 40 }}>Dernière mise à jour : mai 2026</p>

      <h2>1. Remboursements</h2>
      <p>Nous offrons un remboursement complet dans les <strong>7 jours</strong> suivant votre premier paiement si vous n'êtes pas satisfait du service. Passé ce délai, aucun remboursement ne sera accordé pour la période en cours.</p>

      <h2>2. Annulation</h2>
      <p>Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L'annulation prend effet à la fin de la période de facturation en cours. Vous conservez l'accès au service jusqu'à la fin de la période payée.</p>

      <h2>3. Remboursements exceptionnels</h2>
      <p>Dans des circonstances exceptionnelles (erreur de facturation, problème technique majeur de notre côté), nous étudierons les demandes de remboursement au cas par cas. Contactez-nous dans les 30 jours suivant le paiement concerné.</p>

      <h2>4. Comment demander un remboursement</h2>
      <p>Pour demander un remboursement, envoyez un email à <a href="mailto:support@soultrack.app" style={{ color: "#333699" }}>support@soultrack.app</a> avec :</p>
      <ul>
        <li>Votre adresse email de compte</li>
        <li>La date et le montant du paiement</li>
        <li>La raison de votre demande</li>
      </ul>

      <h2>5. Délai de traitement</h2>
      <p>Les remboursements approuvés sont traités dans un délai de 5 à 10 jours ouvrables selon votre banque ou prestataire de paiement.</p>

      <h2>6. Contact</h2>
      <p>Pour toute question : <a href="mailto:support@soultrack.app" style={{ color: "#333699" }}>support@soultrack.app</a></p>
    </div>
  );
}
