module.exports = {
  appId: 'org.soultrack.app',
  appName: 'SoulTrack',
  server: {
    url: 'https://soultrack.org/login',   // ← sans "www."
    cleartext: false,
    allowNavigation: ['soultrack.org', '*.soultrack.org'],
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SystemBars: {
      insetsHandling: 'disable',
    },
    EdgeToEdge: {
      // "backgroundColor" sert de valeur de base pour les deux barres et
      // couvre le cas où le natif ne trouve pas de valeur spécifique.
      // "statusBarColor" et "navigationBarColor" (Capacitor 8+) surchargent
      // chaque barre indépendamment.
      backgroundColor: '#3E7DCF',
      statusBarColor: '#333699',
      navigationBarColor: '#3E7DCF',
    },
  },
};
