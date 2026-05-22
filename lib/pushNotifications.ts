import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export const initPushNotifications = async (userId: string) => {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    await fetch('/api/save-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token: token.value }),
    });
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data;
    if (data?.url) window.location.href = data.url;
  });
};
