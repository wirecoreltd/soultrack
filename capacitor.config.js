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
      statusBarColor: '#00000000',
      statusBarContent: 'dark',
      navigationBarColor: '#00000000',
      navigationBarContent: 'dark',
      offset: 0,
    },
  },
};
