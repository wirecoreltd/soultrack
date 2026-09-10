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
      backgroundColor: '#333699',
      navigationBarColor: '#333699',
      statusBarColor: '#333699',
    },
  },
};
