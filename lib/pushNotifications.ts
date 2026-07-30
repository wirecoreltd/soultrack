import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export const initPushNotifications = async (userId: string) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      try {
        await fetch('/api/save-push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, token: token.value }),
        });
      } catch (err) {
        console.error('Erreur save-push-token:', err);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Erreur registration push:', err);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      if (data?.url) window.location.href = data.url;
    });
  } catch (err) {
    console.error('Erreur initPushNotifications:', err);
  }
};
