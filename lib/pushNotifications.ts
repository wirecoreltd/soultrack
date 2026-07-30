import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export const initPushNotifications = async (userId: string) => {
  if (!Capacitor.isNativePlatform()) {
    alert('DEBUG: pas une plateforme native, push annulé');
    return;
  }

  try {
    const permission = await PushNotifications.requestPermissions();
    alert('DEBUG: permission = ' + JSON.stringify(permission));

    if (permission.receive !== 'granted') {
      alert('DEBUG: permission refusée, arrêt');
      return;
    }

    await PushNotifications.register();
    alert('DEBUG: register() appelé avec succès');

    PushNotifications.addListener('registration', async (token) => {
      alert('DEBUG: token reçu = ' + token.value);
      try {
        const res = await fetch('/api/save-push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, token: token.value }),
        });
        const json = await res.json();
        alert('DEBUG: réponse save-push-token = ' + JSON.stringify(json));
      } catch (err: any) {
        alert('DEBUG ERREUR fetch save-push-token: ' + err.message);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      alert('DEBUG ERREUR registration: ' + JSON.stringify(err));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data;
      if (data?.url) window.location.href = data.url;
    });

  } catch (err: any) {
    alert('DEBUG ERREUR globale initPushNotifications: ' + err.message);
  }
};
