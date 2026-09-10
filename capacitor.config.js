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
    SafeArea: {
      enabled: true,
      customColorsForSystemBars: true,
      statusBarColor: '#333699',
      statusBarContent: 'light',
      navigationBarColor: '#3E7DCF',
      navigationBarContent: 'light',
      offset: 0,
    },
  },
};
