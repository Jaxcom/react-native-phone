import React from 'react';
import {SecureStore} from 'expo';
import t from 'tcomb-form-native';
import {postJSON} from '../lib/fetch';
import {navigate}  from '../lib/navigation';

import {
    Button,
    View,
    AsyncStorage,
    ActivityIndicator,
    StyleSheet
} from 'react-native';

import {getSipData} from '../lib/sip';
import {registerForPushNotifications} from '../lib/notification';

const Form = t.form.Form;

const PhoneNumber = t.refinement(t.String, v => {
    const l = (v || '').length;
    return (l === 0) || ((l === 12) && v.startWith('+'));
} )

const SignIn = t.struct({
    userId: t.String,
    apiToken: t.String,
    apiSecret: t.String,
    domainId: t.maybe(t.String),
    phoneNumber: t.maybe(PhoneNumber),
    baseUrl: t.String,
});

const options = {
    fields: {
        userId: {
            label: 'User ID'
        },
        domainId: {
            label: 'Domain ID (optional)',
            placeholder: 'Leave empty to create new SIP domain'
        },
        phoneNumber: {
            placeholder: '+11234567890. Leave empty to reserve a number'
        },
        baseUrl: {
            label: 'Base url to backend server'
        }
    }
};

export default class SignInScreen extends React.Component {
    static navigationOptions = {
        title: 'Log in',
    };

    state = {
        inProgress: false,
        values: {
            baseUrl: 'https://',
        }
    }

    render() {
        return (
        <View style={styles.container}>
            <Form
                ref="form"
                type={SignIn}
                options={options}
                value={this.state.values}
                onChange={this._formValuesChanged}
            />
            <Button title="Log in" onPress={this._logInAsync} disabled={this.state.inProgress} />
            <ActivityIndicator animating={this.state.inProgress}/>
        </View>
        );
    }

    _logInAsync = async () => {
        this.setState({inProgress: true, error: null})
        try {
            const data = this.refs.form.getValue();
            if (!data) {
                return;
            }
            let {baseUrl} = data;
            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.substr(0, baseUrl.length - 1)
            }
            const {sipUri, password, phoneNumber} = await postJSON(`${baseUrl}/login`, data);
            await SecureStore.setItemAsync('sip', JSON.stringify({sipUri, password}));
            await SecureStore.setItemAsync('bandwidth', JSON.stringify({
                userId: data.userId,
                apiToken: data.apiToken,
                apiSecret: data.apiSecret
            }));
            await AsyncStorage.setItem('phoneNumber', phoneNumber);
            await AsyncStorage.setItem('baseUrl', baseUrl);
            await getSipData();
            setTimeout(() => registerForPushNotifications().catch(console.error), 1000);
            navigate('App');
        } catch(err) {
            console.trace(err);
            this.setState({error: err.message, inProgress: false});
            alert(err.message);
        } 
    };

    _formValuesChanged = values => this.setState({values});
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 4
    }
});