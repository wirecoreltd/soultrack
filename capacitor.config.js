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
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    SystemBars: {
      insetsHandling: 'disable',
    },
    EdgeToEdge: {
      backgroundColor: '#3A48A0',
      statusBarColor: '#3A48A0',
      navigationBarColor: '#3A48A0',
    },
    NavigationBar: {
      color: '#3A48A0',
      style: 'LIGHT', // icônes claires sur fond bleu foncé
    },
  },
};
