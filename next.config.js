const withPWA = require('next-pwa')({
  dest: 'public',          // le service worker et les fichiers de cache sont générés dans /public
  register: true,          // enregistre automatiquement le service worker côté client
  skipWaiting: true,       // active la nouvelle version du SW dès qu'elle est prête, sans attendre la fermeture de tous les onglets
  disable: process.env.NODE_ENV === 'development', // pas de cache en dev, sinon tu verrais du contenu périmé pendant que tu codes

  // ── Règles de cache ──────────────────────────────────────────────────
  // Par défaut next-pwa cache assez agressivement. On personnalise pour
  // NE JAMAIS mettre en cache les routes API (paiements, création
  // d'utilisateurs, webhooks, etc.) : ces réponses doivent toujours
  // venir du réseau, jamais du cache.
  runtimeCaching: [
    {
      // Routes API : toujours réseau, jamais de cache
      urlPattern: /^https?:\/\/.*\/api\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      // JS/CSS générés par Next.js (noms hashés, donc sûrs à cacher longtemps)
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      // Images et polices
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-fonts',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      // Pages HTML : on essaie le réseau en premier (contenu à jour),
      // mais si hors-ligne ou lent, on retombe sur le cache
      urlPattern: /^https?:\/\/soultrack\.org\/(?!api).*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 jour
        },
      },
    },
  ],
});

const nextConfig = {};

module.exports = withPWA(nextConfig);
