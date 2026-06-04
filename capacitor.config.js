module.exports = {
  appId: 'org.soultrack.app',
  appName: 'SoulTrack',
  server: {
    url: 'https://www.soultrack.org/login',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};
