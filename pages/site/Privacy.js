// pages/privacy.js
export default function Privacy() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px", fontFamily: "Arial, sans-serif", color: "#1a1a2e", lineHeight: 1.7 }}>
      <h1 style={{ color: "#333699", marginBottom: 8 }}>Politique de confidentialité</h1>
      <p style={{ color: "#999", fontSize: 14, marginBottom: 40 }}>Dernière mise à jour : mai 2026</p>

      <h2>1. Informations collectées</h2>
      <p>Nous collectons les informations que vous nous fournissez directement, notamment : nom, adresse email, informations de l'église, et données des membres que vous saisissez dans la plateforme.</p>

      <h2>2. Utilisation des informations</h2>
      <p>Nous utilisons vos informations pour :</p>
      <ul>
        <li>Fournir et améliorer nos services</li>
        <li>Traiter vos paiements</li>
        <li>Vous envoyer des communications relatives au service</li>
        <li>Assurer la sécurité de votre compte</li>
      </ul>

      <h2>3. Partage des informations</h2>
      <p>Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations avec des prestataires de services tiers (Paddle, PayPal, Supabase) uniquement dans le cadre de la fourniture du service.</p>

      <h2>4. Sécurité des données</h2>
      <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès non autorisé, modification, divulgation ou destruction.</p>

      <h2>5. Conservation des données</h2>
      <p>Nous conservons vos données aussi longtemps que votre compte est actif ou que nécessaire pour vous fournir nos services. Vous pouvez demander la suppression de vos données à tout moment.</p>

      <h2>6. Vos droits</h2>
      <p>Vous avez le droit d'accéder à vos données, de les corriger, de les supprimer et de vous opposer à leur traitement. Pour exercer ces droits, contactez-nous à support@soultrack.app.</p>

      <h2>7. Cookies</h2>
      <p>Nous utilisons des cookies essentiels pour le fonctionnement du service (authentification, session). Nous n'utilisons pas de cookies publicitaires ou de suivi tiers.</p>

      <h2>8. Contact</h2>
      <p>Pour toute question relative à la confidentialité : <a href="mailto:support@soultrack.app" style={{ color: "#333699" }}>support@soultrack.app</a></p>
    </div>
  );
}
