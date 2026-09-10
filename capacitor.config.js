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
    backgroundColor: '#3E7DCF',
    statusBarColor: '#333699',
    navigationBarColor: '#3E7DCF', // gardé en fallback, inoffensif
  },
  NavigationBar: {
    color: '#3E7DCF',
    style: 'LIGHT', // icônes claires sur fond bleu foncé
  },
},
};
