module.exports = {
  appId: 'org.soultrack.app',
  appName: 'SoulTrack',
  server: {
    url: 'https://www.soultrack.org/login',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    // Edge-to-edge géré directement au niveau natif Android
    // (voir android:windowOptOutEdgeToEdgeEnforcement dans le workflow).
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};
