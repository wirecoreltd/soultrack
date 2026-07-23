module.exports = {
  appId: 'org.soultrack.app',
  appName: 'SoulTrack',
  server: {
    url: 'https://www.soultrack.org/login',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    // Gère proprement l'edge-to-edge forcé par Android 15+ (API 35+)
    // sans avoir besoin de downgrader targetSdkVersion.
    // 'auto' : Capacitor ajuste automatiquement les marges pour que
    // le contenu ne passe pas sous la nav bar / status bar.
    adjustMarginsForEdgeToEdge: 'auto',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};
