import React from 'react';
import {SecureStore} from 'expo';
import t from 'tcomb-form-native'

import {
    Button,
    View,
    AsyncStorage,
    ActivityIndicator,
    StyleSheet
} from 'react-native';

const Form = t.form.Form;

const SignIn = t.struct({
    userId: t.String,
    apiToken: t.String,
    apiSecret: t.String,
    domainId: t.maybe(t.String),
    phoneNumber: t.maybe(t.String),
    baseUrl: t.String,
});

const options = {
    fields: {
        userId: {
            label: 'User ID'
        },
        domainId: {
            label: 'Domain ID (optional)',
            help: 'Leave empty if you would like to create new SIP domain'
        },
        phoneNumber: {
            help: 'Leave empty if you would like to reserve new phone number'
        },
        baseUrl: {
            label: 'Base url to backend server'
        }
    }
};

const defaultValues = {
    baseUrl: 'https://some-server',
};

export default class SignInScreen extends React.Component {
    static navigationOptions = {
        title: 'Log in',
    };

    state = {
        inProgress: false
    }

    render() {
        return (
        <View style={styles.container}>
            <Form
                ref="form"
                type={SignIn}
                options={options}
                value={defaultValues}
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
            const response = await await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                const {sipUri, password, phoneNumber} = await response.json();
                await SecureStore.setItemAsync('sip', JSON.stringify({sipUri, password}));
                await AsyncStorage.setItem('userId', data.userId);
                await AsyncStorage.setItem('phoneNumber', phoneNumber);
                await AsyncStorage.setItem('baseUrl', baseUrl);
            } else {
                const {error} = await response.json();
                throw new Error(error || 'Unknown error from backend server');
            }
            this.props.navigation.navigate('App');
        } catch(err) {
            this.setState({error: err.message});
        } finally {
            this.setState({inProgress: false});
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 4
    }
});