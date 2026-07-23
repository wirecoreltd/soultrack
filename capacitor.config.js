module.exports = {
  appId: 'org.soultrack.app',
  appName: 'SoulTrack',
  server: {
    url: 'https://www.soultrack.org/login',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    // Sur Android 15+ (API 35+), la nav bar/status bar est transparente
    // de façon forcée par l'OS. 'disable' laisse le WebView s'étendre
    // vraiment derrière ces barres, pour que ce soit le fond de VOTRE
    // page (gradient, #333699...) qui apparaisse à travers — au lieu
    // d'un vide noir. On gère le décalage du contenu via CSS
    // (env(safe-area-inset-*)) plutôt que via une marge native.
    adjustMarginsForEdgeToEdge: 'disable',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};
