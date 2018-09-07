import {Permissions, Notifications, SecureStore} from 'expo';
import {AsyncStorage} from 'react-native';
import {postJSON} from './fetch';

const eventHandlers = [];

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
    const bandwidth = await SecureStore.getItemAsync('bandwidth');
    if (!baseUrl || !bandwidth) {
        return;
    }

    const {userId} = JSON.parse(bandwidth || '{}');

    const wsUrl = `${baseUrl.replace('http', 'ws')}/${userId}/messages`;
    
    const handler = e => {
        const message = JSON.parse(e.data);
        eventHandlers.forEach(h => {
            h(message);
        });
    };
    

    const startWebsocket = () => {
        const ws = new WebSocket(wsUrl);
        ws.onmessage = handler;
        ws.onclose = () => {
            setTimeout(startWebsocket, 500);
        };
    };

    startWebsocket();

    Notifications.addListener(handler);
  
    let token = await Notifications.getExpoPushTokenAsync();
  
    // POST the token to your backend server from where you can retrieve it to send push notifications.
    return postJSON(`${baseUrl}/registerForPush`, Object.assign(bandwidth, {token}));
}

export function addIncomingMessagesHandler(handler) {
    eventHandlers.push(handler);
}

export function removeIncomingMessagesHandler(handler) {
    const index = eventHandlers.indexOf(handler);
    if (index >= 0) {
        eventHandlers.splice(index, 1);
    }
}

