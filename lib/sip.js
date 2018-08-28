import {SecureStore} from 'expo';
import {Endpoint} from 'react-native-pjsip';
import {navigate} from './navigation';

let sipState = {};

function getEndpoint() {
    const endpoint = new Endpoint();
    endpoint.addListener("call_terminated", call => {
        if (sipState.activeCall && sipState.activeCall.getId() === call.getId()) {
            sipState.activeCall = null;
            navigate('App');
        }
    });
    endpoint.addListener("call_received", call => {
        if (sipState.activeCall) {
            try { 
                endpoint.declineCall(call).catch(console.error);
            } catch (err) {
                console.error(err.message);
            }
        } else {
            sipState.activeCall = call;
            navigate('IncomingCall', {phoneNumber: call.getRemoteNumber()});
        }
    });
    return endpoint;
}

export async function getSipData() {
    if (sipState.endpoint && (sipState.accounts || []).length > 0) {
        return sipState;
    }
    const endpoint = sipState.endpoint || getEndpoint();
    let state = sipState;
    if (!sipState.accounts) {
        console.log('Initializing SIP ...');
        state = await endpoint.start();
    }
    const accounts = state.accounts || [];
    if (accounts.length === 0) {
        console.log('Extracting SIP data ...');
        const json = await SecureStore.getItemAsync('sip');
        const {sipUri, password} = JSON.parse(json || '{}');
        if (!sipUri) {
            sipState = Object.assign(state, {endpoint}); 
            return sipState;
        }
        const parts = sipUri.replace('sip:', '').split('@');
        const configurations = {
            username: parts[0],
            domain: parts[1],
            password
        };
        console.log('Adding SIP account ...');
        const registeredPromise = new Promise(resolve => {
            endpoint.once("registration_changed", account => {
                if (account.getRegistration().isActive()) {
                    accounts.push(account);        
                } else {
                    navigate('Auth');
                }
                resolve();
            });
        });
        console.log('Registering SIP account ...');
        await Promise.all([registeredPromise, endpoint.createAccount(configurations)]);
    } else {
        console.log('Registering existing SIP account ...');
        if (!accounts[0].getRegistration().isActive()) {
            await endpoint.registerAccount(accounts[0]);
        }
    }
    sipState = Object.assign(state, {endpoint, accounts}); 
    console.log('Return SIP state');
    return sipState;
}