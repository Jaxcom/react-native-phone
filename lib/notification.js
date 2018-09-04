import {Permissions, Notifications} from 'expo';
import {AsyncStorage} from 'react-native';

export async function registerForPushNotifications() {
    const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
  
    if (existingStatus !== 'granted') {
        const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    }
  
    if (finalStatus !== 'granted') {
        return;
    }
    
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    const userId = await AsyncStorage.getItem('userId');
    if (!baseUrl || !userId) {
        return;
    }
  
    let token = await Notifications.getExpoPushTokenAsync();
  
    // POST the token to your backend server from where you can retrieve it to send push notifications.
    return fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({token, userId}),
    });
  }


