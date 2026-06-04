module.exports = {
  appId: 'org.soultrack.app',
  appName: 'SoulTrack',
  server: {
    url: 'https://www.soultrack.org/login',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};
